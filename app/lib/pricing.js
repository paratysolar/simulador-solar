/**
 * Precificação Paraty Solar
 * - Equipamentos por catálogo real (Intelbras Loja Solar)
 * - Mão de obra kits homologados: R$ 1.320 / kWp (fixo)
 * - Kits on-grid/híbrido: isenção ICMS 15% sobre produtos
 * Cliente vê total turnkey + R$/kWp, com itens detalhados do catálogo.
 */

import { buildKitBom, ICMS_RATE, pickModule } from './catalog.js';

export const HSP = {
  AC: 4.5, AL: 5.2, AP: 4.6, AM: 4.4, BA: 5.4, CE: 5.5, DF: 5.2, ES: 4.8,
  GO: 5.3, MA: 5.1, MT: 5.2, MS: 5.1, MG: 5.0, PA: 4.7, PB: 5.4, PR: 4.6,
  PE: 5.3, PI: 5.4, RJ: 4.5, RN: 5.5, RS: 4.5, RO: 4.8, RR: 4.5, SC: 4.4,
  SP: 4.7, SE: 5.3, TO: 5.2,
};

/** Mão de obra instalação + homologação (kits homologados on-grid / híbrido) */
export const MAO_OBRA_KWP = 1320;

/**
 * Preço de equipamentos por kWp (sem mão de obra) — fallback legado; sobrescritos pelo BOM real.
 */
export const EQUIP_KWP = {
  ongrid: {
    base: 1780,
    mid: 1580,
    large: 1430,
    xl: 1600,
  },
  hibrido: {
    base: 2880,
    mid: 2580,
    large: 2280,
    xl: 2080,
  },
  offgrid: {
    base: 5200,
    mid: 4800,
    large: 4500,
    xl: 4200,
  },
};

export const PRECO_KWP = {
  ongrid: {
    base: EQUIP_KWP.ongrid.base + MAO_OBRA_KWP,
    mid: EQUIP_KWP.ongrid.mid + MAO_OBRA_KWP,
    large: EQUIP_KWP.ongrid.large + MAO_OBRA_KWP,
    xl: EQUIP_KWP.ongrid.xl + MAO_OBRA_KWP,
  },
  hibrido: {
    base: EQUIP_KWP.hibrido.base + MAO_OBRA_KWP,
    mid: EQUIP_KWP.hibrido.mid + MAO_OBRA_KWP,
    large: EQUIP_KWP.hibrido.large + MAO_OBRA_KWP,
    xl: EQUIP_KWP.hibrido.xl + MAO_OBRA_KWP,
  },
  offgrid: { ...EQUIP_KWP.offgrid },
};

export const CATALOG = {
  modulo_620: { nome: 'Módulo FV EMSS-620B N-Type Bifacial', marca: 'Intelbras', unit: 716.18, w: 620 },
  inv_ics_5002: { nome: 'Inversor Carregador SEN ICS 5002 G2', marca: 'Intelbras', unit: 4913.14 },
  inv_hibrido_6k: { nome: 'Inversor On-Grid IONS 6K M Híbrido', marca: 'Intelbras', unit: 10430.64 },
  inv_ongrid_5k: { nome: 'Inversor On-Grid IONS-5K M5 AFCI', marca: 'Intelbras', unit: 3837.84 },
  bat_pb_150: { nome: 'Bateria Estacionária Pb 12V 150Ah', marca: 'Intelbras', unit: 1230.41, kwh: 1.8 },
  bat_li_dyness: { nome: 'Bateria Lítio Dyness 51,2V 100Ah (5,12 kWh)', marca: 'Dyness', unit: 8080.24, kwh: 5.12 },
};

const MONTH_FACTORS = [0.85, 0.88, 0.92, 0.95, 1.02, 1.05, 1.08, 1.06, 1.02, 0.98, 0.90, 0.86];
const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function round2(n) { return Math.round(n * 100) / 100; }
function money(n) { return Math.round(n); }

function faixaKey(kwp) {
  if (kwp <= 4) return 'base';
  if (kwp <= 8) return 'mid';
  if (kwp <= 15) return 'large';
  return 'xl';
}

export function calcularPrecoKwp(mode, kwp, cfg) {
  const m = mode || 'ongrid';
  const fk = faixaKey(kwp);
  const equipTable = (cfg?.equip && cfg.equip[m]) || EQUIP_KWP[m] || EQUIP_KWP.ongrid;
  const equip = Number(equipTable[fk]) || EQUIP_KWP.ongrid.base;

  const isHomologado = m === 'ongrid' || m === 'hibrido';
  const maoObraUnit = isHomologado
    ? (Number(cfg?.mao_obra_kwp) || MAO_OBRA_KWP)
    : 0;
  const mao_obra = isHomologado ? money(kwp * maoObraUnit) : 0;
  const equip_total = money(kwp * equip);
  const total = equip_total + mao_obra;
  const preco_kwp = kwp > 0 ? money(total / kwp) : equip + maoObraUnit;

  const total_min = money(total * 0.90);
  const total_max = money(total * 1.25);
  const preco_kwp_min = kwp > 0 ? money(total_min / kwp) : money(preco_kwp * 0.90);
  const preco_kwp_max = kwp > 0 ? money(total_max / kwp) : money(preco_kwp * 1.25);

  return {
    equip_kwp: equip,
    mao_obra_kwp: maoObraUnit,
    equip_total,
    mao_obra,
    total,
    total_min,
    total_max,
    preco_kwp,
    preco_kwp_min,
    preco_kwp_max,
    homologado: isHomologado,
    faixa: fk,
  };
}

