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
    autoReply: true,
    objective: 'Qualificar leads de energia solar, responder dúvidas com a base de conhecimento, agendar visita técnica e mover para proposta quando houver intenção de compra.',
    tone: 'profissional, amigável e objetivo',
    provider: 'rules',
    permissions: ['reply', 'qualify', 'schedule', 'move_funnel', 'add_tag'],
    businessHours: { start: 8, end: 20, days: [1, 2, 3, 4, 5, 6] },
    knowledgeIds: [],
    fallback: 'Olá {{nome}}! Recebemos sua mensagem. Um consultor da Paraty Solar responde em breve. Enquanto isso, pode me contar o valor aproximado da sua conta de luz?',
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
  { id: 'k1', q: 'Vocês parcelam? financiamento cartão', a: 'Sim! Parcelamos em até 12x no cartão ou oferecemos financiamento bancário com entrada facilitada. Posso te passar as opções conforme o valor do projeto.', active: true, source: 'manual', tags: ['preço', 'pagamento'] },
  { id: 'k2', q: 'Qual o prazo de instalação? quanto tempo demora instalar', a: 'Após aprovação do projeto e documentação, a instalação residencial costuma levar de 30 a 60 dias. Projetos comerciais podem variar conforme o porte.', active: true, source: 'manual', tags: ['prazo'] },
  { id: 'k3', q: 'Atendem qual região? Paraty Angra Ubatuba', a: 'Atendemos principalmente o litoral sul fluminense e região de Paraty, Angra dos Reis, Ubatuba e adjacências — projetos residenciais, comerciais e rurais.', active: true, source: 'manual', tags: ['região'] },
  { id: 'k4', q: 'Como funciona a economia na conta? economia redução', a: 'O sistema gera créditos de energia (Geração Distribuída). Em boa parte dos casos a redução da conta fica entre 70% e 95%, conforme consumo e dimensionamento. Quer que eu estime com base no valor da sua conta?', active: true, source: 'manual', tags: ['economia'] },
  { id: 'k5', q: 'Quanto custa? preço valor investimento orçamento', a: 'O investimento depende do consumo mensal e do tipo de instalação (telhado, solo). Em média residencial parte de valores competitivos com payback em poucos anos. Me passa o valor aproximado da conta de luz que eu te oriento melhor.', active: true, source: 'manual', tags: ['preço'] },
  { id: 'k6', q: 'Agendar visita técnica horário reunião call', a: 'Perfeito! Temos horários esta semana. Prefere manhã ou tarde? Um consultor confirma o slot e envia os detalhes. Pode também informar o melhor dia e horário para você.', active: true, source: 'manual', tags: ['agenda'] },
  { id: 'k7', q: 'Manutenção limpeza garantia', a: 'Os painéis exigem pouca manutenção — limpeza periódica e inspeção. Trabalhamos com equipamentos de fabricantes reconhecidos (tipicamente 10 a 25 anos no módulo, conforme modelo). Detalhamos tudo na proposta.', active: true, source: 'manual', tags: ['garantia'] },
  { id: 'k8', q: 'On-grid off-grid híbrido diferença', a: 'On-grid: conectado à rede, gera créditos na conta. Off-grid: independente, com baterias. Híbrido: combina rede + armazenamento. Indicamos o melhor conforme seu perfil de consumo e local.', active: true, source: 'manual', tags: ['técnico'] },
  { id: 'k9', q: 'Simulador dimensionamento kWh', a: 'Você pode usar nosso simulador online para um primeiro dimensionamento, ou me passar o valor da conta e o tipo de imóvel (residencial/comercial/rural) que eu ajudo a estimar.', active: true, source: 'manual', tags: ['simulador'] },
  { id: 'k10', q: 'Olá oi bom dia boa tarde boa noite', a: 'Olá! Sou o assistente da Paraty Solar. Como posso ajudar: dimensionamento, economia na conta, prazo de instalação ou agendar uma conversa com o consultor?', active: true, source: 'manual', tags: ['saudação'] },
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

function scoreKnowledge(item, text) {
  const q = (item.q || '').toLowerCase();
  const a = (item.a || '').toLowerCase();
  const tags = (item.tags || []).map((t) => String(t).toLowerCase());
  let score = 0;
  if (q.length > 4 && text.includes(q.slice(0, Math.min(q.length, 40)))) score += 40;
  const words = q.split(/[\s,?\-/]+/).filter((w) => w.length > 3);
  let hits = 0;
  for (const w of words) { if (text.includes(w)) hits++; }
  if (words.length) score += Math.round((hits / words.length) * 35);
  for (const t of tags) { if (t && text.includes(t)) score += 12; }
  if (/(pre[cç]o|valor|custa|or[cç]amento|investimento)/.test(text) && tags.includes('preço')) score += 15;
  if (/(agendar|visita|hor[aá]rio|reuni)/.test(text) && tags.includes('agenda')) score += 15;
  if (/(econom|reduz|conta de luz)/.test(text) && tags.includes('economia')) score += 15;
  if (/(parcel|financ|cart[aã]o)/.test(text) && (tags.includes('preço') || tags.includes('pagamento'))) score += 15;
  if (/^(oi|ol[aá]|bom dia|boa tarde|boa noite)\b/.test(text) && tags.includes('saudação')) score += 25;
  if (/(solar|painel|energia|kwh|on-grid|off-grid)/.test(text) && /(solar|painel|energia)/.test(a)) score += 5;
  return Math.min(100, score);
}

export async function agentReply(agent, lead, inboundText, token) {
  const knowledge = await loadKnowledge(token);
  let active = knowledge.filter((k) => k.active !== false);
  if (agent?.knowledgeIds?.length) {
    const set = new Set(agent.knowledgeIds);
    const filtered = active.filter((k) => set.has(k.id));
    if (filtered.length) active = filtered;
  }
  const text = (inboundText || '').toLowerCase().trim();
  const nome = lead?.nome || 'cliente';
  let best = null;
  let bestScore = 0;
  for (const k of active) {
    const s = scoreKnowledge(k, text);
    if (s > bestScore) { bestScore = s; best = k; }
  }
  const THRESHOLD = 18;
  let answer = null;
  let knowledgeHit = false;
  let knowledgeId = null;
  if (best && bestScore >= THRESHOLD) {
    answer = best.a;
    knowledgeHit = true;
    knowledgeId = best.id;
  }
  if (!answer) {
    if (/(agendar|visita|hor[aá]rio|reuni[aã]o|quando posso)/i.test(text)) {
      answer = 'Perfeito, ' + nome + '! Temos horários esta semana. Prefere manhã ou tarde? Um consultor confirma o slot.';
    } else if (/(pre[cç]o|valor|quanto custa|or[cç]amento)/i.test(text)) {
      answer = nome + ', o investimento depende do consumo e do telhado. Em geral a economia na conta fica entre 70% e 95%. Pode me passar o valor aproximado da conta de luz?';
    } else if (/(obrigad|valeu|ok|certo)/i.test(text)) {
      answer = 'Por nada, ' + nome + '! Qualquer dúvida sobre energia solar, é só chamar.';
    }
  }
  if (!answer) {
    const fb = agent?.fallback ||
      'Olá {{nome}}! Recebemos sua mensagem. Um consultor da Paraty Solar responde em breve. Enquanto isso, pode me contar o valor aproximado da sua conta de luz?';
    answer = fb.replace(/\{\{nome\}\}/gi, nome).trim();
  }
  return {
    text: answer,
    knowledgeHit,
    knowledgeId,
    score: bestScore,
    agentId: agent?.id,
    agentName: agent?.name,
  };
}
