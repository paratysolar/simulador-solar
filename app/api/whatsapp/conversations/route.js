import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const auth = searchParams.get('auth') || request.headers.get('x-crm-auth') || '';
  const expected = process.env.CRM_PASSWORD || 'solar2026';
  return auth === expected;
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    const prefix = phone
      ? `whatsapp/messages/${phone.replace(/\D/g, '')}/`
      : 'whatsapp/messages/';

    const { blobs } = await list({ prefix, limit: 200, token });
    const sorted = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    const byPhone = {};
    const slice = sorted.slice(0, 100);
    await Promise.all(
      slice.map(async (b) => {
        try {
          const res = await fetch(b.url);
          const data = await res.json();
          const key = data.from || data.to || 'unknown';
          if (!byPhone[key]) {
            byPhone[key] = {
              phone: key,
              contactName: data.contactName || null,
              messages: [],
              lastAt: data.receivedAt || b.uploadedAt,
            };
          }
          byPhone[key].messages.push(data);
          if (data.contactName) byPhone[key].contactName = data.contactName;
        } catch {
          /* skip */
        }
      })
    );

    const conversations = Object.values(byPhone)
      .map((c) => ({
        ...c,
        messages: c.messages.sort(
          (a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0)
        ),
      }))
      .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

    return NextResponse.json({ ok: true, count: conversations.length, conversations });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
