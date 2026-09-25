'use client';

import { useState, useEffect, useRef } from 'react';

const STYLES = `
  :root {
    --g: #00B26B;
    --gd: #009558;
    --gl: #e6f7ef;
    --t: #1a2e28;
    --m: #5a6b66;
    --b: #e2e8e5;
    --bg: #f0f4f2;
    --gold: #c9a227;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--t); }
  .wrap { max-width: 980px; margin: 0 auto; padding: 20px 16px 80px; }
  .logo { font-weight: 800; color: var(--g); font-size: 1.3rem; letter-spacing: -0.02em; }
  h1 { font-size: 1.55rem; margin-bottom: 4px; }
  .sub { color: var(--m); font-size: .88rem; margin-bottom: 20px; }
  .card {
    background: #fff; border: 1px solid var(--b); border-radius: 14px;
    padding: 22px; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,.04);
  }
  label { display: block; font-size: .78rem; color: var(--m); margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: .03em; }
  input, select, textarea {
    width: 100%; padding: 11px 14px; border: 1.5px solid var(--b); border-radius: 10px;
    font: inherit; margin-bottom: 12px; transition: border .15s;
  }
  input:focus, select:focus { outline: none; border-color: var(--g); box-shadow: 0 0 0 3px rgba(0,178,107,.15); }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .modes { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
  .mode {
    padding: 10px 20px; border: 1.5px solid var(--b); border-radius: 999px;
    background: #fff; cursor: pointer; font-weight: 700; font-size: .88rem; transition: all .15s;
  }
  .mode:hover { border-color: var(--g); }
  .mode.on { background: var(--g); color: #fff; border-color: var(--g); }
  .btn {
    background: linear-gradient(135deg, var(--g), var(--gd)); color: #fff; border: 0;
    border-radius: 999px; padding: 13px 32px; font-weight: 700; font-size: 1rem;
    cursor: pointer; box-shadow: 0 4px 14px rgba(0,178,107,.35); transition: transform .1s, box-shadow .15s;
  }
  .btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,178,107,.4); }
  .btn:disabled { background: #9ca3af; cursor: not-allowed; box-shadow: none; transform: none; }
  .btn-out {
    background: #fff; color: var(--g); border: 1.5px solid var(--g); border-radius: 999px;
    padding: 8px 18px; font-weight: 600; cursor: pointer; font-size: .88rem;
  }
  .btn-out:hover { background: var(--gl); }
  .btn-print {
    background: var(--t); color: #fff; border: 0; border-radius: 999px;
    padding: 10px 22px; font-weight: 700; cursor: pointer; font-size: .9rem;
  }
  table { width: 100%; border-collapse: collapse; font-size: .88rem; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--b); }
  th { color: var(--m); font-weight: 600; font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; }
  td.num, th.num { text-align: right; }
  .tot { font-size: 1.45rem; font-weight: 800; color: var(--g); margin-top: 14px; }
  .err { color: #e53e3e; font-size: .9rem; margin: 8px 0; }
  .login { max-width: 380px; margin: 100px auto; text-align: center; }
  .list { font-size: .85rem; }
  .list li { padding: 10px 0; border-bottom: 1px solid var(--b); display: flex; justify-content: space-between; gap: 8px; align-items: center; }
  .list li:hover { background: var(--gl); margin: 0 -8px; padding-left: 8px; padding-right: 8px; border-radius: 8px; cursor: pointer; }
  .prop {
    background: #fff; border-radius: 16px; overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,.08); margin-bottom: 24px;
  }
  .prop-hero {
    background: linear-gradient(135deg, #00B26B 0%, #007a4d 55%, #004d32 100%);
    color: #fff; padding: 36px 32px 28px; position: relative; overflow: hidden;
  }
  .prop-hero::before {
    content: ''; position: absolute; right: -40px; top: -40px;
    width: 220px; height: 220px; border-radius: 50%;
    background: rgba(255,255,255,.08);
  }
  .prop-hero::after {
    content: ''; position: absolute; right: 60px; bottom: -60px;
    width: 160px; height: 160px; border-radius: 50%;
    background: rgba(255,255,255,.06);
  }
  .prop-hero .brand { font-size: .85rem; font-weight: 600; opacity: .9; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 6px; }
  .prop-hero h2 { font-size: 1.7rem; font-weight: 800; margin-bottom: 4px; position: relative; }
  .prop-hero .meta { font-size: .9rem; opacity: .85; position: relative; }
  .prop-hero .badge {
    display: inline-block; background: rgba(255,255,255,.2); backdrop-filter: blur(4px);
    padding: 4px 12px; border-radius: 999px; font-size: .75rem; font-weight: 700;
    margin-top: 12px; letter-spacing: .04em;
  }
  .prop-body { padding: 28px 32px 36px; }
  .kpi-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px;
  }
  .kpi {
    background: var(--gl); border-radius: 12px; padding: 16px 14px; text-align: center;
  }
  .kpi .v { font-size: 1.35rem; font-weight: 800; color: var(--g); line-height: 1.2; }
  .kpi .l { font-size: .72rem; color: var(--m); font-weight: 600; text-transform: uppercase; letter-spacing: .03em; margin-top: 4px; }
  .section-title {
    font-size: 1.05rem; font-weight: 800; color: var(--t); margin: 28px 0 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-title::before {
    content: ''; width: 4px; height: 18px; background: var(--g); border-radius: 2px;
  }
  .chart-wrap {
    background: #fafcfb; border: 1px solid var(--b); border-radius: 12px;
    padding: 20px 16px 12px; margin-bottom: 8px;
  }
  .chart-legend {
    display: flex; gap: 20px; justify-content: center; margin-top: 8px; font-size: .8rem; color: var(--m);
  }
  .chart-legend span { display: flex; align-items: center; gap: 6px; }
  .dot { width: 10px; height: 10px; border-radius: 3px; }
  .dot.g { background: var(--g); }
  .dot.c { background: #94a3b8; }
  .fin-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 8px;
  }
  .fin-card {
    border: 1.5px solid var(--b); border-radius: 12px; padding: 18px; text-align: center;
    transition: border .15s;
  }
  .fin-card:hover { border-color: var(--g); }
  .fin-card .label { font-size: .78rem; color: var(--m); font-weight: 600; text-transform: uppercase; }
  .fin-card .val { font-size: 1.5rem; font-weight: 800; color: var(--g); margin: 6px 0 2px; }
  .fin-card .hint { font-size: .78rem; color: var(--m); }
  .notes-box {
    background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px;
    padding: 16px 18px; font-size: .85rem; color: #78350f; line-height: 1.55;
  }
  .notes-box strong { color: #92400e; }
  .notes-box ul { margin: 8px 0 0 18px; }
  .notes-box li { margin-bottom: 4px; }
  .tech-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: .88rem;
  }
  .tech-item {
    background: #f8faf9; border-radius: 10px; padding: 12px 14px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .tech-item .k { color: var(--m); }
  .tech-item .v { font-weight: 700; }
  .payback-table th { background: var(--gl); }
  .footer-prop {
    margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--b);
    font-size: .8rem; color: var(--m); text-align: center; line-height: 1.5;
  }
  .print-bar {
    display: flex; gap: 10px; justify-content: flex-end; margin-bottom: 12px; flex-wrap: wrap;
  }
  @media (max-width: 700px) {
    .kpi-grid { grid-template-columns: 1fr 1fr; }
    .fin-grid, .tech-grid, .row { grid-template-columns: 1fr; }
    .prop-body { padding: 20px 16px 28px; }
    .prop-hero { padding: 28px 20px 22px; }
  }
  @media print {
    body { background: #fff; }
    .no-print { display: none !important; }
    .prop { box-shadow: none; border: none; }
    .wrap { max-width: 100%; padding: 0; }
  }
`;

