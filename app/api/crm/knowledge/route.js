import { NextResponse } from 'next/server';
import { checkAuth } from '../lib';
import { loadKnowledge, saveKnowledge } from '../lib-ext';

export const runtime = 'edge';

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB nao configurado' }, { status: 503 });
  const items = await loadKnowledge(token);
  return NextResponse.json({ ok: true, items, count: items.length });
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB nao configurado' }, { status: 503 });
  try {
    const body = await request.json();
    let items = await loadKnowledge(token);

    if (body.action === 'upsert' && body.item) {
      const it = body.item;
      if (!it.id) it.id = 'k-' + Date.now();
      it.active = it.active !== false;
      const idx = items.findIndex((x) => x.id === it.id);
      if (idx >= 0) items[idx] = it; else items.push(it);
      await saveKnowledge(token, items);
      return NextResponse.json({ ok: true, item: it, items });
    }
    if (body.action === 'delete' && body.id) {
      items = items.filter((x) => x.id !== body.id);
      await saveKnowledge(token, items);
      return NextResponse.json({ ok: true, items });
    }
    if (body.action === 'toggle' && body.id) {
      const it = items.find((x) => x.id === body.id);
      if (it) it.active = !it.active;
      await saveKnowledge(token, items);
      return NextResponse.json({ ok: true, items });
    }
    if (body.action === 'approve' && body.id) {
      const it = items.find((x) => x.id === body.id);
      if (it) { it.active = true; it.source = 'approved'; }
      await saveKnowledge(token, items);
      return NextResponse.json({ ok: true, items });
    }
    return NextResponse.json({ error: 'action invalida' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
