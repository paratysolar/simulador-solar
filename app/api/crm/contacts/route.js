import { NextResponse } from 'next/server';
import { checkAuth, loadMeta, saveMeta, blobPut, loadAllLeads, enrichLead } from '../lib';

export const runtime = 'edge';

/**
 * Importa contatos (CSV Google Contatos ou lista JSON).
 * POST { contacts: [...] }  ou  { csv: "texto csv..." }
 * GET  lista contatos (mesmos leads enriquecidos)
 */

function onlyDigits(s) {
  return String(s || '').replace(/\D/g, '');
}

function normalizePhone(raw) {
  let d = onlyDigits(raw);
  if (!d) return '';
  if (d.startsWith('55') && d.length >= 12) return d;
  if (d.length === 10 || d.length === 11) return '55' + d;
  if (d.length >= 12 && d.length <= 13) return d;
  return d;
}

function pick(row, keys) {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  const lower = {};
  Object.keys(row).forEach((k) => { lower[k.toLowerCase().trim()] = row[k]; });
  for (const k of keys) {
    const v = lower[k.toLowerCase()];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  for (const key of Object.keys(row)) {
    const lk = key.toLowerCase();
    for (const want of keys) {
      if (lk.includes(want.toLowerCase()) && String(row[key] || '').trim()) {
        return String(row[key]).trim();
      }
    }
  }
  return '';
}

/** Parse CSV simples com aspas (Google Contatos) */
function parseCsv(text) {
  const lines = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQ && text[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if ((c === '\n' || c === '\r') && !inQ) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      lines.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.trim() || lines.length) lines.push(cur);

  if (!lines.length) return [];
  const splitRow = (line) => {
    const cols = [];
    let cell = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') { cell += '"'; i++; }
        else q = !q;
      } else if (ch === ',' && !q) {
        cols.push(cell);
        cell = '';
      } else cell += ch;
    }
    cols.push(cell);
    return cols;
  };

  const headers = splitRow(lines[0]).map((h) => h.trim().replace(/^\uFEFF/, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitRow(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (cols[idx] || '').trim(); });
    rows.push(obj);
  }
  return rows;
}

function rowToContact(row) {
  const given = pick(row, [
    'Given Name', 'First Name', 'Nome próprio', 'Nome proprio', 'Primeiro Nome', 'first_name',
  ]);
  const family = pick(row, [
    'Family Name', 'Last Name', 'Sobrenome', 'last_name',
  ]);
  let nome = pick(row, [
    'Name', 'Nome', 'Full Name', 'nome completo', 'Contact Name',
  ]);
  if (!nome) nome = [given, family].filter(Boolean).join(' ').trim();
  if (!nome) nome = pick(row, ['Organization 1 - Name', 'Organization', 'Empresa', 'Company']) || 'Sem nome';

  const phoneRaw = pick(row, [
    'Phone 1 - Value', 'Phone', 'Telefone', 'Mobile Phone',
    'Phone 2 - Value', 'Celular', 'WhatsApp', 'telefone', 'phone', 'Mobile',
  ]);
  const phoneParts = phoneRaw.split(/[:;|]/).map((p) => p.trim()).filter(Boolean);
  let telefone = '';
  for (const p of phoneParts) {
    const n = normalizePhone(p);
    if (n.length >= 10) { telefone = n; break; }
  }
  if (!telefone) telefone = normalizePhone(phoneRaw);

  const email = pick(row, [
    'E-mail 1 - Value', 'Email 1 - Value', 'E-mail', 'Email', 'email',
  ]);
  const cidade = pick(row, [
    'Address 1 - City', 'City', 'Cidade', 'Address 1 - Formatted',
  ]);
  const org = pick(row, [
    'Organization 1 - Name', 'Organization', 'Empresa', 'Company',
  ]);

  return {
    nome: nome.slice(0, 120),
    telefone,
    contato: telefone || email,
    email: email || '',
    cidade: cidade.slice(0, 80),
    empresa: org.slice(0, 80),
  };
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  try {
    const [raw, meta] = await Promise.all([loadAllLeads(token), loadMeta(token)]);
    const leads = raw.map((i) => enrichLead(i, meta));
    return NextResponse.json({ ok: true, count: leads.length, contacts: leads });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });

  try {
    const body = await request.json().catch(() => ({}));
    let contacts = [];

    if (typeof body.csv === 'string' && body.csv.trim()) {
      const rows = parseCsv(body.csv);
      contacts = rows.map(rowToContact).filter((c) => c.nome || c.telefone || c.email);
    } else if (Array.isArray(body.contacts)) {
      contacts = body.contacts.map((c) => ({
        nome: String(c.nome || c.name || 'Sem nome').slice(0, 120),
        telefone: normalizePhone(c.telefone || c.phone || c.contato || ''),
        contato: normalizePhone(c.telefone || c.phone || c.contato || '') || String(c.email || ''),
        email: String(c.email || ''),
        cidade: String(c.cidade || c.city || ''),
        empresa: String(c.empresa || c.company || ''),
      }));
    } else {
      return NextResponse.json({
        error: 'Envie { csv: "..." } (export Google Contatos) ou { contacts: [...] }',
      }, { status: 400 });
    }

    if (!contacts.length) {
      return NextResponse.json({ error: 'Nenhum contato válido no arquivo' }, { status: 400 });
    }

    if (contacts.length > 500) {
      contacts = contacts.slice(0, 500);
    }

    const meta = await loadMeta(token);
    const existing = await loadAllLeads(token);
    const existingPhones = new Set();
    existing.forEach((item) => {
      const d = item.data || {};
      const p = normalizePhone(d.telefone || d.contato || meta[d.id]?.telefone);
      if (p) existingPhones.add(p);
    });
    Object.values(meta).forEach((m) => {
      const p = normalizePhone(m?.telefone || m?.contato);
      if (p) existingPhones.add(p);
    });

    const now = new Date().toISOString();
    let created = 0;
    let skipped = 0;
    const ids = [];

    for (const c of contacts) {
      if (c.telefone && existingPhones.has(c.telefone)) {
        skipped++;
        continue;
      }
      if (!c.telefone && !c.email && (!c.nome || c.nome === 'Sem nome')) {
        skipped++;
        continue;
      }

      const id = 'gcont-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
      const leadPayload = {
        id,
        nome: c.nome,
        contato: c.telefone || c.email,
        telefone: c.telefone,
        email: c.email,
        cidade: c.cidade,
        empresa: c.empresa,
        mode: 'CRM',
        source: 'google_csv',
        receivedAt: now,
        ts: now,
      };
      await blobPut(`leads/${id}.json`, leadPayload, token);
      meta[id] = {
        stage: 'novo',
        tags: ['importado', 'google'],
        telefone: c.telefone,
        nome: c.nome,
        email: c.email,
        value: 0,
        source: 'google_csv',
        notes: [{ text: 'Importado do CSV Google Contatos', at: now, by: 'import' }],
        updatedAt: now,
        createdAt: now,
      };
      if (c.telefone) existingPhones.add(c.telefone);
      ids.push(id);
      created++;
    }

    await saveMeta(token, meta);

    return NextResponse.json({
      ok: true,
      created,
      skipped,
      total: contacts.length,
      ids: ids.slice(0, 20),
      message: created
        ? `${created} contato(s) importado(s)${skipped ? `, ${skipped} ignorado(s) (duplicado ou vazio)` : ''}`
        : `Nenhum novo contato. ${skipped} ignorado(s) (já existiam ou sem dados).`,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
