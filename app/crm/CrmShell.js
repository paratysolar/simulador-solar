'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  STAGES, TAGS, TRIGGER_TYPES, MENU, REPORT_SECTIONS, LOSS_REASONS,
  DEFAULT_PIPELINE, stageLabel, stageColor, fmtMoney, fmtDate,
} from './crm-data';
import { CSS } from './crm-styles';
import ContatosTab from './ContatosTab';

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
  const [knowledge, setKnowledge] = useState([]);
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
  const [newKnow, setNewKnow] = useState({ q: '', a: '', active: true });
  const [apptForm, setApptForm] = useState({ nome: '', title: '', at: '', duration: 60 });
  const [bcText, setBcText] = useState('');
  const [bcStage, setBcStage] = useState('');
  const [bcResult, setBcResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [testMsg, setTestMsg] = useState('');
  const [testResult, setTestResult] = useState(null);

  const a = auth;
  const activePipe = pipelines.find((p) => p.id === activePipeId) || pipelines[0] || DEFAULT_PIPELINE;
  const columns = activePipe?.columns || STAGES;

  useEffect(() => { const s = sessionStorage.getItem('crm_auth_v1'); if (s) setAuth(s); }, []);

  const loadLeads = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/leads?auth=' + encodeURIComponent(a)).then((r) => r.json());
      if (d.ok) setLeads(d.leads || []);
    } catch {}
  }, [auth, a]);

  const loadFlows = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/flows?auth=' + encodeURIComponent(a)).then((r) => r.json());
      if (d.ok) setFlows(d.flows || []);
    } catch {}
  }, [auth, a]);

  const loadAgents = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/agents?auth=' + encodeURIComponent(a)).then((r) => r.json());
      if (d.ok) setAgents(d.agents || []);
    } catch {}
  }, [auth, a]);

  const loadKnowledge = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/knowledge?auth=' + encodeURIComponent(a)).then((r) => r.json());
      if (d.ok) setKnowledge(d.items || d.knowledge || []);
    } catch {}
  }, [auth, a]);

  const loadPipes = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/pipelines?auth=' + encodeURIComponent(a)).then((r) => r.json());
      if (d.ok && d.pipelines?.length) {
        setPipelines(d.pipelines);
        if (d.activeId) setActivePipeId(d.activeId);
      }
    } catch {}
  }, [auth, a]);

  const loadDash = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/dashboard?auth=' + encodeURIComponent(a)).then((r) => r.json());
      if (d.ok) setDash(d);
    } catch {}
  }, [auth, a]);

  const loadReports = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/reports?auth=' + encodeURIComponent(a) + '&days=30').then((r) => r.json());
      if (d.ok) setReports(d);
    } catch {}
  }, [auth, a]);

  const loadAppts = useCallback(async () => {
    if (!auth) return;
    try {
      const d = await fetch('/api/crm/calendar?auth=' + encodeURIComponent(a)).then((r) => r.json());
      if (d.ok) { setAppts(d.appointments || []); setGcal(d.googleCalendar || { connected: false }); }
    } catch {}
  }, [auth, a]);

  const loadWa = useCallback(async () => {
    if (!auth) return;
    try {
      const [cfg, inbox] = await Promise.all([
        fetch('/api/whatsapp/config?auth=' + encodeURIComponent(a)).then((r) => r.json()).catch(() => ({})),
        fetch('/api/crm/inbox?auth=' + encodeURIComponent(a)).then((r) => r.json()).catch(() => ({})),
      ]);
      if (cfg.ok || cfg.connected !== undefined) setWaConfig(cfg);
      if (inbox.ok) setConversations(inbox.conversations || []);
    } catch {}
  }, [auth, a]);

  useEffect(() => {
    if (!auth) return;
    loadLeads();
    loadPipes();
    if (tab === 'flows') loadFlows();
    if (tab === 'agents') { loadAgents(); loadKnowledge(); }
    if (tab === 'knowledge') loadKnowledge();
    if (tab === 'dashboard') loadDash();
    if (tab === 'relatorios') loadReports();
    if (tab === 'calendario') loadAppts();
    if (tab === 'chat' || tab === 'settings') loadWa();
    if (tab === 'broadcast' || tab === 'contatos') loadLeads();
  }, [auth, tab, loadLeads, loadFlows, loadAgents, loadKnowledge, loadPipes, loadDash, loadReports, loadAppts, loadWa]);

  async function login() {
    setErr('');
    if (!pwd.trim()) { setErr('Informe a senha'); return; }
    try {
      const res = await fetch('/api/crm/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) {
        sessionStorage.setItem('crm_auth_v1', pwd);
        setAuth(pwd);
        setPwd('');
      } else {
        setErr('Senha incorreta');
        setPwd('');
      }
    } catch (e) {
      setErr('Falha de conexão. Tente novamente.');
      setPwd('');
    }
  }

  function logout() {
    sessionStorage.removeItem('crm_auth_v1');
    setAuth('');
  }

  async function patchLead(id, body) {
    setMsg('');
    try {
      const d = await fetch('/api/crm/leads?auth=' + encodeURIComponent(a), {
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
      const d = await fetch('/api/crm/seed?auth=' + encodeURIComponent(a), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then((r) => r.json());
      if (d.ok) { setMsg('✓ ' + (d.message || (d.created + ' leads demo'))); loadLeads(); loadReports(); loadAppts(); }
      else setErr(d.error || 'Seed falhou');
    } catch (e) { setErr(String(e.message || e)); }
    setLoading(false);
  }

  async function createPipeline() {
    if (!pipeName.trim()) return;
    const d = await fetch('/api/crm/pipelines?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', pipeline: { name: pipeName, columns: pipeCols } }),
    }).then((r) => r.json());
    if (d.ok) { setPipelines(d.pipelines); setActivePipeId(d.pipeline.id); setShowPipe(false); setPipeName(''); setMsg('Pipeline criado'); }
  }

  async function importGoogleCsv(file) {
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setErr('');
    setMsg('');
    try {
      const text = await file.text();
      if (!text.trim()) { setErr('Arquivo CSV vazio'); setImporting(false); return; }
      const d = await fetch('/api/crm/contacts?auth=' + encodeURIComponent(a), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text }),
      }).then((r) => r.json());
      if (d.ok) {
        setImportResult(d);
        setMsg(d.message || ((d.created || 0) + ' contato(s) importado(s)'));
        await loadLeads();
      } else setErr(d.error || 'Falha na importacao');
    } catch (e) {
      setErr('Erro ao ler/importar CSV: ' + (e.message || e));
    }
    setImporting(false);
  }

  async function createOpportunity() {
    const body = {
      id: 'opp-' + Date.now(), nome: oppForm.nome || 'Novo contato',
      telefone: oppForm.telefone, value: Number(oppForm.value) || 0,
      stage: oppForm.stage || columns[0]?.id || 'novo', tags: ['manual'], source: 'crm',
    };
    await fetch('/api/crm/seed?auth=' + encodeURIComponent(a), {
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
      const d = await fetch('/api/whatsapp/send?auth=' + encodeURIComponent(a), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: activeChat.phone, text: replyText.trim() }),
    }).then((r) => r.json());
      if (d.ok) { setWaMsg('Enviado (janela 24h)'); setReplyText(''); loadWa(); }
      else setWaErr(d.error || 'Falha');
    } catch (e) { setWaErr(String(e.message || e)); }
  }

  async function agentSuggest() {
    if (!activeChat?.lead?.id) { setWaErr('Abra chat de um lead vinculado'); return; }
    const d = await fetch('/api/crm/agents?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reply', leadId: activeChat.lead.id, text: replyText || 'olá', send: false }),
    }).then((r) => r.json());
    if (d.ok) setReplyText(d.text || ''); else setWaErr(d.error || 'Falha agente');
  }

  async function saveFlow() {
    if (!newFlow.name) return;
    await fetch('/api/crm/flows?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', flow: { ...newFlow, id: 'flow-' + Date.now(), active: true } }),
    });
    setShowTrigger(false); loadFlows(); setMsg('Flow salvo');
  }

  async function toggleFlow(id) {
    await fetch('/api/crm/flows?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id }),
    });
    loadFlows();
  }

  async function saveAgent() {
    if (!newAgent.name) return;
    await fetch('/api/crm/agents?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', agent: { ...newAgent, id: 'agent-' + Date.now() } }),
    });
    setShowAgent(false); loadAgents(); setMsg('Agente salvo');
  }

  async function testAgent() {
    setTestResult(null);
    const d = await fetch('/api/crm/agents?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test', text: testMsg }),
    }).then((r) => r.json());
    setTestResult(d);
  }

  async function saveKnow() {
    if (!newKnow.q || !newKnow.a) return;
    await fetch('/api/crm/knowledge?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', item: { ...newKnow, id: 'k-' + Date.now() } }),
    });
    setNewKnow({ q: '', a: '', active: true }); loadKnowledge(); setMsg('Conhecimento salvo');
  }

  async function saveWa() {
    setWaErr('');
    try {
      const d = await fetch('/api/whatsapp/config?auth=' + encodeURIComponent(a), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: formToken, phoneNumberId: formPhoneId, wabaId: formWabaId, displayPhone: formDisplay }),
      }).then((r) => r.json());
      if (d.ok) { setWaMsg('WhatsApp salvo'); loadWa(); } else setWaErr(d.error || 'Falha');
    } catch (e) { setWaErr(String(e.message || e)); }
  }

  async function connectGcal() {
    const d = await fetch('/api/crm/calendar?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'connect_google', accessToken: gcalToken, calendarId: gcalCalId || 'primary' }),
    }).then((r) => r.json());
    if (d.ok) { setGcal(d.googleCalendar); setMsg('Google Calendar conectado'); }
    else setErr(d.error || 'Falha GCal');
  }

  async function createAppt() {
    const d = await fetch('/api/crm/calendar?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...apptForm }),
    }).then((r) => r.json());
    if (d.ok) { setAppts(d.appointments || []); setShowAppt(false); setMsg('Agendamento criado' + (d.appointment?.gcalEventId ? ' + Google' : '')); }
  }

  async function runBroadcast() {
    setBcResult(null);
    const d = await fetch('/api/crm/broadcast?auth=' + encodeURIComponent(a), {
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
            <input
              className="input"
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              placeholder="Digite a senha"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              name="crm-password"
            />
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
          <div className="brand">
            Paraty Solar
            <small>CRM · ChatFunnel</small>
          </div>
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
                        <span>{s.label}</span><span>{(byStage[s.id] || []).length}</span>
                      </div>
                      <div className="col-b">
                        {(byStage[s.id] || []).map((l) => (
                          <div className="lead-card" key={l.id} draggable onDragStart={(e) => e.dataTransfer.setData('id', l.id)} onClick={() => setSelected(l)}>
                            <strong>{l.nome}</strong>
                            <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{l.telefone || l.contato}</div>
                            {l.value ? <div style={{ fontSize: '.8rem' }}>{fmtMoney(l.value)}</div> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'chat' && (
              <div className="card">
                <h3>Inbox WhatsApp</h3>
                <div style={{ display: 'flex', gap: 16, minHeight: 320 }}>
                  <div style={{ width: 220, borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
                    {(conversations || []).map((c) => (
                      <div key={c.phone} style={{ padding: 8, cursor: 'pointer', background: activeChat?.phone === c.phone ? 'var(--teal-dim)' : undefined }} onClick={() => setActiveChat(c)}>
                        <strong>{c.contactName || c.lead?.nome || c.phone}</strong>
                        <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{c.lastMessage?.slice?.(0, 40)}</div>
                      </div>
                    ))}
                    {!conversations?.length && <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Sem conversas. Conecte o WhatsApp em Configurações.</p>}
                  </div>
                  <div style={{ flex: 1 }}>
                    {activeChat ? (
                      <>
                        <strong>{activeChat.contactName || activeChat.phone}</strong>
                        <div style={{ margin: '12px 0', maxHeight: 200, overflowY: 'auto', fontSize: '.9rem' }}>
                          {(activeChat.messages || []).map((m, i) => (
                            <div key={i} style={{ marginBottom: 6, textAlign: m.fromMe ? 'right' : 'left' }}>
                              <span style={{ background: m.fromMe ? 'var(--teal)' : '#e2e8f0', color: m.fromMe ? '#fff' : '#000', padding: '4px 8px', borderRadius: 8, display: 'inline-block' }}>{m.text}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input className="input" style={{ margin: 0, flex: 1 }} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Mensagem (grátis 24h)" onKeyDown={(e) => e.key === 'Enter' && sendReply()} />
                          <button className="btn btn-ghost btn-sm" onClick={agentSuggest}>IA</button>
                          <button className="btn btn-primary btn-sm" onClick={sendReply}>Enviar</button>
                        </div>
                        {waMsg && <div className="ok">{waMsg}</div>}
                        {waErr && <div className="err">{waErr}</div>}
                      </>
                    ) : <p style={{ color: 'var(--muted)' }}>Selecione uma conversa</p>}
                  </div>
                </div>
              </div>
            )}

            {tab === 'agents' && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3>Agentes de IA</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAgent(true)}>+ Agente</button>
                </div>
                {(agents || []).map((ag) => (
                  <div key={ag.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <strong>{ag.name}</strong> — {ag.tone} {ag.active ? '✓' : '(off)'}
                    <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{ag.objective}</div>
                  </div>
                ))}
                <div style={{ marginTop: 16 }}>
                  <h4>Testar resposta</h4>
                  <input className="input" value={testMsg} onChange={(e) => setTestMsg(e.target.value)} placeholder="Ex: Quanto custa o sistema solar?" onKeyDown={(e) => e.key === 'Enter' && testAgent()} />
                  <button className="btn btn-ghost btn-sm" onClick={testAgent}>Testar</button>
                  {testResult && <pre style={{ fontSize: '.85rem', marginTop: 8 }}>{JSON.stringify(testResult, null, 2)}</pre>}
                </div>
              </div>
            )}

            {tab === 'knowledge' && (
              <div className="card">
                <h3>Base de conhecimento</h3>
                <div style={{ marginBottom: 12 }}>
                  <input className="input" value={newKnow.q} onChange={(e) => setNewKnow((f) => ({ ...f, q: e.target.value }))} placeholder="Ex: Qual o prazo de instalação?" />
                  <textarea className="input" rows={3} value={newKnow.a} onChange={(e) => setNewKnow((f) => ({ ...f, a: e.target.value }))} placeholder="Texto que o agente enviará" />
                  <button className="btn btn-primary btn-sm" onClick={saveKnow}>Salvar</button>
                </div>
                {(knowledge || []).map((k) => (
                  <div key={k.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <strong>Q:</strong> {k.q}<br /><strong>A:</strong> {k.a}
                  </div>
                ))}
              </div>
            )}

            {tab === 'flows' && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3>Flows / Triggers</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowTrigger(true)}>+ Flow</button>
                </div>
                {(flows || []).map((f) => (
                  <div key={f.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>{f.name}</strong> — {f.trigger} {f.active ? '✓' : '(off)'}</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleFlow(f.id)}>{f.active ? 'Desativar' : 'Ativar'}</button>
                  </div>
                ))}
                {!flows?.length && <p style={{ color: 'var(--muted)' }}>Nenhum flow. Crie automações por evento (novo contato, tag, etapa).</p>}
              </div>
            )}

            {tab === 'broadcast' && (
              <div className="card">
                <h3>Disparo (janela 24h)</h3>
                <select className="input" value={bcStage} onChange={(e) => setBcStage(e.target.value)}>
                  <option value="">Todos</option>
                  {STAGES.map((s) => <option key={s.id || s} value={s.id || s}>{s.label || s}</option>)}
                </select>
                <textarea className="input" rows={4} value={bcText} onChange={(e) => setBcText(e.target.value)} placeholder="Olá {{nome}}, tudo bem?" />
                <button className="btn btn-primary" onClick={runBroadcast}>Enviar</button>
                {bcResult && <pre style={{ marginTop: 8, fontSize: '.85rem' }}>{JSON.stringify(bcResult, null, 2)}</pre>}
              </div>
            )}

            {tab === 'contatos' && (
              <ContatosTab
                filtered={filtered}
                q={q}
                setQ={setQ}
                importing={importing}
                importResult={importResult}
                importGoogleCsv={importGoogleCsv}
                loadLeads={loadLeads}
                setShowOpp={setShowOpp}
                setSelected={setSelected}
                stageLabel={stageLabel}
                stageColor={stageColor}
                activePipe={activePipe}
                fmtMoney={fmtMoney}
              />
            )}

            {tab === 'calendario' && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3>Agenda</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAppt(true)}>+ Agendar</button>
                </div>
                {(appts || []).map((ap) => (
                  <div key={ap.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <strong>{ap.title || 'Visita'}</strong> — {ap.nome} · {ap.at}
                  </div>
                ))}
                {!appts?.length && <p style={{ color: 'var(--muted)' }}>Nenhum agendamento.</p>}
              </div>
            )}

            {tab === 'relatorios' && (
              <div className="card">
                <h3>Relatórios</h3>
                <pre style={{ fontSize: '.85rem', overflow: 'auto' }}>{JSON.stringify(reports, null, 2)}</pre>
              </div>
            )}

            {tab === 'suporte' && (
              <div className="card">
                <h3>Suporte Paraty Solar CRM</h3>
                <ul style={{ lineHeight: 1.8 }}>
                  <li>Senha CRM: definida apenas no servidor (variável <code>CRM_PASSWORD</code> no Vercel).</li>
                  <li>Importar contatos: aba Contatos → CSV do Google Contatos.</li>
                  <li>Webhook WhatsApp: <code>{webhookUrl}</code></li>
                </ul>
              </div>
            )}

            {tab === 'settings' && (
              <div className="card">
                <h3>WhatsApp Cloud API</h3>
                <input className="input" value={formToken} onChange={(e) => setFormToken(e.target.value)} placeholder="EAAG... Access Token" />
                <input className="input" value={formPhoneId} onChange={(e) => setFormPhoneId(e.target.value)} placeholder="Phone Number ID" />
                <input className="input" value={formWabaId} onChange={(e) => setFormWabaId(e.target.value)} placeholder="WABA ID" />
                <input className="input" value={formDisplay} onChange={(e) => setFormDisplay(e.target.value)} placeholder="Número exibido" />
                <button className="btn btn-primary" onClick={saveWa}>Salvar WhatsApp</button>
                {waMsg && <div className="ok">{waMsg}</div>}
                {waErr && <div className="err">{waErr}</div>}
                <h3 style={{ marginTop: 24 }}>Google Calendar</h3>
                <input className="input" value={gcalToken} onChange={(e) => setGcalToken(e.target.value)} placeholder="ya29... Access Token" />
                <input className="input" value={gcalCalId} onChange={(e) => setGcalCalId(e.target.value)} placeholder="primary" />
                <button className="btn btn-ghost" onClick={connectGcal}>Conectar Calendar</button>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)' }}>Webhook: {webhookUrl}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showOpp && (
        <div className="modal-bg" onClick={() => setShowOpp(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nova oportunidade</h3>
            <input className="input" value={oppForm.nome} onChange={(e) => setOppForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome" />
            <input className="input" value={oppForm.telefone} onChange={(e) => setOppForm((f) => ({ ...f, telefone: e.target.value }))} placeholder="Telefone" />
            <input className="input" value={oppForm.value} onChange={(e) => setOppForm((f) => ({ ...f, value: e.target.value }))} placeholder="Valor" />
            <button className="btn btn-primary" onClick={createOpportunity}>Criar</button>
          </div>
        </div>
      )}

      {showPipe && (
        <div className="modal-bg" onClick={() => setShowPipe(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Novo pipeline</h3>
            <input className="input" value={pipeName} onChange={(e) => setPipeName(e.target.value)} placeholder="Nome do pipeline" />
            <button className="btn btn-primary" onClick={createPipeline}>Criar</button>
          </div>
        </div>
      )}

      {showTrigger && (
        <div className="modal-bg" onClick={() => setShowTrigger(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Novo flow</h3>
            <input className="input" value={newFlow.name} onChange={(e) => setNewFlow((f) => ({ ...f, name: e.target.value }))} placeholder="Nome" />
            <select className="input" value={newFlow.trigger} onChange={(e) => setNewFlow((f) => ({ ...f, trigger: e.target.value }))}>
              {TRIGGER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <textarea className="input" rows={2} value={newFlow.steps[0]?.text || ''} onChange={(e) => setNewFlow((f) => ({ ...f, steps: [{ type: 'message', text: e.target.value }] }))} placeholder="Mensagem WA" />
            <button className="btn btn-primary" onClick={saveFlow}>Salvar</button>
          </div>
        </div>
      )}

      {showAgent && (
        <div className="modal-bg" onClick={() => setShowAgent(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Novo agente</h3>
            <input className="input" value={newAgent.name} onChange={(e) => setNewAgent((f) => ({ ...f, name: e.target.value }))} placeholder="Nome" />
            <input className="input" value={newAgent.objective} onChange={(e) => setNewAgent((f) => ({ ...f, objective: e.target.value }))} placeholder="Objetivo" />
            <button className="btn btn-primary" onClick={saveAgent}>Salvar</button>
          </div>
        </div>
      )}

      {showAppt && (
        <div className="modal-bg" onClick={() => setShowAppt(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Agendar</h3>
            <input className="input" value={apptForm.nome} onChange={(e) => setApptForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome do cliente" />
            <input className="input" value={apptForm.title} onChange={(e) => setApptForm((f) => ({ ...f, title: e.target.value }))} placeholder="Visita técnica" />
            <input className="input" type="datetime-local" value={apptForm.at} onChange={(e) => setApptForm((f) => ({ ...f, at: e.target.value }))} />
            <button className="btn btn-primary" onClick={createAppt}>Criar</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-bg" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h3>{selected.nome || 'Lead'}</h3>
            <p>{selected.telefone} · {selected.cidade}</p>
            <select className="input" value={selected.stage || 'novo'} onChange={(e) => patchLead(selected.id, { stage: e.target.value })}>
              {columns.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <textarea className="input" rows={2} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Anotação..." />
            <button className="btn btn-primary" onClick={() => { if (noteText.trim()) patchLead(selected.id, { note: noteText }); setNoteText(''); }}>Salvar nota</button>
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
