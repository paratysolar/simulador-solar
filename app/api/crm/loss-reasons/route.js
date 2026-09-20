import { NextResponse } from 'next/server';
import { checkAuth, loadMeta, loadAllLeads, enrichLead } from '../lib';
import { LOSS_REASONS, LOSS_LABELS } from '../lib-ext';

export const runtime = 'edge';

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB nao configurado' }, { status: 503 });
  try {
    const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
    const leads = raw.map((i) => enrichLead(i, meta)).filter((l) => l.stage === 'perdido');
    const byReason = {};
    LOSS_REASONS.forEach((r) => { byReason[r] = 0; });
    leads.forEach((l) => {
      const r = l.lossReason || 'outro';
      byReason[r] = (byReason[r] || 0) + 1;
    });
    return NextResponse.json({
      ok: true,
      reasons: LOSS_REASONS.map((id) => ({ id, label: LOSS_LABELS[id], count: byReason[id] || 0 })),
      total: leads.length,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
