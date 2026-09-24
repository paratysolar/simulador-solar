'use client';

import { useState, useEffect } from 'react';

const STYLES = `
  :root { --g:#00B26B; --gd:#009558; --t:#1a2e28; --m:#5a6b66; --b:#e2e8e5; --bg:#f4f7f5; }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--t)}
  .wrap{max-width:960px;margin:0 auto;padding:24px 16px 60px}
  .logo{font-weight:800;color:var(--g);font-size:1.25rem;margin-bottom:8px}
  h1{font-size:1.5rem;margin-bottom:6px}
  .sub{color:var(--m);font-size:.9rem;margin-bottom:24px}
  .card{background:#fff;border:1px solid var(--b);border-radius:12px;padding:20px;margin-bottom:16px}
  label{display:block;font-size:.8rem;color:var(--m);margin-bottom:4px;font-weight:500}
  input,select,textarea{width:100%;padding:10px 12px;border:1.5px solid var(--b);border-radius:8px;font:inherit;margin-bottom:12px}
  input:focus,select:focus{outline:none;border-color:var(--g)}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .modes{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
  .mode{padding:10px 18px;border:1.5px solid var(--b);border-radius:999px;background:#fff;cursor:pointer;font-weight:600;font-size:.9rem}
  .mode.on{background:var(--g);color:#fff;border-color:var(--g)}
  .btn{background:var(--g);color:#fff;border:0;border-radius:999px;padding:12px 28px;font-weight:700;font-size:1rem;cursor:pointer}
  .btn:hover{background:var(--gd)}
  .btn:disabled{background:#9ca3af;cursor:not-allowed}
  .btn-out{background:#fff;color:var(--g);border:1.5px solid var(--g);border-radius:999px;padding:8px 16px;font-weight:600;cursor:pointer}
  table{width:100%;border-collapse:collapse;font-size:.9rem}
  th,td{text-align:left;padding:8px;border-bottom:1px solid var(--b)}
  th{color:var(--m);font-weight:600}
  .tot{font-size:1.3rem;font-weight:800;color:var(--g);margin-top:12px}
  .err{color:#e53e3e;font-size:.9rem;margin:8px 0}
  .ok{color:var(--g);font-size:.9rem}
  .login{max-width:360px;margin:80px auto;text-align:center}
  .list{font-size:.85rem}
  .list li{padding:8px 0;border-bottom:1px solid var(--b);display:flex;justify-content:space-between;gap:8px}
  @media(max-width:600px){.row{grid-template-columns:1fr}}
`;

