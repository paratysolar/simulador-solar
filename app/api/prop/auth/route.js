import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const expected = process.env.PROP_PASSWORD || '';
    if (!expected) {
      return NextResponse.json({ error: 'PROP_PASSWORD não configurada no servidor' }, { status: 503 });
    }
    if (password !== expected) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 });
  }
}
