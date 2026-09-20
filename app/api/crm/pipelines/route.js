import { NextResponse } from 'next/server';
import { checkAuth, blobGet, blobPut } from '../lib';

export const runtime = 'edge';

const DEFAULT = {
  id: 'solar-default',
  name: 'Vendas Solar',
  columns: [
    { id: 'novo', label: 'Novos Leads', color: '#0d9488' },
    { id: 'qualificacao', label: 'Em Qualificação', color: '#14b8a6' },
    { id: 'agendamento', label: 'Em Agendamento', color: '#2dd4bf' },
    { id: 'call_agendada', label: 'Call Agendada', color: '#5eead4' },
    { id: 'call_realizada', label: 'Call Realizada', color: '#99f6e4' },
    { id: 'proposta', label: 'Proposta Enviada', color: '#f59e0b' },
    { id: 'fechado', label: 'Concluído', color: '#10b981', isWon: true },
    { id: 'perdido', label: 'Perdido', color: '#ef4444', isLost: true },
  ],
};

async function loadPipelines(token) {
  const data = await blobGet('crm/pipelines.json', token);
  if (data?.pipelines?.length) return data.pipelines;
  return [DEFAULT];
}

async function savePipelines(token, pipelines) {
  await blobPut('crm/pipelines.json', { pipelines, updatedAt: new Date().toISOString() }, token);
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  const pipelines = await loadPipelines(token);
  return NextResponse.json({ ok: true, pipelines, activeId: pipelines[0]?.id });
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  try {
    const body = await request.json();
    let pipelines = await loadPipelines(token);

    if (body.action === 'create' && body.pipeline) {
      const p = body.pipeline;
      if (!p.id) p.id = 'pipe-' + Date.now();
      if (!p.columns || !p.columns.length) {
        p.columns = [
          { id: 'inicio', label: 'Início', color: '#0d9488' },
          { id: 'concluido', label: 'Concluído', color: '#10b981', isWon: true },
        ];
      }
      pipelines.push(p);
      await savePipelines(token, pipelines);
      return NextResponse.json({ ok: true, pipeline: p, pipelines });
    }

    if (body.action === 'update' && body.pipeline) {
      const idx = pipelines.findIndex((x) => x.id === body.pipeline.id);
      if (idx < 0) return NextResponse.json({ error: 'pipeline não encontrado' }, { status: 404 });
      pipelines[idx] = { ...pipelines[idx], ...body.pipeline };
      await savePipelines(token, pipelines);
      return NextResponse.json({ ok: true, pipeline: pipelines[idx], pipelines });
    }

    if (body.action === 'delete' && body.id) {
      if (pipelines.length <= 1) return NextResponse.json({ error: 'Mantenha ao menos 1 pipeline' }, { status: 400 });
      pipelines = pipelines.filter((x) => x.id !== body.id);
      await savePipelines(token, pipelines);
      return NextResponse.json({ ok: true, pipelines });
    }

    if (body.action === 'add_column' && body.pipelineId && body.column) {
      const p = pipelines.find((x) => x.id === body.pipelineId);
      if (!p) return NextResponse.json({ error: 'pipeline não encontrado' }, { status: 404 });
      const col = body.column;
      if (!col.id) col.id = 'col-' + Date.now();
      if (!col.color) col.color = '#94a3b8';
      p.columns = p.columns || [];
      const last = p.columns[p.columns.length - 1];
      if (last?.isWon || last?.isLost) p.columns.splice(p.columns.length - 1, 0, col);
      else p.columns.push(col);
      await savePipelines(token, pipelines);
      return NextResponse.json({ ok: true, pipeline: p, pipelines });
    }

    return NextResponse.json({ error: 'action inválida' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
