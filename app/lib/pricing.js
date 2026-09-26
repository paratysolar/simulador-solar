/**
 * Precificação competitiva por kWp — alinhada ao mercado 2026 (Leroy / Solfácil / Solar Task).
 * Cliente vê investimento total e R$/kWp, NÃO lista unitária detalhada.
 * Referência mercado: R$ 2.450–3.500/kWp instalado (Solfácil R$ 2,45/Wp).
 * Paraty Solar: agressivo e competitivo na Costa Verde/RJ.
 */

export const HSP = {
  AC: 4.5, AL: 5.2, AP: 4.6, AM: 4.4, BA: 5.4, CE: 5.5, DF: 5.2, ES: 4.8,
  GO: 5.3, MA: 5.1, MT: 5.2, MS: 5.1, MG: 5.0, PA: 4.7, PB: 5.4, PR: 4.6,
  PE: 5.3, PI: 5.4, RJ: 4.5, RN: 5.5, RS: 4.5, RO: 4.8, RR: 4.5, SC: 4.4,
  SP: 4.7, SE: 5.3, TO: 5.2,
};

/** Tabela de preço por kWp instalado (tudo incluso: equipamentos + instalação + homologação) */
export const PRECO_KWP = {
  ongrid: {
    base: 3100,
    mid: 2900,
    large: 2700,
    xl: 2550,
  },
  offgrid: {
    base: 5200,
    mid: 4800,
    large: 4500,
    xl: 4200,
  },
  hibrido: {
    base: 4200,
    mid: 3900,
    large: 3600,
    xl: 3400,
  },
};

/** Catálogo interno (referência técnica — NÃO exibir unitário ao cliente) */
export const CATALOG = {
  modulo_450: { nome: 'Módulo FV N-Type Bifacial 450W', marca: 'Astronergy / Intelbras', unit: 420, w: 450 },
  modulo_550: { nome: 'Módulo FV N-Type 550W', marca: 'Intelbras / Astronergy', unit: 480, w: 550 },
  modulo_620: { nome: 'Módulo FV EMSS-620B N-Type Bifacial', marca: 'Intelbras', unit: 580, w: 620 },
  inv_isv_2002: { nome: 'Inversor Onda Senoidal ISV 2002', marca: 'Intelbras', unit: 1890 },
  inv_ics_5002: { nome: 'Inversor Carregador SEN ICS 5002 G2', marca: 'Intelbras', unit: 4200 },
  inv_hibrido_6k: { nome: 'Inversor On-Grid IONS 6K M Híbrido', marca: 'Intelbras', unit: 6800 },
  inv_ongrid_5k: { nome: 'Inversor On-Grid 5kW String', marca: 'Intelbras', unit: 2800 },
  mppt_2024: { nome: 'Controlador Carga MPPT ECM 2024 G2', marca: 'Intelbras', unit: 890 },
  bat_pb_60: { nome: 'Bateria Estacionária Pb 12V 60Ah', marca: 'Intelbras', unit: 620, kwh: 0.72 },
  bat_pb_150: { nome: 'Bateria Estacionária Pb 12V 150Ah', marca: 'Intelbras', unit: 980, kwh: 1.8 },
  bat_li_dyness: { nome: 'Bateria Lítio Dyness 51,2V 100Ah (5,12 kWh)', marca: 'Dyness', unit: 4800, kwh: 5.12 },
};

const MONTH_FACTORS = [0.85, 0.88, 0.92, 0.95, 1.02, 1.05, 1.08, 1.06, 1.02, 0.98, 0.90, 0.86];
const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function round2(n) { return Math.round(n * 100) / 100; }
function money(n) { return Math.round(n); }

/** Retorna R$/kWp conforme porte e modo */
export function precoPorKwp(mode, kwp, override) {
  const table = (override && override[mode]) || PRECO_KWP[mode] || PRECO_KWP.ongrid;
  if (kwp <= 4) return table.base;
  if (kwp <= 8) return table.mid;
  if (kwp <= 15) return table.large;
  return table.xl;
}

/**
 * Dimensiona sistema com precificação competitiva por kWp.
 * Cliente vê: composição resumida + total + R$/kWp.
 * Não expõe preço unitário de cada item.
 */