export default function PropPage() {
  const [auth, setAuth] = useState('');
  const [pwd, setPwd] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [mode, setMode] = useState('ongrid');
  const [form, setForm] = useState({
    cliente_nome: '', cliente_telefone: '', cliente_email: '',
    endereco: '', cidade: '', uf: 'SP', gasto_rs: '', wh_dia: '',
  });
  const [result, setResult] = useState(null);
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const s = sessionStorage.getItem('prop_auth');
    if (s) setAuth(s);
  }, []);

  async function login(e) {
    e.preventDefault();
    setLoginErr('');
    try {
      const res = await fetch('/api/prop/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginErr(data.error || 'Falha no login');
        return;
      }
      sessionStorage.setItem('prop_auth', pwd);
      setAuth(pwd);
    } catch {
      setLoginErr('Erro de conexão');
    }
  }

  async function loadList() {
    try {
      const res = await fetch('/api/prop', { headers: { 'x-prop-auth': auth } });
      const data = await res.json();
      if (res.ok) setList(data.proposals || []);
    } catch {}
  }

  useEffect(() => {
    if (auth) loadList();
  }, [auth]);

  async function gerar(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setResult(null);
    try {
      const res = await fetch('/api/prop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-prop-auth': auth },
        body: JSON.stringify({
          mode,
          ...form,
          gasto_rs: form.gasto_rs ? Number(form.gasto_rs) : 0,
          wh_dia: form.wh_dia ? Number(form.wh_dia) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || data.hint || 'Erro ao gerar');
        return;
      }
      setResult(data.proposal);
      loadList();
    } catch (ex) {
      setErr(String(ex.message || ex));
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    sessionStorage.removeItem('prop_auth');
    setAuth('');
  }

  function fmt(n) {
    return 'R$ ' + Math.round(n || 0).toLocaleString('pt-BR');
  }

  if (!auth) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="login card">
          <div className="logo">Paraty Solar</div>
          <h1>Propostas</h1>
          <p className="sub">Acesso restrito — senha do módulo /prop</p>
          <form onSubmit={login}>
            <input
              type="password"
              placeholder="Senha"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoComplete="current-password"
            />
            {loginErr && <p className="err">{loginErr}</p>}
            <button className="btn" type="submit" style={{ width: '100%' }}>Entrar</button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="logo">Paraty Solar</div>
            <h1>Gerador de Propostas</h1>
            <p className="sub">On-Grid · Off-Grid · Híbrido — geração rápida</p>
          </div>
          <button className="btn-out" onClick={logout}>Sair</button>
        </div>

        <div className="card">
          <div className="modes">
            {['ongrid', 'offgrid', 'hibrido'].map((m) => (
              <button
                key={m}
                type="button"
                className={'mode' + (mode === m ? ' on' : '')}
                onClick={() => setMode(m)}
              >
                {m === 'ongrid' ? 'On-Grid' : m === 'offgrid' ? 'Off-Grid' : 'Híbrido'}
              </button>
            ))}
          </div>

          <form onSubmit={gerar}>
            <div className="row">
              <div>
                <label>Nome do cliente</label>
                <input required value={form.cliente_nome} onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })} />
              </div>
              <div>
                <label>Celular</label>
                <input required value={form.cliente_telefone} onChange={(e) => setForm({ ...form, cliente_telefone: e.target.value })} />
              </div>
            </div>
            <div className="row">
              <div>
                <label>E-mail</label>
                <input type="email" value={form.cliente_email} onChange={(e) => setForm({ ...form, cliente_email: e.target.value })} />
              </div>
              <div>
                <label>UF</label>
                <input maxLength={2} value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })} />
              </div>
            </div>
            <label>Endereço</label>
            <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            <div className="row">
              <div>
                <label>Cidade</label>
                <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
              </div>
              {mode === 'offgrid' ? (
                <div>
                  <label>Consumo diário (Wh/dia)</label>
                  <input type="number" min="50" value={form.wh_dia} onChange={(e) => setForm({ ...form, wh_dia: e.target.value })} required />
                </div>
              ) : (
                <div>
                  <label>Gasto médio mensal (R$)</label>
                  <input type="number" min="50" value={form.gasto_rs} onChange={(e) => setForm({ ...form, gasto_rs: e.target.value })} required />
                </div>
              )}
            </div>
            {err && <p className="err">{err}</p>}
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Gerando…' : 'Gerar proposta ›'}
            </button>
          </form>
        </div>

        {result && (
          <div className="card">
            <h2 style={{ marginBottom: 12 }}>Proposta {result.id}</h2>
            <p style={{ color: 'var(--m)', marginBottom: 12 }}>
              {result.mode?.toUpperCase()} · {result.kwp} kWp · {result.modulos} módulos · {result.area_m2} m²
              {result.baterias ? ` · Bateria ${result.baterias.kwh} kWh` : ''}
            </p>
            <table>
              <thead>
                <tr><th>Item</th><th>Qtd</th><th>Unit.</th><th>Total</th></tr>
              </thead>
              <tbody>
                {(result.itens || []).map((it, i) => (
                  <tr key={i}>
                    <td>{it.item}</td>
                    <td>{it.qtd}</td>
                    <td>{fmt(it.unit)}</td>
                    <td>{fmt(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="tot">Total: {fmt(result.total)}</div>
            <p style={{ marginTop: 8, color: 'var(--m)' }}>
              Economia anual ~ {fmt(result.economia_ano)} · Payback ~ {result.payback_anos} anos · Geração ~ {result.geracao_mes} kWh/mês
            </p>
          </div>
        )}

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Últimas propostas</h3>
          {!list.length && <p className="sub">Nenhuma proposta ainda (ou banco não configurado).</p>}
          <ul className="list">
            {list.map((p) => (
              <li key={p.id}>
                <span>
                  <strong>{p.cliente_nome || p.id}</strong> · {p.mode} · {p.kwp} kWp
                </span>
                <span>{fmt(p.total || p.investimento)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
