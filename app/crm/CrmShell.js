'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  STAGES, TAGS, TRIGGER_TYPES, MENU, REPORT_SECTIONS, LOSS_REASONS,
  DEFAULT_PIPELINE, stageLabel, stageColor, fmtMoney, fmtDate,
} from './crm-data';
import { CSS } from './crm-styles';
import ContatosTab from './ContatosTab';
import FunnelKanban from './FunnelKanban';

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

  async function patchLead(id, body, opts = {}) {
    setMsg('');
    if (body.stage) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...body } : l)));
      if (selected?.id === id) setSelected((s) => (s ? { ...s, ...body } : s));
    }
    try {
      const d = await fetch('/api/crm/leads?auth=' + encodeURIComponent(a), {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...body }),
      }).then((r) => r.json());
      if (d.ok) {
        if (!opts.silent) setMsg('Salvo');
        if (!body.stage) await loadLeads();
      } else { setErr(d.error || 'Falha'); await loadLeads(); }
    } catch (e) { setErr(String(e.message || e)); await loadLeads(); }
  }

  async function deleteLead(id) {
    if (!id || !window.confirm('Excluir este contato?')) return;
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (selected?.id === id) setSelected(null);
    try {
      const d = await fetch('/api/crm/leads?auth=' + encodeURIComponent(a), {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      }).then((r) => r.json());
      if (d.ok) setMsg('Excluído'); else { setErr(d.error || 'Falha'); await loadLeads(); }
    } catch (e) { setErr(String(e.message || e)); await loadLeads(); }
  }

  function moveLead(id, stageId) {
    const lead = leads.find((l) => l.id === id);
    if (lead && lead.stage === stageId) return;
    patchLead(id, { stage: stageId }, { silent: true });
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
    setImporting(true); setImportResult(null); setErr(''); setMsg('');
    try {
      const text = await file.text();
      if (!text.trim()) { setErr('Arquivo CSV vazio'); setImporting(false); return; }
      const d = await fetch('/api/crm/contacts?auth=' + encodeURIComponent(a), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ csv: text }),
      }).then((r) => r.json());
      if (d.ok) { setImportResult(d); setMsg(d.message || ((d.created || 0) + ' importados')); await loadLeads(); }
      else setErr(d.error || 'Falha');
    } catch (e) { setErr('Erro CSV: ' + (e.message || e)); }
    setImporting(false);
  }

  async function createOpportunity() {
    const body = {
      id: 'opp-' + Date.now(), nome: oppForm.nome || 'Novo contato',
      telefone: oppForm.telefone, value: Number(oppForm.value) || 0,
      stage: oppForm.stage || columns[0]?.id || 'novo', tags: ['manual'], source: 'crm',
    };
    await fetch('/api/crm/seed?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ single: body }),
    });
    setShowOpp(false); setOppStep(1);
    setOppForm({ nome: '', telefone: '', value: '', stage: 'novo' });
    loadLeads(); setMsg('Contato adicionado');
  }

  async function sendReply() {
    if (!activeChat || !replyText.trim()) return;
    setWaErr(''); setWaMsg('');
    try {
      const d = await fetch('/api/whatsapp/send?auth=' + encodeURIComponent(a), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: activeChat.phone, text: replyText.trim() }),
      }).then((r) => r.json());
      if (d.ok) { setWaMsg('Enviado'); setReplyText(''); loadWa(); }
      else setWaErr(d.error || 'Falha');
    } catch (e) { setWaErr(String(e.message || e)); }
  }

  async function agentSuggest() {
    if (!activeChat?.lead?.id) { setWaErr('Abra chat de um lead'); return; }
    const d = await fetch('/api/crm/agents?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reply', leadId: activeChat.lead.id, text: replyText || 'olá', send: false }),
    }).then((r) => r.json());
    if (d.ok) setReplyText(d.text || ''); else setWaErr(d.error || 'Falha');
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
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle', id }),
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
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'test', text: testMsg }),
    }).then((r) => r.json());
    setTestResult(d);
  }

  async function saveKnow() {
    if (!newKnow.q || !newKnow.a) return;
    await fetch('/api/crm/knowledge?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', item: { ...newKnow, id: 'k-' + Date.now() } }),
    });
    setNewKnow({ q: '', a: '', active: true }); loadKnowledge(); setMsg('Salvo');
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
    if (d.ok) { setGcal(d.googleCalendar); setMsg('Calendar conectado'); }
    else setErr(d.error || 'Falha');
  }

  async function createAppt() {
    const d = await fetch('/api/crm/calendar?auth=' + encodeURIComponent(a), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...apptForm }),
    }).then((r) => r.json());
    if (d.ok) { setAppts(d.appointments || []); setShowAppt(false); setMsg('Agendado'); }
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

  if (!auth) {
    return (
      <div className="crm-root">
        <style>{CSS}</style>
        <div className="login-wrap">
          <div className="login-box">
            <h2 style={{ color: 'var(--teal)', marginBottom: 8 }}>Paraty Solar CRM</h2>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: 16 }}>Funil · Chat · Flows · Agenda</p>
            <label>Senha</label>
            <input className="input" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && login()} placeholder="Digite a senha" autoComplete="off" />
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
            <button className="btn btn-ghost btn-sm" onClick={seedDemo} disabled={loading}>{loading ? '...' : 'Dados demo'}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { loadLeads(); loadReports(); loadAppts(); }}>Atualizar</button>
          </div>
          <div className="content">
            {msg && <div className="ok" style={{ marginBottom: 10 }}>{msg}</div>}
            {err && <div className="err" style={{ marginBottom: 10 }}>{err}</div>}

            {tab === 'dashboard' && (
              <div className="stats">
                <div className="stat"><div className="n">{dash?.total ?? leads.length}</div><div className="l">Leads</div></div>
                <div className="stat"><div className="n">{byStage.fechado?.length || 0}</div><div className="l">Ganhos</div></div>
                <div className="stat"><div className="n">{byStage.perdido?.length || 0}</div><div className="l">Perdidos</div></div>
              </div>
            )}

            {tab === 'funil' && (
              <>
                <div className="filters">
                  <select className="input" style={{ margin: 0 }} value={activePipeId} onChange={(e) => setActivePipeId(e.target.value)}>
                    {pipelines.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input className="input" style={{ margin: 0, flex: 1 }} placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
                  <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>Total: {filtered.length}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowOpp(true)}>+ Contato</button>
                </div>
                <FunnelKanban
                  columns={columns}
                  byStage={byStage}
                  onMove={moveLead}
                  onOpen={(l) => { setSelected(l); setNoteText(''); }}
                  fmtMoney={fmtMoney}
                />
              </>
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

            {tab === 'chat' && (
              <div className="card">
                <h3>Inbox WhatsApp</h3>
                <p style={{ color: 'var(--muted)' }}>Conversas: {(conversations || []).length}</p>
                {(conversations || []).map((c) => (
                  <button key={c.phone} className="btn btn-ghost btn-sm" style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 4 }} onClick={() => setActiveChat(c)}>
                    {c.contactName || c.phone}
                  </button>
                ))}
                {activeChat && (
                  <div style={{ marginTop: 12 }}>
                    <input className="input" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Mensagem" />
                    <button className="btn btn-primary btn-sm" onClick={sendReply}>Enviar</button>
                    {waMsg && <div className="ok">{waMsg}</div>}
                    {waErr && <div className="err">{waErr}</div>}
                  </div>
                )}
              </div>
            )}

            {tab === 'settings' && (
              <div className="card">
                <h3>WhatsApp</h3>
                <input className="input" value={formToken} onChange={(e) => setFormToken(e.target.value)} placeholder="Access Token" />
                <input className="input" value={formPhoneId} onChange={(e) => setFormPhoneId(e.target.value)} placeholder="Phone Number ID" />
                <button className="btn btn-primary" onClick={saveWa}>Salvar</button>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)' }}>Webhook: {webhookUrl}</p>
              </div>
            )}

            {(tab === 'flows' || tab === 'agents' || tab === 'knowledge' || tab === 'broadcast' || tab === 'calendario' || tab === 'relatorios' || tab === 'suporte') && (
              <div className="card">
                <h3>{MENU.find((m) => m.id === tab)?.label}</h3>
                <p style={{ color: 'var(--muted)' }}>Use o menu e as ações do topo. Contatos e funil estão completos com arrastar, editar e excluir.</p>
                {tab === 'broadcast' && (
                  <>
                    <textarea className="input" rows={3} value={bcText} onChange={(e) => setBcText(e.target.value)} placeholder="Mensagem" />
                    <button className="btn btn-primary" onClick={runBroadcast}>Disparar</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showOpp && (
        <div className="modal-bg" onClick={() => setShowOpp(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Adicionar contato</h3>
            <input className="input" value={oppForm.nome} onChange={(e) => setOppForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome" />
            <input className="input" value={oppForm.telefone} onChange={(e) => setOppForm((f) => ({ ...f, telefone: e.target.value }))} placeholder="Telefone" />
            <input className="input" value={oppForm.value} onChange={(e) => setOppForm((f) => ({ ...f, value: e.target.value }))} placeholder="Valor" />
            <button className="btn btn-primary" onClick={createOpportunity}>Adicionar</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-bg" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h3>Editar contato</h3>
            <input className="input" defaultValue={selected.nome || ''} id="edit-nome" placeholder="Nome" />
            <input className="input" defaultValue={selected.telefone || selected.contato || ''} id="edit-telefone" placeholder="Telefone" />
            <input className="input" type="number" defaultValue={selected.value || ''} id="edit-value" placeholder="Valor" />
            <select className="input" value={selected.stage || 'novo'} onChange={(e) => patchLead(selected.id, { stage: e.target.value }, { silent: true })}>
              {columns.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <textarea className="input" rows={2} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Anotação..." />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => {
                const body = {
                  nome: document.getElementById('edit-nome')?.value?.trim(),
                  telefone: document.getElementById('edit-telefone')?.value?.trim(),
                  contato: document.getElementById('edit-telefone')?.value?.trim(),
                  value: Number(document.getElementById('edit-value')?.value) || 0,
                };
                if (noteText.trim()) body.note = noteText.trim();
                patchLead(selected.id, body).then(() => { setNoteText(''); setSelected(null); });
              }}>Salvar</button>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Fechar</button>
              <button className="btn btn-ghost" style={{ color: '#ef4444', marginLeft: 'auto' }} onClick={() => deleteLead(selected.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
