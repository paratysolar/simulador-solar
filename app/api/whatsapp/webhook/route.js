import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'paraty_solar_verify_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!body?.entry) {
      return NextResponse.json({ ok: true });
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;
        const value = change.value || {};
        const messages = value.messages || [];
        const contacts = value.contacts || [];
        const metadata = value.metadata || {};

        for (const msg of messages) {
          const contact = contacts.find((c) => c.wa_id === msg.from) || {};
          const record = {
            id: msg.id,
            from: msg.from,
            timestamp: msg.timestamp,
            type: msg.type,
            text: msg.text?.body || msg.button?.text || msg.interactive?.button_reply?.title || null,
            contactName: contact.profile?.name || null,
            phoneNumberId: metadata.phone_number_id || null,
            direction: 'inbound',
            receivedAt: new Date().toISOString(),
            raw: msg,
          };

          if (blobToken) {
            const pathname = `whatsapp/messages/${msg.from}/${Date.now()}-${msg.id}.json`;
            await put(pathname, JSON.stringify(record, null, 2), {
              access: 'public',
              contentType: 'application/json',
              token: blobToken,
              addRandomSuffix: false,
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ ok: true });
  }
}
