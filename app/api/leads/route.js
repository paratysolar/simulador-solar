import { NextResponse } from 'next/server';
import { hasDatabase, ensureSchema, insertLead, listLeads } from '../../lib/db';

export const runtime = 'edge';

function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const auth = searchParams.get('auth') || request.headers.get('x-crm-auth') || '';
  const expected = process.env.CRM_PASSWORD || '';
  return expected && auth === expected;
}

function validatePublicLead(data) {
  if (!data || typeof data !== 'object') return 'JSON inválido';
  if (!data.mode) return 'Campo mode ausente';
  if (data.website || data.hpField) return 'Rejeitado';
  const nome = String(data.nome || '').trim();
  const phone = String(data.telefone || data.contato || data.celular || '').replace(/\D/g, '');
  if (nome.length < 2) return 'Nome completo obrigatório';
  if (phone.length < 10 || phone.length > 13) return 'Celular inválido';
  const endereco = String(data.logradouro || data.endereco || data.local || '').trim();
  if (endereco.length < 5) return 'Endereço / local obrigatório';
  const capOk = data.humanVerified || data.captchaOk ||
    (data.captcha != null && data.captchaExpected != null && Number(data.captcha) === Number(data.captchaExpected));
  if (!capOk) return 'Verificação humana obrigatória';
  return null;
}

export async function POST(request) {
  try {
    if (!hasDatabase()) {
      return NextResponse.json({
        error: 'Banco de dados não configurado',
        hint: 'Defina DATABASE_URL ou prop_DATABASE_URL (Neon) nas variáveis de ambiente.',
      }, { status: 503 });
    }
    const data = await request.json();
    const err = validatePublicLead(data);
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const phone = String(data.telefone || data.contato || data.celular || '').replace(/\D/g, '');
    const id = await insertLead({
      ...data,
      telefone: phone,
      celular: phone,
      contato: phone,
      stage: 'novo',
      tags: ['simulador', data.mode, data.tipoLocal].filter(Boolean),
    });

    return NextResponse.json({ ok: true, saved: true, id, storage: 'postgres' });
  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    return NextResponse.json({ error: 'Falha ao salvar', detail: String(err.message || err) }, { status: 500 });
  }
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    if (!hasDatabase()) {
      return NextResponse.json({ error: 'DATABASE_URL não configurada' }, { status: 503 });
    }
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage') || undefined;
    const limit = Math.min(Number(searchParams.get('limit') || 100), 500);
    const leads = await listLeads({ limit, stage });
    return NextResponse.json({ ok: true, leads, storage: 'postgres' });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
