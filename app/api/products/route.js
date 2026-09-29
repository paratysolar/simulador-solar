import { NextResponse } from 'next/server';
import { hasDatabase, ensureSchema, listProducts, seedProducts } from '../../lib/db';
import { CATALOG_PRODUCTS, ICMS_RATE } from '../../lib/catalog';

export const runtime = 'edge';

function checkAuth(request) {
  const auth = request.headers.get('x-prop-auth') || request.headers.get('x-crm-auth') || '';
  const expected = process.env.PROP_PASSWORD || process.env.CRM_PASSWORD || '';
  return expected && auth === expected;
}

/**
 * GET /api/products
 * Lista catálogo. ?seed=1 força upsert do PDF Intelbras.
 * ?categoria=modulos|inversores|baterias|estrutura|acessorios
 */
export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get('categoria') || undefined;
  const doSeed = searchParams.get('seed') === '1';

  if (!hasDatabase()) {
    let list = CATALOG_PRODUCTS;
    if (categoria) list = list.filter((p) => p.categoria === categoria);
    return NextResponse.json({
      ok: true,
      source: 'catalog-fallback',
      icms_rate: ICMS_RATE,
      note: 'DATABASE_URL ausente — retornando catálogo embutido (PDF Loja Solar Intelbras).',
      count: list.length,
      products: list,
    });
  }

  try {
    await ensureSchema();
    if (doSeed) {
      const n = await seedProducts();
      const products = await listProducts({ categoria });
      return NextResponse.json({
        ok: true,
        seeded: n,
        icms_rate: ICMS_RATE,
        count: products.length,
        products,
      });
    }
    const products = await listProducts({ categoria });
    if (!products.length) {
      await seedProducts();
      const again = await listProducts({ categoria });
      return NextResponse.json({
        ok: true,
        seeded: true,
        icms_rate: ICMS_RATE,
        count: again.length,
        products: again,
      });
    }
    return NextResponse.json({
      ok: true,
      icms_rate: ICMS_RATE,
      count: products.length,
      products,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