/** @deprecated use calcularPrecoKwp */
export function precoPorKwp(mode, kwp, override) {
  const cfg = override
    ? { equip: override, mao_obra_kwp: MAO_OBRA_KWP }
    : null;
  return calcularPrecoKwp(mode, kwp, cfg).preco_kwp;
}

export function dimensionar(input) {
  const mode = input.mode || 'ongrid';
  const tarifa = Number(input.tarifa) || 0.95;
  const uf = (input.uf || 'RJ').toUpperCase();
  const hsp = HSP[uf] || 4.8;
  const gasto = Number(input.gasto_rs) || 0;
  const whDia = Number(input.wh_dia) || 0;
  const priceCfg = input.price_cfg || null;

  let consumoKwh, kwp, batKwh = 0;

  if ((mode === 'offgrid' || mode === 'hibrido') && whDia > 0) {
    consumoKwh = (whDia * 30) / 1000;
    kwp = Math.max(0.45, round2((whDia * 1.3) / (hsp * 1000)));
    batKwh = mode === 'offgrid'
      ? round2((whDia * 2) / 1000 / 0.5)
      : round2(kwp * 2);
  } else if (mode === 'offgrid' && gasto > 0) {
    consumoKwh = gasto / tarifa;
    kwp = Math.max(0.9, round2((consumoKwh * 1.35) / (hsp * 30)));
    batKwh = round2(kwp * 3);
  } else {
    consumoKwh = gasto / tarifa;
    kwp = Math.max(1.2, round2((consumoKwh * 1.05) / (hsp * 30)));
    if (mode === 'hibrido') {
      batKwh = round2(kwp * 2);
      kwp = round2(kwp * 1.1);
    }
  }

  const modW = 620;
  const modulos = Math.ceil((kwp * 1000) / modW);
  const kwpReal = round2((modulos * modW) / 1000);
  const area_m2 = round2(modulos * 2.6);
  const geracao_mes = Math.round(kwpReal * hsp * 30);

  // BOM real (catálogo Intelbras) + isenção ICMS 15% em kits on-grid/híbrido
  const bom = buildKitBom({ mode, kwp: kwpReal, modulos, batKwh });
  const maoObraUnit = (mode === 'ongrid' || mode === 'hibrido')
    ? (Number(priceCfg?.mao_obra_kwp) || MAO_OBRA_KWP)
    : 0;
  const mao_obra = mode === 'offgrid' ? 0 : money(kwpReal * maoObraUnit);
  const equip_total = money(bom.subtotal_produtos);
  const total = equip_total + mao_obra;
  const total_min = money(total * 0.90);
  const total_max = money(total * 1.25);
  const preco_kwp = kwpReal > 0 ? money(total / kwpReal) : 0;
  const preco = {
    equip_kwp: kwpReal > 0 ? money(equip_total / kwpReal) : 0,
    mao_obra_kwp: maoObraUnit,
    equip_total,
    mao_obra,
    total,
    total_min,
    total_max,
    preco_kwp,
    preco_kwp_min: kwpReal > 0 ? money(total_min / kwpReal) : 0,
    preco_kwp_max: kwpReal > 0 ? money(total_max / kwpReal) : 0,
    homologado: mode === 'ongrid' || mode === 'hibrido',
    faixa: faixaKey(kwpReal),
    desconto_icms: bom.desconto_icms,
    subtotal_com_icms: bom.subtotal_com_icms,
    icms_isento: bom.icms_isento,
  };

  const itens = bom.items.map((i) => ({
    sku: i.sku,
    item: i.item,
    marca: i.marca,
    categoria: i.categoria,
    qtd: i.qtd,
    unit: i.unit,
    total: i.total,
  }));
  if (bom.desconto_icms > 0) {
    itens.push({
      item: `Isenção ICMS ${Math.round(ICMS_RATE * 100)}% (kit homologado)`,
      marca: 'Legislação GD',
      qtd: 1,
      unit: -bom.desconto_icms,
      total: -bom.desconto_icms,
    });
  }
  if (mao_obra > 0) {
    itens.push({
      item: `Mão de obra instalação e homologação (R$ ${maoObraUnit.toLocaleString('pt-BR')}/kWp)`,
      marca: 'Paraty Solar',
      qtd: 1,
      unit: mao_obra,
      total: mao_obra,
    });
  } else if (mode === 'offgrid') {
    itens.push({
      item: 'Projeto elétrico, instalação e comissionamento (incluso no pacote)',
      marca: 'Paraty Solar',
      qtd: 1,
      unit: null,
      total: null,
    });
  }
  const batItem = bom.items.find((i) => i.categoria === 'baterias');
  if (batItem && batItem.sku === '4301496') {
    batKwh = round2(batItem.qtd * 5.12);
  }

  const economiaMes = mode === 'offgrid'
    ? consumoKwh * tarifa
    : Math.min(gasto * 0.92, geracao_mes * tarifa * 0.95);
  const economia_ano = money(economiaMes * 12);
  const payback_anos = economia_ano > 0 ? round2(total / economia_ano) : 0;
  const pbSimples = economia_ano > 0 ? total / economia_ano : 0;
  const payback_min = pbSimples > 0 ? Math.max(2, Math.floor(pbSimples * 1.6)) : 0;
  const payback_max = pbSimples > 0 ? Math.max(payback_min + 1, Math.ceil(pbSimples * 2.2)) : 0;

  const geracaoMensal = MONTH_FACTORS.map((f) => Math.round(geracao_mes * f));
  const consumoMensal = MONTHS.map(() => Math.round(consumoKwh));

  const paybackTable = [];
  let acum = 0;
  let tarifaY = tarifa;
  for (let y = 1; y <= 25; y++) {
    const deg = Math.pow(0.995, y - 1);
    const genY = geracao_mes * 12 * deg;
    const econY = genY * tarifaY * (mode === 'offgrid' ? 1 : 0.92);
    acum += econY;
    if (y === 5 || y === 10 || y === 15 || y === 20 || y === 25) {
      paybackTable.push({
        ano: y,
        geracao: Math.round(genY),
        economia_acum: money(acum),
        retorno: money(acum - total),
      });
    }
    tarifaY *= 1.06;
  }

  const parcela21 = money(total * 0.065);
  const parcela6 = money(total / 6);
  const numProposta = `PROP${Date.now().toString().slice(-8)}`;
  const validade = new Date();
  validade.setDate(validade.getDate() + 15);

  return {
    num_proposta: numProposta,
    validade: validade.toISOString().slice(0, 10),
    mode,
    kwp: kwpReal,
    modulos,
    modulo_w: modW,
    preco_kwp,
    preco_kwp_min: preco.preco_kwp_min,
    preco_kwp_max: preco.preco_kwp_max,
    preco_kwp_label: `Entre R$ ${preco.preco_kwp_min.toLocaleString('pt-BR')} e R$ ${preco.preco_kwp_max.toLocaleString('pt-BR')}/kWp`,
    equip_kwp: preco.equip_kwp,
    mao_obra_kwp: preco.mao_obra_kwp,
    equip_total: preco.equip_total,
    mao_obra: preco.mao_obra,
    homologado: preco.homologado,
    faixa: preco.faixa,
    inversor: bom.inversor?.nome || itens.find((i) => /inversor/i.test(i.item))?.item || '',
    baterias: batKwh > 0 ? { kwh: batKwh, tipo: batKwh >= 3 ? 'LiFePO4 Dyness' : 'Pb-Ácido Intelbras' } : null,
    area_m2,
    geracao_mes,
    geracao_anual: geracao_mes * 12,
    economia_ano,
    economia_mes: money(economiaMes),
    investimento: total,
    investimento_min: total_min,
    investimento_max: total_max,
    subtotal_equip: preco.equip_total,
    servico: preco.mao_obra,
    payback_anos,
    payback_min,
    payback_max,
    payback_label: payback_min && payback_max
      ? `Entre ${payback_min} e ${payback_max} anos`
      : '—',
    consumo_kwh: round2(consumoKwh),
    gasto_rs: gasto || money(consumoKwh * tarifa),
    tarifa,
    hsp,
    uf,
    itens,
    total,
    total_min,
    total_max,
    desconto_icms: bom.desconto_icms || 0,
    subtotal_com_icms: bom.subtotal_com_icms || equip_total,
    icms_isento: Boolean(bom.icms_isento),
    geracaoMensal,
    consumoMensal,
    meses: MONTHS,
    paybackTable,
    financiamento: {
      parcela_6x_sem_juros: parcela6,
      parcela_21x: parcela21,
      cartao_6x: parcela6,
      cartao_21x: parcela21,
    },
    grid_zero: mode === 'ongrid' && kwpReal <= 7.5,
    notes: {
      lei: 'Dimensionamento alinhado à Lei 14.300/22 e REN ANEEL.',
      garantia_modulos: '12 anos de fabricação das placas / 25 anos de performance.',
      garantia_inversor: '10 anos de garantia dos inversores.',
      preco: preco.homologado
        ? `Produtos Intelbras (catálogo) com isenção ICMS 15% + mão de obra R$ ${preco.mao_obra_kwp}/kWp.`
        : 'Pacote off-grid turnkey (equipamentos + instalação).',
      icms: bom.icms_isento
        ? `Kit homologado: isenção de ICMS sobre produtos (R$ ${Number(bom.desconto_icms || 0).toLocaleString('pt-BR')}).`
        : null,
    },
  };
}

export function defaultPriceConfig() {
  return {
    mao_obra_kwp: MAO_OBRA_KWP,
    equip: JSON.parse(JSON.stringify(EQUIP_KWP)),
    updated_at: new Date().toISOString(),
  };
}
