import { neon } from '@neondatabase/serverless';
let _sql = null, _ready = false;
function dbUrl() {
  return process.env.DATABASE_URL || process.env.prop_DATABASE_URL || process.env.PROP_DATABASE_URL
    || process.env.prop_POSTGRES_URL || process.env.POSTGRES_URL || process.env.prop_POSTGRES_PRISMA_URL
    || process.env.prop_DATABASE_URL_UNPOOLED || process.env.prop_POSTGRES_URL_NON_POOLING || '';
}
export function hasDatabase() { return Boolean(dbUrl()); }
export function sql() {
  const u = dbUrl();
  if (!u) throw new Error('prop_DATABASE_URL / DATABASE_URL não configurada');
  if (!_sql) _sql = neon(u);
  return _sql;
}
export async function ensureSchema() {
  if (_ready) return;
  const q = sql();
  await q`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY, received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), source TEXT DEFAULT 'simulador',
    mode TEXT NOT NULL, tipo_local TEXT, nome TEXT NOT NULL, email TEXT, telefone TEXT NOT NULL,
    cep TEXT, endereco TEXT, cidade TEXT, uf TEXT, gasto NUMERIC, equipamentos JSONB DEFAULT '[]'::jsonb,
    dimensao JSONB, wh_dia NUMERIC, kwp NUMERIC, area NUMERIC, custo NUMERIC, geracao_mes NUMERIC,
    economia_ano NUMERIC, payback TEXT, bat_kwh NUMERIC, stage TEXT DEFAULT 'novo',
    tags TEXT[] DEFAULT ARRAY['simulador'], notes TEXT, meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await q`CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage)`;
  await q`CREATE INDEX IF NOT EXISTS idx_leads_telefone ON leads(telefone)`;
  await q`CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY, lead_id TEXT, mode TEXT NOT NULL, cliente_nome TEXT, cliente_telefone TEXT,
    cliente_email TEXT, endereco TEXT, cidade TEXT, uf TEXT, consumo_kwh NUMERIC, gasto_rs NUMERIC,
    kwp NUMERIC, modulos INT, inversor TEXT, baterias JSONB, area_m2 NUMERIC, geracao_mes NUMERIC,
    economia_ano NUMERIC, investimento NUMERIC, payback_anos NUMERIC, itens JSONB DEFAULT '[]'::jsonb,
    total NUMERIC, validade_dias INT DEFAULT 15, status TEXT DEFAULT 'rascunho', pdf_url TEXT,
    created_by TEXT, payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  try { await q`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}'::jsonb`; } catch (_) {}
  await q`CREATE TABLE IF NOT EXISTS crm_meta (
    lead_id TEXT PRIMARY KEY, stage TEXT DEFAULT 'novo', tags TEXT[] DEFAULT '{}', notes TEXT,
    value NUMERIC DEFAULT 0, data JSONB DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await q`CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY, phone TEXT NOT NULL, direction TEXT NOT NULL, body TEXT, raw JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await q`CREATE TABLE IF NOT EXISTS app_config (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  _ready = true;
}
export async function insertLead(row) {
  await ensureSchema();
  const id = row.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const phone = row.telefone || row.celular || row.contato;
  await sql()`INSERT INTO leads (id,source,mode,tipo_local,nome,email,telefone,cep,endereco,cidade,uf,gasto,equipamentos,dimensao,wh_dia,kwp,area,custo,geracao_mes,economia_ano,payback,bat_kwh,stage,tags,meta)
    VALUES (${id},${row.source||'simulador'},${row.mode},${row.tipoLocal||row.tipo_local||null},${row.nome},${row.email||null},${phone},${row.cep||null},${row.endereco||row.local||row.logradouro||null},${row.cidade||null},${row.uf||null},${row.gasto??null},${JSON.stringify(row.equipamentos||[])},${row.dimensao?JSON.stringify(row.dimensao):null},${row.whDia??row.wh_dia??null},${row.kwp??null},${row.area??null},${row.custo??null},${row.geracaoMes??row.geracao_mes??null},${row.economiaAno??row.economia_ano??null},${row.payback||null},${row.batKwh??row.bat_kwh??null},${row.stage||'novo'},${row.tags||['simulador']},${JSON.stringify(row.meta||{})})
    ON CONFLICT (id) DO UPDATE SET updated_at=NOW(), meta=EXCLUDED.meta`;
  return id;
}
export async function listLeads({ limit = 100, stage } = {}) {
  await ensureSchema();
  if (stage) return sql()`SELECT * FROM leads WHERE stage=${stage} ORDER BY received_at DESC LIMIT ${limit}`;
  return sql()`SELECT * FROM leads ORDER BY received_at DESC LIMIT ${limit}`;
}
export async function insertProposal(row) {
  await ensureSchema();
  const id = row.id || `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const payload = {
    num_proposta: row.num_proposta,
    validade: row.validade,
    geracaoMensal: row.geracaoMensal,
    consumoMensal: row.consumoMensal,
    meses: row.meses,
    paybackTable: row.paybackTable,
    financiamento: row.financiamento,
    grid_zero: row.grid_zero,
    notes: row.notes,
    modulo_w: row.modulo_w,
    geracao_anual: row.geracao_anual,
    economia_mes: row.economia_mes,
    subtotal_equip: row.subtotal_equip,
    servico: row.servico,
    tarifa: row.tarifa,
    hsp: row.hsp,
  };
  await sql()`INSERT INTO proposals (id,lead_id,mode,cliente_nome,cliente_telefone,cliente_email,endereco,cidade,uf,consumo_kwh,gasto_rs,kwp,modulos,inversor,baterias,area_m2,geracao_mes,economia_ano,investimento,payback_anos,itens,total,validade_dias,status,created_by,payload)
    VALUES (${id},${row.lead_id||null},${row.mode},${row.cliente_nome||null},${row.cliente_telefone||null},${row.cliente_email||null},${row.endereco||null},${row.cidade||null},${row.uf||null},${row.consumo_kwh??null},${row.gasto_rs??null},${row.kwp??null},${row.modulos??null},${row.inversor||null},${row.baterias?JSON.stringify(row.baterias):null},${row.area_m2??null},${row.geracao_mes??null},${row.economia_ano??null},${row.investimento??null},${row.payback_anos??null},${JSON.stringify(row.itens||[])},${row.total??null},${row.validade_dias??15},${row.status||'rascunho'},${row.created_by||null},${JSON.stringify(payload)})`;
  return id;
}
export async function listProposals({ limit = 50 } = {}) {
  await ensureSchema();
  return sql()`SELECT * FROM proposals ORDER BY created_at DESC LIMIT ${limit}`;
}
export async function getProposal(id) {
  await ensureSchema();
  const rows = await sql()`SELECT * FROM proposals WHERE id=${id} LIMIT 1`;
  return rows[0] || null;
}
