import { NextResponse } from 'next/server';
import {
  hasDatabase,
  ensureSchema,
  insertLead,
  listLeads,
  seedPriceTables,
  getPriceConfig,
  listPriceTiers,
} from '../../lib/db';
import { MAO_OBRA_KWP } from '../../lib/pricing';

export const runtime = 'edge';

/** POST: seed lead de teste + tabelas de preço (mão de obra R$ 1320/kWp). */
export async function POST(request) {
  try {
    const auth = request.headers.get('x-crm-auth') || request.headers.get('x-prop-auth') || '';
    const ok =
      (process.env.CRM_PASSWORD && auth === process.env.CRM_PASSWORD) ||
      (process.env.PROP_PASSWORD && auth === process.env.PROP_PASSWORD);
    if (!ok) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    if (!hasDatabase()) {
      return NextResponse.json({
        error: 'Banco não configurado',
        hint: 'prop_DATABASE_URL ou DATABASE_URL',
        envKeys: Object.keys(process.env).filter((k) =>
          /DATABASE|POSTGRES|NEON|PG/i.test(k)
        ),
      }, { status: 503 });
    }

    await ensureSchema();
    await seedPriceTables();

    const id = await insertLead({
      mode: 'offgrid',
      tipoLocal: 'offgrid',
      nome: 'Cliente Teste Off-Grid',
      email: 'teste@paratysolar.com',
      telefone: '11988776655',
      endereco: 'Av. Paulista 1000, São Paulo - SP',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01310-100',
      gasto: 285,
      whDia: 3200,
      equipamentos: [
        { id: 'geladeira', nome: 'Geladeira 150W', watts: 150, horas: 24, wh: 3600 },
        { id: 'lampada_led', nome: 'Lâmpada LED 10W', watts: 10, horas: 5, wh: 50 },
        { id: 'tv_43', nome: 'TV 43" 80W', watts: 80, horas: 3, wh: 240 },
      ],
      dimensao: {
        embarcacao: { tipo: 'lancha', comprimento: 7.5, largura: 2.4 },
        motorhome: { tipo: 'motorhome', comprimento: 6.5, largura: 2.3 },
      },
      kwp: 2.1,
      area: 14,
      custo: 24500,
      geracaoMes: 300,
      economiaAno: 3200,
      payback: '7,7 anos',
      batKwh: 6.4,
      source: 'seed-teste',
      stage: 'novo',
      tags: ['simulador', 'offgrid', 'teste'],
      meta: { seed: true },
    });

    const priceCfg = await getPriceConfig();
    const tiers = await listPriceTiers();
    const leads = await listLeads({ limit: 5 });

    return NextResponse.json({
      ok: true,
      id,
      storage: 'postgres',
      price: {
        mao_obra_kwp: priceCfg.mao_obra_kwp,
        expected: MAO_OBRA_KWP,
        tiers_count: tiers.length,
        notes: priceCfg.notes,
      },
      recent: leads.map((l) => ({ id: l.id, nome: l.nome, mode: l.mode, stage: l.stage })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    hasDatabase: hasDatabase(),
    mao_obra_kwp_default: MAO_OBRA_KWP,
    envHints: Object.keys(process.env).filter((k) =>
      /DATABASE|POSTGRES|NEON|PG/i.test(k)
    ),
  });
}
