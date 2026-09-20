import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { fireTriggers, enrichLead, loadMeta, saveMeta } from '../crm/lib';

export const runtime = 'edge';

function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const auth = searchParams.get('auth') || request.headers.get('x-crm-auth') || '';
  return auth === (process.env.CRM_PASSWORD || 'solar2026');
}

function validatePublicLead(data) {
  if (!data || typeof data !== 'object') return 'JSON inválido';
  if (!data.mode) return 'Campo mode ausente';
  if (data.website) return 'Rejeitado';
  const nome = String(data.nome || '').trim();
  const phone = String(data.telefone || data.contato || '').replace(/\D/g, '');
  const cep = String(data.cep || '').replace(/\D/g, '');
  if (nome.length < 3) return 'Nome completo obrigatório';
  if (phone.length < 10 || phone.length > 11) return 'Celular inválido';
  if (cep.length !== 8) return 'CEP inválido';
  if (!String(data.logradouro || data.endereco || '').trim()) return 'Endereço (rua) obrigatório';
  if (!String(data.cidade || '').trim()) return 'Cidade obrigatória';
  if (!data.humanVerified && !data.captchaOk) return 'Verificação humana obrigatória';
  return null;
}

export async function POST(request) {
  try {
    const data = await request.json();
    const err = validatePublicLead(data);
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const phone = String(data.telefone || data.contato || '').replace(/\D/g, '');
    const id = data.id || Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const pathname = 'leads/' + data.mode + '/' + id + '.json';
    const payload = {
      id,
      receivedAt: new Date().toISOString(),
      source: data.source || 'simulador',
      nome: String(data.nome).trim(),
      contato: data.contato || phone,
      telefone: phone,
      cep: data.cep,
      logradouro: data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      cidade: data.cidade || '',
      uf: data.uf || '',
      endereco: data.endereco || '',
      mode: data.mode,
      humanVerified: true,
      gasto: data.gasto,
      tarifa: data.tarifa,
      kwp: data.kwp,
      area: data.area,
      custo: data.custo,
      geracaoMes: data.geracaoMes,
      economiaAno: data.economiaAno,
      payback: data.payback,
      batKwh: data.batKwh,
      whDia: data.whDia,
      investimento: data.investimento,
      roi: data.roi,
      ts: data.ts || new Date().toISOString(),
    };

    if (!token) {
      console.log('[LEAD]', JSON.stringify(payload));
      return NextResponse.json({ ok: true, saved: false, warning: 'Persistência temporária' });
    }

    const blob = await put(pathname, JSON.stringify(payload, null, 2), {
      access: 'public', contentType: 'application/json', token, addRandomSuffix: false,
    });

    try {
      const meta = await loadMeta(token);
      const lead = enrichLead(
        { pathname, url: blob.url, uploadedAt: new Date().toISOString(), data: payload },
        meta
      );
      meta[lead.id] = {
        ...(meta[lead.id] || {}),
        stage: 'novo',
        tags: ['simulador'],
        telefone: phone,
        nome: payload.nome,
        source: 'simulador',
        value: payload.custo || payload.investimento || payload.economiaAno || 0,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      await saveMeta(token, meta);
      await fireTriggers({ type: 'novo_contato' }, lead, request, token);
    } catch (e) {
      console.error('Trigger novo_contato:', e);
    }

    return NextResponse.json({ ok: true, saved: true, id });
  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    return NextResponse.json({ error: 'Falha ao salvar', detail: String(err.message || err) }, { status: 500 });
  }
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    const full = searchParams.get('full') === '1';
    const prefix = mode ? 'leads/' + mode + '/' : 'leads/';
    const { blobs } = await list({ prefix, limit: 150, token });
    const sorted = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    if (!full) {
      return NextResponse.json({
        ok: true, count: sorted.length,
        leads: sorted.map((b) => ({ url: b.url, pathname: b.pathname, uploadedAt: b.uploadedAt })),
      });
    }
    const leads = await Promise.all(sorted.slice(0, 80).map(async (b) => {
      try {
        const res = await fetch(b.url);
        return { url: b.url, pathname: b.pathname, uploadedAt: b.uploadedAt, data: await res.json() };
      } catch {
        return { url: b.url, pathname: b.pathname, uploadedAt: b.uploadedAt, data: null };
      }
    }));
    return NextResponse.json({ ok: true, count: leads.length, leads });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
