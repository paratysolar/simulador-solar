import { neon } from '@neondatabase/serverless';
import { defaultPriceConfig, MAO_OBRA_KWP, EQUIP_KWP } from './pricing.js';

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
  await q`CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;

  await q`CREATE TABLE IF NOT EXISTS price_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    mao_obra_kwp NUMERIC NOT NULL DEFAULT 1320,
    equip JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
  )`;
  await q`CREATE TABLE IF NOT EXISTS price_tiers (
    id SERIAL PRIMARY KEY,
    mode TEXT NOT NULL,
    faixa TEXT NOT NULL,
    min_kwp NUMERIC NOT NULL,
    max_kwp NUMERIC,
    equip_kwp NUMERIC NOT NULL,
    mao_obra_kwp NUMERIC NOT NULL DEFAULT 1320,
    active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(mode, faixa)
  )`;

  /* Catálogo de produtos (Intelbras Loja Solar) */
  await q`CREATE TABLE IF NOT EXISTS products (
    sku TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    marca TEXT,
    preco NUMERIC NOT NULL,
    unidade TEXT DEFAULT 'un',
    potencia_w NUMERIC,
    potencia_kw NUMERIC,
    kwh NUMERIC,
    ativo BOOLEAN NOT NULL DEFAULT true,
    source TEXT DEFAULT 'intelbras',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await q`CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria)`;

  _ready = true;
  await seedPriceTables();
  await seedProducts();
}

export async function seedPriceTables() {
  const q = sql();
  const cfg = defaultPriceConfig();

  await q`INSERT INTO price_config (id, mao_obra_kwp, equip, notes, updated_by, updated_at)
    VALUES (
      'default',
      ${cfg.mao_obra_kwp},
      ${JSON.stringify(cfg.equip)},
      'Mão de obra R$ 1320/kWp em kits homologados (on-grid/híbrido). Equipamentos por faixa.',
      'system',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      mao_obra_kwp = COALESCE(NULLIF(price_config.mao_obra_kwp, 0), EXCLUDED.mao_obra_kwp),
      equip = CASE
        WHEN price_config.equip IS NULL OR price_config.equip = '{}'::jsonb
        THEN EXCLUDED.equip
        ELSE price_config.equip
      END,
      updated_at = NOW()`;

  await q`UPDATE price_config
    SET mao_obra_kwp = ${MAO_OBRA_KWP}, updated_at = NOW()
    WHERE id = 'default' AND (mao_obra_kwp IS NULL OR mao_obra_kwp <= 0)`;

  const specs = [
    ['ongrid', 'base', 0, 4, EQUIP_KWP.ongrid.base, MAO_OBRA_KWP],
    ['ongrid', 'mid', 4, 8, EQUIP_KWP.ongrid.mid, MAO_OBRA_KWP],
    ['ongrid', 'large', 8, 15, EQUIP_KWP.ongrid.large, MAO_OBRA_KWP],
    ['ongrid', 'xl', 15, null, EQUIP_KWP.ongrid.xl, MAO_OBRA_KWP],
    ['hibrido', 'base', 0, 4, EQUIP_KWP.hibrido.base, MAO_OBRA_KWP],
    ['hibrido', 'mid', 4, 8, EQUIP_KWP.hibrido.mid, MAO_OBRA_KWP],
    ['hibrido', 'large', 8, 15, EQUIP_KWP.hibrido.large, MAO_OBRA_KWP],
    ['hibrido', 'xl', 15, null, EQUIP_KWP.hibrido.xl, MAO_OBRA_KWP],
    ['offgrid', 'base', 0, 4, EQUIP_KWP.offgrid.base, 0],
    ['offgrid', 'mid', 4, 8, EQUIP_KWP.offgrid.mid, 0],
    ['offgrid', 'large', 8, 15, EQUIP_KWP.offgrid.large, 0],
    ['offgrid', 'xl', 15, null, EQUIP_KWP.offgrid.xl, 0],
  ];
  for (const [mode, faixa, minK, maxK, equip, mo] of specs) {
    await q`INSERT INTO price_tiers (mode, faixa, min_kwp, max_kwp, equip_kwp, mao_obra_kwp, updated_at)
      VALUES (${mode}, ${faixa}, ${minK}, ${maxK}, ${equip}, ${mo}, NOW())
      ON CONFLICT (mode, faixa) DO UPDATE SET
        min_kwp = EXCLUDED.min_kwp,
        max_kwp = EXCLUDED.max_kwp,
        equip_kwp = COALESCE(price_tiers.equip_kwp, EXCLUDED.equip_kwp),
        mao_obra_kwp = EXCLUDED.mao_obra_kwp,
        updated_at = NOW()`;
  }
}

