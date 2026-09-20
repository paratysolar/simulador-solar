import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * POST /api/leads
 * Body: JSON do lead gerado pelo simulador
 */
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data || !data.mode) {
      return NextResponse.json(
        { error: 'JSON inválido ou campo mode ausente' },
        { status: 400 }
      );
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      // Fallback: log only (dev / sem Blob configurado)
      console.log('[LEAD]', JSON.stringify(data));
      return NextResponse.json({
        ok: true,
        saved: false,
        warning: 'BLOB_READ_WRITE_TOKEN não configurado. Lead apenas logado.',
      });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pathname = `leads/${data.mode}/${id}.json`;

    const blob = await put(pathname, JSON.stringify({
      id,
      receivedAt: new Date().toISOString(),
      ...data,
    }, null, 2), {
      access: 'public',
      contentType: 'application/json',
      token,
      addRandomSuffix: false,
    });

    return NextResponse.json({
      ok: true,
      saved: true,
      id,
      url: blob.url,
    });
  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    return NextResponse.json(
      { error: 'Falha ao salvar lead', detail: String(err.message || err) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads
 * Lista os leads salvos (últimos 100)
 */
export async function GET(request) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN não configurado' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    const prefix = mode ? `leads/${mode}/` : 'leads/';

    const { blobs } = await list({
      prefix,
      limit: 100,
      token,
    });

    const sorted = blobs.sort(
      (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );

    return NextResponse.json({
      ok: true,
      count: sorted.length,
      leads: sorted.map((b) => ({
        url: b.url,
        pathname: b.pathname,
        uploadedAt: b.uploadedAt,
        size: b.size,
      })),
    });
  } catch (err) {
    console.error('Erro ao listar leads:', err);
    return NextResponse.json(
      { error: 'Falha ao listar leads', detail: String(err.message || err) },
      { status: 500 }
    );
  }
}
