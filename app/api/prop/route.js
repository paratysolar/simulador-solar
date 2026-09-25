import { NextResponse } from 'next/server';
import { hasDatabase, insertProposal, listProposals, getProposal, ensureSchema } from '../../lib/db';
import { dimensionar } from '../../lib/pricing';

export const runtime = 'edge';

function checkPropAuth(request) {
  const auth = request.headers.get('x-prop-auth') || '';
  const expected = process.env.PROP_PASSWORD || '';
  return expected && auth === expected;
}

export async function POST(request) {
  if (!checkPropAuth(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (!hasDatabase()) return NextResponse.json({ error: 'DATABASE_URL não configurada' }, { status: 503 });
  try {
    const body = await request.json();
    const calc = dimensionar({
      mode: body.mode || 'ongrid',
      tarifa: body.tarifa,
      uf: body.uf,
      gasto_rs: body.gasto_rs,
      wh_dia: body.wh_dia,
      incluir_servico: body.incluir_servico !== false,
    });
    const id = await insertProposal({
      ...calc,
      lead_id: body.lead_id || null,
      cliente_nome: body.cliente_nome,
      cliente_telefone: body.cliente_telefone,
      cliente_email: body.cliente_email,
      endereco: body.endereco,
      cidade: body.cidade,
      uf: body.uf || calc.uf,
      validade_dias: body.validade_dias || 15,
      status: 'gerada',
      created_by: 'prop',
    });
    return NextResponse.json({
      ok: true,
      id,
      proposal: {
        id,
        cliente_nome: body.cliente_nome,
        cliente_telefone: body.cliente_telefone,
        cliente_email: body.cliente_email,
        endereco: body.endereco,
        cidade: body.cidade,
        uf: body.uf || calc.uf,
        ...calc,
      },
    });
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
