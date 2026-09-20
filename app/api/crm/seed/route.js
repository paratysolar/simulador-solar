import { NextResponse } from 'next/server';
import { checkAuth, loadMeta, saveMeta, blobPut } from '../lib';

export const runtime = 'edge';

const DEMO = [
  { id: 'demo-1', nome: 'Carlos Mendes', contato: '21998887766', telefone: '21998887766', cidade: 'Paraty', stage: 'novo', tags: ['quente', 'residencial'], value: 28500, source: 'simulador', mode: 'On-Grid' },
  { id: 'demo-2', nome: 'Ana Paula Silva', contato: '21997776655', telefone: '21997776655', cidade: 'Angra dos Reis', stage: 'qualificacao', tags: ['morno', 'comercial'], value: 42000, source: 'whatsapp', mode: 'Híbrido' },
  { id: 'demo-3', nome: 'Roberto Lima', contato: '24996665544', telefone: '24996665544', cidade: 'Ubatuba', stage: 'agendamento', tags: ['quente'], value: 19800, source: 'indicacao', mode: 'Off-Grid' },
  { id: 'demo-4', nome: 'Fernanda Costa', contato: '21995554433', telefone: '21995554433', cidade: 'Paraty', stage: 'call_agendada', tags: ['residencial', 'financiamento'], value: 32000, source: 'anuncio', mode: 'On-Grid' },
  { id: 'demo-5', nome: 'João Pedro', contato: '21994443322', telefone: '21994443322', cidade: 'Mangaratiba', stage: 'call_realizada', tags: ['comercial'], value: 67000, source: 'simulador', mode: 'On-Grid' },
  { id: 'demo-6', nome: 'Mariana Alves', contato: '24993332211', telefone: '24993332211', cidade: 'Paraty', stage: 'proposta', tags: ['quente', 'à vista'], value: 24500, source: 'whatsapp', mode: 'Híbrido' },
  { id: 'demo-7', nome: 'Pedro Santos', contato: '21992221100', telefone: '21992221100', cidade: 'Angra', stage: 'fechado', tags: ['cliente'], value: 38000, source: 'simulador', mode: 'On-Grid' },
  { id: 'demo-8', nome: 'Lucia Ferreira', contato: '21991110099', telefone: '21991110099', cidade: 'Paraty', stage: 'perdido', tags: ['frio'], value: 15000, source: 'anuncio', mode: 'Off-Grid', lossReason: 'financeiro' },
  { id: 'demo-9', nome: 'Bruno Oliveira', contato: '24990009988', telefone: '24990009988', cidade: 'Ubatuba', stage: 'novo', tags: ['rural'], value: 52000, source: 'indicacao', mode: 'Off-Grid' },
  { id: 'demo-10', nome: 'Camila Rocha', contato: '21988887766', telefone: '21988887766', cidade: 'Paraty', stage: 'qualificacao', tags: ['quente', 'residencial'], value: 21000, source: 'simulador', mode: 'On-Grid' },
  { id: 'demo-11', nome: 'Ricardo Nunes', contato: '21987654321', telefone: '21987654321', cidade: 'Paraty', stage: 'proposta', tags: ['comercial'], value: 89000, source: 'anuncio', mode: 'On-Grid' },
  { id: 'demo-12', nome: 'Patricia Dias', contato: '24981234567', telefone: '24981234567', cidade: 'Angra', stage: 'fechado', tags: ['cliente', 'residencial'], value: 27500, source: 'whatsapp', mode: 'Híbrido' },
];

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const body = await request.json().catch(() => ({}));
    const now = new Date().toISOString();
    const meta = await loadMeta(token);

    if (body.single) {
      const d = body.single;
      const id = d.id || 'opp-' + Date.now();
      const leadPayload = {
        id, nome: d.nome, contato: d.telefone || d.contato,
        telefone: d.telefone, mode: d.mode || 'CRM', source: d.source || 'crm',
        receivedAt: now, ts: now,
      };
      await blobPut(`leads/${id}.json`, leadPayload, token);
      meta[id] = {
        stage: d.stage || 'novo', tags: d.tags || ['manual'],
        telefone: d.telefone, nome: d.nome, value: d.value || 0,
        source: d.source || 'crm', notes: [], updatedAt: now, createdAt: now,
      };
      await saveMeta(token, meta);
      return NextResponse.json({ ok: true, created: 1, id, message: 'Oportunidade criada' });
    }

    let created = 0;
    for (const d of DEMO) {
      const leadPayload = {
        id: d.id, nome: d.nome, contato: d.contato, telefone: d.telefone,
        cidade: d.cidade, mode: d.mode, source: d.source,
        receivedAt: now, ts: now, demo: true,
      };
      await blobPut(`leads/${d.id}.json`, leadPayload, token);
      meta[d.id] = {
        stage: d.stage, tags: d.tags || [], telefone: d.telefone, nome: d.nome,
        value: d.value || 0, source: d.source, lossReason: d.lossReason || null,
        notes: [{ text: 'Lead de demonstração (seed)', at: now, by: 'seed' }],
        updatedAt: now, createdAt: now,
      };
      created++;
    }

    const appts = DEMO.filter((d) => ['call_agendada', 'agendamento'].includes(d.stage)).map((d, i) => ({
      id: 'appt-' + d.id, leadId: d.id, nome: d.nome,
      title: 'Visita técnica / Call — ' + d.nome,
      at: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
      duration: 60, source: 'seed',
    }));
    await blobPut('crm/appointments.json', { items: appts, updatedAt: now }, token);
    await saveMeta(token, meta);

    return NextResponse.json({
      ok: true, created, appointments: appts.length,
      message: 'Dados de demonstração carregados. Use o funil e relatórios.',
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({
    ok: true,
    info: 'POST /api/crm/seed?auth=SENHA para carregar 12 leads demo + agendamentos',
    count: DEMO.length,
  });
}
