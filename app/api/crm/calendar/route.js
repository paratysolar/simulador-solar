import { NextResponse } from 'next/server';
import { checkAuth, blobGet, blobPut, loadMeta } from '../lib';

export const runtime = 'edge';

async function loadAppts(token) {
  const data = await blobGet('crm/appointments.json', token);
  return data?.items || [];
}

async function saveAppts(token, items) {
  await blobPut('crm/appointments.json', { items, updatedAt: new Date().toISOString() }, token);
}

async function loadGcal(token) {
  return (await blobGet('crm/gcal.json', token)) || { connected: false };
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  try {
    let items = await loadAppts(token);
    if (from) items = items.filter((a) => new Date(a.at) >= new Date(from));
    if (to) items = items.filter((a) => new Date(a.at) <= new Date(to));
    items.sort((a, b) => new Date(a.at) - new Date(b.at));
    const gcal = await loadGcal(token);
    return NextResponse.json({
      ok: true, appointments: items, count: items.length,
      googleCalendar: {
        connected: !!gcal.connected,
        calendarId: gcal.calendarId || null,
        email: gcal.email || null,
        note: gcal.connected
          ? 'Google Calendar conectado. Eventos locais sincronizam ao criar/editar.'
          : 'Cole access token em Configurações para conectar.',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: 'BLOB não configurado' }, { status: 503 });
  try {
    const body = await request.json();
    let items = await loadAppts(token);
    if (body.action === 'create') {
      const appt = {
        id: body.id || 'appt-' + Date.now(),
        leadId: body.leadId || null,
        nome: body.nome || 'Agendamento',
        title: body.title || body.nome || 'Visita técnica',
        at: body.at || new Date().toISOString(),
        duration: Number(body.duration) || 60,
        notes: body.notes || '',
        source: body.source || 'crm',
        gcalEventId: null,
        createdAt: new Date().toISOString(),
      };
      const gcal = await loadGcal(token);
      if (gcal.connected && gcal.accessToken && gcal.calendarId) {
        try {
          const start = new Date(appt.at);
          const end = new Date(start.getTime() + appt.duration * 60000);
          const res = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(gcal.calendarId) + '/events',
            {
              method: 'POST',
              headers: { Authorization: 'Bearer ' + gcal.accessToken, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                summary: appt.title,
                description: appt.notes || 'Lead: ' + appt.nome,
                start: { dateTime: start.toISOString(), timeZone: 'America/Sao_Paulo' },
                end: { dateTime: end.toISOString(), timeZone: 'America/Sao_Paulo' },
              }),
            }
          );
          const data = await res.json();
          if (res.ok) appt.gcalEventId = data.id;
        } catch {}
      }
      items.push(appt);
      await saveAppts(token, items);
      if (body.leadId) {
        const meta = await loadMeta(token);
        const crm = meta[body.leadId] || {};
        crm.appointmentAt = appt.at;
        crm.updatedAt = new Date().toISOString();
        meta[body.leadId] = crm;
        await blobPut('crm/meta.json', meta, token);
      }
      return NextResponse.json({ ok: true, appointment: appt, appointments: items });
    }
    if (body.action === 'delete' && body.id) {
      items = items.filter((x) => x.id !== body.id);
      await saveAppts(token, items);
      return NextResponse.json({ ok: true, appointments: items });
    }
    if (body.action === 'connect_google') {
      const gcal = {
        connected: true,
        accessToken: body.accessToken || null,
        refreshToken: body.refreshToken || null,
        calendarId: body.calendarId || 'primary',
        email: body.email || null,
        connectedAt: new Date().toISOString(),
      };
      await blobPut('crm/gcal.json', gcal, token);
      return NextResponse.json({ ok: true, googleCalendar: { connected: true, calendarId: gcal.calendarId, email: gcal.email } });
    }
    if (body.action === 'disconnect_google') {
      await blobPut('crm/gcal.json', { connected: false }, token);
      return NextResponse.json({ ok: true, googleCalendar: { connected: false } });
    }
    return NextResponse.json({ error: 'action inválida' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
