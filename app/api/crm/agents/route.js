import { NextResponse } from 'next/server';
import { checkAuth, loadAllLeads, loadMeta, enrichLead } from '../lib';
import { loadAgents, saveAgents, agentReply } from '../lib-ext';

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
      a.active = a.active !== false;
      a.autoReply = a.autoReply !== false;
      const idx = agents.findIndex((x) => x.id === a.id);
      if (idx >= 0) agents[idx] = { ...agents[idx], ...a };
      else agents.push(a);
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

    if (body.action === 'toggle_auto' && body.id) {
      const a = agents.find((x) => x.id === body.id);
      if (a) a.autoReply = !a.autoReply;
      await saveAgents(token, agents);
      return NextResponse.json({ ok: true, agents });
    }

    if (body.action === 'test' && body.text) {
      const agent = agents.find((x) => x.id === body.agentId) || agents.find((x) => x.active) || agents[0];
      if (!agent) return NextResponse.json({ error: 'Nenhum agente' }, { status: 404 });
      const fakeLead = { id: 'test', nome: body.nome || 'Cliente', telefone: '', stage: 'novo', tags: [] };
      const result = await agentReply(agent, fakeLead, body.text, token);
      return NextResponse.json({ ok: true, ...result, agentName: agent.name });
    }

    if (body.action === 'reply' && body.text) {
      const agent = agents.find((x) => x.id === body.agentId) || agents.find((x) => x.active);
      if (!agent) return NextResponse.json({ error: 'Nenhum agente ativo' }, { status: 404 });

      let lead = { id: body.leadId || 'unknown', nome: body.nome || 'Cliente', telefone: body.phone || '', stage: 'novo', tags: [] };

      if (body.leadId) {
        const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
        const item = raw.find((i) => (i.data?.id || i.pathname) === body.leadId);
        if (item) lead = enrichLead(item, meta);
      }

      const result = await agentReply(agent, lead, body.text, token);

      if (body.send && (lead.telefone || lead.contato || body.phone)) {
        try {
          const to = body.phone || lead.telefone || lead.contato;
          const sendRes = await fetch(new URL('/api/whatsapp/send', request.url).toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-crm-auth': process.env.CRM_PASSWORD || 'solar2026',
            },
            body: JSON.stringify({ to, text: result.text }),
          });
          const sendData = await sendRes.json();
          result.sent = !!sendData.ok;
          result.sendError = sendData.error || null;
        } catch (e) {
          result.sent = false;
          result.sendError = String(e.message || e);
        }
      }

      return NextResponse.json({ ok: true, agentId: agent.id, agentName: agent.name, ...result });
    }

    return NextResponse.json({ error: 'action inválida. Use: upsert, toggle, toggle_auto, test, reply' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
