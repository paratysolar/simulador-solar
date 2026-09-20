import { NextResponse } from 'next/server';
import { checkAuth, loadMeta, loadAllLeads, enrichLead, STAGES, STAGE_LABELS } from '../lib';
import { list } from '@vercel/blob';

export const runtime = 'edge';

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
    const leads = raw.map((i) => enrichLead(i, meta));

    const ganhos = leads.filter((l) => l.stage === 'fechado');
    const perdidos = leads.filter((l) => l.stage === 'perdido');
    const faturamento = ganhos.reduce((s, l) => s + (Number(l.value) || 0), 0);

    const bySource = {};
    leads.forEach((l) => {
      const src = l.source || l.mode || 'simulador';
      bySource[src] = (bySource[src] || 0) + 1;
    });

    const funnel = STAGES.map((s) => ({
      id: s,
      label: STAGE_LABELS[s] || s,
      count: leads.filter((l) => l.stage === s).length,
    }));

    let msgCount = 0;
    let inbound = 0;
    let outbound = 0;
    try {
      const { blobs } = await list({ prefix: 'whatsapp/messages/', limit: 300, token });
      msgCount = blobs.length;
      const sample = blobs.slice(0, 80);
      await Promise.all(sample.map(async (b) => {
        try {
          const res = await fetch(b.url);
          const d = await res.json();
          if (d.direction === 'outbound') outbound++;
          else inbound++;
        } catch { /* skip */ }
      }));
    } catch { /* skip */ }

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

    return NextResponse.json({
      ok: true,
      total: leads.length,
      ganhos: ganhos.length,
      perdidos: perdidos.length,
      taxaGanho: leads.length ? Math.round((ganhos.length / Math.max(ganhos.length + perdidos.length, 1)) * 1000) / 10 : 0,
      taxaPerda: leads.length ? Math.round((perdidos.length / Math.max(ganhos.length + perdidos.length, 1)) * 1000) / 10 : 0,
      faturamento,
      bySource,
      funnel,
      messages: { total: msgCount, inbound, outbound },
      msgCount,
      history,
      appointments: leads.filter((l) => l.appointmentAt).length,
      agendamentos: leads.filter((l) => l.appointmentAt).length,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
