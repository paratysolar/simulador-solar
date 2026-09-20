export const STAGES = [
  { id: 'novo', label: 'Novo', color: '#94a3b8' },
  { id: 'contactado', label: 'Contactado', color: '#3b82f6' },
  { id: 'qualificado', label: 'Qualificado', color: '#8b5cf6' },
  { id: 'proposta', label: 'Proposta', color: '#f59e0b' },
  { id: 'negociacao', label: 'Negociação', color: '#f97316' },
  { id: 'fechado', label: 'Fechado', color: '#10b981' },
  { id: 'perdido', label: 'Perdido', color: '#ef4444' },
];
export const TAGS = ['quente', 'morno', 'frio', 'residencial', 'comercial', 'rural', 'financiamento', 'à vista', 'cliente'];
export const TRIGGER_TYPES = [
  { id: 'novo_contato', label: 'Novo Contato', desc: 'Novo lead adicionado', icon: '👤+' },
  { id: 'tag_adicionada', label: 'Tag adicionada', desc: 'Tag adicionada ao contato', icon: '🏷️' },
  { id: 'tag_removida', label: 'Tag removida', desc: 'Tag removida do contato', icon: '🏷️×' },
  { id: 'contato_coluna', label: 'Contato na coluna', desc: 'Lead movido para coluna', icon: '→' },
  { id: 'contato_removido', label: 'Removido da coluna', desc: 'Lead saiu da coluna', icon: '←' },
  { id: 'ganhar', label: 'Ganhar', desc: 'Oportunidade ganha', icon: '🏆' },
  { id: 'perder', label: 'Perder', desc: 'Oportunidade perdida', icon: '✕' },
];
export const MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'flows', label: 'Flows', icon: '⚡' },
  { id: 'funil', label: 'Funil de vendas', icon: '🗂️' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'broadcast', label: 'Broadcast', icon: '📢' },
  { id: 'contatos', label: 'Contatos', icon: '👥' },
  { id: 'calendario', label: 'Calendário', icon: '📅' },
  { id: 'relatorios', label: 'Relatórios', icon: '📈' },
  { id: 'settings', label: 'Configurações', icon: '⚙️' },
];

export function stageLabel(id) { return STAGES.find(s => s.id === id)?.label || id; }
export function stageColor(id) { return STAGES.find(s => s.id === id)?.color || '#94a3b8'; }
export function fmtMoney(n) { return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
export function fmtDate(d) { if (!d) return '—'; try { return new Date(d).toLocaleString('pt-BR'); } catch { return String(d); } }
