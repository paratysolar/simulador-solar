import { NextResponse } from 'next/server';
import { hasDatabase, ensureSchema, insertLead, listLeads } from '../../lib/db';

export const runtime = 'edge';

/** POST: cria lead de teste no Neon. Protegido por CRM_PASSWORD ou PROP_PASSWORD. */
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

    const leads = await listLeads({ limit: 5 });
    return NextResponse.json({
      ok: true,
      id,
      storage: 'postgres',
      recent: leads.map((l) => ({ id: l.id, nome: l.nome, mode: l.mode, stage: l.stage })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    hasDatabase: hasDatabase(),
    envHints: Object.keys(process.env).filter((k) =>
      /DATABASE|POSTGRES|NEON|PG/i.test(k)
    ),
  });
}
