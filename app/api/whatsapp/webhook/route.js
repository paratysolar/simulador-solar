import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

async function blobGet(path, token) {
  try {
    const { blobs } = await list({ prefix: path, limit: 1, token });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url);
    return await res.json();
  } catch {
    return null;
  }
}

async function getWaConfig(token) {
  return blobGet('config/whatsapp.json', token);
}

async function sendText(config, to, text) {
  const phone = String(to).replace(/\D/g, '');
  if (!config?.accessToken || !config?.phoneNumberId || phone.length < 10) return null;
  const graphUrl = `https://graph.facebook.com/v22.0/${config.phoneNumberId}/messages`;
  const res = await fetch(graphUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'text',
      text: { preview_url: false, body: text },
    }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

function matchLead(meta, rawLeads, phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;
  for (const item of rawLeads) {
    const d = item.data || {};
    const id = d.id || item.pathname;
    const crm = meta[id] || {};
    const p = String(crm.telefone || d.contato || d.telefone || '').replace(/\D/g, '');
    if (p && (p.includes(digits) || digits.includes(p) || p.slice(-8) === digits.slice(-8))) {
      return {
        id,
        nome: d.nome || d.contato || crm.nome || 'Cliente',
        telefone: crm.telefone || d.contato || phone,
        stage: crm.stage || 'novo',
        tags: crm.tags || [],
        data: d,
        crm,
      };
    }
  }
  return null;
}

async function loadAllLeadsLite(token) {
  const { blobs } = await list({ prefix: 'leads/', limit: 150, token });
  const sorted = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  const items = await Promise.all(
    sorted.slice(0, 80).map(async (b) => {
      try {
        const res = await fetch(b.url);
        const data = await res.json();
        return { pathname: b.pathname, uploadedAt: b.uploadedAt, data };
      } catch {
        return null;
      }
    })
  );
  return items.filter(Boolean);
}

async function ruleAgentReply(inboundText, lead, token) {
  const knowledge = (await blobGet('crm/knowledge.json', token))?.items || [];
  const agents = (await blobGet('crm/agents.json', token))?.agents || [];
  const agent = agents.find((a) => a.active) || {
    id: 'default',
    name: 'Consultor Solar',
    objective: 'Qualificar leads solares',
  };
  const text = (inboundText || '').toLowerCase();
  let answer = null;
  for (const k of knowledge.filter((x) => x.active !== false)) {
    const q = (k.q || '').toLowerCase();
    const words = q.split(/\s+/).filter((w) => w.length > 3);
    if (words.some((w) => text.includes(w)) || (q.length > 5 && text.includes(q.slice(0, 18)))) {
      answer = k.a;
      break;
    }
  }
  if (!answer && /(agendar|visita|horario|reuniao|quando posso)/i.test(text)) {
    answer = ('Perfeito, ' + (lead?.nome || '') + '! Temos horarios esta semana. Prefere manha ou tarde? Um consultor confirma o slot.').trim();
  }
  if (!answer && /(preco|valor|quanto custa|econom)/i.test(text)) {
    answer = 'O investimento depende do consumo e do telhado. Em geral a economia na conta fica entre 70% e 95%. Pode me passar o valor aproximado da conta de luz?';
  }
  if (!answer) {
    answer = ('Ola ' + (lead?.nome || '') + '! Obrigado pela mensagem. Sou o assistente da Paraty Solar. Em que posso ajudar: dimensionamento, proposta ou agendar visita tecnica?').trim();
  }
  return { text: answer, agentId: agent.id, agentName: agent.name };
}

async function fireKeywordFlows(text, lead, token, config) {
  const flowsData = await blobGet('crm/flows.json', token);
  const flows = flowsData?.flows || [];
  const meta = (await blobGet('crm/meta.json', token)) || {};
  const fired = [];
  for (const flow of flows) {
    if (!flow.active || flow.trigger !== 'keyword') continue;
    const kw = (flow.keyword || '').toLowerCase();
    if (!kw) continue;
    const t = (text || '').toLowerCase();
    const mode = flow.keywordMode || 'contains';
    let match = false;
    if (mode === 'exact') match = t === kw;
    else if (mode === 'starts') match = t.startsWith(kw);
    else match = t.includes(kw);
    if (!match) continue;
    const crm = meta[lead.id] || { notes: [], tags: [] };
    for (const step of flow.steps || []) {
      if (step.type === 'message' && step.text) {
        const msg = String(step.text).replace(/\{\{nome\}\}/gi, lead.nome || '');
        await sendText(config, lead.telefone || lead.id, msg);
        fired.push({ flow: flow.id, step: 'message' });
      }
      if (step.type === 'set_stage' && step.stage) {
        crm.stage = step.stage;
        fired.push({ flow: flow.id, step: 'set_stage', stage: step.stage });
      }
      if (step.type === 'add_tag' && step.tag) {
        crm.tags = crm.tags || [];
        if (!crm.tags.includes(step.tag)) crm.tags.push(step.tag);
        fired.push({ flow: flow.id, step: 'add_tag', tag: step.tag });
      }
    }
    crm.updatedAt = new Date().toISOString();
    meta[lead.id] = crm;
  }
  if (fired.length) {
    await put('crm/meta.json', JSON.stringify(meta, null, 2), {
      access: 'public', contentType: 'application/json', token,
      addRandomSuffix: false, allowOverwrite: true,
    });
  }
  return fired;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'paraty_solar_verify_2026';
  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!body?.entry) return NextResponse.json({ ok: true });
    const autoAgent = process.env.WA_AUTO_AGENT !== '0';
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;
        const value = change.value || {};
        const messages = value.messages || [];
        const contacts = value.contacts || [];
        const metadata = value.metadata || {};
        for (const msg of messages) {
          const contact = contacts.find((c) => c.wa_id === msg.from) || {};
          const text = msg.text?.body || msg.button?.text || msg.interactive?.button_reply?.title || null;
          const record = {
            id: msg.id, from: msg.from, timestamp: msg.timestamp, type: msg.type, text,
            contactName: contact.profile?.name || null,
            phoneNumberId: metadata.phone_number_id || null,
            direction: 'inbound', receivedAt: new Date().toISOString(), raw: msg,
          };
          if (blobToken) {
            const pathname = `whatsapp/messages/${msg.from}/${Date.now()}-${msg.id}.json`;
            await put(pathname, JSON.stringify(record, null, 2), {
              access: 'public', contentType: 'application/json', token: blobToken, addRandomSuffix: false,
            });
          }
          if (blobToken && text) {
            try {
              const [meta, rawLeads, config] = await Promise.all([
                blobGet('crm/meta.json', blobToken).then((m) => m || {}),
                loadAllLeadsLite(blobToken),
                getWaConfig(blobToken),
              ]);
              let lead = matchLead(meta, rawLeads, msg.from);
              if (!lead) {
                lead = {
                  id: 'wa-' + String(msg.from).replace(/\D/g, ''),
                  nome: contact.profile?.name || 'WhatsApp',
                  telefone: msg.from, stage: 'novo', tags: ['whatsapp'],
                };
                if (!meta[lead.id]) {
                  meta[lead.id] = {
                    stage: 'novo', tags: ['whatsapp'], telefone: msg.from,
                    nome: lead.nome, source: 'whatsapp', updatedAt: new Date().toISOString(),
                  };
                  await put('crm/meta.json', JSON.stringify(meta, null, 2), {
                    access: 'public', contentType: 'application/json', token: blobToken,
                    addRandomSuffix: false, allowOverwrite: true,
                  });
                }
              }
              await fireKeywordFlows(text, lead, blobToken, config);
              if (autoAgent && config?.accessToken) {
                const reply = await ruleAgentReply(text, lead, blobToken);
                const sent = await sendText(config, msg.from, reply.text);
                if (sent?.ok) {
                  const outRecord = {
                    id: sent.data?.messages?.[0]?.id || `agent-${Date.now()}`,
                    to: msg.from, from: 'agent', direction: 'outbound',
                    text: reply.text, agentId: reply.agentId, agentName: reply.agentName,
                    receivedAt: new Date().toISOString(), type: 'text',
                  };
                  await put(`whatsapp/messages/${msg.from}/${Date.now()}-agent.json`, JSON.stringify(outRecord, null, 2), {
                    access: 'public', contentType: 'application/json', token: blobToken, addRandomSuffix: false,
                  });
                }
              }
            } catch (e) {
              console.error('Agent/flow processing error:', e);
            }
          }
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ ok: true });
  }
}
