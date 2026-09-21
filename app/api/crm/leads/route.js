import { NextResponse } from 'next/server';
import {
  checkAuth, loadMeta, saveMeta, loadAllLeads, enrichLead, STAGES, fireTriggers, blobDel,
} from '../lib';

export const runtime = 'edge';

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const q = (searchParams.get('q') || '').toLowerCase();
    const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
    let leads = raw.map((i) => enrichLead(i, meta));
    if (stage) leads = leads.filter((l) => l.stage === stage);
    if (q) leads = leads.filter((l) => JSON.stringify(l).toLowerCase().includes(q));

    const funnel = {};
    STAGES.forEach((s) => {
      funnel[s] = raw.map((i) => enrichLead(i, meta)).filter((l) => l.stage === s).length;
    });

    return NextResponse.json({ ok: true, stages: STAGES, funnel, count: leads.length, leads });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const body = await request.json();
    const {
      id, stage, tags, note, telefone, nome, contato, score, owner,
      nextAction, nextActionAt, appointmentAt, value, source, lossReason, customFields, priority, fire = true,
    } = body;
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });
    if (stage && typeof stage !== 'string') {
      return NextResponse.json({ error: 'stage inválido' }, { status: 400 });
    }

    const meta = await loadMeta(token);
    const current = meta[id] || { notes: [], tags: [] };
    const prevStage = current.stage || 'novo';
    const prevTags = [...(current.tags || [])];

    if (stage) current.stage = stage;
    if (Array.isArray(tags)) current.tags = tags;
    if (telefone !== undefined) current.telefone = telefone;
    if (nome !== undefined) current.nome = nome;
    if (contato !== undefined) current.contato = contato;
    if (score !== undefined) current.score = Number(score) || 0;
    if (owner !== undefined) current.owner = owner;
    if (nextAction !== undefined) current.nextAction = nextAction;
    if (nextActionAt !== undefined) current.nextActionAt = nextActionAt;
    if (appointmentAt !== undefined) current.appointmentAt = appointmentAt;
    if (value !== undefined) current.value = Number(value) || 0;
    if (source !== undefined) current.source = source;
    if (lossReason !== undefined) current.lossReason = lossReason;
    if (customFields && typeof customFields === 'object') current.customFields = { ...(current.customFields || {}), ...customFields };
    if (priority !== undefined) current.priority = priority;

    if (note && String(note).trim()) {
      current.notes = current.notes || [];
      current.notes.unshift({ text: String(note).trim(), at: new Date().toISOString(), by: 'crm' });
      current.notes = current.notes.slice(0, 50);
    }

    current.updatedAt = new Date().toISOString();
    meta[id] = current;
    await saveMeta(token, meta);

    let triggered = [];
    if (fire) {
      const raw = await loadAllLeads(token);
      const item = raw.find((i) => (i.data?.id || i.pathname) === id);
      if (item) {
        const lead = enrichLead(item, meta);
        if (stage && stage !== prevStage) {
          if (stage === 'fechado') {
            triggered = await fireTriggers({ type: 'ganhar', stage }, lead, request, token);
          } else if (stage === 'perdido') {
            triggered = await fireTriggers({ type: 'perder', stage }, lead, request, token);
          } else {
            triggered = await fireTriggers({ type: 'contato_coluna', stage }, lead, request, token);
            if (prevStage) {
              await fireTriggers({ type: 'contato_removido', stage: prevStage }, lead, request, token);
            }
          }
        }
        if (Array.isArray(tags)) {
          const added = tags.filter((t) => !prevTags.includes(t));
          const removed = prevTags.filter((t) => !tags.includes(t));
          for (const t of added) {
            triggered = triggered.concat(await fireTriggers({ type: 'tag_adicionada', tag: t }, lead, request, token));
          }
          for (const t of removed) {
            triggered = triggered.concat(await fireTriggers({ type: 'tag_removida', tag: t }, lead, request, token));
          }
        }
      }
    }

    return NextResponse.json({ ok: true, id, crm: current, triggered, triggersFired: triggered });
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
    if (body.action === 'fire_novo' && body.leadId) {
      const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
      const item = raw.find((i) => (i.data?.id || i.pathname) === body.leadId);
      if (!item) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
      const lead = enrichLead(item, meta);
      const triggered = await fireTriggers({ type: 'novo_contato' }, lead, request, token);
      return NextResponse.json({ ok: true, triggered });
    }
    return NextResponse.json({ error: 'action inválida' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const id = body.id || searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

    const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
    const item = raw.find((i) => (i.data?.id || i.pathname) === id || i.pathname?.includes(id));
    if (item?.url) {
      await blobDel(item.url, token);
    } else {
      await blobDel(`leads/${id}.json`, token);
    }
    if (meta[id]) {
      delete meta[id];
      await saveMeta(token, meta);
    }
    return NextResponse.json({ ok: true, id, message: 'Contato excluído' });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
