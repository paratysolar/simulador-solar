import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { fireTriggers, enrichLead, loadMeta } from '../crm/lib';

export const runtime = 'edge';

function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const auth = searchParams.get('auth') || request.headers.get('x-crm-auth') || '';
  const expected = process.env.CRM_PASSWORD || 'solar2026';
  return auth === expected;
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data || !data.mode) {
      return NextResponse.json({ error: 'JSON inválido ou campo mode ausente' }, { status: 400 });
    }
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.log('[LEAD]', JSON.stringify(data));
      return NextResponse.json({ ok: true, saved: false, warning: 'BLOB_READ_WRITE_TOKEN não configurado.' });
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pathname = `leads/${data.mode}/${id}.json`;
    const payload = { id, receivedAt: new Date().toISOString(), ...data };
    const blob = await put(pathname, JSON.stringify(payload, null, 2), {
      access: 'public', contentType: 'application/json', token, addRandomSuffix: false,
    });

    let triggered = [];
    try {
      const meta = await loadMeta(token);
      const lead = enrichLead({ pathname, url: blob.url, uploadedAt: new Date().toISOString(), data: payload }, meta);
      triggered = await fireTriggers({ type: 'novo_contato' }, lead, request, token);
    } catch (e) {
      console.error('Trigger novo_contato:', e);
    }

    return NextResponse.json({ ok: true, saved: true, id, url: blob.url, triggered });
  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    return NextResponse.json({ error: 'Falha ao salvar lead', detail: String(err.message || err) }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN não configurado' }, { status: 503 });
    }
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    const full = searchParams.get('full') === '1';
    const prefix = mode ? `leads/${mode}/` : 'leads/';
    const { blobs } = await list({ prefix, limit: 150, token });
    const sorted = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    if (!full) {
      return NextResponse.json({
        ok: true, count: sorted.length,
        leads: sorted.map((b) => ({ url: b.url, pathname: b.pathname, uploadedAt: b.uploadedAt, size: b.size })),
      });
    }
    const slice = sorted.slice(0, 80);
    const leads = await Promise.all(slice.map(async (b) => {
      try {
        const res = await fetch(b.url);
        const data = await res.json();
        return { url: b.url, pathname: b.pathname, uploadedAt: b.uploadedAt, data };
      } catch {
        return { url: b.url, pathname: b.pathname, uploadedAt: b.uploadedAt, data: { mode: 'unknown', error: 'falha ao ler' } };
      }
    }));
    return NextResponse.json({ ok: true, count: leads.length, leads });
  } catch (err) {
    console.error('Erro ao listar leads:', err);
    return NextResponse.json({ error: 'Falha ao listar leads', detail: String(err.message || err) }, { status: 500 });
  }
}
