'use client';

import { useEffect, useState, useMemo } from 'react';

const STYLES = `
  :root { --bg:#0a0a0a; --card:#111; --soft:#161616; --text:#f5f5f5; --muted:#a0a0a0; --accent:#06cb3f; --border:#2a2a2a; --danger:#ff4d4f; --wa:#25d366; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body, .crm-root { font-family: Inter, system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 24px 16px 60px; }
  header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  h1 { font-size: 1.4rem; font-weight: 600; }
  h1 span { color: var(--accent); }
  a.back { color: var(--muted); text-decoration: none; font-size: 0.9rem; }
  a.back:hover { color: var(--accent); }
  .tabs { display: flex; gap: 6px; margin-bottom: 24px; flex-wrap: wrap; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
  .tab { background: transparent; border: 1px solid var(--border); color: var(--muted); border-radius: 10px; padding: 10px 16px; cursor: pointer; font-family: inherit; font-size: 0.9rem; }
  .tab.active { background: var(--accent); color: #0a0a0a; border-color: var(--accent); font-weight: 600; }
  .tab.wa.active { background: var(--wa); border-color: var(--wa); color: #0a0a0a; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .stat { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; text-align: center; }
  .stat .n { font-size: 1.6rem; font-weight: 700; color: var(--accent); }
  .stat .l { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
  .filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
  .filters select, .filters input, .filters button, .btn {
    background: var(--soft); border: 1px solid var(--border); color: var(--text);
    border-radius: 10px; padding: 10px 14px; font-family: inherit; font-size: 0.9rem;
  }
  .filters button, .btn-primary { background: var(--accent); color: #0a0a0a; font-weight: 600; cursor: pointer; border: none; }
  .btn-wa { background: var(--wa); color: #0a0a0a; font-weight: 600; cursor: pointer; border: none; border-radius: 10px; padding: 12px 20px; font-family: inherit; }
  .btn-danger { background: transparent; border: 1px solid var(--danger); color: var(--danger); border-radius: 10px; padding: 10px 14px; cursor: pointer; font-family: inherit; }
  table { width: 100%; border-collapse: collapse; background: var(--card); border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
  th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border); font-size: 0.85rem; }
  th { background: var(--soft); color: var(--muted); font-weight: 500; font-size: 0.72rem; text-transform: uppercase; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 0.72rem; font-weight: 600; background: rgba(6,203,63,.15); color: var(--accent); }
  .badge.offgrid { background: rgba(62,106,225,.2); color: #7aa0ff; }
  .badge.hibrido { background: rgba(255,180,0,.15); color: #ffb400; }
  .badge.roi { background: rgba(180,100,255,.15); color: #c9a0ff; }
  .empty { text-align: center; padding: 48px 20px; color: var(--muted); }
  .login-box { max-width: 360px; margin: 80px auto; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; text-align: center; }
  .login-box h2 { margin-bottom: 8px; }
  .login-box p { color: var(--muted); font-size: 0.9rem; margin-bottom: 20px; }
  .login-box input { width: 100%; margin-bottom: 12px; background: var(--soft); border: 1px solid var(--border); color: var(--text); border-radius: 10px; padding: 12px; font-family: inherit; }
  .login-box button { width: 100%; background: var(--accent); color: #0a0a0a; font-weight: 600; border: none; border-radius: 10px; padding: 12px; cursor: pointer; font-family: inherit; }
  .err { color: var(--danger); font-size: 0.9rem; margin-top: 8px; }
  .ok { color: var(--accent); font-size: 0.9rem; margin-top: 8px; }
  .detail { position: fixed; inset: 0; background: rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px; }
  .detail-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; max-width: 560px; width: 100%; max-height: 80vh; overflow: auto; padding: 24px; }
  .detail-card pre { background: var(--soft); padding: 14px; border-radius: 10px; font-size: 0.78rem; overflow: auto; white-space: pre-wrap; word-break: break-word; margin-top: 12px; }
  .btn-link { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 0.85rem; font-family: inherit; }
  .btn-out { background: transparent; border: 1px solid var(--border); color: var(--muted); border-radius: 10px; padding: 8px 14px; cursor: pointer; font-family: inherit; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
  .card h3 { font-size: 1.05rem; margin-bottom: 8px; }
  .card p, .card li { color: var(--muted); font-size: 0.9rem; line-height: 1.5; }
  .card ul { margin: 10px 0 10px 18px; }
  .card input, .card textarea { width: 100%; background: var(--soft); border: 1px solid var(--border); color: var(--text); border-radius: 10px; padding: 12px; font-family: inherit; margin: 6px 0 12px; }
  .card label { font-size: 0.8rem; color: var(--muted); }
  .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 100px; font-size: 0.8rem; font-weight: 600; }
  .status-pill.on { background: rgba(37,211,102,.15); color: var(--wa); }
  .status-pill.off { background: rgba(255,77,79,.12); color: var(--danger); }
  .chat-list { display: grid; gap: 10px; }
  .chat-item { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px; cursor: pointer; }
  .chat-item:hover { border-color: var(--wa); }
  .chat-item.active { border-color: var(--wa); background: var(--soft); }
  .chat-msgs { max-height: 360px; overflow: auto; background: var(--soft); border-radius: 12px; padding: 14px; margin: 12px 0; }
  .msg { margin-bottom: 10px; max-width: 80%; }
  .msg.inbound { margin-right: auto; }
  .msg.outbound { margin-left: auto; text-align: right; }
  .msg .bubble { display: inline-block; padding: 8px 12px; border-radius: 12px; font-size: 0.88rem; }
  .msg.inbound .bubble { background: #1a2e1a; color: #d4f5d4; }
  .msg.outbound .bubble { background: #1a2438; color: #c8d6ff; }
  .msg .meta { font-size: 0.7rem; color: var(--muted); margin-top: 2px; }
  .send-row { display: flex; gap: 8px; }
  .send-row input { flex: 1; }
`;

