import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const STAGES = ['novo', 'contactado', 'qualificado', 'proposta', 'negociacao', 'fechado', 'perdido'];

function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const auth = searchParams.get('auth') || request.headers.get('x-crm-auth') || '';
  return auth === (process.env.CRM_PASSWORD || 'solar2026');
}

async function loadAllLeads(token) {
  const { blobs } = await list({ prefix: 'leads/', limit: 200, token });
  const sorted = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  const slice = sorted.slice(0, 120);
  const items = await Promise.all(
    slice.map(async (b) => {
      try {
        const res = await fetch(b.url);
        const data = await res.json();
        return { pathname: b.pathname, url: b.url, uploadedAt: b.uploadedAt, data };
      } catch {
        return null;
      }
    })
  );
  return items.filter(Boolean);
}

async function loadCrmMeta(token) {
  try {
    const { blobs } = await list({ prefix: 'crm/meta.json', limit: 1, token });
    if (!blobs.length) return {};
    const res = await fetch(blobs[0].url);
    return await res.json();
  } catch {
    return {};
  }
}

async function saveCrmMeta(token, meta) {
  await put('crm/meta.json', JSON.stringify(meta, null, 2), {
    access: 'public', contentType: 'application/json', token, addRandomSuffix: false, allowOverwrite: true,
  });
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB nao configurado' }, { status: 503 });
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const q = (searchParams.get('q') || '').toLowerCase();
    const [rawLeads, meta] = await Promise.all([loadAllLeads(token), loadCrmMeta(token)]);
    const leads = rawLeads.map((item) => {
      const d = item.data || {};
      const id = d.id || item.pathname;
      const crm = meta[id] || {};
      return {
        id, pathname: item.pathname, url: item.url, uploadedAt: item.uploadedAt,
        mode: d.mode || '—', nome: d.nome || d.contato || crm.nome || '—',
        contato: d.contato || crm.contato || '—',
        telefone: crm.telefone || d.contato || d.telefone || '',
        cidade: d.cidade || crm.cidade || '—',
        stage: crm.stage || 'novo', tags: crm.tags || [], notes: crm.notes || [],
        score: crm.score || 0, owner: crm.owner || '', nextAction: crm.nextAction || '',
        nextActionAt: crm.nextActionAt || null,
        updatedAt: crm.updatedAt || d.receivedAt || item.uploadedAt, data: d,
      };
    });
    let filtered = leads;
    if (stage) filtered = filtered.filter((l) => l.stage === stage);
    if (q) filtered = filtered.filter((l) => JSON.stringify(l).toLowerCase().includes(q));
    const funnel = {};
    STAGES.forEach((s) => { funnel[s] = leads.filter((l) => l.stage === s).length; });
    return NextResponse.json({ ok: true, stages: STAGES, funnel, count: filtered.length, leads: filtered });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB nao configurado' }, { status: 503 });
  try {
    const body = await request.json();
    const { id, stage, tags, note, telefone, nome, contato, score, owner, nextAction, nextActionAt } = body;
    if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 });
    if (stage && !STAGES.includes(stage)) return NextResponse.json({ error: 'stage invalido', stages: STAGES }, { status: 400 });
    const meta = await loadCrmMeta(token);
    const current = meta[id] || { notes: [], tags: [] };
    if (stage) current.stage = stage;
    if (Array.isArray(tags)) current.tags = tags;
    if (telefone !== undefined) current.telefone = telefone;
    if (nome !== undefined) current.nome = nome;
    if (contato !== undefined) current.contato = contato;
    if (score !== undefined) current.score = Number(score) || 0;
    if (owner !== undefined) current.owner = owner;
    if (nextAction !== undefined) current.nextAction = nextAction;
    if (nextActionAt !== undefined) current.nextActionAt = nextActionAt;
    if (note && String(note).trim()) {
      current.notes = current.notes || [];
      current.notes.unshift({ text: String(note).trim(), at: new Date().toISOString(), by: 'crm' });
      current.notes = current.notes.slice(0, 50);
    }
    current.updatedAt = new Date().toISOString();
    meta[id] = current;
    await saveCrmMeta(token, meta);
    return NextResponse.json({ ok: true, id, crm: current });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
