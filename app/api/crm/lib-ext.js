import { blobGet, blobPut, loadMeta, loadAllLeads, enrichLead } from './lib';

export const LOSS_REASONS = [
  'sem_perfil', 'financeiro', 'concorrente', 'sem_resposta', 'adiou', 'outro',
];
export const LOSS_LABELS = {
  sem_perfil: 'Sem perfil', financeiro: 'Financeiro', concorrente: 'Concorrente',
  sem_resposta: 'Sem resposta', adiou: 'Adiou', outro: 'Outro',
};

export const DEFAULT_AGENTS = [
  {
    id: 'agente-solar',
    name: 'Consultor Solar Paraty',
    active: true,
    objective: 'Qualificar leads de energia solar, agendar visita t\u00e9cnica e mover para proposta quando houver inten\u00e7\u00e3o de compra.',
    tone: 'profissional, amig\u00e1vel e objetivo',
    provider: 'rules',
    permissions: ['reply', 'qualify', 'schedule', 'move_funnel', 'add_tag'],
    businessHours: { start: 8, end: 20, days: [1, 2, 3, 4, 5, 6] },
    knowledgeIds: [],
  },
];

export async function loadAgents(token) {
  const data = await blobGet('crm/agents.json', token);
  if (data?.agents) return data.agents;
  return DEFAULT_AGENTS;
}

export async function saveAgents(token, agents) {
  await blobPut('crm/agents.json', { agents, updatedAt: new Date().toISOString() }, token);
}

export const DEFAULT_KNOWLEDGE = [
  { id: 'k1', q: 'Voc\u00eas parcelam o plano?', a: 'Sim, em at\u00e9 12x no cart\u00e3o ou financiamento banc\u00e1rio com entrada facilitada.', active: true, source: 'manual' },
  { id: 'k2', q: 'Qual o prazo de instala\u00e7\u00e3o?', a: 'Ap\u00f3s aprova\u00e7\u00e3o do projeto e documenta\u00e7\u00e3o, a instala\u00e7\u00e3o residencial costuma levar de 30 a 60 dias.', active: true, source: 'manual' },
  { id: 'k3', q: 'Atendem qual regi\u00e3o?', a: 'Atendemos principalmente o litoral sul fluminense e regi\u00e3o de Paraty, com projetos residenciais, comerciais e rurais.', active: true, source: 'manual' },
  { id: 'k4', q: 'Como funciona a economia na conta?', a: 'O sistema gera cr\u00e9ditos de energia (GD). Em boa parte dos casos a redu\u00e7\u00e3o da conta fica entre 70% e 95%, conforme consumo e dimensionamento.', active: true, source: 'manual' },
];

export async function loadKnowledge(token) {
  const data = await blobGet('crm/knowledge.json', token);
  if (data?.items) return data.items;
  return DEFAULT_KNOWLEDGE;
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

export function matchSegment(lead, segment) {
  const rules = segment.rules || [];
  for (const r of rules) {
    if (r.type === 'tag_has' && !(lead.tags || []).includes(r.value)) return false;
    if (r.type === 'tag_not' && (lead.tags || []).includes(r.value)) return false;
    if (r.type === 'stage' && lead.stage !== r.value) return false;
    if (r.type === 'source' && lead.source !== r.value) return false;
  }
  return true;
}

export async function agentReply(agent, lead, inboundText, token) {
  const knowledge = await loadKnowledge(token);
  const active = knowledge.filter((k) => k.active !== false);
  const text = (inboundText || '').toLowerCase();
  let answer = null;
  for (const k of active) {
    const q = (k.q || '').toLowerCase();
    const words = q.split(/\s+/).filter((w) => w.length > 3);
    if (words.some((w) => text.includes(w)) || text.includes(q.slice(0, 20))) {
      answer = k.a;
      break;
    }
  }
  if (!answer) {
    answer = ('Ol\u00e1 ' + (lead.nome || '') + '! Recebemos sua mensagem. Um consultor da Paraty Solar responde em breve. Enquanto isso, pode me contar o valor aproximado da sua conta de luz?').trim();
  }
  return { text: answer, knowledgeHit: !!answer, agentId: agent?.id };
}