export default function CrmPage() {
  const [auth, setAuth] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [mode, setMode] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [waConfig, setWaConfig] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [waMsg, setWaMsg] = useState('');
  const [waErr, setWaErr] = useState('');
  const [formToken, setFormToken] = useState('');
  const [formPhoneId, setFormPhoneId] = useState('');
  const [formWabaId, setFormWabaId] = useState('');
  const [formDisplay, setFormDisplay] = useState('');
  const [formBusiness, setFormBusiness] = useState('Paraty Solar');

  useEffect(() => {
    const s = sessionStorage.getItem('crm_auth_v1');
    if (s) setAuth(s);
  }, []);

  useEffect(() => {
    if (!auth) return;
    if (tab === 'leads') loadLeads();
    if (tab === 'whatsapp' || tab === 'settings') {
      loadWaConfig();
      if (tab === 'whatsapp') loadConversations();
    }
  }, [auth, tab, mode]);

  async function login() {
    setErr('');
    try {
      const res = await fetch('/api/leads?auth=' + encodeURIComponent(pwd));
      const data = await res.json();
      if (data.error === 'unauthorized') { setErr('Senha incorreta'); return; }
      sessionStorage.setItem('crm_auth_v1', pwd);
      setAuth(pwd);
    } catch {
      if (pwd === 'solar2026') { sessionStorage.setItem('crm_auth_v1', pwd); setAuth(pwd); }
      else setErr('Senha incorreta');
    }
  }

  function logout() {
    sessionStorage.removeItem('crm_auth_v1');
    setAuth('');
    setLeads([]);
    setConversations([]);
    setWaConfig(null);
  }

  async function loadLeads() {
    setLoading(true);
    try {
      const url = '/api/leads?full=1' + (mode ? '&mode=' + mode : '') + '&auth=' + encodeURIComponent(auth);
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) setLeads(data.leads || []);
      else setLeads([]);
    } catch { setLeads([]); }
    setLoading(false);
  }

  async function loadWaConfig() {
    try {
      const res = await fetch('/api/whatsapp/config?auth=' + encodeURIComponent(auth));
      const data = await res.json();
      setWaConfig(data);
    } catch { setWaConfig({ connected: false }); }
  }

  async function loadConversations() {
    try {
      const res = await fetch('/api/whatsapp/conversations?auth=' + encodeURIComponent(auth));
      const data = await res.json();
      if (data.ok) setConversations(data.conversations || []);
    } catch { setConversations([]); }
  }

  async function saveManualConfig() {
    setWaErr(''); setWaMsg('');
    if (!formToken || !formPhoneId) {
      setWaErr('Token e Phone Number ID sao obrigatorios');
      return;
    }
    try {
      const res = await fetch('/api/whatsapp/config?auth=' + encodeURIComponent(auth), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: formToken,
          phoneNumberId: formPhoneId,
          wabaId: formWabaId,
          displayPhone: formDisplay,
          businessName: formBusiness || 'Paraty Solar',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setWaMsg('WhatsApp conectado com sucesso!');
        loadWaConfig();
        setFormToken('');
      } else setWaErr(data.error || 'Falha ao salvar');
    } catch (e) { setWaErr(String(e.message || e)); }
  }

  async function disconnectWa() {
    if (!confirm('Desconectar WhatsApp?')) return;
    await fetch('/api/whatsapp/config?auth=' + encodeURIComponent(auth), { method: 'DELETE' });
    setWaConfig({ connected: false });
    setWaMsg('Desconectado.');
  }

  async function sendReply() {
    if (!activeChat || !replyText.trim()) return;
    setWaErr(''); setWaMsg('');
    try {
      const res = await fetch('/api/whatsapp/send?auth=' + encodeURIComponent(auth), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: activeChat.phone, text: replyText.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setWaMsg('Mensagem enviada (gratuita na janela de 24h)');
        setReplyText('');
        loadConversations();
      } else setWaErr(data.error || 'Falha ao enviar');
    } catch (e) { setWaErr(String(e.message || e)); }
  }

  function openMetaOAuth() {
    const appId = prompt('Cole o App ID do Meta (developers.facebook.com):');
    if (!appId) return;
    const redirect = encodeURIComponent(window.location.origin + '/crm?tab=settings');
    const url = 'https://www.facebook.com/v22.0/dialog/oauth?client_id=' + appId + '&redirect_uri=' + redirect + '&scope=whatsapp_business_management,whatsapp_business_messaging,business_management&response_type=code&state=paraty_solar';
    window.open(url, '_blank', 'width=600,height=700');
  }

  const filtered = useMemo(() => {
    if (!q) return leads;
    const qq = q.toLowerCase();
    return leads.filter(l => JSON.stringify(l).toLowerCase().includes(qq));
  }, [leads, q]);

  const stats = useMemo(() => {
    const m = { ongrid: 0, offgrid: 0, hibrido: 0, roi: 0 };
    leads.forEach(l => { const x = l.data?.mode; if (m[x] !== undefined) m[x]++; });
    return m;
  }, [leads]);

  function resumo(d) {
    if (!d) return '';
    if (d.mode === 'ongrid') return (d.kwp ? d.kwp + ' kWp · ' : '') + (d.economiaAno ? 'R$ ' + Number(d.economiaAno).toLocaleString('pt-BR') + '/ano' : '');
    if (d.mode === 'offgrid') return (d.kwp ? d.kwp + ' kWp · ' : '') + (d.ah ? d.ah + ' Ah' : '');
    if (d.mode === 'hibrido') return (d.kwp ? d.kwp + ' kWp · ' : '') + (d.batKwh ? d.batKwh + ' kWh' : '');
    if (d.mode === 'roi') return (d.roi != null ? d.roi + '% · ' : '') + (d.payback ? d.payback + ' anos' : '');
    return '';
  }

  const webhookUrl = typeof window !== 'undefined'
    ? window.location.origin + '/api/whatsapp/webhook'
    : 'https://seu-dominio.vercel.app/api/whatsapp/webhook';

  return (
    <div className="crm-root">
      <style>{STYLES}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {!auth ? (
        <div className="login-box">
          <h2>CRM Paraty Solar</h2>
          <p>Leads + WhatsApp Business</p>
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Senha do CRM"
            onKeyDown={e => e.key === 'Enter' && login()} />
          <button onClick={login}>Entrar</button>
          {err && <div className="err">{err}</div>}
        </div>
      ) : (
        <div className="wrap">
          <header>
            <div>
              <h1>CRM <span>Paraty Solar</span></h1>
              <a className="back" href="/index.html">← Voltar ao simulador</a>
            </div>
            <button className="btn-out" onClick={logout}>Sair</button>
          </header>

          <div className="tabs">
            <button className={'tab' + (tab === 'leads' ? ' active' : '')} onClick={() => setTab('leads')}>Leads</button>
            <button className={'tab wa' + (tab === 'whatsapp' ? ' active' : '')} onClick={() => setTab('whatsapp')}>WhatsApp</button>
            <button className={'tab' + (tab === 'settings' ? ' active' : '')} onClick={() => setTab('settings')}>Configuracoes</button>
          </div>

          {tab === 'leads' && (
            <>
              <div className="stats">
                <div className="stat"><div className="n">{leads.length}</div><div className="l">Total</div></div>
                <div className="stat"><div className="n">{stats.ongrid}</div><div className="l">On-Grid</div></div>
                <div className="stat"><div className="n">{stats.offgrid}</div><div className="l">Off-Grid</div></div>
                <div className="stat"><div className="n">{stats.hibrido}</div><div className="l">Hibrido</div></div>
                <div className="stat"><div className="n">{stats.roi}</div><div className="l">ROI</div></div>
              </div>
              <div className="filters">
                <select value={mode} onChange={e => setMode(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="ongrid">On-Grid</option>
                  <option value="offgrid">Off-Grid</option>
                  <option value="hibrido">Hibrido</option>
                  <option value="roi">ROI</option>
                </select>
                <input type="search" placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} />
                <button onClick={loadLeads}>Atualizar</button>
              </div>
              {loading ? <div className="empty">Carregando...</div> : !filtered.length ? (
                <div className="empty">Nenhum lead encontrado.</div>
              ) : (
                <table>
                  <thead><tr><th>Data</th><th>Modo</th><th>Contato</th><th>Cidade</th><th>Resumo</th><th></th></tr></thead>
                  <tbody>
                    {filtered.map((l, i) => {
                      const d = l.data || {};
                      const date = String(d.receivedAt || d.ts || l.uploadedAt || '').slice(0, 19).replace('T', ' ');
                      return (
                        <tr key={i}>
                          <td>{date}</td>
                          <td><span className={'badge ' + (d.mode || '')}>{d.mode || '—'}</span></td>
                          <td>{d.nome || d.contato || '—'}</td>
                          <td>{d.cidade || '—'}</td>
                          <td>{resumo(d)}</td>
                          <td><button className="btn-link" onClick={() => setDetail(d)}>Ver</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}

          {tab === 'whatsapp' && (
            <>
              {!waConfig?.connected ? (
                <div className="card">
                  <h3>WhatsApp nao conectado</h3>
                  <p>Va em <strong>Configuracoes</strong> e conecte a conta Meta / WhatsApp Business Cloud API.</p>
                  <button className="btn-wa" style={{ marginTop: 12 }} onClick={() => setTab('settings')}>Ir para Configuracoes</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <strong>Conversas</strong>
                      <button className="btn-link" onClick={loadConversations}>Atualizar</button>
                    </div>
                    <div className="chat-list">
                      {!conversations.length && <div className="empty" style={{ padding: 20 }}>Nenhuma mensagem ainda.</div>}
                      {conversations.map((c) => (
                        <div key={c.phone} className={'chat-item' + (activeChat?.phone === c.phone ? ' active' : '')}
                          onClick={() => setActiveChat(c)}>
                          <div style={{ fontWeight: 600 }}>{c.contactName || c.phone}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                            {(c.messages[c.messages.length - 1]?.text || '').slice(0, 40)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    {activeChat ? (
                      <>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                          {activeChat.contactName || activeChat.phone}
                          <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>{activeChat.phone}</span>
                        </div>
                        <div className="chat-msgs">
                          {activeChat.messages.map((m, i) => (
                            <div key={i} className={'msg ' + (m.direction || 'inbound')}>
                              <div className="bubble">{m.text || '[' + m.type + ']'}</div>
                              <div className="meta">{m.direction === 'outbound' ? 'Voce' : 'Cliente'} · {String(m.receivedAt || '').slice(0, 19).replace('T', ' ')}</div>
                            </div>
                          ))}
                        </div>
                        <div className="send-row">
                          <input value={replyText} onChange={e => setReplyText(e.target.value)}
                            placeholder="Responder (gratuito na janela de 24h)..."
                            onKeyDown={e => e.key === 'Enter' && sendReply()} />
                          <button className="btn-wa" onClick={sendReply}>Enviar</button>
                        </div>
                        {waMsg && <div className="ok">{waMsg}</div>}
                        {waErr && <div className="err">{waErr}</div>}
                      </>
                    ) : (
                      <div className="empty">Selecione uma conversa</div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'settings' && (
            <>
              <div className="card">
                <h3>Status WhatsApp Business</h3>
                {waConfig?.connected ? (
                  <>
                    <span className="status-pill on">● Conectado</span>
                    <p style={{ marginTop: 12 }}>
                      Numero: <strong>{waConfig.displayPhone || '—'}</strong><br />
                      Phone Number ID: <code>{waConfig.phoneNumberId}</code><br />
                      WABA: <code>{waConfig.wabaId || '—'}</code><br />
                      Empresa: {waConfig.businessName || 'Paraty Solar'}<br />
                      Desde: {waConfig.connectedAt ? String(waConfig.connectedAt).slice(0, 19).replace('T', ' ') : '—'}
                    </p>
                    <button className="btn-danger" onClick={disconnectWa}>Desconectar</button>
                  </>
                ) : (
                  <span className="status-pill off">● Desconectado</span>
                )}
              </div>

              <div className="card">
                <h3>Conectar Meta / WhatsApp (parceiro)</h3>
                <p>Volume inicial baixo → recursos <strong>gratuitos</strong> da Cloud API:</p>
                <ul>
                  <li>Receber mensagens (sempre gratis)</li>
                  <li>Responder na janela de 24h (service messages)</li>
                  <li>Webhook em tempo real</li>
                </ul>
                <p style={{ marginTop: 12 }}>A tela "Conecte sua conta facilmente a <strong>paraty solar</strong>" e o Embedded Signup da Meta. Passos:</p>
                <ol style={{ margin: '12px 0 12px 18px', color: 'var(--muted)', fontSize: '0.9rem' }}>
                  <li>Crie um App Business em developers.facebook.com</li>
                  <li>Adicione produto WhatsApp → Cloud API</li>
                  <li>Gere token permanente (System User) ou de teste</li>
                  <li>Copie Phone Number ID e WABA ID</li>
                  <li>Cole abaixo e salve</li>
                  <li>Configure o Webhook na Meta</li>
                </ol>
                <button className="btn-wa" onClick={openMetaOAuth} style={{ marginBottom: 16 }}>
                  Abrir login Meta (OAuth) — estilo da tela mostrada
                </button>
                <label>Access Token</label>
                <input type="password" value={formToken} onChange={e => setFormToken(e.target.value)} placeholder="EAAG..." />
                <label>Phone Number ID</label>
                <input value={formPhoneId} onChange={e => setFormPhoneId(e.target.value)} placeholder="123456789012345" />
                <label>WABA ID</label>
                <input value={formWabaId} onChange={e => setFormWabaId(e.target.value)} placeholder="Opcional" />
                <label>Numero de exibicao</label>
                <input value={formDisplay} onChange={e => setFormDisplay(e.target.value)} placeholder="+55..." />
                <label>Nome da empresa</label>
                <input value={formBusiness} onChange={e => setFormBusiness(e.target.value)} />
                <button className="btn-primary" onClick={saveManualConfig}>Salvar conexao</button>
                {waMsg && <div className="ok">{waMsg}</div>}
                {waErr && <div className="err">{waErr}</div>}
              </div>

              <div className="card">
                <h3>Webhook</h3>
                <p>Meta → WhatsApp → Configuration → Webhook:</p>
                <p style={{ margin: '10px 0' }}><code style={{ background: 'var(--soft)', padding: '8px 12px', borderRadius: 8, display: 'block', wordBreak: 'break-all' }}>{webhookUrl}</code></p>
                <p>Verify Token: <code>paraty_solar_verify_2026</code></p>
                <p style={{ marginTop: 8 }}>Assine o campo <strong>messages</strong>.</p>
              </div>

              <div className="card">
                <h3>Banco de dados</h3>
                <p>
                  <strong>Vercel Blob</strong> (ja criado).<br />
                  Leads → leads/&#123;mode&#125;/&#123;id&#125;.json<br />
                  Config WA → config/whatsapp.json<br />
                  Mensagens → whatsapp/messages/&#123;phone&#125;/<br />
                  Ideal para volume inicial. Postgres quando crescer.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {detail && (
        <div className="detail" onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="detail-card">
            <button className="btn-link" style={{ float: 'right', fontSize: '1.3rem' }} onClick={() => setDetail(null)}>×</button>
            <h3>Detalhe do lead</h3>
            <pre>{JSON.stringify(detail, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
