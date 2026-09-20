import { NextResponse } from 'next/server';
import { checkAuth, fireTriggers, loadMeta, enrichLead, loadAllLeads } from '../lib';

export const runtime = 'edge';

/**
 * POST body:
 * { event: 'novo_contato'|'tag_adicionada'|'tag_removida'|'contato_coluna'|'contato_removido'|'ganhar'|'perder',
 *   leadId, stage?, tag? }
 */
export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const body = await request.json();
    const { event, leadId, stage, tag } = body;
    if (!event || !leadId) {
      return NextResponse.json({ error: 'event e leadId obrigatórios' }, { status: 400 });
    }

    const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
    const item = raw.find((i) => (i.data?.id || i.pathname) === leadId);
    if (!item) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });

    const lead = enrichLead(item, meta);
    const fired = await fireTriggers({ type: event, stage, tag }, lead, request, token);

    return NextResponse.json({ ok: true, fired, count: fired.length });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({
    ok: true,
    triggers: [
      { id: 'novo_contato', label: 'Novo Contato', desc: 'Quando um lead entra na lista' },
      { id: 'tag_adicionada', label: 'Tag adicionada ao contato', desc: 'Quando uma tag é adicionada' },
      { id: 'tag_removida', label: 'Tag removida do contato', desc: 'Quando uma tag é removida' },
      { id: 'contato_coluna', label: 'Contato adicionado à coluna', desc: 'Quando move no funil' },
      { id: 'contato_removido', label: 'Contato removido da coluna', desc: 'Quando sai de uma coluna' },
      { id: 'ganhar', label: 'Ganhar oportunidade', desc: 'Quando marca como Fechado' },
      { id: 'perder', label: 'Perder oportunidade', desc: 'Quando marca como Perdido' },
    ],
  });
}
