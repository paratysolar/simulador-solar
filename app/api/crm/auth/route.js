import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Login do CRM — não revela a senha nem defaults no cliente.
 * Obrigatório: variável CRM_PASSWORD no Vercel.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const pwd = String(body.password || body.auth || '').trim();
    const expected = process.env.CRM_PASSWORD;

    if (!expected) {
      return NextResponse.json(
        { error: 'CRM_PASSWORD não configurada no servidor. Defina a variável no Vercel.' },
        { status: 503 }
      );
    }

    if (!pwd || pwd !== expected) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Falha na autenticação' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    info: 'POST { password } para autenticar. Configure CRM_PASSWORD no ambiente.',
  });
}
