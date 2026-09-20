import { put, list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const CONFIG_PATH = 'config/whatsapp.json';

function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const auth = searchParams.get('auth') || request.headers.get('x-crm-auth') || '';
  const expected = process.env.CRM_PASSWORD || 'solar2026';
  return auth === expected;
}

async function getConfig(token) {
  try {
    const { blobs } = await list({ prefix: CONFIG_PATH, limit: 1, token });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url);
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  }
  const config = await getConfig(token);
  if (config) {
    return NextResponse.json({
      ok: true,
      connected: true,
      phoneNumberId: config.phoneNumberId || null,
      wabaId: config.wabaId || null,
      displayPhone: config.displayPhone || null,
      businessName: config.businessName || null,
      connectedAt: config.connectedAt || null,
      hasToken: !!config.accessToken,
    });
  }
  return NextResponse.json({ ok: true, connected: false });
}

export async function POST(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  }
  try {
    const body = await request.json();
    const payload = {
      accessToken: body.accessToken || null,
      phoneNumberId: body.phoneNumberId || null,
      wabaId: body.wabaId || null,
      displayPhone: body.displayPhone || null,
      businessName: body.businessName || 'Paraty Solar',
      appId: body.appId || process.env.META_APP_ID || null,
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await put(CONFIG_PATH, JSON.stringify(payload, null, 2), {
      access: 'public',
      contentType: 'application/json',
      token,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return NextResponse.json({ ok: true, connected: true });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  }
  try {
    const { blobs } = await list({ prefix: CONFIG_PATH, limit: 5, token });
    for (const b of blobs) {
      await del(b.url, { token });
    }
    return NextResponse.json({ ok: true, connected: false });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