export async function getPriceConfig() {
  await ensureSchema();
  const rows = await sql()`SELECT * FROM price_config WHERE id = 'default' LIMIT 1`;
  if (!rows.length) return defaultPriceConfig();
  const r = rows[0];
  return {
    mao_obra_kwp: Number(r.mao_obra_kwp) || MAO_OBRA_KWP,
    equip: r.equip || EQUIP_KWP,
    notes: r.notes,
    updated_at: r.updated_at,
  };
}

export async function listPriceTiers() {
  await ensureSchema();
  return sql()`SELECT * FROM price_tiers WHERE active = true ORDER BY mode, min_kwp`;
}

export async function savePriceConfig(cfg, updatedBy = 'admin') {
  await ensureSchema();
  const mao = Number(cfg.mao_obra_kwp) || MAO_OBRA_KWP;
  const equip = cfg.equip || EQUIP_KWP;
  await sql()`INSERT INTO price_config (id, mao_obra_kwp, equip, notes, updated_at, updated_by)
    VALUES ('default', ${mao}, ${JSON.stringify(equip)}, ${cfg.notes || null}, NOW(), ${updatedBy})
    ON CONFLICT (id) DO UPDATE SET
      mao_obra_kwp = EXCLUDED.mao_obra_kwp,
      equip = EXCLUDED.equip,
      notes = EXCLUDED.notes,
      updated_at = NOW(),
      updated_by = EXCLUDED.updated_by`;

  if (equip) {
    for (const mode of ['ongrid', 'hibrido', 'offgrid']) {
      const t = equip[mode];
      if (!t) continue;
      const mo = mode === 'offgrid' ? 0 : mao;
      const map = [
        ['base', 0, 4, t.base],
        ['mid', 4, 8, t.mid],
        ['large', 8, 15, t.large],
        ['xl', 15, null, t.xl],
      ];
      for (const [faixa, minK, maxK, val] of map) {
        if (val == null) continue;
        await sql()`INSERT INTO price_tiers (mode, faixa, min_kwp, max_kwp, equip_kwp, mao_obra_kwp, updated_at)
          VALUES (${mode}, ${faixa}, ${minK}, ${maxK}, ${val}, ${mo}, NOW())
          ON CONFLICT (mode, faixa) DO UPDATE SET
            equip_kwp = EXCLUDED.equip_kwp,
            mao_obra_kwp = EXCLUDED.mao_obra_kwp,
            min_kwp = EXCLUDED.min_kwp,
            max_kwp = EXCLUDED.max_kwp,
            updated_at = NOW()`;
      }
    }
  }
  return getPriceConfig();
}

/** Seed catálogo de produtos Intelbras (idempotente upsert). */
export async function seedProducts() {
  const { CATALOG_PRODUCTS } = await import('./catalog.js');
  const q = sql();
  for (const p of CATALOG_PRODUCTS) {
    await q`INSERT INTO products (sku, nome, categoria, marca, preco, unidade, potencia_w, potencia_kw, kwh, ativo, source, updated_at)
      VALUES (
        ${p.sku}, ${p.nome}, ${p.categoria}, ${p.marca || null}, ${p.preco},
        ${p.unidade || 'un'}, ${p.potencia_w ?? null}, ${p.potencia_kw ?? null}, ${p.kwh ?? null},
        ${p.ativo !== false}, 'intelbras', NOW()
      )
      ON CONFLICT (sku) DO UPDATE SET
        nome = EXCLUDED.nome,
        categoria = EXCLUDED.categoria,
        marca = EXCLUDED.marca,
        preco = EXCLUDED.preco,
        unidade = EXCLUDED.unidade,
        potencia_w = EXCLUDED.potencia_w,
        potencia_kw = EXCLUDED.potencia_kw,
        kwh = EXCLUDED.kwh,
        ativo = EXCLUDED.ativo,
        updated_at = NOW()`;
  }
  return CATALOG_PRODUCTS.length;
}

export async function listProducts({ categoria } = {}) {
  await ensureSchema();
  if (categoria) {
    return sql()`SELECT * FROM products WHERE ativo = true AND categoria = ${categoria} ORDER BY nome`;
  }
  return sql()`SELECT * FROM products WHERE ativo = true ORDER BY categoria, nome`;
}

export async function getProduct(sku) {
  await ensureSchema();
  const rows = await sql()`SELECT * FROM products WHERE sku = ${sku} LIMIT 1`;
  return rows[0] || null;
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
    preco_kwp: row.preco_kwp,
    preco_kwp_label: row.preco_kwp_label,
    equip_kwp: row.equip_kwp,
    mao_obra_kwp: row.mao_obra_kwp,
    equip_total: row.equip_total,
    mao_obra: row.mao_obra,
    homologado: row.homologado,
    desconto_icms: row.desconto_icms,
    icms_isento: row.icms_isento,
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
