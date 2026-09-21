import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Login do CRM.
 * A senha NUNCA fica no código — só em CRM_PASSWORD no ambiente (Vercel).
 * Respostas genéricas: não revela se a senha está errada vs. env ausente.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const pwd = String(body.password || body.auth || '').trim();
    const expected = process.env.CRM_PASSWORD;

    // Sem variável configurada ou senha errada → mesma resposta genérica
    if (!expected || !pwd || pwd !== expected) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    // Não devolve a senha; o cliente guarda só em sessionStorage local
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Falha na autenticação' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    info: 'POST { password } para autenticar. Configure CRM_PASSWORD no Vercel.',
  });
}
