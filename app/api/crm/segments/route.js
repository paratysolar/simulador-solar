import { NextResponse } from 'next/server';
import { checkAuth, loadAllLeads, loadMeta, enrichLead } from '../lib';
import { loadSegments, saveSegments, matchSegment } from '../lib-ext';

export const runtime = 'edge';

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB nao configurado' }, { status: 503 });
  const segments = await loadSegments(token);
  return NextResponse.json({ ok: true, segments });
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB nao configurado' }, { status: 503 });
  try {
    const body = await request.json();
    let segments = await loadSegments(token);

    if (body.action === 'upsert' && body.segment) {
      const s = body.segment;
      if (!s.id) s.id = 'seg-' + Date.now();
      const idx = segments.findIndex((x) => x.id === s.id);
      if (idx >= 0) segments[idx] = s; else segments.push(s);
      await saveSegments(token, segments);
      return NextResponse.json({ ok: true, segment: s, segments });
    }
    if (body.action === 'delete' && body.id) {
      segments = segments.filter((x) => x.id !== body.id);
      await saveSegments(token, segments);
      return NextResponse.json({ ok: true, segments });
    }
    if (body.action === 'preview' && body.segment) {
      const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
      const leads = raw.map((i) => enrichLead(i, meta)).filter((l) => matchSegment(l, body.segment));
      return NextResponse.json({ ok: true, count: leads.length, sample: leads.slice(0, 20) });
    }
    return NextResponse.json({ error: 'action invalida' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
