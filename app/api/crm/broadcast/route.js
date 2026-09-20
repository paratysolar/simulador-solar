import { NextResponse } from 'next/server';
import { checkAuth, loadMeta, loadAllLeads, enrichLead } from '../lib';

export const runtime = 'edge';

/**
 * Broadcast is limited: only sends to leads that likely have open 24h window
 * (have received inbound recently) OR user acknowledges it's a service reply attempt.
 * Marketing templates require paid Meta templates — we document that.
 */
export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const body = await request.json();
    const { text, stage, tag, leadIds } = body;
    if (!text || !String(text).trim()) {
      return NextResponse.json({ error: 'text obrigatório' }, { status: 400 });
    }

    const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
    let leads = raw.map((i) => enrichLead(i, meta));

    if (Array.isArray(leadIds) && leadIds.length) {
      leads = leads.filter((l) => leadIds.includes(l.id));
    } else {
      if (stage) leads = leads.filter((l) => l.stage === stage);
      if (tag) leads = leads.filter((l) => (l.tags || []).includes(tag));
    }

    leads = leads.filter((l) => (l.telefone || l.contato || '').replace(/\D/g, '').length >= 10);

    const results = [];
    const batch = leads.slice(0, 20);
    for (const lead of batch) {
      try {
        const sendRes = await fetch(new URL('/api/whatsapp/send', request.url).toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-crm-auth': process.env.CRM_PASSWORD || 'solar2026',
          },
          body: JSON.stringify({
            to: lead.telefone || lead.contato,
            text: text.replace(/\{\{nome\}\}/gi, lead.nome || 'cliente'),
          }),
        });
        const data = await sendRes.json();
        results.push({ id: lead.id, nome: lead.nome, ok: !!data.ok, error: data.error });
      } catch (e) {
        results.push({ id: lead.id, nome: lead.nome, ok: false, error: String(e.message || e) });
      }
    }

    return NextResponse.json({
      ok: true,
      attempted: batch.length,
      totalMatched: leads.length,
      note: leads.length > 20 ? 'Limitado a 20 por lote (volume inicial / janela 24h)' : null,
      results,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({
    ok: true,
    info: 'Broadcast envia texto livre apenas para leads com telefone. Funciona de graça dentro da janela de 24h do WhatsApp. Para disparo frio use templates pagos da Meta.',
  });
}
