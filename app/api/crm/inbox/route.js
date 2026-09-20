import { NextResponse } from 'next/server';
import { checkAuth, loadAllLeads, loadMeta, enrichLead } from '../lib';
import { list } from '@vercel/blob';

export const runtime = 'edge';

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB nao configurado' }, { status: 503 });
  try {
    const { blobs } = await list({ prefix: 'whatsapp/messages/', limit: 200, token });
    const sorted = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    const byPhone = {};
    await Promise.all(sorted.slice(0, 120).map(async (b) => {
      try {
        const res = await fetch(b.url);
        const data = await res.json();
        const key = data.from || data.to || 'unknown';
        if (!byPhone[key]) {
          byPhone[key] = { phone: key, contactName: data.contactName || null, messages: [], lastAt: data.receivedAt || b.uploadedAt, unread: 0 };
        }
        byPhone[key].messages.push(data);
        if (data.contactName) byPhone[key].contactName = data.contactName;
        if (data.direction === 'inbound') byPhone[key].unread++;
      } catch { /* skip */ }
    }));

    const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
    const leads = raw.map((i) => enrichLead(i, meta));

    const conversations = Object.values(byPhone).map((c) => {
      const phoneDigits = String(c.phone).replace(/\D/g, '');
      const lead = leads.find((l) => {
        const p = String(l.telefone || l.contato || '').replace(/\D/g, '');
        return p && (p.includes(phoneDigits) || phoneDigits.includes(p));
      });
      return {
        ...c,
        messages: c.messages.sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0)),
        lead: lead ? { id: lead.id, nome: lead.nome, stage: lead.stage, tags: lead.tags } : null,
      };
    }).sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

    return NextResponse.json({
      ok: true,
      count: conversations.length,
      conversations,
      stats: {
        total: conversations.length,
        withLead: conversations.filter((c) => c.lead).length,
        unread: conversations.reduce((s, c) => s + (c.unread || 0), 0),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
