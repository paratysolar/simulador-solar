import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const auth = searchParams.get('auth') || request.headers.get('x-crm-auth') || '';
  const expected = process.env.CRM_PASSWORD || 'solar2026';
  return auth === expected;
}

async function getConfig(token) {
  try {
    const { blobs } = await list({ prefix: 'config/whatsapp.json', limit: 1, token });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url);
    return await res.json();
  } catch {
    return null;
  }
}

export async function POST(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { to, text } = body;
    if (!to || !text) {
      return NextResponse.json({ error: 'Campos to e text são obrigatórios' }, { status: 400 });
    }

    const config = await getConfig(blobToken);
    if (!config?.accessToken || !config?.phoneNumberId) {
      return NextResponse.json({
        error: 'WhatsApp não conectado. Vá em Configurações e conecte a conta Meta.',
      }, { status: 400 });
    }

    const phone = String(to).replace(/\D/g, '');
    if (phone.length < 10) {
      return NextResponse.json({ error: 'Número inválido' }, { status: 400 });
    }

    const graphUrl = `https://graph.facebook.com/v22.0/${config.phoneNumberId}/messages`;
    const res = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone,
        type: 'text',
        text: { preview_url: false, body: text },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({
        error: data.error?.message || 'Falha ao enviar',
        detail: data,
      }, { status: 400 });
    }

    const record = {
      id: data.messages?.[0]?.id || `out-${Date.now()}`,
      from: config.displayPhone || config.phoneNumberId,
      to: phone,
      timestamp: String(Math.floor(Date.now() / 1000)),
      type: 'text',
      text,
      direction: 'outbound',
      receivedAt: new Date().toISOString(),
    };
    const pathname = `whatsapp/messages/${phone}/${Date.now()}-out.json`;
    await put(pathname, JSON.stringify(record, null, 2), {
      access: 'public',
      contentType: 'application/json',
      token: blobToken,
      addRandomSuffix: false,
    });

    return NextResponse.json({
      ok: true,
      messageId: data.messages?.[0]?.id,
      note: 'Mensagem de serviço enviada (gratuita dentro da janela de 24h).',
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
