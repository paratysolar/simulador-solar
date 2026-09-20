import { NextResponse } from 'next/server';
import { checkAuth, loadMeta, loadAllLeads, enrichLead, STAGES } from '../lib';

export const runtime = 'edge';

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
    const leads = raw.map((i) => enrichLead(i, meta));

    const funnel = {};
    STAGES.forEach((s) => { funnel[s] = leads.filter((l) => l.stage === s).length; });

    const ganhos = leads.filter((l) => l.stage === 'fechado');
    const perdidos = leads.filter((l) => l.stage === 'perdido');
    const faturamento = ganhos.reduce((s, l) => s + (Number(l.value) || 0), 0);

    const bySource = {};
    leads.forEach((l) => {
      const src = l.source || 'simulador';
      bySource[src] = (bySource[src] || 0) + 1;
    });

    const now = Date.now();
    const dayMs = 86400000;
    const history = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = now - i * dayMs;
      const dayEnd = dayStart + dayMs;
      const count = leads.filter((l) => {
        const t = new Date(l.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
      history.push({ date: new Date(dayStart).toISOString().slice(0, 10), count });
    }

    const appointments = leads.filter((l) => l.appointmentAt).length;

    return NextResponse.json({
      ok: true,
      total: leads.length,
      ganhos: ganhos.length,
      perdidos: perdidos.length,
      taxaGanho: leads.length ? Math.round((ganhos.length / leads.length) * 1000) / 10 : 0,
      taxaPerda: leads.length ? Math.round((perdidos.length / leads.length) * 1000) / 10 : 0,
      faturamento,
      appointments,
      funnel,
      bySource,
      history,
      recent: leads.slice(0, 10),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
