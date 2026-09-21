import { put, list } from '@vercel/blob';

export const STAGES = ['novo', 'qualificacao', 'agendamento', 'call_agendada', 'call_realizada', 'proposta', 'fechado', 'perdido', 'contactado', 'qualificado', 'negociacao'];
export const STAGE_LABELS = {
  novo: 'Novo', qualificacao: 'Em Qualificação', agendamento: 'Em Agendamento',
  call_agendada: 'Call Agendada', call_realizada: 'Call Realizada',
  proposta: 'Proposta', fechado: 'Fechado', perdido: 'Perdido',
  contactado: 'Contactado', qualificado: 'Qualificado', negociacao: 'Negociação',
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
    mode: d.mode || '—',
    nome: d.nome || d.contato || crm.nome || '—',
    contato: d.contato || crm.contato || '—',
    telefone: crm.telefone || d.contato || d.telefone || '',
    cidade: d.cidade || crm.cidade || '—',
    stage: crm.stage || 'novo',
    tags: crm.tags || [],
    notes: crm.notes || [],
    score: crm.score || 0,
    owner: crm.owner || '',
    source: crm.source || d.mode || 'simulador',
    value: crm.value || d.custo || d.economiaAno || 0,
    nextAction: crm.nextAction || '',
    nextActionAt: crm.nextActionAt || null,
    appointmentAt: crm.appointmentAt || null,
    lossReason: crm.lossReason || null,
    updatedAt: crm.updatedAt || d.receivedAt || item.uploadedAt,
    createdAt: d.receivedAt || d.ts || item.uploadedAt,
    data: d,
  };
}

export const DEFAULT_FLOWS = [
  {
    id: 'boas-vindas',
    name: 'Boas-vindas (Novo Contato)',
    active: true,
    trigger: 'novo_contato',
    steps: [
      { type: 'message', text: 'Olá {{nome}}! Obrigado pelo interesse em energia solar com a Paraty Solar. Em breve um consultor entra em contato.' },
      { type: 'set_stage', stage: 'contactado' },
      { type: 'add_tag', tag: 'morno' },
    ],
  },
  {
    id: 'tag-quente',
    name: 'Lead Quente → Proposta',
    active: true,
    trigger: 'tag_adicionada',
    triggerTag: 'quente',
    steps: [
      { type: 'set_stage', stage: 'qualificado' },
      { type: 'message', text: '{{nome}}, vamos priorizar seu atendimento! Em breve enviamos uma proposta personalizada.' },
    ],
  },
  {
    id: 'ganhou',
    name: 'Ganhou Oportunidade',
    active: true,
    trigger: 'ganhar',
    steps: [
      { type: 'message', text: 'Parabéns {{nome}}! Bem-vindo à energia solar com a Paraty Solar.' },
      { type: 'add_tag', tag: 'cliente' },
    ],
  },
];

export async function loadFlows(token) {
  const data = await blobGet('crm/flows.json', token);
  if (data?.flows) return data.flows;
  return DEFAULT_FLOWS;
}

export async function saveFlows(token, flows) {
  await blobPut('crm/flows.json', { flows, updatedAt: new Date().toISOString() }, token);
}

export async function runFlowSteps(flow, lead, request, token) {
  const nome = lead.nome || lead.contato || 'cliente';
  const results = [];
  const meta = await loadMeta(token);
  const crm = meta[lead.id] || { notes: [], tags: [] };

  for (const step of flow.steps || []) {
    if (step.type === 'message' && step.text) {
      const text = step.text.replace(/\{\{nome\}\}/gi, nome);
      if (lead.telefone || lead.contato) {
        try {
          const sendRes = await fetch(new URL('/api/whatsapp/send', request.url).toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-crm-auth': process.env.CRM_PASSWORD || '',
            },
            body: JSON.stringify({ to: lead.telefone || lead.contato, text }),
          });
          const sendData = await sendRes.json();
          results.push({ step: 'message', text, sent: !!sendData.ok });
        } catch (e) {
          results.push({ step: 'message', text, sent: false, error: String(e.message || e) });
        }
      } else {
        results.push({ step: 'message', text, sent: false, error: 'Sem telefone' });
      }
    }
    if (step.type === 'set_stage' && step.stage) {
      crm.stage = step.stage;
      results.push({ step: 'set_stage', stage: step.stage });
    }
    if (step.type === 'add_tag' && step.tag) {
      crm.tags = Array.from(new Set([...(crm.tags || []), step.tag]));
      results.push({ step: 'add_tag', tag: step.tag });
    }
    if (step.type === 'wait') {
      results.push({ step: 'wait', minutes: step.minutes || 0 });
    }
  }

  crm.updatedAt = new Date().toISOString();
  meta[lead.id] = crm;
  await saveMeta(token, meta);
  return results;
}

export async function fireTriggers(event, lead, request, token) {
  const flows = await loadFlows(token);
  const fired = [];
  for (const flow of flows) {
    if (!flow.active) continue;
    let match = false;
    if (flow.trigger === event.type) {
      if (flow.trigger === 'contato_coluna' || flow.trigger === 'contato_removido') {
        match = !flow.triggerStage || flow.triggerStage === event.stage;
      } else if (flow.trigger === 'tag_adicionada' || flow.trigger === 'tag_removida') {
        match = !flow.triggerTag || flow.triggerTag === event.tag;
      } else {
        match = true;
      }
    }
    if (flow.trigger === 'novo_contato' && event.type === 'novo_contato') match = true;
    if (match) {
      const results = await runFlowSteps(flow, lead, request, token);
      fired.push({ flowId: flow.id, name: flow.name, results });
    }
  }
  return fired;
}