function ChartGenConsumo({ meses, geracao, consumo }) {
  if (!meses?.length || !geracao?.length) return null;
  const max = Math.max(...geracao, ...consumo, 1);
  const W = 640;
  const H = 220;
  const padL = 42;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = meses.length;
  const barW = chartW / n;
  const gap = barW * 0.18;
  const bw = (barW - gap * 2) / 2;

  const yTicks = 4;
  const ticks = [];
  for (let i = 0; i <= yTicks; i++) {
    const v = Math.round((max / yTicks) * i);
    const y = padT + chartH - (v / max) * chartH;
    ticks.push({ v, y });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={t.y} x2={W - padR} y2={t.y} stroke="#e2e8e5" strokeWidth="1" />
          <text x={padL - 6} y={t.y + 3} textAnchor="end" fontSize="10" fill="#5a6b66">{t.v}</text>
        </g>
      ))}
      {meses.map((m, i) => {
        const x0 = padL + i * barW + gap;
        const hG = (geracao[i] / max) * chartH;
        const hC = (consumo[i] / max) * chartH;
        return (
          <g key={m}>
            <rect x={x0} y={padT + chartH - hG} width={bw} height={hG} rx="3" fill="#00B26B" />
            <rect x={x0 + bw + 2} y={padT + chartH - hC} width={bw} height={hC} rx="3" fill="#94a3b8" />
            <text x={x0 + bw} y={H - 10} textAnchor="middle" fontSize="11" fill="#5a6b66" fontWeight="600">{m}</text>
          </g>
        );
      })}
      <text x={8} y={14} fontSize="10" fill="#5a6b66" fontWeight="600">kWh</text>
    </svg>
  );
}

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
  const propRef = useRef(null);

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
      setTimeout(() => propRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
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

  function printProp() {
    window.print();
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
            <input type="password" placeholder="Senha" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="current-password" />
            {loginErr && <p className="err">{loginErr}</p>}
            <button className="btn" type="submit" style={{ width: '100%' }}>Entrar</button>
          </form>
        </div>
      </>
    );
  }

  const r = result;

  return (
    <>
      <style>{STYLES}</style>
      <div className="wrap">
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div className="logo">Paraty Solar</div>
            <h1>Gerador de Propostas</h1>
            <p className="sub">On-Grid · Off-Grid · Híbrido — preços reais Intelbras</p>
          </div>
          <button className="btn-out" onClick={logout}>Sair</button>
        </div>

        <div className="card no-print">
          <div className="modes">
            {['ongrid', 'offgrid', 'hibrido'].map((m) => (
              <button key={m} type="button" className={'mode' + (mode === m ? ' on' : '')} onClick={() => setMode(m)}>
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
            <button className="btn" type="submit" disabled={busy}>{busy ? 'Gerando…' : 'Gerar proposta ›'}</button>
          </form>
        </div>

        {r && (
          <div ref={propRef}>
            <div className="print-bar no-print">
              <button className="btn-print" onClick={printProp}>🖨 Imprimir / PDF</button>
            </div>
            <div className="prop">
              <div className="prop-hero">
                <div className="brand">Paraty Solar · Grupo Intelbras</div>
                <h2>Proposta Comercial {r.num_proposta || r.id}</h2>
                <div className="meta">
                  {r.cliente_nome && <strong>{r.cliente_nome}</strong>}
                  {r.cidade && ` · ${r.cidade}/${r.uf || ''}`}
                  {r.endereco && ` · ${r.endereco}`}
                </div>
                <div className="meta" style={{ marginTop: 4 }}>
                  Validade: {r.validade || '15 dias'} · {r.mode === 'ongrid' ? 'On-Grid' : r.mode === 'offgrid' ? 'Off-Grid' : 'Híbrido'}
                  {r.grid_zero ? ' · Grid-Zero elegível' : ''}
                </div>
                <span className="badge">
                  {r.kwp} kWp · {r.modulos} módulos · {r.area_m2} m²
                  {r.baterias ? ` · ${r.baterias.kwh} kWh bateria` : ''}
                </span>
              </div>
              <div className="prop-body">
                <div className="kpi-grid">
                  <div className="kpi"><div className="v">{fmt(r.total || r.investimento)}</div><div className="l">Investimento</div></div>
                  <div className="kpi"><div className="v">{fmt(r.economia_ano)}</div><div className="l">Economia / ano</div></div>
                  <div className="kpi"><div className="v">{r.payback_anos} anos</div><div className="l">Payback</div></div>
                  <div className="kpi"><div className="v">{(r.geracao_mes || 0).toLocaleString('pt-BR')}</div><div className="l">kWh / mês</div></div>
                </div>
                <div className="section-title">Geração estimada × Consumo</div>
                <div className="chart-wrap">
                  <ChartGenConsumo meses={r.meses} geracao={r.geracaoMensal} consumo={r.consumoMensal} />
                  <div className="chart-legend">
                    <span><span className="dot g" /> Geração solar</span>
                    <span><span className="dot c" /> Consumo informado</span>
                  </div>
                </div>
                <p style={{ fontSize: '.8rem', color: 'var(--m)', marginBottom: 8 }}>
                  HSP {r.hsp} kWh/m²/dia ({r.uf}) · Geração anual ~ {(r.geracao_anual || r.geracao_mes * 12 || 0).toLocaleString('pt-BR')} kWh ·
                  Consumo ~ {Math.round(r.consumo_kwh || 0)} kWh/mês
                </p>
                <div className="section-title">Dimensionamento técnico</div>
                <div className="tech-grid">
                  <div className="tech-item"><span className="k">Potência</span><span className="v">{r.kwp} kWp</span></div>
                  <div className="tech-item"><span className="k">Módulos</span><span className="v">{r.modulos} × {r.modulo_w || 450}W</span></div>
                  <div className="tech-item"><span className="k">Área aproximada</span><span className="v">{r.area_m2} m²</span></div>
                  <div className="tech-item"><span className="k">Inversor</span><span className="v" style={{ fontSize: '.8rem', maxWidth: '55%', textAlign: 'right' }}>{r.inversor || '—'}</span></div>
                  {r.baterias && (<>
                    <div className="tech-item"><span className="k">Bateria</span><span className="v">{r.baterias.kwh} kWh</span></div>
                    <div className="tech-item"><span className="k">Tipo</span><span className="v">{r.baterias.tipo}</span></div>
                  </>)}
                  <div className="tech-item"><span className="k">Tarifa considerada</span><span className="v">R$ {(r.tarifa || 0.95).toFixed(2)}/kWh</span></div>
                  <div className="tech-item"><span className="k">Economia mensal</span><span className="v">{fmt(r.economia_mes)}</span></div>
                </div>
                <div className="section-title">Lista de materiais (BOM)</div>
                <table>
                  <thead><tr><th>Item</th><th>Marca</th><th className="num">Qtd</th><th className="num">Unit.</th><th className="num">Total</th></tr></thead>
                  <tbody>
                    {(r.itens || []).map((it, i) => (
                      <tr key={i}>
                        <td>{it.item}</td>
                        <td style={{ color: 'var(--m)', fontSize: '.82rem' }}>{it.marca || '—'}</td>
                        <td className="num">{it.qtd}</td>
                        <td className="num">{fmt(it.unit)}</td>
                        <td className="num" style={{ fontWeight: 600 }}>{fmt(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="tot">Total do investimento: {fmt(r.total || r.investimento)}</div>
                {r.subtotal_equip != null && r.servico > 0 && (
                  <p style={{ fontSize: '.82rem', color: 'var(--m)', marginTop: 4 }}>Equipamentos {fmt(r.subtotal_equip)} + Instalação {fmt(r.servico)}</p>
                )}
                <div className="section-title">Opções de pagamento</div>
                <div className="fin-grid">
                  <div className="fin-card">
                    <div className="label">6× no cartão</div>
                    <div className="val">{fmt(r.financiamento?.parcela_6x_sem_juros || (r.total || 0) / 6)}</div>
                    <div className="hint">sem juros · cartão de crédito</div>
                  </div>
                  <div className="fin-card">
                    <div className="label">21× no cartão</div>
                    <div className="val">{fmt(r.financiamento?.parcela_21x || (r.total || 0) * 0.065)}</div>
                    <div className="hint">parcelamento estendido</div>
                  </div>
                </div>
                <p style={{ fontSize: '.8rem', color: 'var(--m)', marginTop: 6 }}>Condições ilustrativas. Confirme com a equipe comercial as taxas vigentes e bancos parceiros.</p>
                {r.paybackTable?.length > 0 && (<>
                  <div className="section-title">Retorno acumulado (cenário 25 anos)</div>
                  <table className="payback-table">
                    <thead><tr><th>Ano</th><th className="num">Geração (kWh)</th><th className="num">Economia acum.</th><th className="num">Retorno líquido</th></tr></thead>
                    <tbody>
                      {r.paybackTable.map((row) => (
                        <tr key={row.ano}>
                          <td>{row.ano}</td>
                          <td className="num">{row.geracao?.toLocaleString('pt-BR')}</td>
                          <td className="num">{fmt(row.economia_acum)}</td>
                          <td className="num" style={{ color: row.retorno >= 0 ? 'var(--g)' : '#e53e3e', fontWeight: 700 }}>{fmt(row.retorno)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ fontSize: '.78rem', color: 'var(--m)', marginTop: 6 }}>Considera degradação ~0,5%/ano e reajuste de tarifa +6%/ano. Valores estimados.</p>
                </>)}
                <div className="section-title">Notas importantes</div>
                <div className="notes-box">
                  <strong>Aspectos técnicos e regulatórios</strong>
                  <ul>
                    <li>{r.notes?.lei || 'Dimensionamento alinhado à Lei 14.300/22 e REN ANEEL.'}</li>
                    {r.grid_zero && (<li>Sistema até 7,5 kWp — elegível a <strong>grid-zero / fast-track</strong> em diversas distribuidoras (troca de medidor simplificada).</li>)}
                    <li>{r.notes?.garantia_modulos || 'Garantia módulos: 15 anos produto / 30 anos performance.'}</li>
                    <li>{r.notes?.garantia_inversor || 'Garantia inversor: 5–10 anos conforme modelo.'}</li>
                  </ul>
                  <strong style={{ display: 'block', marginTop: 12 }}>Comercial</strong>
                  <ul>
                    <li>Após a conexão, a economia começa a aparecer na fatura da distribuidora (créditos de energia). Em alguns casos há <strong>período de graça</strong> até a homologação.</li>
                    <li>Imóvel com sistema solar tende a valorizar — argumento forte para quem pensa em revenda ou aluguel.</li>
                    <li>Troca de medidor e comunicação com a distribuidora são acompanhadas pela nossa equipe técnica.</li>
                  </ul>
                </div>
                <div className="footer-prop">
                  Paraty Solar · Equipamentos Grupo Intelbras · Proposta gerada automaticamente<br />
                  Esta é uma estimativa técnica e comercial. Valores e disponibilidade sujeitos a confirmação.<br />
                  Dúvidas? Fale com seu consultor · {r.cliente_telefone || ''}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card no-print">
          <h3 style={{ marginBottom: 12 }}>Últimas propostas</h3>
          {!list.length && <p className="sub">Nenhuma proposta ainda (ou banco não configurado).</p>}
          <ul className="list">
            {list.map((p) => (
              <li key={p.id} onClick={() => {
                const payload = typeof p.payload === 'string' ? JSON.parse(p.payload || '{}') : (p.payload || {});
                const itens = typeof p.itens === 'string' ? JSON.parse(p.itens || '[]') : (p.itens || []);
                const baterias = typeof p.baterias === 'string' ? JSON.parse(p.baterias || 'null') : p.baterias;
                setResult({ ...p, ...payload, itens, baterias });
                setTimeout(() => propRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
              }}>
                <span><strong>{p.cliente_nome || p.id}</strong> · {p.mode} · {p.kwp} kWp</span>
                <span>{fmt(p.total || p.investimento)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
