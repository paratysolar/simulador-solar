export const STAGES = [
  { id: 'novo', label: 'Novo', color: '#94a3b8' },
  { id: 'contactado', label: 'Contactado', color: '#3b82f6' },
  { id: 'qualificado', label: 'Qualificado', color: '#8b5cf6' },
  { id: 'proposta', label: 'Proposta', color: '#f59e0b' },
  { id: 'negociacao', label: 'Negocia\u00e7\u00e3o', color: '#f97316' },
  { id: 'fechado', label: 'Fechado', color: '#10b981' },
  { id: 'perdido', label: 'Perdido', color: '#ef4444' },
];
export const TAGS = ['quente', 'morno', 'frio', 'residencial', 'comercial', 'rural', 'financiamento', '\u00e0 vista', 'cliente', 'inativo', 'recuperacao'];
export const TRIGGER_TYPES = [
  { id: 'novo_contato', label: 'Novo Contato', desc: 'Novo lead adicionado' },
  { id: 'tag_adicionada', label: 'Tag adicionada', desc: 'Tag no contato' },
  { id: 'tag_removida', label: 'Tag removida', desc: 'Tag removida' },
  { id: 'contato_coluna', label: 'Contato na coluna', desc: 'Lead movido no funil' },
  { id: 'contato_removido', label: 'Removido da coluna', desc: 'Saiu da coluna' },
  { id: 'ganhar', label: 'Ganhar', desc: 'Oportunidade ganha' },
  { id: 'perder', label: 'Perder', desc: 'Oportunidade perdida' },
  { id: 'keyword', label: 'Palavra-chave', desc: 'Mensagem cont\u00e9m palavra' },
];
export const MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: '\ud83d\udcca' },
  { id: 'inbox', label: 'Inbox', icon: '\ud83d\udce5' },
  { id: 'agents', label: 'Agentes de IA', icon: '\ud83e\udd16' },
  { id: 'funil', label: 'Funil de vendas', icon: '\ud83d\uddc2\ufe0f' },
  { id: 'flows', label: 'Automa\u00e7\u00f5es', icon: '\u26a1' },
  { id: 'broadcast', label: 'Broadcast', icon: '\ud83d\udce2' },
  { id: 'contatos', label: 'Contatos', icon: '\ud83d\udc65' },
  { id: 'knowledge', label: 'Conhecimento', icon: '\ud83d\udcda' },
  { id: 'calendario', label: 'Agenda', icon: '\ud83d\udcc5' },
  { id: 'relatorios', label: 'Relat\u00f3rios', icon: '\ud83d\udcc8' },
  { id: 'settings', label: 'Integra\u00e7\u00f5es', icon: '\u2699\ufe0f' },
];
export const LOSS_REASONS = [
  { id: 'sem_perfil', label: 'Sem perfil' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'concorrente', label: 'Concorrente' },
  { id: 'sem_resposta', label: 'Sem resposta' },
  { id: 'adiou', label: 'Adiou' },
  { id: 'outro', label: 'Outro' },
];
export function stageLabel(id) { return STAGES.find(s => s.id === id)?.label || id; }
export function stageColor(id) { return STAGES.find(s => s.id === id)?.color || '#94a3b8'; }
export function fmtMoney(n) { return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
export function fmtDate(d) { if (!d) return '\u2014'; try { return new Date(d).toLocaleString('pt-BR'); } catch { return String(d); } }
