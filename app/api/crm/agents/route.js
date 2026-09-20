import { NextResponse } from 'next/server';
import { checkAuth, loadAgents, saveAgents, agentReply, loadAllLeads, loadMeta, enrichLead } from '../lib';

export const runtime = 'edge';

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  const agents = await loadAgents(token);
  return NextResponse.json({ ok: true, agents });
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  try {
    const body = await request.json();
    const agents = await loadAgents(token);

    if (body.action === 'upsert' && body.agent) {
      const a = body.agent;
      if (!a.id) a.id = 'agent-' + Date.now();
      const idx = agents.findIndex((x) => x.id === a.id);
      if (idx >= 0) agents[idx] = a; else agents.push(a);
      await saveAgents(token, agents);
      return NextResponse.json({ ok: true, agent: a, agents });
    }
    if (body.action === 'delete' && body.id) {
      const next = agents.filter((x) => x.id !== body.id);
      await saveAgents(token, next);
      return NextResponse.json({ ok: true, agents: next });
    }
    if (body.action === 'toggle' && body.id) {
      const a = agents.find((x) => x.id === body.id);
      if (a) a.active = !a.active;
      await saveAgents(token, agents);
      return NextResponse.json({ ok: true, agents });
    }
    if (body.action === 'reply' && body.leadId && body.text) {
      const agent = agents.find((x) => x.id === body.agentId) || agents.find((x) => x.active);
      if (!agent) return NextResponse.json({ error: 'Nenhum agente ativo' }, { status: 404 });
      const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
      const item = raw.find((i) => (i.data?.id || i.pathname) === body.leadId);
      if (!item) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
      const lead = enrichLead(item, meta);
      const result = await agentReply(agent, lead, body.text, token);
      if (body.send && (lead.telefone || lead.contato)) {
        try {
          await fetch(new URL('/api/whatsapp/send', request.url).toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-crm-auth': process.env.CRM_PASSWORD || 'solar2026' },
            body: JSON.stringify({ to: lead.telefone || lead.contato, text: result.text }),
          });
          result.sent = true;
        } catch { result.sent = false; }
      }
      return NextResponse.json({ ok: true, agentId: agent.id, ...result });
    }
    return NextResponse.json({ error: 'action inválida' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
