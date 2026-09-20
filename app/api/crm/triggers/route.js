import { NextResponse } from 'next/server';
import { checkAuth, fireTriggers, loadAllLeads, loadMeta, enrichLead } from '../lib';

export const runtime = 'edge';

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  try {
    const body = await request.json();
    const { event, leadId, lead } = body;
    if (!event || !event.type) return NextResponse.json({ error: 'event.type obrigatório' }, { status: 400 });

    let target = lead;
    if (!target && leadId) {
      const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
      const item = raw.find((i) => (i.data?.id || i.pathname) === leadId);
      if (!item) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
      target = enrichLead(item, meta);
    }
    if (!target) return NextResponse.json({ error: 'lead ou leadId obrigatório' }, { status: 400 });

    const fired = await fireTriggers(event, target, request, token);
    return NextResponse.json({ ok: true, fired });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({
    ok: true,
    events: [
      'novo_contato', 'tag_adicionada', 'tag_removida',
      'contato_coluna', 'contato_removido', 'ganhar', 'perder',
    ],
  });
}
