import { NextResponse } from 'next/server';
import { checkAuth, loadAllLeads, loadMeta, enrichLead, blobGet } from '../lib';

export const runtime = 'edge';

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  try {
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get('days') || 30);
    const [raw, meta, pipesData, flowsData, apptsData] = await Promise.all([
      loadAllLeads(token), loadMeta(token),
      blobGet('crm/pipelines.json', token),
      blobGet('crm/flows.json', token),
      blobGet('crm/appointments.json', token),
    ]);
    const leads = raw.map((i) => enrichLead(i, meta));
    const pipeline = pipesData?.pipelines?.[0] || null;
    const columns = pipeline?.columns || [
      { id: 'novo', label: 'Novos Leads' },
      { id: 'qualificacao', label: 'Em Qualificação' },
      { id: 'agendamento', label: 'Em Agendamento' },
      { id: 'call_agendada', label: 'Call Agendada' },
      { id: 'call_realizada', label: 'Call Realizada' },
      { id: 'proposta', label: 'Proposta Enviada' },
      { id: 'fechado', label: 'Concluído' },
      { id: 'perdido', label: 'Perdido' },
    ];
    const total = leads.length;
    const ganhos = leads.filter((l) => l.stage === 'fechado' || columns.find((c) => c.id === l.stage)?.isWon);
    const perdidos = leads.filter((l) => l.stage === 'perdido');
    const faturamento = ganhos.reduce((s, l) => s + (Number(l.value) || 0), 0);
    const appts = apptsData?.items || [];
    const funnelStages = columns.filter((c) => !c.isLost);
    const funnel = funnelStages.map((col, idx) => {
      const inOrPast = leads.filter((l) => {
        if (col.isWon) return l.stage === col.id;
        const order = funnelStages.findIndex((c) => c.id === l.stage);
        if (l.stage === 'perdido') return false;
        if (order < 0) return l.stage === col.id;
        return order >= idx;
      }).length;
      return {
        id: col.id, label: col.label,
        count: leads.filter((l) => l.stage === col.id).length,
        reached: inOrPast,
        pct: total ? Math.round((inOrPast / total) * 10000) / 100 : 0,
      };
    });
    const bySource = {};
    leads.forEach((l) => { const s = l.source || 'outros'; bySource[s] = (bySource[s] || 0) + 1; });
    const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
    leads.forEach((l) => {
      try { const h = new Date(l.updatedAt || l.createdAt).getHours(); if (byHour[h]) byHour[h].count++; } catch {}
    });
    const flows = flowsData?.flows || [];
    return NextResponse.json({
      ok: true, period: { days },
      indicators: {
        totalLeads: total, leadsGanhos: ganhos.length, leadsPerdidos: perdidos.length,
        faturamento, agendamentos: appts.length,
        horasIA: Math.round(total * 0.15 * 10) / 10,
      },
      funnel,
      bySource: Object.entries(bySource).map(([name, count]) => ({ name, count })),
      byHour,
      flows: { total: flows.length, active: flows.filter((f) => f.active).length },
      appointments: appts.slice(0, 20),
      recent: leads.slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 15).map((l) => ({
        id: l.id, nome: l.nome, stage: l.stage, value: l.value, source: l.source, updatedAt: l.updatedAt,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
