import { NextResponse } from 'next/server';
import { hasDatabase, insertProposal, listProposals, getProposal, ensureSchema } from '../../lib/db';

export const runtime = 'edge';

function checkPropAuth(request) {
  const auth = request.headers.get('x-prop-auth') || '';
  const expected = process.env.PROP_PASSWORD || '';
  return expected && auth === expected;
}

const HSP = {
  AC: 4.5, AL: 5.2, AP: 4.6, AM: 4.4, BA: 5.4, CE: 5.5, DF: 5.2, ES: 4.8,
  GO: 5.3, MA: 5.1, MT: 5.2, MS: 5.1, MG: 5.0, PA: 4.7, PB: 5.4, PR: 4.6,
  PE: 5.3, PI: 5.4, RJ: 4.5, RN: 5.5, RS: 4.5, RO: 4.8, RR: 4.5, SC: 4.4,
  SP: 4.7, SE: 5.3, TO: 5.2,
};

function gerarProposta(input) {
  const mode = input.mode || 'ongrid';
  const tarifa = Number(input.tarifa) || 0.95;
  const uf = (input.uf || 'SP').toUpperCase();
  const hsp = HSP[uf] || 4.8;
  const gasto = Number(input.gasto_rs) || 0;
  const whDia = Number(input.wh_dia) || 0;

  let consumoKwh, kwp, batKwh = 0;

  if (mode === 'offgrid' && whDia > 0) {
    consumoKwh = (whDia * 30) / 1000;
    kwp = Math.max(0.4, Math.round(((whDia * 1.3) / (hsp * 1000)) * 100) / 100);
    batKwh = Math.round((whDia * 2) / 500) / 10;
  } else {
    consumoKwh = gasto / tarifa;
    kwp = Math.max(1.2, Math.round(((consumoKwh * 1.05) / (hsp * 30)) * 10) / 10);
    if (mode === 'hibrido') {
      batKwh = Math.round(kwp * 2 * 10) / 10;
      kwp = Math.round(kwp * 1.1 * 10) / 10;
    }
    if (mode === 'offgrid') {
      kwp = Math.round(kwp * 1.35 * 10) / 10;
      batKwh = Math.round(kwp * 3 * 10) / 10;
    }
  }

  const moduloW = 550;
  const modulos = Math.ceil((kwp * 1000) / moduloW);
  const area_m2 = Math.round(modulos * 2.3 * 10) / 10;
  const geracao_mes = Math.round(kwp * hsp * 30);
  const precoModulo = 780;
  const precoInversor = mode === 'offgrid' ? 4200 : mode === 'hibrido' ? 6500 : 2800;
  const precoBat = 1800;
  const instalacao = Math.round(kwp * 900);

  const itens = [
    { item: `Módulo ${moduloW}W`, qtd: modulos, unit: precoModulo, total: modulos * precoModulo },
    { item: mode === 'hibrido' ? 'Inversor híbrido' : mode === 'offgrid' ? 'Inversor off-grid' : 'Inversor string', qtd: 1, unit: precoInversor, total: precoInversor },
  ];
  if (batKwh > 0) {
    itens.push({ item: `Bateria LiFePO4 ${batKwh} kWh`, qtd: 1, unit: Math.round(batKwh * precoBat), total: Math.round(batKwh * precoBat) });
  }
  itens.push({ item: 'Estrutura + cabeamento + proteção', qtd: 1, unit: instalacao, total: instalacao });
  itens.push({ item: 'Mão de obra instalação', qtd: 1, unit: Math.round(kwp * 600), total: Math.round(kwp * 600) });

  const total = itens.reduce((s, i) => s + i.total, 0);
  const economia_ano = Math.round((mode === 'offgrid' ? consumoKwh * tarifa : Math.min(gasto * 0.92, geracao_mes * tarifa * 0.95)) * 12);
  const payback_anos = economia_ano > 0 ? Math.round((total / economia_ano) * 10) / 10 : 0;

  return {
    mode, kwp, modulos, inversor: itens[1].item,
    baterias: batKwh > 0 ? { kwh: batKwh, tipo: 'LiFePO4' } : null,
    area_m2, geracao_mes, economia_ano, investimento: total, payback_anos,
    consumo_kwh: Math.round(consumoKwh * 10) / 10,
    gasto_rs: gasto || Math.round(consumoKwh * tarifa),
    itens, total,
  };
}

export async function POST(request) {
  if (!checkPropAuth(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (!hasDatabase()) return NextResponse.json({ error: 'DATABASE_URL não configurada' }, { status: 503 });
  try {
    const body = await request.json();
    const calc = gerarProposta(body);
    const id = await insertProposal({
      ...calc,
      lead_id: body.lead_id || null,
      cliente_nome: body.cliente_nome,
      cliente_telefone: body.cliente_telefone,
      cliente_email: body.cliente_email,
      endereco: body.endereco,
      cidade: body.cidade,
      uf: body.uf,
      validade_dias: body.validade_dias || 15,
      status: 'gerada',
      created_by: 'prop',
    });
    return NextResponse.json({ ok: true, id, proposal: { id, ...calc } });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function GET(request) {
  if (!checkPropAuth(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (!hasDatabase()) return NextResponse.json({ error: 'DATABASE_URL não configurada' }, { status: 503 });
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const p = await getProposal(id);
      if (!p) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 });
      return NextResponse.json({ ok: true, proposal: p });
    }
    const list = await listProposals({ limit: 50 });
    return NextResponse.json({ ok: true, proposals: list });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
