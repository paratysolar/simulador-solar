import { NextResponse } from 'next/server';
import {
  hasDatabase,
  ensureSchema,
  getPriceConfig,
  listPriceTiers,
  savePriceConfig,
  seedPriceTables,
} from '../../lib/db';
import { MAO_OBRA_KWP, defaultPriceConfig } from '../../lib/pricing';

export const runtime = 'edge';

function checkAuth(request) {
  const auth = request.headers.get('x-prop-auth') || request.headers.get('x-crm-auth') || '';
  const expected = process.env.PROP_PASSWORD || process.env.CRM_PASSWORD || '';
  return expected && auth === expected;
}

/**
 * GET /api/pricing
 * Retorna config de preço + tiers. Seed automático se tabelas vazias.
 * Query: ?seed=1 força re-seed com defaults (mão de obra 1320).
 */
export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  if (!hasDatabase()) {
    return NextResponse.json(
      {
        error: 'DATABASE_URL não configurada',
        fallback: defaultPriceConfig(),
        mao_obra_kwp: MAO_OBRA_KWP,
      },
      { status: 503 }
    );
  }
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    if (searchParams.get('seed') === '1') {
      // Force refresh seed values (upsert mao_obra 1320)
      await seedPriceTables();
      await savePriceConfig(defaultPriceConfig(), 'seed-api');
    }
    const cfg = await getPriceConfig();
    const tiers = await listPriceTiers();
    return NextResponse.json({
      ok: true,
      mao_obra_kwp: cfg.mao_obra_kwp,
      config: cfg,
      tiers,
      notes:
        'Kits homologados (on-grid/híbrido): mão de obra R$ ' +
        (cfg.mao_obra_kwp || MAO_OBRA_KWP) +
        '/kWp. Off-grid: pacote turnkey sem linha separada de MO.',
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

/**
 * POST /api/pricing
 * Body: { mao_obra_kwp?: number, equip?: { ongrid, hibrido, offgrid }, notes?: string }
 * Atualiza price_config e sincroniza price_tiers.
 */
export async function POST(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  if (!hasDatabase()) {
    return NextResponse.json({ error: 'DATABASE_URL não configurada' }, { status: 503 });
  }
  try {
    const body = await request.json();
    const mao = body.mao_obra_kwp != null ? Number(body.mao_obra_kwp) : MAO_OBRA_KWP;
    if (Number.isNaN(mao) || mao < 0) {
      return NextResponse.json({ error: 'mao_obra_kwp inválido' }, { status: 400 });
    }
    const cfg = await savePriceConfig(
      {
        mao_obra_kwp: mao,
        equip: body.equip || undefined,
        notes:
          body.notes ||
          `Mão de obra R$ ${mao}/kWp em kits homologados (on-grid/híbrido).`,
      },
      body.updated_by || 'admin'
    );
    const tiers = await listPriceTiers();
    return NextResponse.json({
      ok: true,
      config: cfg,
      tiers,
      message: `Precificação salva. Mão de obra: R$ ${cfg.mao_obra_kwp}/kWp`,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
