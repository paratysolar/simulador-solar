/**
 * Catálogo e dimensionamento com preços reais Intelbras (ago/2026).
 * Baseado em propostas reais: Neném, Rodrigo, Neir, Arthur, Geraldo.
 */

export const HSP = {
  AC: 4.5, AL: 5.2, AP: 4.6, AM: 4.4, BA: 5.4, CE: 5.5, DF: 5.2, ES: 4.8,
  GO: 5.3, MA: 5.1, MT: 5.2, MS: 5.1, MG: 5.0, PA: 4.7, PB: 5.4, PR: 4.6,
  PE: 5.3, PI: 5.4, RJ: 4.5, RN: 5.5, RS: 4.5, RO: 4.8, RR: 4.5, SC: 4.4,
  SP: 4.7, SE: 5.3, TO: 5.2,
};

/** Preços unitários aproximados extraídos dos kits reais */
export const CATALOG = {
  modulo_450: { nome: 'Módulo FV N-Type Bifacial 450W', marca: 'Astronergy / Intelbras', unit: 420, w: 450 },
  modulo_620: { nome: 'Módulo FV EMSS-620B N-Type Bifacial', marca: 'Intelbras', unit: 580, w: 620 },
  inv_isv_2002: { nome: 'Inversor Onda Senoidal ISV 2002', marca: 'Intelbras', unit: 1890 },
  inv_ics_5002: { nome: 'Inversor Carregador SEN ICS 5002 G2', marca: 'Intelbras', unit: 4200 },
  inv_hibrido_6k: { nome: 'Inversor On-Grid IONS 6K M Híbrido', marca: 'Intelbras', unit: 6800 },
  inv_ongrid_5k: { nome: 'Inversor On-Grid 5kW String', marca: 'Intelbras', unit: 2800 },
  mppt_2024: { nome: 'Controlador Carga MPPT ECM 2024 G2', marca: 'Intelbras', unit: 890 },
  bat_pb_60: { nome: 'Bateria Estacionária Pb 12V 60Ah', marca: 'Intelbras', unit: 620, kwh: 0.72 },
  bat_pb_150: { nome: 'Bateria Estacionária Pb 12V 150Ah', marca: 'Intelbras', unit: 980, kwh: 1.8 },
  bat_li_dyness: { nome: 'Bateria Lítio Dyness 51,2V 100Ah (5,12 kWh)', marca: 'Dyness', unit: 4800, kwh: 5.12 },
  kit_fix_ceramica: { nome: 'Kit Fix Smart Cerâmica 2,40m', marca: 'Solar Group', unit: 280 },
  kit_fix_fibro: { nome: 'Kit Fix Smart Fibrocimento 2,40m', marca: 'Solar Group', unit: 310 },
  kit_fix_metal: { nome: 'Kit Fix Metálica Smart 2,40m', marca: 'Solar Group', unit: 340 },
  perfil_par: { nome: 'Perfil Smart X Retrato (par) 2,40m', marca: 'Solar Group', unit: 95 },
  grampo: { nome: 'Grampo Intermed Smart 35mm', marca: 'Solar Group', unit: 8 },
  juncao: { nome: 'Kit Junção U Smart X 14cm', marca: 'Solar Group', unit: 18 },
  stringbox_1e1s: { nome: 'String Box 1040V 1E-1S', marca: 'Clamper', unit: 320 },
  stringbox_2e1s: { nome: 'String Box 600V 2E-1S', marca: 'Clamper', unit: 380 },
  stringbox_4e4s: { nome: 'String Box 1000V 4E-4S G2', marca: 'Clamper', unit: 890 },
  mc4: { nome: 'Conector MC4 par (M+F)', marca: 'Intelbras', unit: 28 },
  cabo_vermelho: { nome: 'Cabo solar vermelho 1kV 4mm (25m)', marca: 'Intelbras', unit: 145 },
  cabo_preto: { nome: 'Cabo solar preto 1kV 4mm (25m)', marca: 'Intelbras', unit: 145 },
  cabo_verde: { nome: 'Cabo solar verde 1kV 6mm (25m)', marca: 'Intelbras', unit: 180 },
  medidor: { nome: 'Medidor energia trifásico DTSU666', marca: 'Chint', unit: 450 },
};

const MONTH_FACTORS = [0.85, 0.88, 0.92, 0.95, 1.02, 1.05, 1.08, 1.06, 1.02, 0.98, 0.90, 0.86];
const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function round2(n) { return Math.round(n * 100) / 100; }
function money(n) { return Math.round(n); }

/**
 * Dimensiona sistema e monta BOM realista com preços de catálogo.
 */
