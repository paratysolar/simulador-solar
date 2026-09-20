import { NextResponse } from 'next/server';
import { checkAuth, loadMeta, loadAllLeads, enrichLead } from '../lib';

export const runtime = 'edge';

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const body = await request.json();
    const { text, stage } = body;
    if (!text || !String(text).trim()) {
      return NextResponse.json({ error: 'text obrigatório' }, { status: 400 });
    }

    const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
    let leads = raw.map((i) => enrichLead(i, meta));
    if (stage) leads = leads.filter((l) => l.stage === stage);

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const lead of leads) {
      const phone = String(lead.telefone || lead.contato || '').replace(/\D/g, '');
      if (!phone || phone.length < 10) { failed++; continue; }
      const msg = String(text).replace(/\{\{nome\}\}/gi, lead.nome || 'cliente');
      try {
        const sendRes = await fetch(new URL('/api/whatsapp/send', request.url).toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-crm-auth': process.env.CRM_PASSWORD || 'solar2026',
          },
          body: JSON.stringify({ to: phone, text: msg }),
        });
        const data = await sendRes.json();
        if (data.ok) sent++;
        else { failed++; errors.push({ phone, error: data.error }); }
      } catch (e) {
        failed++;
        errors.push({ phone, error: String(e.message || e) });
      }
    }

    return NextResponse.json({ ok: true, sent, failed, total: leads.length, errors: errors.slice(0, 10) });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
