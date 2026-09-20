import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const FLOWS_PATH = 'crm/flows.json';

function checkAuth(request) {
  const { searchParams } = new URL(request.url);
  const auth = searchParams.get('auth') || request.headers.get('x-crm-auth') || '';
  return auth === (process.env.CRM_PASSWORD || 'solar2026');
}

const DEFAULT_FLOWS = [
  {
    id: 'boas-vindas',
    name: 'Boas-vindas (lead novo)',
    active: true,
    trigger: 'stage_enter',
    triggerStage: 'novo',
    steps: [
      { type: 'wait', minutes: 0 },
      { type: 'message', text: 'Olá {{nome}}! Obrigado pelo interesse em energia solar com a Paraty Solar. Em breve um consultor entra em contato. Enquanto isso, posso tirar alguma dúvida?' },
      { type: 'set_stage', stage: 'contactado' },
    ],
  },
  {
    id: 'qualificacao',
    name: 'Qualificação rápida',
    active: true,
    trigger: 'stage_enter',
    triggerStage: 'contactado',
    steps: [
      { type: 'message', text: 'Para te atender melhor: o interesse é residencial, comercial ou rural? E qual o valor aproximado da sua conta de luz?' },
    ],
  },
  {
    id: 'proposta-followup',
    name: 'Follow-up após proposta',
    active: true,
    trigger: 'stage_enter',
    triggerStage: 'proposta',
    steps: [
      { type: 'wait', minutes: 1440 },
      { type: 'message', text: 'Oi {{nome}}! Conseguiu analisar a proposta de energia solar? Estou à disposição para ajustar o projeto ou tirar dúvidas.' },
    ],
  },
  {
    id: 'recuperacao',
    name: 'Recuperação de perdidos',
    active: false,
    trigger: 'manual',
    triggerStage: 'perdido',
    steps: [
      { type: 'message', text: 'Olá {{nome}}! Houve alguma mudança no seu interesse por energia solar? Temos condições especiais neste mês.' },
      { type: 'set_stage', stage: 'contactado' },
    ],
  },
];

async function loadFlows(token) {
  try {
    const { blobs } = await list({ prefix: FLOWS_PATH, limit: 1, token });
    if (!blobs.length) return DEFAULT_FLOWS;
    const res = await fetch(blobs[0].url);
    const data = await res.json();
    return Array.isArray(data.flows) ? data.flows : DEFAULT_FLOWS;
  } catch {
    return DEFAULT_FLOWS;
  }
}

async function saveFlows(token, flows) {
  await put(FLOWS_PATH, JSON.stringify({ flows, updatedAt: new Date().toISOString() }, null, 2), {
    access: 'public', contentType: 'application/json', token, addRandomSuffix: false, allowOverwrite: true,
  });
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB nao configurado' }, { status: 503 });
  const flows = await loadFlows(token);
  return NextResponse.json({ ok: true, flows });
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB nao configurado' }, { status: 503 });
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
    if (body.action === 'run' && body.flowId && body.lead) {
      const flow = flows.find((x) => x.id === body.flowId);
      if (!flow) return NextResponse.json({ error: 'Flow nao encontrado' }, { status: 404 });
      const lead = body.lead;
      const nome = lead.nome || lead.contato || 'cliente';
      const results = [];
      for (const step of flow.steps || []) {
        if (step.type === 'message' && step.text) {
          const text = step.text.replace(/\{\{nome\}\}/gi, nome);
          if (lead.telefone || lead.contato) {
            try {
              const sendRes = await fetch(new URL('/api/whatsapp/send', request.url).toString(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-crm-auth': process.env.CRM_PASSWORD || 'solar2026' },
                body: JSON.stringify({ to: lead.telefone || lead.contato, text }),
              });
              const sendData = await sendRes.json();
              results.push({ step: 'message', text, sent: sendData.ok, detail: sendData });
            } catch (e) {
              results.push({ step: 'message', text, sent: false, error: String(e.message || e) });
            }
          } else {
            results.push({ step: 'message', text, sent: false, error: 'Sem telefone' });
          }
        }
        if (step.type === 'set_stage' && step.stage) {
          results.push({ step: 'set_stage', stage: step.stage });
        }
        if (step.type === 'wait') {
          results.push({ step: 'wait', minutes: step.minutes || 0 });
        }
      }
      return NextResponse.json({ ok: true, flowId: flow.id, results });
    }
    return NextResponse.json({ error: 'action invalida' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
