export const DEFAULT_PIPELINE = {
  id: 'solar-default',
  name: 'Vendas Solar',
  columns: [
    { id: 'novo', label: 'Novos Leads', color: '#0d9488' },
    { id: 'qualificacao', label: 'Em Qualificação', color: '#14b8a6' },
    { id: 'agendamento', label: 'Em Agendamento', color: '#2dd4bf' },
    { id: 'call_agendada', label: 'Call Agendada', color: '#5eead4' },
    { id: 'call_realizada', label: 'Call Realizada', color: '#99f6e4' },
    { id: 'proposta', label: 'Proposta Enviada', color: '#f59e0b' },
    { id: 'fechado', label: 'Concluído', color: '#10b981', isWon: true },
    { id: 'perdido', label: 'Perdido', color: '#ef4444', isLost: true },
  ],
};

export const STAGES = DEFAULT_PIPELINE.columns.map((c) => ({
  id: c.id,
  label: c.label,
  color: c.color,
}));

export const TAGS = [
  'quente', 'morno', 'frio', 'residencial', 'comercial', 'rural',
  'financiamento', 'à vista', 'cliente', 'inativo', 'recuperacao', 'whatsapp',
];

export const TRIGGER_TYPES = [
  { id: 'novo_contato', label: 'Novo Contato', desc: 'Novo lead adicionado' },
  { id: 'tag_adicionada', label: 'Tag adicionada', desc: 'Tag no contato' },
  { id: 'tag_removida', label: 'Tag removida', desc: 'Tag removida' },
  { id: 'contato_coluna', label: 'Contato na coluna', desc: 'Lead movido no funil' },
  { id: 'contato_removido', label: 'Removido da coluna', desc: 'Saiu da coluna' },
  { id: 'ganhar', label: 'Ganhar', desc: 'Oportunidade ganha' },
  { id: 'perder', label: 'Perder', desc: 'Oportunidade perdida' },
  { id: 'keyword', label: 'Palavra-chave', desc: 'Mensagem contém palavra' },
];

export const MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'flows', label: 'Flows', icon: '⚡' },
  { id: 'funil', label: 'Funil de vendas', icon: '🗂️' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'agents', label: 'Agentes de IA', icon: '🤖', badge: 'BETA' },
  { id: 'broadcast', label: 'Broadcast', icon: '📢' },
  { id: 'contatos', label: 'Contatos', icon: '👥' },
  { id: 'calendario', label: 'Calendário', icon: '📅' },
  { id: 'relatorios', label: 'Relatórios', icon: '📈' },
  { id: 'suporte', label: 'Suporte', icon: '🛟' },
  { id: 'settings', label: 'Configurações', icon: '⚙️' },
];

export const REPORT_SECTIONS = [
  { id: 'geral', label: 'Geral' },
  { id: 'funil', label: 'Funil' },
  { id: 'contatos', label: 'Contatos / Leads' },
  { id: 'flows', label: 'Flows / Automações' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'agendamentos', label: 'Agendamentos' },
  { id: 'agentes', label: 'Agentes / Colaboradores' },
];

export const LOSS_REASONS = [
  { id: 'sem_perfil', label: 'Sem perfil' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'concorrente', label: 'Concorrente' },
  { id: 'sem_resposta', label: 'Sem resposta' },
  { id: 'adiou', label: 'Adiou' },
  { id: 'outro', label: 'Outro' },
];

export function stageLabel(id, pipeline) {
  const cols = pipeline?.columns || STAGES;
  return cols.find((s) => s.id === id)?.label || id;
}

export function stageColor(id, pipeline) {
  const cols = pipeline?.columns || STAGES;
  return cols.find((s) => s.id === id)?.color || '#94a3b8';
}

export function fmtMoney(n) {
  return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('pt-BR');
  } catch {
    return String(d);
  }
}

export const DEMO_LEADS = [
  { id: 'demo-1', nome: 'Carlos Mendes', contato: '21998887766', telefone: '21998887766', cidade: 'Paraty', stage: 'novo', tags: ['quente', 'residencial'], value: 28500, source: 'simulador', mode: 'On-Grid' },
  { id: 'demo-2', nome: 'Ana Paula Silva', contato: '21997776655', telefone: '21997776655', cidade: 'Angra dos Reis', stage: 'qualificacao', tags: ['morno', 'comercial'], value: 42000, source: 'whatsapp', mode: 'Híbrido' },
  { id: 'demo-3', nome: 'Roberto Lima', contato: '24996665544', telefone: '24996665544', cidade: 'Ubatuba', stage: 'agendamento', tags: ['quente'], value: 19800, source: 'indicacao', mode: 'Off-Grid' },
  { id: 'demo-4', nome: 'Fernanda Costa', contato: '21995554433', telefone: '21995554433', cidade: 'Paraty', stage: 'call_agendada', tags: ['residencial', 'financiamento'], value: 32000, source: 'anuncio', mode: 'On-Grid' },
  { id: 'demo-5', nome: 'João Pedro', contato: '21994443322', telefone: '21994443322', cidade: 'Mangaratiba', stage: 'call_realizada', tags: ['comercial'], value: 67000, source: 'simulador', mode: 'On-Grid' },
  { id: 'demo-6', nome: 'Mariana Alves', contato: '24993332211', telefone: '24993332211', cidade: 'Paraty', stage: 'proposta', tags: ['quente', 'à vista'], value: 24500, source: 'whatsapp', mode: 'Híbrido' },
  { id: 'demo-7', nome: 'Pedro Santos', contato: '21992221100', telefone: '21992221100', cidade: 'Angra', stage: 'fechado', tags: ['cliente'], value: 38000, source: 'simulador', mode: 'On-Grid' },
  { id: 'demo-8', nome: 'Lucia Ferreira', contato: '21991110099', telefone: '21991110099', cidade: 'Paraty', stage: 'perdido', tags: ['frio'], value: 15000, source: 'anuncio', mode: 'Off-Grid', lossReason: 'financeiro' },
  { id: 'demo-9', nome: 'Bruno Oliveira', contato: '24990009988', telefone: '24990009988', cidade: 'Ubatuba', stage: 'novo', tags: ['rural'], value: 52000, source: 'indicacao', mode: 'Off-Grid' },
  { id: 'demo-10', nome: 'Camila Rocha', contato: '21988887766', telefone: '21988887766', cidade: 'Paraty', stage: 'qualificacao', tags: ['quente', 'residencial'], value: 21000, source: 'simulador', mode: 'On-Grid' },
];
