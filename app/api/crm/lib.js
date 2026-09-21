import { put, list, del } from '@vercel/blob';

export const STAGES = ['novo', 'qualificacao', 'agendamento', 'call_agendada', 'call_realizada', 'proposta', 'fechado', 'perdido', 'contactado', 'qualificado', 'negociacao'];
export const STAGE_LABELS = {
  novo: 'Novo', contactado: 'Contactado', qualificado: 'Qualificado',
  proposta: 'Proposta', negociacao: 'Negociação', fechado: 'Fechado', perdido: 'Perdido',
};

export const LOSS_REASONS = [
  'sem_perfil', 'financeiro', 'concorrente', 'sem_resposta', 'adiou', 'outro',
];
export const LOSS_LABELS = {
  sem_perfil: 'Sem perfil', financeiro: 'Financeiro', concorrente: 'Concorrente',
  sem_resposta: 'Sem resposta', adiou: 'Adiou', outro: 'Outro',
};

export function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const auth = searchParams.get('auth') || request.headers.get('x-crm-auth') || '';
  const expected = process.env.CRM_PASSWORD;
  if (!expected) return false;
  return auth === expected;
}

export async function blobGet(path, token) {
  try {
    const { blobs } = await list({ prefix: path, limit: 1, token });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url);
    return await res.json();
  } catch {
    return null;
  }
}

export async function blobPut(path, data, token) {
  await put(path, JSON.stringify(data, null, 2), {
    access: 'public', contentType: 'application/json', token,
    addRandomSuffix: false, allowOverwrite: true,
  });
}

export async function blobDel(urlOrPath, token) {
  try {
    if (urlOrPath && String(urlOrPath).startsWith('http')) {
      await del(urlOrPath, { token });
      return true;
    }
    const { blobs } = await list({ prefix: urlOrPath, limit: 5, token });
    for (const b of blobs) {
      await del(b.url, { token });
    }
    return blobs.length > 0;
  } catch {
    return false;
  }
}

export async function loadMeta(token) {
  return (await blobGet('crm/meta.json', token)) || {};
}

export async function saveMeta(token, meta) {
  await blobPut('crm/meta.json', meta, token);
}

export async function loadAllLeads(token) {
  const { blobs } = await list({ prefix: 'leads/', limit: 250, token });
  const sorted = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  const slice = sorted.slice(0, 150);
  const items = await Promise.all(slice.map(async (b) => {
    try {
      const res = await fetch(b.url);
      const data = await res.json();
      return { pathname: b.pathname, url: b.url, uploadedAt: b.uploadedAt, data };
    } catch { return null; }
  }));
  return items.filter(Boolean);
}

export function enrichLead(item, meta) {
  const d = item.data || {};
  const id = d.id || item.pathname;
  const crm = meta[id] || {};
  return {
    id, pathname: item.pathname, url: item.url, uploadedAt: item.uploadedAt,
    nome: crm.nome || d.nome || '',
    telefone: crm.telefone || d.telefone || d.contato || '',
    contato: crm.contato || d.contato || d.telefone || '',
    email: crm.email || d.email || '',
    cidade: d.cidade || crm.cidade || '',
    mode: d.mode || '',
    source: crm.source || d.source || '',
    stage: crm.stage || 'novo',
    tags: crm.tags || [],
    notes: crm.notes || [],
    value: crm.value || d.value || 0,
    score: crm.score || 0,
    owner: crm.owner || '',
    nextAction: crm.nextAction || '',
    nextActionAt: crm.nextActionAt || null,
    appointmentAt: crm.appointmentAt || null,
    lossReason: crm.lossReason || null,
    customFields: crm.customFields || {},
    priority: crm.priority || null,
    receivedAt: d.receivedAt || d.ts || item.uploadedAt,
    updatedAt: crm.updatedAt || null,
    ...d,
    ...crm,
    id,
  };
}

export async function loadFlows(token) {
  const data = await blobGet('crm/flows.json', token);
  return data?.flows || [];
}

export async function saveFlows(token, flows) {
  await blobPut('crm/flows.json', { flows, updatedAt: new Date().toISOString() }, token);
}

export async function loadAgents(token) {
  const data = await blobGet('crm/agents.json', token);
  return data?.agents || [];
}

export async function saveAgents(token, agents) {
  await blobPut('crm/agents.json', { agents, updatedAt: new Date().toISOString() }, token);
}

export async function loadKnowledge(token) {
  const data = await blobGet('crm/knowledge.json', token);
  return data?.items || [];
}

export async function saveKnowledge(token, items) {
  await blobPut('crm/knowledge.json', { items, updatedAt: new Date().toISOString() }, token);
}

export async function loadSegments(token) {
  const data = await blobGet('crm/segments.json', token);
  return data?.segments || [];
}

export async function saveSegments(token, segments) {
  await blobPut('crm/segments.json', { segments, updatedAt: new Date().toISOString() }, token);
}

export async function fireTriggers({ type, stage, tag }, lead, request, token) {
  try {
    const flows = await loadFlows(token);
    const matched = flows.filter((f) => {
      if (!f.active) return false;
      if (f.trigger !== type) return false;
      if (f.triggerStage && stage && f.triggerStage !== stage) return false;
      if (f.triggerTag && tag && f.triggerTag !== tag) return false;
      return true;
    });
    const results = [];
    for (const flow of matched) {
      for (const step of (flow.steps || [])) {
        if (step.type === 'message' && step.text && lead.telefone) {
          try {
            const sendRes = await fetch(new URL('/api/whatsapp/send', request.url).toString(), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-crm-auth': process.env.CRM_PASSWORD || '',
              },
              body: JSON.stringify({
                to: lead.telefone,
                text: String(step.text).replace(/\{\{nome\}\}/gi, lead.nome || ''),
              }),
            });
            results.push({ flow: flow.id, step: 'message', ok: sendRes.ok });
          } catch (e) {
            results.push({ flow: flow.id, step: 'message', ok: false, error: String(e) });
          }
        }
      }
    }
    return results;
  } catch {
    return [];
  }
}
