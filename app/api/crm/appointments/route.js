import { NextResponse } from 'next/server';
import { checkAuth, loadMeta, saveMeta, loadAllLeads, enrichLead } from '../lib';

export const runtime = 'edge';

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
    const leads = raw.map((i) => enrichLead(i, meta));
    const appointments = leads
      .filter((l) => l.appointmentAt)
      .map((l) => ({
        id: l.id,
        nome: l.nome,
        telefone: l.telefone || l.contato,
        at: l.appointmentAt,
        stage: l.stage,
        nextAction: l.nextAction,
      }))
      .sort((a, b) => new Date(a.at) - new Date(b.at));

    return NextResponse.json({ ok: true, count: appointments.length, appointments });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const { leadId, appointmentAt, nextAction } = await request.json();
    if (!leadId) return NextResponse.json({ error: 'leadId obrigatório' }, { status: 400 });
    const meta = await loadMeta(token);
    const current = meta[leadId] || { notes: [], tags: [] };
    if (appointmentAt !== undefined) current.appointmentAt = appointmentAt;
    if (nextAction !== undefined) current.nextAction = nextAction;
    current.updatedAt = new Date().toISOString();
    meta[leadId] = current;
    await saveMeta(token, meta);
    return NextResponse.json({ ok: true, crm: current });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