export function dimensionar(input) {
  const mode = input.mode || 'ongrid';
  const tarifa = Number(input.tarifa) || 0.95;
  const uf = (input.uf || 'RJ').toUpperCase();
  const hsp = HSP[uf] || 4.8;
  const gasto = Number(input.gasto_rs) || 0;
  const whDia = Number(input.wh_dia) || 0;
  const precoOverride = input.preco_kwp_table || null;

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

  const use620 = kwp >= 18;
  const modW = use620 ? 620 : 550;
  const modulos = Math.ceil((kwp * 1000) / modW);
  const kwpReal = round2((modulos * modW) / 1000);
  const area_m2 = round2(modulos * (use620 ? 2.6 : 2.4));
  const geracao_mes = Math.round(kwpReal * hsp * 30);

  const preco_kwp = precoPorKwp(mode, kwpReal, precoOverride);
  const total = money(kwpReal * preco_kwp);

  const itens = [];
  const modNome = use620
    ? 'Módulo FV N-Type Bifacial 620W (Intelbras)'
    : 'Módulo FV N-Type 550W (Intelbras / Astronergy)';
  itens.push({ item: modNome, marca: 'Intelbras', qtd: modulos, unit: null, total: null });

  if (mode === 'offgrid') {
    if (kwpReal <= 0.6) {
      itens.push({ item: 'Inversor Onda Senoidal ISV 2002 + MPPT', marca: 'Intelbras', qtd: 1, unit: null, total: null });
    } else {
      const invQtd = Math.max(1, Math.ceil(kwpReal / 5));
      itens.push({ item: 'Inversor Carregador SEN ICS 5002 G2', marca: 'Intelbras', qtd: invQtd, unit: null, total: null });
    }
    if (batKwh >= 3) {
      const nBat = Math.max(1, Math.ceil(batKwh / 5.12));
      itens.push({ item: 'Bateria Lítio Dyness 5,12 kWh', marca: 'Dyness', qtd: nBat, unit: null, total: null });
      batKwh = round2(nBat * 5.12);
    } else {
      const nBat = Math.max(2, Math.ceil(batKwh / 1.8));
      itens.push({ item: 'Bateria Estacionária Pb 150Ah', marca: 'Intelbras', qtd: nBat, unit: null, total: null });
      batKwh = round2(nBat * 1.8);
    }
  } else if (mode === 'hibrido') {
    const invQtd = Math.max(1, Math.ceil(kwpReal / 6));
    itens.push({ item: 'Inversor Híbrido IONS 6K M', marca: 'Intelbras', qtd: invQtd, unit: null, total: null });
    const nBat = Math.max(1, Math.ceil(batKwh / 5.12));
    itens.push({ item: 'Bateria Lítio Dyness 5,12 kWh', marca: 'Dyness', qtd: nBat, unit: null, total: null });
    batKwh = round2(nBat * 5.12);
  } else {
    const invQtd = Math.max(1, Math.ceil(kwpReal / 5));
    itens.push({ item: 'Inversor On-Grid String 5kW', marca: 'Intelbras', qtd: invQtd, unit: null, total: null });
  }

  itens.push({ item: 'Estrutura de fixação + cabos + string box + conectores', marca: 'Paraty Solar', qtd: 1, unit: null, total: null });
  itens.push({ item: 'Projeto elétrico, instalação, comissionamento e homologação', marca: 'Paraty Solar', qtd: 1, unit: null, total: null });

  const economiaMes = mode === 'offgrid'
    ? consumoKwh * tarifa
    : Math.min(gasto * 0.92, geracao_mes * tarifa * 0.95);
  const economia_ano = money(economiaMes * 12);
  const payback_anos = economia_ano > 0 ? round2(total / economia_ano) : 0;

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
    preco_kwp_label: `R$ ${preco_kwp.toLocaleString('pt-BR')}/kWp`,
    inversor: itens.find((i) => /inversor/i.test(i.item))?.item || '',
    baterias: batKwh > 0 ? { kwh: batKwh, tipo: batKwh >= 3 ? 'LiFePO4 Dyness' : 'Pb-Ácido Intelbras' } : null,
    area_m2,
    geracao_mes,
    geracao_anual: geracao_mes * 12,
    economia_ano,
    economia_mes: money(economiaMes),
    investimento: total,
    subtotal_equip: null,
    servico: null,
    payback_anos,
    consumo_kwh: round2(consumoKwh),
    gasto_rs: gasto || money(consumoKwh * tarifa),
    tarifa,
    hsp,
    uf,
    itens,
    total,
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
      garantia_modulos: '15 anos produto / 30 anos performance (Grupo Intelbras).',
      garantia_inversor: '5–10 anos conforme modelo.',
      preco: 'Investimento turnkey competitivo (equipamentos + instalação + homologação). Preço por kWp alinhado ao mercado 2026.',
    },
  };
}
