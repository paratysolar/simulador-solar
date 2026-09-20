'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  STAGES, TAGS, TRIGGER_TYPES, MENU, REPORT_SECTIONS, LOSS_REASONS,
  DEFAULT_PIPELINE, stageLabel, stageColor, fmtMoney, fmtDate,
} from './crm-data';
import { CSS } from './crm-styles';

export default function CrmPage() {
  const [auth, setAuth] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('funil');
  const [leads, setLeads] = useState([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [flows, setFlows] = useState([]);
  const [agents, setAgents] = useState([]);
  const [pipelines, setPipelines] = useState([DEFAULT_PIPELINE]);
  const [activePipeId, setActivePipeId] = useState(DEFAULT_PIPELINE.id);
  const [dash, setDash] = useState(null);
  const [reports, setReports] = useState(null);
  const [reportSec, setReportSec] = useState('geral');
  const [appts, setAppts] = useState([]);
  const [gcal, setGcal] = useState({ connected: false });
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [waConfig, setWaConfig] = useState(null);
  const [waMsg, setWaMsg] = useState('');
  const [waErr, setWaErr] = useState('');
  const [formToken, setFormToken] = useState('');
  const [formPhoneId, setFormPhoneId] = useState('');
  const [formWabaId, setFormWabaId] = useState('');
  const [formDisplay, setFormDisplay] = useState('');
  const [gcalToken, setGcalToken] = useState('');
  const [gcalCalId, setGcalCalId] = useState('primary');
  const [showPipe, setShowPipe] = useState(false);
  const [showOpp, setShowOpp] = useState(false);
  const [showTrigger, setShowTrigger] = useState(false);
  const [showAgent, setShowAgent] = useState(false);
  const [showAppt, setShowAppt] = useState(false);
  const [pipeName, setPipeName] = useState('');
  const [pipeCols, setPipeCols] = useState([
    { id: 'inicio', label: 'Início', color: '#0d9488' },
    { id: 'concluido', label: 'Concluído', color: '#10b981', isWon: true },
  ]);
  const [oppStep, setOppStep] = useState(1);
  const [oppMode, setOppMode] = useState('existente');
  const [oppSearch, setOppSearch] = useState('');
  const [oppForm, setOppForm] = useState({ nome: '', telefone: '', value: '', stage: 'novo' });
  const [newFlow, setNewFlow] = useState({ name: '', trigger: 'novo_contato', steps: [{ type: 'message', text: '' }] });
  const [newAgent, setNewAgent] = useState({ name: '', objective: '', tone: 'profissional', active: true, provider: 'rules' });
  const [apptForm, setApptForm] = useState({ nome: '', title: '', at: '', duration: 60 });
  const [bcText, setBcText] = useState('');
  const [bcStage, setBcStage] = useState('');
  const [bcResult, setBcResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const a = auth;
  const activePipe = pipelines.find((p) => p.id === activePipeId) || pipelines[0] || DEFAULT_PIPELINE;
  const columns = activePipe?.columns || STAGES;

  useEffect(() => { const s = sessionStorage.getItem('crm_auth_v1'); if (s) setAuth(s); }, []);

  const loadLeads = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/leads?auth=' + a).then((r) => r.json());
      if (d.ok) setLeads(d.leads || []);
    } catch {}
  }, [auth, a]);

  const loadFlows = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/flows?auth=' + a).then((r) => r.json());
      if (d.ok) setFlows(d.flows || []);
    } catch {}
  }, [auth, a]);

  const loadAgents = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/agents?auth=' + a).then((r) => r.json());
      if (d.ok) setAgents(d.agents || []);
    } catch {}
  }, [auth, a]);

  const loadPipes = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/pipelines?auth=' + a).then((r) => r.json());
      if (d.ok && d.pipelines?.length) {
        setPipelines(d.pipelines);
        if (d.activeId) setActivePipeId(d.activeId);
      }
    } catch {}
  }, [auth, a]);

  const loadDash = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/dashboard?auth=' + a).then((r) => r.json());
      if (d.ok) setDash(d);
    } catch {}
  }, [auth, a]);

  const loadReports = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/reports?auth=' + a + '&days=30').then((r) => r.json());
      if (d.ok) setReports(d);
    } catch {}
  }, [auth, a]);

  const loadAppts = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/calendar?auth=' + a).then((r) => r.json());
      if (d.ok) { setAppts(d.appointments || []); setGcal(d.googleCalendar || { connected: false }); }
    } catch {}
  }, [auth, a]);

  const loadWa = useCallback(async () => {
    if (!auth) return;
    try {
      const [cfg, inbox] = await Promise.all([
        fetch('/api/whatsapp/config?auth=' + a).then((r) => r.json()).catch(() => ({})),
        fetch('/api/crm/inbox?auth=' + a).then((r) => r.json()).catch(() => ({})),
      ]);
      if (cfg.ok || cfg.connected !== undefined) setWaConfig(cfg);
      if (inbox.ok) setConversations(inbox.conversations || []);
    } catch {}
  }, [auth, a]);

  useEffect(() => {
    if (!auth) return;
    loadLeads(); loadPipes();
    if (tab === 'flows') loadFlows();
    if (tab === 'agents') loadAgents();
    if (tab === 'dashboard') loadDash();
    if (tab === 'relatorios') loadReports();
    if (tab === 'calendario') loadAppts();
    if (tab === 'chat' || tab === 'settings') loadWa();
  }, [auth, tab, loadLeads, loadFlows, loadAgents, loadPipes, loadDash, loadReports, loadAppts, loadWa]);

  async function login() {
    setErr('');
    try {
      const d = await fetch('/api/crm/leads?auth=' + encodeURIComponent(pwd)).then((r) => r.json());
      if (d.ok || d.leads) { sessionStorage.setItem('crm_auth_v1', pwd); setAuth(pwd); }
      else setErr(d.error || 'Senha incorreta');
    } catch (e) { setErr(String(e.message || e)); }
  }
  function logout() { sessionStorage.removeItem('crm_auth_v1'); setAuth(''); }

  async function patchLead(id, body) {
    setMsg('');
    try {
      const d = await fetch('/api/crm/leads?auth=' + a, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...body }),
      }).then((r) => r.json());
      if (d.ok) { setMsg('Salvo'); loadLeads(); if (selected?.id === id) setSelected((s) => ({ ...s, ...body, stage: body.stage || s.stage })); }
      else setErr(d.error || 'Falha');
    } catch (e) { setErr(String(e.message || e)); }
  }

  async function seedDemo() {
    setLoading(true); setMsg('');
    try {
      const d = await fetch('/api/crm/seed?auth=' + a, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then((r) => r.json());
      if (d.ok) { setMsg('✓ ' + (d.message || d.created + ' leads demo')); loadLeads(); loadReports(); loadAppts(); }
      else setErr(d.error || 'Seed falhou');
    } catch (e) { setErr(String(e.message || e)); }
    setLoading(false);
  }

  async function createPipeline() {
    if (!pipeName.trim()) return;
    const d = await fetch('/api/crm/pipelines?auth=' + a, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', pipeline: { name: pipeName, columns: pipeCols } }),
    }).then((r) => r.json());
    if (d.ok) { setPipelines(d.pipelines); setActivePipeId(d.pipeline.id); setShowPipe(false); setPipeName(''); setMsg('Pipeline criado'); }
  }

  async function createOpportunity() {
    const body = {
      id: 'opp-' + Date.now(), nome: oppForm.nome || 'Novo contato',
      telefone: oppForm.telefone, value: Number(oppForm.value) || 0,
      stage: oppForm.stage || columns[0]?.id || 'novo', tags: ['manual'], source: 'crm',
    };
    await fetch('/api/crm/seed?auth=' + a, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ single: body }),
    });
    setShowOpp(false); setOppStep(1);
    setOppForm({ nome: '', telefone: '', value: '', stage: 'novo' });
    loadLeads(); setMsg('Oportunidade adicionada');
  }

  async function sendReply() {
    if (!activeChat || !replyText.trim()) return;
    setWaErr(''); setWaMsg('');
    try {
      const d = await fetch('/api/whatsapp/send?auth=' + a, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: activeChat.phone, text: replyText.trim() }),
      }).then((r) => r.json());
      if (d.ok) { setWaMsg('Enviado (janela 24h)'); setReplyText(''); loadWa(); }
      else setWaErr(d.error || 'Falha');
    } catch (e) { setWaErr(String(e.message || e)); }
  }

  async function agentSuggest() {
    if (!activeChat?.lead?.id) { setWaErr('Abra chat de um lead vinculado'); return; }
    const d = await fetch('/api/crm/agents?auth=' + a, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reply', leadId: activeChat.lead.id, text: replyText || 'olá', send: false }),
    }).then((r) => r.json());
    if (d.ok) setReplyText(d.text || ''); else setWaErr(d.error || 'Falha agente');
  }

  async function saveFlow() {
    if (!newFlow.name) return;
    await fetch('/api/crm/flows?auth=' + a, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', flow: { ...newFlow, id: 'flow-' + Date.now(), active: true } }),
    });
    setShowTrigger(false); loadFlows(); setMsg('Flow salvo');
  }

  async function toggleFlow(id) {
    await fetch('/api/crm/flows?auth=' + a, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id }),
    });
    loadFlows();
  }

  async function saveAgent() {
    if (!newAgent.name) return;
    await fetch('/api/crm/agents?auth=' + a, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', agent: { ...newAgent, id: 'agent-' + Date.now() } }),
    });
    setShowAgent(false); loadAgents(); setMsg('Agente salvo');
  }

  async function saveWa() {
    setWaErr('');
    try {
      const d = await fetch('/api/whatsapp/config?auth=' + a, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: formToken, phoneNumberId: formPhoneId, wabaId: formWabaId, displayPhone: formDisplay }),
      }).then((r) => r.json());
      if (d.ok) { setWaMsg('WhatsApp salvo'); loadWa(); } else setWaErr(d.error || 'Falha');
    } catch (e) { setWaErr(String(e.message || e)); }
  }

  async function connectGcal() {
    const d = await fetch('/api/crm/calendar?auth=' + a, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'connect_google', accessToken: gcalToken, calendarId: gcalCalId || 'primary' }),
    }).then((r) => r.json());
    if (d.ok) { setGcal(d.googleCalendar); setMsg('Google Calendar conectado'); }
    else setErr(d.error || 'Falha GCal');
  }

  async function createAppt() {
    const d = await fetch('/api/crm/calendar?auth=' + a, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...apptForm }),
    }).then((r) => r.json());
    if (d.ok) { setAppts(d.appointments || []); setShowAppt(false); setMsg('Agendamento criado' + (d.appointment?.gcalEventId ? ' + Google' : '')); }
  }

  async function runBroadcast() {
    setBcResult(null);
    const d = await fetch('/api/crm/broadcast?auth=' + a, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: bcText, stage: bcStage || undefined }),
    }).then((r) => r.json());
    setBcResult(d);
  }

  const filtered = useMemo(() => {
    let list = leads;
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter((l) => (l.nome || '').toLowerCase().includes(qq) || (l.telefone || '').includes(qq) || (l.cidade || '').toLowerCase().includes(qq));
    }
    return list;
  }, [leads, q]);

  const byStage = useMemo(() => {
    const m = {};
    columns.forEach((c) => { m[c.id] = []; });
    filtered.forEach((l) => {
      const s = l.stage || columns[0]?.id;
      if (!m[s]) m[s] = [];
      m[s].push(l);
    });
    return m;
  }, [filtered, columns]);

  const oppMatches = useMemo(() => {
    if (!oppSearch.trim()) return leads.slice(0, 8);
    const qq = oppSearch.toLowerCase();
    return leads.filter((l) => (l.nome || '').toLowerCase().includes(qq) || (l.telefone || '').includes(qq)).slice(0, 8);
  }, [leads, oppSearch]);

  if (!auth) {
    return (
      <div className="crm-root">
        <style>{CSS}</style>
        <div className="login-wrap">
          <div className="login-box">
            <h2 style={{ color: 'var(--teal)', marginBottom: 8 }}>Paraty Solar CRM</h2>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: 16 }}>Funil · Chat · Flows · Agenda</p>
            <label>Senha</label>
            <input className="input" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && login()} placeholder="solar2026" />
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={login}>Entrar</button>
            {err && <div className="err">{err}</div>}
          </div>
        </div>
      </div>
    );
  }

  const webhookUrl = typeof window !== 'undefined' ? window.location.origin + '/api/whatsapp/webhook' : '';

  return (
    <div className="crm-root">
      <style>{CSS}</style>
      <div className="layout">
        <aside className="sidebar">
          <div className="brand">Paraty Solar<small>CRM · ChatFunnel</small></div>
          <nav className="nav">
            {MENU.map((m) => (
              <button key={m.id} className={tab === m.id ? 'active' : ''} onClick={() => setTab(m.id)}>
                <span>{m.icon}</span><span>{m.label}</span>
                {m.badge && <span className="badge">{m.badge}</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding: 12 }}>
            <button className="btn btn-ghost btn-sm" style={{ width: '100%', color: '#fff', background: 'rgba(255,255,255,.15)', border: 0 }} onClick={logout}>Sair</button>
          </div>
        </aside>
        <div className="main">
          <div className="topbar">
            <h1>{MENU.find((m) => m.id === tab)?.label || 'CRM'}</h1>
            <div style={{ flex: 1 }} />
            <button className="btn btn-ghost btn-sm" onClick={seedDemo} disabled={loading}>{loading ? 'Carregando…' : '🧪 Dados demo'}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { loadLeads(); loadReports(); loadAppts(); }}>↻ Atualizar</button>
          </div>
          <div className="content">
            {msg && <div className="ok" style={{ marginBottom: 10 }}>{msg}</div>}
            {err && <div className="err" style={{ marginBottom: 10 }}>{err}</div>}

            {tab === 'dashboard' && (
              <>
                <div className="stats">
                  <div className="stat"><div className="n">{dash?.total ?? leads.length}</div><div className="l">Leads</div></div>
                  <div className="stat"><div className="n" style={{ color: '#10b981' }}>{byStage.fechado?.length || 0}</div><div className="l">Ganhos</div></div>
                  <div className="stat"><div className="n" style={{ color: '#ef4444' }}>{byStage.perdido?.length || 0}</div><div className="l">Perdidos</div></div>
                  <div className="stat"><div className="n">{fmtMoney(leads.filter((l) => l.stage === 'fechado').reduce((s, l) => s + (Number(l.value) || 0), 0))}</div><div className="l">Faturamento</div></div>
                </div>
                <div className="card">
                  <h3>Ações rápidas</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => setTab('funil')}>Abrir funil</button>
                    <button className="btn btn-ghost" onClick={() => setShowOpp(true)}>+ Oportunidade</button>
                    <button className="btn btn-ghost" onClick={() => setTab('chat')}>Inbox</button>
                    <button className="btn btn-ghost" onClick={seedDemo}>Carregar demo</button>
                  </div>
                </div>
              </>
            )}

            {tab === 'funil' && (
              <>
                <div className="filters">
                  <select className="input" style={{ margin: 0 }} value={activePipeId} onChange={(e) => setActivePipeId(e.target.value)}>
                    {pipelines.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowPipe(true)}>+ Pipeline</button>
                  <input className="input" style={{ margin: 0, flex: 1, minWidth: 160 }} placeholder="Digite a sua busca" value={q} onChange={(e) => setQ(e.target.value)} />
                  <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>Total: {filtered.length}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowOpp(true)}>+ Oportunidade</button>
                </div>
                <div className="kanban">
                  {columns.map((s) => (
                    <div className="col" key={s.id} onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => { e.preventDefault(); const id = e.dataTransfer.getData('id'); if (id) await patchLead(id, { stage: s.id }); }}>
                      <div className="col-h" style={{ borderTop: '3px solid ' + s.color }}>
                        <span>{s.label}</span><span>{byStage[s.id]?.length || 0}</span>
                      </div>
                      <div className="col-b">
                        {(byStage[s.id] || []).map((l) => (
                          <div className="lead-card" key={l.id} draggable onDragStart={(e) => e.dataTransfer.setData('id', l.id)} onClick={() => setSelected(l)}>
                            <div className="name">{l.nome}</div>
                            <div className="meta">{l.mode || l.source} · {l.cidade || '—'}</div>
                            <div className="meta">{fmtMoney(l.value)}</div>
                            {(l.tags || []).map((t) => <span className="tag" key={t}>{t}</span>)}
                          </div>
                        ))}
                        <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 4 }}
                          onClick={() => { setOppForm((f) => ({ ...f, stage: s.id })); setShowOpp(true); }}>+ Adicionar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'flows' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Gatilho → mensagem → ação (estilo n8n)</p>
                  <button className="btn btn-primary" onClick={() => setShowTrigger(true)}>+ Automação</button>
                </div>
                {!flows.length ? <div className="empty">Nenhuma automação</div> : flows.map((f) => (
                  <div className="flow-item" key={f.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{f.name}</strong>
                      <label style={{ fontSize: '.8rem' }}><input type="checkbox" checked={!!f.active} onChange={() => toggleFlow(f.id)} /> Ativo</label>
                    </div>
                    <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 6 }}>
                      Gatilho: <strong>{TRIGGER_TYPES.find((t) => t.id === f.trigger)?.label || f.trigger}</strong>
                    </div>
                  </div>
                ))}
              </>
            )}

            {tab === 'chat' && (
              <div className="chat-layout">
                <div className="chat-list">
                  {!conversations.length && <div className="empty">Sem conversas</div>}
                  {conversations.map((c) => (
                    <div key={c.phone} className={'chat-item' + (activeChat?.phone === c.phone ? ' active' : '')} onClick={() => setActiveChat(c)}>
                      <strong>{c.contactName || c.lead?.nome || c.phone}</strong>
                      <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{c.lead ? stageLabel(c.lead.stage, activePipe) : 'Sem lead'}</div>
                    </div>
                  ))}
                </div>
                <div className="chat-panel">
                  {activeChat ? (
                    <>
                      <div style={{ padding: 12, borderBottom: '1px solid var(--border)' }}><strong>{activeChat.contactName || activeChat.phone}</strong></div>
                      <div className="chat-msgs">
                        {(activeChat.messages || []).map((m, i) => (
                          <div key={i} className={'msg ' + (m.direction === 'outbound' ? 'outbound' : 'inbound')}>
                            <div className="bubble">{m.text || '[msg]'}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: 12, display: 'flex', gap: 8 }}>
                        <input className="input" style={{ margin: 0, flex: 1 }} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Mensagem (24h)" onKeyDown={(e) => e.key === 'Enter' && sendReply()} />
                        <button className="btn btn-wa" onClick={sendReply}>Enviar</button>
                        <button className="btn btn-ghost btn-sm" onClick={agentSuggest}>🤖 IA</button>
                      </div>
                      {waMsg && <div className="ok">{waMsg}</div>}
                      {waErr && <div className="err">{waErr}</div>}
                    </>
                  ) : <div className="empty">Selecione uma conversa</div>}
                </div>
              </div>
            )}

            {tab === 'agents' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Agentes de IA</p>
                  <button className="btn btn-primary" onClick={() => setShowAgent(true)}>+ Agente</button>
                </div>
                {!agents.length ? <div className="empty">Nenhum agente</div> : agents.map((ag) => (
                  <div className="flow-item" key={ag.id}>
                    <strong>🤖 {ag.name}</strong> <span className={'pill ' + (ag.active ? 'on' : 'off')}>{ag.active ? 'Ativo' : 'Inativo'}</span>
                    <div style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{ag.objective || '—'}</div>
                  </div>
                ))}
              </>
            )}

            {tab === 'broadcast' && (
              <div className="card">
                <h3>Disparo em massa (janela 24h)</h3>
                <label>Filtro etapa</label>
                <select className="input" value={bcStage} onChange={(e) => setBcStage(e.target.value)}>
                  <option value="">Todas</option>
                  {columns.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <label>Mensagem ({'{{nome}}'})</label>
                <textarea className="input" rows={4} value={bcText} onChange={(e) => setBcText(e.target.value)} />
                <button className="btn btn-primary" onClick={runBroadcast} disabled={!bcText.trim()}>Disparar</button>
                {bcResult && <div style={{ marginTop: 12 }} className={bcResult.ok ? 'ok' : 'err'}>Tentativas: {bcResult.attempted}</div>}
              </div>
            )}

            {tab === 'contatos' && (
              <table>
                <thead><tr><th>Nome</th><th>Telefone</th><th>Etapa</th><th>Valor</th></tr></thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(l)}>
                      <td>{l.nome}</td><td>{l.telefone || l.contato}</td>
                      <td>{stageLabel(l.stage, activePipe)}</td><td>{fmtMoney(l.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'calendario' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span className={'pill ' + (gcal.connected ? 'on' : 'off')}>Google Calendar: {gcal.connected ? 'Conectado' : 'Desconectado'}</span>
                  <button className="btn btn-primary" onClick={() => setShowAppt(true)}>+ Agendar</button>
                </div>
                {!appts.length ? <div className="empty">Nenhum agendamento — use Dados demo</div> : (
                  <table>
                    <thead><tr><th>Quando</th><th>Título</th><th>Contato</th></tr></thead>
                    <tbody>{appts.map((ap) => (
                      <tr key={ap.id}><td>{fmtDate(ap.at)}</td><td>{ap.title}</td><td>{ap.nome}</td></tr>
                    ))}</tbody>
                  </table>
                )}
              </>
            )}

            {tab === 'relatorios' && (
              <>
                <div className="report-side">
                  {REPORT_SECTIONS.map((s) => (
                    <button key={s.id} className={reportSec === s.id ? 'active' : ''} onClick={() => setReportSec(s.id)}>{s.label}</button>
                  ))}
                </div>
                <div className="stats">
                  <div className="stat"><div className="n">{reports?.indicators?.totalLeads ?? leads.length}</div><div className="l">Total de leads</div></div>
                  <div className="stat"><div className="n">{reports?.indicators?.leadsGanhos ?? 0}</div><div className="l">Leads ganhos</div></div>
                  <div className="stat"><div className="n">{reports?.indicators?.leadsPerdidos ?? 0}</div><div className="l">Leads perdidos</div></div>
                  <div className="stat"><div className="n">{fmtMoney(reports?.indicators?.faturamento)}</div><div className="l">Faturamento</div></div>
                  <div className="stat"><div className="n">{reports?.indicators?.agendamentos ?? 0}</div><div className="l">Agendamentos</div></div>
                  <div className="stat"><div className="n">{reports?.indicators?.horasIA ?? 0}h</div><div className="l">Horas IA</div></div>
                </div>
                <div className="card">
                  <h3>Conversão por etapa</h3>
                  <div className="funnel-chart">
                    {(reports?.funnel || columns.map((c) => ({
                      id: c.id, label: c.label, count: byStage[c.id]?.length || 0, reached: byStage[c.id]?.length || 0, pct: 0,
                    }))).filter((f) => f.id !== 'perdido').map((f, i, arr) => {
                      const maxR = Math.max(...arr.map((x) => x.reached || x.count || 1), 1);
                      const h = Math.max(12, ((f.reached || f.count) / maxR) * 160);
                      return (
                        <div className="funnel-bar" key={f.id}>
                          <div className="cnt">{f.count} leads</div>
                          <div className="bar" style={{ height: h, opacity: 1 - i * 0.08 }} />
                          <div className="lbl">{f.label}<br />{f.pct ? f.pct + '%' : ''}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="report-grid">
                  <div className="card">
                    <h3>Entrada por origem</h3>
                    {(reports?.bySource || []).map((s) => (
                      <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '.85rem' }}>
                        <span>{s.name}</span><strong>{s.count}</strong>
                      </div>
                    ))}
                    {!reports?.bySource?.length && <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Rode Dados demo</p>}
                  </div>
                  <div className="card">
                    <h3>Últimos eventos</h3>
                    {(reports?.recent || []).slice(0, 8).map((l) => (
                      <div key={l.id} style={{ fontSize: '.8rem', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                        {l.nome} · {stageLabel(l.stage, activePipe)} · {fmtMoney(l.value)}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tab === 'suporte' && (
              <div className="card">
                <h3>Suporte</h3>
                <ul style={{ margin: '12px 0 0 18px', fontSize: '.9rem', lineHeight: 1.8, color: 'var(--muted)' }}>
                  <li>Senha: CRM_PASSWORD (padrão solar2026)</li>
                  <li>Webhook verify: paraty_solar_verify_2026</li>
                  <li>Botão Dados demo carrega 12 leads + agenda</li>
                  <li>Google Calendar: token OAuth em Configurações</li>
                </ul>
              </div>
            )}

            {tab === 'settings' && (
              <>
                <div className="card">
                  <h3>WhatsApp Cloud API</h3>
                  <p>Status: {waConfig?.connected ? <span className="ok">Conectado</span> : <span className="err">Desconectado</span>}</p>
                  <label>Access Token</label>
                  <input className="input" value={formToken} onChange={(e) => setFormToken(e.target.value)} />
                  <label>Phone Number ID</label>
                  <input className="input" value={formPhoneId} onChange={(e) => setFormPhoneId(e.target.value)} />
                  <label>WABA ID</label>
                  <input className="input" value={formWabaId} onChange={(e) => setFormWabaId(e.target.value)} />
                  <button className="btn btn-primary" onClick={saveWa}>Salvar WhatsApp</button>
                </div>
                <div className="card">
                  <h3>Webhook Meta</h3>
                  <code style={{ display: 'block', background: 'var(--soft)', padding: 10, borderRadius: 8, fontSize: '.8rem', wordBreak: 'break-all' }}>{webhookUrl}</code>
                  <p style={{ marginTop: 8, fontSize: '.85rem' }}>Verify: <code>paraty_solar_verify_2026</code></p>
                </div>
                <div className="card">
                  <h3>Google Calendar</h3>
                  <p>Status: {gcal.connected ? <span className="ok">Conectado</span> : <span className="err">Desconectado</span>}</p>
                  <label>Access Token Google</label>
                  <input className="input" value={gcalToken} onChange={(e) => setGcalToken(e.target.value)} placeholder="ya29..." />
                  <label>Calendar ID</label>
                  <input className="input" value={gcalCalId} onChange={(e) => setGcalCalId(e.target.value)} placeholder="primary" />
                  <button className="btn btn-primary" onClick={connectGcal}>Conectar Google Calendar</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div className="drawer">
          <button className="btn btn-ghost btn-sm" style={{ float: 'right' }} onClick={() => setSelected(null)}>✕</button>
          <h3 style={{ color: 'var(--teal)' }}>{selected.nome}</h3>
          <p style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{selected.telefone || selected.contato}</p>
          <label>Etapa</label>
          <select className="input" value={selected.stage || ''} onChange={(e) => patchLead(selected.id, { stage: e.target.value })}>
            {columns.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <label>Tags</label>
          <div style={{ marginBottom: 10 }}>
            {TAGS.map((t) => (
              <button key={t} className="btn btn-sm" style={{
                margin: 2,
                background: (selected.tags || []).includes(t) ? 'var(--teal)' : 'var(--soft)',
                color: (selected.tags || []).includes(t) ? '#fff' : 'inherit',
              }} onClick={() => {
                const tags = new Set(selected.tags || []);
                if (tags.has(t)) tags.delete(t); else tags.add(t);
                patchLead(selected.id, { tags: [...tags] });
              }}>{t}</button>
            ))}
          </div>
          <label>Valor (R$)</label>
          <input className="input" type="number" defaultValue={selected.value || ''} onBlur={(e) => patchLead(selected.id, { value: e.target.value })} />
          <label>Nota</label>
          <textarea className="input" rows={2} value={noteText} onChange={(e) => setNoteText(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={() => { if (noteText.trim()) { patchLead(selected.id, { note: noteText }); setNoteText(''); } }}>Salvar nota</button>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary btn-sm" onClick={() => patchLead(selected.id, { stage: 'fechado' })}>🏆 Ganhar</button>
            <button className="btn btn-danger btn-sm" onClick={() => patchLead(selected.id, { stage: 'perdido' })}>✕ Perder</button>
          </div>
        </div>
      )}

      {showPipe && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setShowPipe(false)}>
          <div className="modal">
            <button className="btn btn-ghost btn-sm" style={{ float: 'right' }} onClick={() => setShowPipe(false)}>✕</button>
            <h3>Criar pipeline</h3>
            <label>Nome</label>
            <input className="input" value={pipeName} onChange={(e) => setPipeName(e.target.value)} placeholder="Nome do pipeline" />
            <label>Colunas</label>
            {pipeCols.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.color }} />
                <input className="input" style={{ margin: 0 }} value={c.label} onChange={(e) => {
                  const next = [...pipeCols];
                  next[i] = { ...next[i], label: e.target.value, id: e.target.value.toLowerCase().replace(/\s+/g, '_') };
                  setPipeCols(next);
                }} />
              </div>
            ))}
            <button className="btn btn-ghost" style={{ width: '100%', marginBottom: 12 }} onClick={() => setPipeCols((cols) => [...cols.slice(0, -1), { id: 'col-' + Date.now(), label: 'Nova coluna', color: '#94a3b8' }, cols[cols.length - 1]])}>+ Adicionar coluna</button>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowPipe(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={createPipeline}>Criar</button>
            </div>
          </div>
        </div>
      )}

      {showOpp && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setShowOpp(false)}>
          <div className="modal wide">
            <button className="btn btn-ghost btn-sm" style={{ float: 'right' }} onClick={() => setShowOpp(false)}>✕</button>
            <h3>Adicionar oportunidade</h3>
            <p style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Pipeline: {activePipe?.name}</p>
            <div className="steps">
              <span className={oppStep >= 1 ? 'done' : ''}>✓ Informações do contato</span>
              <span>—</span>
              <span className={oppStep >= 2 ? 'done' : ''}>Configuração no pipeline</span>
            </div>
            {oppStep === 1 && (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button className={'btn ' + (oppMode === 'existente' ? 'btn-primary' : 'btn-ghost')} onClick={() => setOppMode('existente')}>Contato existente</button>
                  <button className={'btn ' + (oppMode === 'novo' ? 'btn-primary' : 'btn-ghost')} onClick={() => setOppMode('novo')}>Novo contato</button>
                </div>
                {oppMode === 'existente' ? (
                  <>
                    <label>Buscar contato</label>
                    <input className="input" value={oppSearch} onChange={(e) => setOppSearch(e.target.value)} placeholder="Nome, telefone ou email" />
                    {oppMatches.map((l) => (
                      <div key={l.id} className="lead-card" onClick={() => {
                        setOppForm({ nome: l.nome, telefone: l.telefone || l.contato, value: String(l.value || ''), stage: columns[0]?.id || 'novo' });
                        setOppStep(2);
                      }}>
                        <div className="name">{l.nome}</div>
                        <div className="meta">{l.telefone || l.contato}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <label>Nome</label>
                    <input className="input" value={oppForm.nome} onChange={(e) => setOppForm((f) => ({ ...f, nome: e.target.value }))} />
                    <label>Telefone</label>
                    <input className="input" value={oppForm.telefone} onChange={(e) => setOppForm((f) => ({ ...f, telefone: e.target.value }))} />
                  </>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-ghost" onClick={() => setShowOpp(false)}>Fechar</button>
                  {oppMode === 'novo' && <button className="btn btn-primary" onClick={() => setOppStep(2)} disabled={!oppForm.nome}>Próximo</button>}
                </div>
              </>
            )}
            {oppStep === 2 && (
              <>
                <label>Coluna inicial</label>
                <select className="input" value={oppForm.stage} onChange={(e) => setOppForm((f) => ({ ...f, stage: e.target.value }))}>
                  {columns.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <label>Valor estimado (R$)</label>
                <input className="input" type="number" value={oppForm.value} onChange={(e) => setOppForm((f) => ({ ...f, value: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-ghost" onClick={() => setOppStep(1)}>Voltar</button>
                  <button className="btn btn-primary" onClick={createOpportunity}>Criar oportunidade</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showTrigger && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setShowTrigger(false)}>
          <div className="modal">
            <h3>Nova automação</h3>
            <label>Nome</label>
            <input className="input" value={newFlow.name} onChange={(e) => setNewFlow((f) => ({ ...f, name: e.target.value }))} />
            <label>Gatilho</label>
            <select className="input" value={newFlow.trigger} onChange={(e) => setNewFlow((f) => ({ ...f, trigger: e.target.value }))}>
              {TRIGGER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <label>Mensagem</label>
            <textarea className="input" rows={3} value={newFlow.steps[0]?.text || ''} onChange={(e) => setNewFlow((f) => ({ ...f, steps: [{ type: 'message', text: e.target.value }] }))} />
            <button className="btn btn-primary" onClick={saveFlow}>Salvar</button>
          </div>
        </div>
      )}

      {showAgent && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setShowAgent(false)}>
          <div className="modal">
            <h3>Novo agente</h3>
            <label>Nome</label>
            <input className="input" value={newAgent.name} onChange={(e) => setNewAgent((f) => ({ ...f, name: e.target.value }))} />
            <label>Objetivo</label>
            <textarea className="input" rows={3} value={newAgent.objective} onChange={(e) => setNewAgent((f) => ({ ...f, objective: e.target.value }))} />
            <button className="btn btn-primary" onClick={saveAgent}>Salvar</button>
          </div>
        </div>
      )}

      {showAppt && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setShowAppt(false)}>
          <div className="modal">
            <h3>Novo agendamento</h3>
            <label>Título</label>
            <input className="input" value={apptForm.title} onChange={(e) => setApptForm((f) => ({ ...f, title: e.target.value }))} />
            <label>Contato</label>
            <input className="input" value={apptForm.nome} onChange={(e) => setApptForm((f) => ({ ...f, nome: e.target.value }))} />
            <label>Data/hora</label>
            <input className="input" type="datetime-local" onChange={(e) => setApptForm((f) => ({ ...f, at: e.target.value ? new Date(e.target.value).toISOString() : '' }))} />
            <button className="btn btn-primary" onClick={createAppt}>Criar{gcal.connected ? ' + Google' : ''}</button>
          </div>
        </div>
      )}
    </div>
  );
}