export function dimensionar(input) {
  const mode = input.mode || 'ongrid';
  const tarifa = Number(input.tarifa) || 0.95;
  const uf = (input.uf || 'SP').toUpperCase();
  const hsp = HSP[uf] || 4.8;
  const gasto = Number(input.gasto_rs) || 0;
  const whDia = Number(input.wh_dia) || 0;
  const incluirServico = input.incluir_servico !== false;

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

  const use620 = kwp >= 15;
  const modW = use620 ? 620 : 450;
  const modulos = Math.ceil((kwp * 1000) / modW);
  const kwpReal = round2((modulos * modW) / 1000);
  const area_m2 = round2(modulos * (use620 ? 2.6 : 2.3));
  const geracao_mes = Math.round(kwpReal * hsp * 30);

  const itens = [];
  const push = (key, qtd, overrideNome) => {
    const c = CATALOG[key];
    if (!c || qtd <= 0) return;
    itens.push({
      item: overrideNome || c.nome,
      marca: c.marca,
      qtd,
      unit: c.unit,
      total: money(c.unit * qtd),
    });
  };

  push(use620 ? 'modulo_620' : 'modulo_450', modulos);

  if (mode === 'offgrid') {
    if (kwpReal <= 0.6) {
      push('inv_isv_2002', 1);
      push('mppt_2024', 1);
    } else {
      const invQtd = Math.max(1, Math.ceil(kwpReal / 5));
      push('inv_ics_5002', invQtd);
    }
    if (batKwh >= 3) {
      const nBat = Math.max(1, Math.ceil(batKwh / 5.12));
      push('bat_li_dyness', nBat);
      batKwh = round2(nBat * 5.12);
    } else if (batKwh >= 1.5) {
      const nBat = Math.max(2, Math.ceil(batKwh / 1.8));
      push('bat_pb_150', nBat);
      batKwh = round2(nBat * 1.8);
    } else {
      const nBat = Math.max(2, Math.ceil(batKwh / 0.72));
      push('bat_pb_60', nBat);
      batKwh = round2(nBat * 0.72);
    }
  } else if (mode === 'hibrido') {
    const invQtd = Math.max(1, Math.ceil(kwpReal / 6));
    push('inv_hibrido_6k', invQtd);
    const nBat = Math.max(1, Math.ceil(batKwh / 5.12));
    push('bat_li_dyness', nBat);
    batKwh = round2(nBat * 5.12);
  } else {
    const invQtd = Math.max(1, Math.ceil(kwpReal / 5));
    push('inv_ongrid_5k', invQtd);
  }

  const kitsFix = Math.max(1, Math.ceil(modulos / 4));
  push(mode === 'hibrido' && kwpReal > 20 ? 'kit_fix_metal' : 'kit_fix_ceramica', kitsFix);
  push('perfil_par', Math.max(1, Math.ceil(modulos / 2)));
  if (modulos > 4) {
    push('grampo', Math.max(2, modulos - kitsFix * 2));
    push('juncao', Math.max(2, Math.ceil(modulos / 3)));
  }

  if (modulos <= 4) push('stringbox_1e1s', 1);
  else if (modulos <= 12) push('stringbox_2e1s', Math.ceil(modulos / 8));
  else push('stringbox_4e4s', Math.ceil(modulos / 20));

  push('mc4', Math.max(1, Math.ceil(modulos / 4)));
  const caboSets = Math.max(1, Math.ceil(modulos / 8));
  push('cabo_vermelho', caboSets);
  push('cabo_preto', caboSets);
  if (modulos >= 6) push('cabo_verde', caboSets);
  if (mode === 'hibrido' && kwpReal > 10) push('medidor', 1);

  const subtotalEquip = itens.reduce((s, i) => s + i.total, 0);
  const servicoUnit = mode === 'offgrid' ? 1400 : mode === 'hibrido' ? 1200 : 900;
  const servico = incluirServico ? money(Math.max(1500, kwpReal * servicoUnit)) : 0;
  if (servico > 0) {
    itens.push({
      item: 'Serviço de instalação e comissionamento',
      marca: 'Paraty Solar',
      qtd: 1,
      unit: servico,
      total: servico,
    });
  }

  const total = money(subtotalEquip + servico);
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
    inversor: itens.find((i) => /inversor/i.test(i.item))?.item || '',
    baterias: batKwh > 0 ? { kwh: batKwh, tipo: batKwh >= 3 ? 'LiFePO4 Dyness' : 'Pb-Ácido Intelbras' } : null,
    area_m2,
    geracao_mes,
    geracao_anual: geracao_mes * 12,
    economia_ano,
    economia_mes: money(economiaMes),
    investimento: total,
    subtotal_equip: subtotalEquip,
    servico,
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
    },
  };
}
