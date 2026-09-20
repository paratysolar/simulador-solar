'use client';

import { useEffect, useState, useMemo } from 'react';

const STYLES = `
  :root { --bg:#0a0a0a; --card:#111; --soft:#161616; --text:#f5f5f5; --muted:#a0a0a0; --accent:#06cb3f; --border:#2a2a2a; --danger:#ff4d4f; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body, .crm-root { font-family: Inter, system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 24px 16px 60px; }
  header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
  h1 { font-size: 1.4rem; font-weight: 600; }
  h1 span { color: var(--accent); }
  a.back { color: var(--muted); text-decoration: none; font-size: 0.9rem; }
  a.back:hover { color: var(--accent); }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .stat { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; text-align: center; }
  .stat .n { font-size: 1.6rem; font-weight: 700; color: var(--accent); }
  .stat .l { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
  .filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
  .filters select, .filters input, .filters button {
    background: var(--soft); border: 1px solid var(--border); color: var(--text);
    border-radius: 10px; padding: 10px 14px; font-family: inherit; font-size: 0.9rem;
  }
  .filters button { background: var(--accent); color: #0a0a0a; font-weight: 600; cursor: pointer; border: none; }
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
  .detail { position: fixed; inset: 0; background: rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px; }
  .detail-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; max-width: 560px; width: 100%; max-height: 80vh; overflow: auto; padding: 24px; }
  .detail-card pre { background: var(--soft); padding: 14px; border-radius: 10px; font-size: 0.78rem; overflow: auto; white-space: pre-wrap; word-break: break-word; margin-top: 12px; }
  .btn-link { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 0.85rem; font-family: inherit; }
  .btn-out { background: transparent; border: 1px solid var(--border); color: var(--muted); border-radius: 10px; padding: 8px 14px; cursor: pointer; font-family: inherit; }
`;

export default function CrmPage() {
  const [auth, setAuth] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [leads, setLeads] = useState([]);
  const [mode, setMode] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const s = sessionStorage.getItem('crm_auth_v1');
    if (s) setAuth(s);
  }, []);

  useEffect(() => {
    if (auth) load();
  }, [auth, mode]);

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
  }

  async function load() {
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

  return (
    <div className="crm-root">
      <style>{STYLES}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {!auth ? (
        <div className="login-box">
          <h2>CRM Leads</h2>
          <p>Acesso restrito ao painel de leads.</p>
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Senha do CRM"
            onKeyDown={e => e.key === 'Enter' && login()} />
          <button onClick={login}>Entrar</button>
          {err && <div className="err">{err}</div>}
        </div>
      ) : (
        <div className="wrap">
          <header>
            <div>
              <h1>CRM <span>Leads</span></h1>
              <a className="back" href="/index.html">← Voltar ao simulador</a>
            </div>
            <button className="btn-out" onClick={logout}>Sair</button>
          </header>
          <div className="stats">
            <div className="stat"><div className="n">{leads.length}</div><div className="l">Total</div></div>
            <div className="stat"><div className="n">{stats.ongrid}</div><div className="l">On-Grid</div></div>
            <div className="stat"><div className="n">{stats.offgrid}</div><div className="l">Off-Grid</div></div>
            <div className="stat"><div className="n">{stats.hibrido}</div><div className="l">Híbrido</div></div>
            <div className="stat"><div className="n">{stats.roi}</div><div className="l">ROI</div></div>
          </div>
          <div className="filters">
            <select value={mode} onChange={e => setMode(e.target.value)}>
              <option value="">Todos</option>
              <option value="ongrid">On-Grid</option>
              <option value="offgrid">Off-Grid</option>
              <option value="hibrido">Híbrido</option>
              <option value="roi">ROI</option>
            </select>
            <input type="search" placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} />
            <button onClick={load}>Atualizar</button>
          </div>
          {loading ? <div className="empty">Carregando...</div> : !filtered.length ? (
            <div className="empty">Nenhum lead encontrado. Use o simulador e clique em Salvar lead.</div>
          ) : (
            <table>
              <thead>
                <tr><th>Data</th><th>Modo</th><th>Contato</th><th>Cidade</th><th>Resumo</th><th></th></tr>
              </thead>
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
