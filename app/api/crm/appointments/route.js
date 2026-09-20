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
        leadId: l.id,
        nome: l.nome,
        at: l.appointmentAt,
        note: l.nextAction || '',
        stage: l.stage,
      }))
      .sort((a, b) => new Date(a.at) - new Date(b.at));
    return NextResponse.json({ ok: true, appointments });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  try {
    const body = await request.json();
    const { leadId, at, note } = body;
    if (!leadId || !at) return NextResponse.json({ error: 'leadId e at obrigatórios' }, { status: 400 });
    const meta = await loadMeta(token);
    const crm = meta[leadId] || { notes: [], tags: [] };
    crm.appointmentAt = at;
    if (note) {
      crm.notes = crm.notes || [];
      crm.notes.unshift({ text: 'Agendamento: ' + note, at: new Date().toISOString(), by: 'crm' });
    }
    crm.updatedAt = new Date().toISOString();
    meta[leadId] = crm;
    await saveMeta(token, meta);
    return NextResponse.json({ ok: true, leadId, at });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
