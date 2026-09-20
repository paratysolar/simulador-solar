import { NextResponse } from 'next/server';
import { checkAuth, loadFlows, saveFlows, runFlowSteps, loadAllLeads, loadMeta, enrichLead, DEFAULT_FLOWS } from '../lib';

export const runtime = 'edge';

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  const flows = await loadFlows(token);
  return NextResponse.json({
    ok: true,
    flows,
    triggerTypes: [
      { id: 'novo_contato', label: 'Novo Contato' },
      { id: 'tag_adicionada', label: 'Tag adicionada ao contato' },
      { id: 'tag_removida', label: 'Tag removida do contato' },
      { id: 'contato_coluna', label: 'Contato adicionado à coluna' },
      { id: 'contato_removido', label: 'Contato removido da coluna' },
      { id: 'ganhar', label: 'Ganhar oportunidade' },
      { id: 'perder', label: 'Perder oportunidade' },
      { id: 'manual', label: 'Manual' },
    ],
  });
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const body = await request.json();
    const flows = await loadFlows(token);

    if (body.action === 'save_all' && Array.isArray(body.flows)) {
      await saveFlows(token, body.flows);
      return NextResponse.json({ ok: true, flows: body.flows });
    }
    if (body.action === 'upsert' && body.flow) {
      const f = body.flow;
      if (!f.id) f.id = 'flow-' + Date.now();
      const idx = flows.findIndex((x) => x.id === f.id);
      if (idx >= 0) flows[idx] = f; else flows.push(f);
      await saveFlows(token, flows);
      return NextResponse.json({ ok: true, flow: f, flows });
    }
    if (body.action === 'delete' && body.id) {
      const next = flows.filter((x) => x.id !== body.id);
      await saveFlows(token, next);
      return NextResponse.json({ ok: true, flows: next });
    }
    if (body.action === 'toggle' && body.id) {
      const f = flows.find((x) => x.id === body.id);
      if (f) f.active = !f.active;
      await saveFlows(token, flows);
      return NextResponse.json({ ok: true, flows });
    }
    if (body.action === 'reset_defaults') {
      await saveFlows(token, DEFAULT_FLOWS);
      return NextResponse.json({ ok: true, flows: DEFAULT_FLOWS });
    }
    if (body.action === 'run' && body.flowId && body.lead) {
      const flow = flows.find((x) => x.id === body.flowId);
      if (!flow) return NextResponse.json({ error: 'Flow não encontrado' }, { status: 404 });
      const results = await runFlowSteps(flow, body.lead, request, token);
      return NextResponse.json({ ok: true, flowId: flow.id, results });
    }
    return NextResponse.json({ error: 'action inválida' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
