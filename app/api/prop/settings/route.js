import { NextResponse } from 'next/server';
import { hasDatabase, ensureSchema, sql } from '../../../lib/db';
import { CATALOG_PRODUCTS } from '../../../lib/catalog';

export const runtime = 'edge';

function checkAuth(request) {
  const auth = request.headers.get('x-prop-auth') || request.headers.get('x-crm-auth') || '';
  const expected = process.env.PROP_PASSWORD || process.env.CRM_PASSWORD || '';
  return expected && auth === expected;
}

const LOCAL_PHOTOS = [
  '20240222_095716.jpg','20240224_110459.jpg','20240224_110913.jpg','20240224_111158.jpg','20240224_111200.jpg',
  '20240226_131715.jpg','20240226_131719.jpg','20240505_155359.jpg','20240505_155404.jpg','20240505_155408.jpg',
  '20240615_102913.jpg','20240827_142114.jpg','20240827_142325.jpg','20250211_161337.jpg','20250211_161402.jpg',
  '20250211_161418.jpg','20250626_114815.jpg','20250714_150407.jpg','20250714_150823.jpg','20251017_141001.jpg',
  '20251017_141014.jpg','20251017_141026.jpg','20251021_145736.jpg','20260108_094825.jpg','20260108_115422.jpg',
  '20260109_140820.jpg','20260109_161519.jpg','20260109_161533.jpg','20260109_161543.jpg',
];

const DEFAULT_PHOTOS = {
  cover1: '/prop-photos/20240505_155359.jpg',
  cover2: '/prop-photos/20250211_161337.jpg',
  cover3: '/prop-photos/20240827_142114.jpg',
  portfolio: [
    { src: '/prop-photos/20240222_095716.jpg', title: 'Residencial', place: 'Paraty – RJ' },
    { src: '/prop-photos/20240224_110459.jpg', title: 'Residencial', place: 'Costa Verde – RJ' },
    { src: '/prop-photos/20240505_155404.jpg', title: 'Comercial', place: 'Paraty – RJ' },
    { src: '/prop-photos/20240615_102913.jpg', title: 'Residencial', place: 'Angra dos Reis – RJ' },
    { src: '/prop-photos/20240827_142325.jpg', title: 'Comercial', place: 'Paraty – RJ' },
    { src: '/prop-photos/20250211_161402.jpg', title: 'Residencial', place: 'Costa Verde – RJ' },
    { src: '/prop-photos/20250714_150407.jpg', title: 'Residencial', place: 'Paraty – RJ' },
    { src: '/prop-photos/20251017_141001.jpg', title: 'Comercial', place: 'Paraty – RJ' },
    { src: '/prop-photos/20260108_094825.jpg', title: 'Residencial', place: 'Costa Verde – RJ' },
  ],
  team: [
    '/prop-photos/20251021_145736.jpg',
    '/prop-photos/20260109_140820.jpg',
    '/prop-photos/20260109_161519.jpg',
  ],
};

async function getSetting(key) {
  if (!hasDatabase()) return null;
  await ensureSchema();
  const rows = await sql()`SELECT value FROM app_config WHERE key = ${key} LIMIT 1`;
  return rows[0]?.value ?? null;
}

async function setSetting(key, value) {
  if (!hasDatabase()) return false;
  await ensureSchema();
  await sql()`INSERT INTO app_config (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`;
  return true;
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    let photos = DEFAULT_PHOTOS;
    const saved = await getSetting('proposal_photos');
    if (saved && typeof saved === 'object') {
      photos = {
        cover1: saved.cover1 || DEFAULT_PHOTOS.cover1,
        cover2: saved.cover2 || DEFAULT_PHOTOS.cover2,
        cover3: saved.cover3 || DEFAULT_PHOTOS.cover3,
        portfolio: Array.isArray(saved.portfolio) && saved.portfolio.length ? saved.portfolio : DEFAULT_PHOTOS.portfolio,
        team: Array.isArray(saved.team) && saved.team.length ? saved.team : DEFAULT_PHOTOS.team,
      };
    }
    let products = CATALOG_PRODUCTS;
    if (hasDatabase()) {
      try {
        await ensureSchema();
        const rows = await sql()`SELECT * FROM products WHERE ativo = true ORDER BY categoria, nome`;
        if (rows.length) products = rows;
      } catch (_) {}
    }
    return NextResponse.json({
      ok: true,
      photos,
      defaults: DEFAULT_PHOTOS,
      local_files: LOCAL_PHOTOS.map((f) => `/prop-photos/${f}`),
      products,
      catalog_count: CATALOG_PRODUCTS.length,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function POST(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (body.photos) {
      const p = body.photos;
      const photos = {
        cover1: String(p.cover1 || DEFAULT_PHOTOS.cover1),
        cover2: String(p.cover2 || DEFAULT_PHOTOS.cover2),
        cover3: String(p.cover3 || DEFAULT_PHOTOS.cover3),
        portfolio: Array.isArray(p.portfolio) ? p.portfolio.slice(0, 12) : DEFAULT_PHOTOS.portfolio,
        team: Array.isArray(p.team) ? p.team.slice(0, 6) : DEFAULT_PHOTOS.team,
      };
      const ok = await setSetting('proposal_photos', photos);
      return NextResponse.json({ ok: true, photos, persisted: ok, message: ok ? 'Fotos da proposta salvas.' : 'Salvo (sem banco).' });
    }
    if (body.delete_sku) {
      if (!hasDatabase()) return NextResponse.json({ error: 'DATABASE_URL não configurada' }, { status: 503 });
      await ensureSchema();
      await sql()`UPDATE products SET ativo = false, updated_at = NOW() WHERE sku = ${String(body.delete_sku)}`;
      return NextResponse.json({ ok: true, message: 'Produto desativado.' });
    }
    if (body.product) {
      if (!hasDatabase()) return NextResponse.json({ error: 'DATABASE_URL não configurada' }, { status: 503 });
      await ensureSchema();
      const p = body.product;
      const sku = String(p.sku || '').trim();
      if (!sku || !p.nome || p.preco == null) {
        return NextResponse.json({ error: 'sku, nome e preco são obrigatórios' }, { status: 400 });
      }
      await sql()`INSERT INTO products (sku, nome, categoria, marca, preco, unidade, potencia_w, potencia_kw, kwh, ativo, source, updated_at)
        VALUES (
          ${sku}, ${String(p.nome)}, ${String(p.categoria || 'acessorios')}, ${p.marca || null},
          ${Number(p.preco)}, ${p.unidade || 'un'}, ${p.potencia_w ?? null}, ${p.potencia_kw ?? null},
          ${p.kwh ?? null}, true, ${p.source || 'manual'}, NOW()
        )
        ON CONFLICT (sku) DO UPDATE SET
          nome = EXCLUDED.nome, categoria = EXCLUDED.categoria, marca = EXCLUDED.marca,
          preco = EXCLUDED.preco, unidade = EXCLUDED.unidade, potencia_w = EXCLUDED.potencia_w,
          potencia_kw = EXCLUDED.potencia_kw, kwh = EXCLUDED.kwh, ativo = true, updated_at = NOW()`;
      return NextResponse.json({ ok: true, message: 'Produto salvo.', sku });
    }
    if (body.reset_photos) {
      await setSetting('proposal_photos', DEFAULT_PHOTOS);
      return NextResponse.json({ ok: true, photos: DEFAULT_PHOTOS, message: 'Fotos restauradas ao padrão.' });
    }
    return NextResponse.json({ error: 'Nenhuma ação reconhecida' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
