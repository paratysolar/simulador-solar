'use client';

import { useState, useEffect } from 'react';
import { STYLES } from './prop-styles';

/* Fotos reais Paraty Solar */
const PHOTOS = {
  cover1: '/prop-photos/20250211_161337.jpg',
  cover2: '/prop-photos/WhatsApp_Image_2026-09-06_at_153548.jpg',
  cover3: '/prop-photos/20240827_142325.jpg',
  portfolio: [
    { src: '/prop-photos/20240222_095716.jpg', seg: 'Residencial', cid: 'Paraty - RJ', mod: '12', gen: '480', econ: 'R$ 420' },
    { src: '/prop-photos/20240224_110459.jpg', seg: 'Comercial', cid: 'Paraty - RJ', mod: '48', gen: '1.920', econ: 'R$ 1.680' },
    { src: '/prop-photos/20240224_110913.jpg', seg: 'Residencial', cid: 'Paraty - RJ', mod: '24', gen: '960', econ: 'R$ 840' },
    { src: '/prop-photos/20240505_155359.jpg', seg: 'Instalação', cid: 'Equipe Paraty', mod: '—', gen: '—', econ: 'Comissionamento' },
    { src: '/prop-photos/20240615_102913.jpg', seg: 'Residencial', cid: 'Região - RJ', mod: '16', gen: '640', econ: 'R$ 560' },
    { src: '/prop-photos/20240827_142325.jpg', seg: 'Residencial', cid: 'Paraty - RJ', mod: '20', gen: '800', econ: 'R$ 700' },
    { src: '/prop-photos/20250211_161402.jpg', seg: 'Residencial', cid: 'Costa Verde - RJ', mod: '36', gen: '1.440', econ: 'R$ 1.260' },
    { src: '/prop-photos/20250211_161418.jpg', seg: 'Residencial', cid: 'Costa Verde - RJ', mod: '36', gen: '1.440', econ: 'R$ 1.260' },
    { src: '/prop-photos/WhatsApp_Image_2026-09-06_at_153554.jpg', seg: 'Residencial', cid: 'Paraty - RJ', mod: '10', gen: '400', econ: 'R$ 350' },
  ],
  team: [
    '/prop-photos/WhatsApp_Image_2026-09-06_at_153554_1.jpg',
    '/prop-photos/WhatsApp_Image_2026-09-06_at_153555_1.jpg',
    '/prop-photos/20240505_155404.jpg',
  ],
};

function fmt(n) {
  return 'R$ ' + Math.round(n || 0).toLocaleString('pt-BR');
}

function ChartGeracao({ meses, geracao, consumo }) {
  if (!geracao?.length) return null;
  const max = Math.max(...geracao, ...(consumo || []), 1);
  return (
    <div className="chart-wrap">
      <h4>Geração estimada × Consumo informado (kWh/mês)</h4>
      <div className="gen-chart">
        {meses.map((m, i) => (
          <div key={m} className="gen-col">
            <div className="gen-bar g" style={{ height: `${(geracao[i] / max) * 140}px` }} title={`Geração: ${geracao[i]}`} />
            <div className="gen-bar c" style={{ height: `${((consumo?.[i] || 0) / max) * 140}px` }} title={`Consumo: ${consumo?.[i] || 0}`} />
            <span className="gen-lbl">{m}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10, fontSize: '.78rem' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--g)', borderRadius: 2, marginRight: 4 }} /> Geração</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#94a3b8', borderRadius: 2, marginRight: 4 }} /> Consumo</span>
      </div>
    </div>
  );
}

function ChartRetorno({ total, economia_ano }) {
  const bars = [];
  let acum = -(total || 0);
  const anual = economia_ano || 0;
  for (let y = 1; y <= 15; y++) {
    acum += anual * Math.pow(1.06, y - 1) * Math.pow(0.995, y - 1);
    bars.push({ y, v: Math.round(acum) });
  }
  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.v)), 1);
  return (
    <div className="chart-wrap">
      <h4>Retorno de Investimento (15 anos)</h4>
      <div className="bar-chart">
        {bars.map((b) => (
          <div key={b.y} className="bar-col">
            <div className="bar" style={{ height: `${(Math.abs(b.v) / maxAbs) * 160}px`, background: b.v >= 0 ? '#5b9bd5' : '#e74c3c' }} title={`Ano ${b.y}: ${fmt(b.v)}`} />
            <span className="bar-lbl">{b.y}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PropPage() {
  const [auth, setAuth] = useState('');
  const [pwd, setPwd] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [mode, setMode] = useState('ongrid');
  const [form, setForm] = useState({
    cliente_nome: '', cliente_telefone: '', cliente_email: '',
    endereco: '', cidade: '', uf: 'RJ', gasto_rs: '', wh_dia: '', tarifa: '0.95',
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
      if (!res.ok) { setLoginErr(data.error || 'Falha no login'); return; }
      sessionStorage.setItem('prop_auth', pwd);
      setAuth(pwd);
    } catch { setLoginErr('Erro de conexão'); }
  }

  async function loadList() {
    try {
      const res = await fetch('/api/prop', { headers: { 'x-prop-auth': auth } });
      const data = await res.json();
      if (res.ok) setList(data.proposals || []);
    } catch {}
  }

  useEffect(() => { if (auth) loadList(); }, [auth]);

  async function gerar(e) {
    e.preventDefault();
    setBusy(true); setErr(''); setResult(null);
    try {
      const res = await fetch('/api/prop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-prop-auth': auth },
        body: JSON.stringify({
          mode, ...form,
          gasto_rs: form.gasto_rs ? Number(form.gasto_rs) : 0,
          wh_dia: form.wh_dia ? Number(form.wh_dia) : 0,
          tarifa: form.tarifa ? Number(form.tarifa) : 0.95,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || data.hint || 'Erro ao gerar'); return; }
      const p = data.proposal;
      const full = p.payload ? { ...p, ...(typeof p.payload === 'string' ? JSON.parse(p.payload) : p.payload) } : p;
      setResult({ ...full, cliente_nome: form.cliente_nome, cidade: form.cidade, uf: form.uf, cliente_telefone: form.cliente_telefone });
      loadList();
      setTimeout(() => document.getElementById('proposta')?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch (ex) { setErr(String(ex.message || ex)); }
    finally { setBusy(false); }
  }

  function logout() { sessionStorage.removeItem('prop_auth'); setAuth(''); }
  function openProposal(p) {
    const full = p.payload ? { ...p, ...(typeof p.payload === 'string' ? JSON.parse(p.payload) : p.payload) } : p;
    setResult(full);
    setTimeout(() => document.getElementById('proposta')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  if (!auth) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="login card">
          <div className="logo-txt">Paraty <span>Solar</span></div>
          <h1>Propostas</h1>
          <p className="sub">Acesso restrito — módulo comercial</p>
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
  const lucro15 = r ? Math.round((r.economia_ano || 0) * 15 * 1.4 - (r.total || 0)) : 0;
  const contaCom = r ? Math.max(0, Math.round((r.gasto_rs || 0) - (r.economia_mes || 0))) : 0;
  const parcela72 = r ? Math.round((r.total || 0) * 0.0285) : 0;
  const parcela60 = r ? Math.round((r.total || 0) * 0.0315) : 0;
  const parcela48 = r ? Math.round((r.total || 0) * 0.036) : 0;
  const parcela10 = r ? Math.round((r.total || 0) / 10) : 0;

  return (
    <>
      <style>{STYLES}</style>
      <div className="wrap">
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div className="logo-txt">Paraty <span>Solar</span></div>
            <h1>Gerador de Propostas</h1>
            <p className="sub">Modelo comercial · On-Grid · Off-Grid · Híbrido</p>
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
              <div><label>Nome do cliente</label><input required value={form.cliente_nome} onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })} /></div>
              <div><label>Celular / WhatsApp</label><input required value={form.cliente_telefone} onChange={(e) => setForm({ ...form, cliente_telefone: e.target.value })} /></div>
            </div>
            <div className="row">
              <div><label>E-mail</label><input type="email" value={form.cliente_email} onChange={(e) => setForm({ ...form, cliente_email: e.target.value })} /></div>
              <div><label>UF</label><input maxLength={2} value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })} /></div>
            </div>
            <label>Endereço</label>
            <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            <div className="row">
              <div><label>Cidade</label><input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></div>
              {mode === 'offgrid' ? (
                <div><label>Consumo diário (Wh/dia)</label><input type="number" min="50" value={form.wh_dia} onChange={(e) => setForm({ ...form, wh_dia: e.target.value })} required /></div>
              ) : (
                <div><label>Gasto médio mensal (R$)</label><input type="number" min="50" value={form.gasto_rs} onChange={(e) => setForm({ ...form, gasto_rs: e.target.value })} required /></div>
              )}
            </div>
            <div className="row">
              <div><label>Tarifa (R$/kWh)</label><input type="number" step="0.01" min="0.3" value={form.tarifa} onChange={(e) => setForm({ ...form, tarifa: e.target.value })} /></div>
            </div>
            {err && <p className="err">{err}</p>}
            <button className="btn" type="submit" disabled={busy}>{busy ? 'Gerando…' : 'Gerar proposta comercial ›'}</button>
          </form>
        </div>

        {r && (
          <div id="proposta" className="proposta">
            <div className="toolbar no-print">
              <button className="btn" onClick={() => window.print()}>🖨 Imprimir / Salvar PDF</button>
              <button className="btn-out" onClick={() => setResult(null)}>Nova proposta</button>
            </div>

            <div className="page">
              <div className="cover">
                <div>
                  <div style={{ fontSize: '.9rem', letterSpacing: '.2em', opacity: .8 }}>PARATY SOLAR</div>
                  <h1>PROPOSTA<br />COMERCIAL</h1>
                  <p className="tagline">Inovação e sustentabilidade<br />para o seu projeto</p>
                </div>
                <div className="cover-circles">
                  <img src={PHOTOS.cover1} alt="Projeto Paraty" />
                  <img src={PHOTOS.cover2} alt="Instalação" className="main" />
                  <img src={PHOTOS.cover3} alt="Sistema solar" />
                </div>
                <div className="cover-brand">
                  <div className="name">Paraty <span>Solar</span></div>
                  <div className="sub-b">Energia Solar</div>
                </div>
                <div className="cover-footer">
                  <div>
                    <div>📱 (12) 99705-4541</div>
                    <div>🌐 www.paratysolar.com.br</div>
                    <div>✉ contato@paratysolar.com.br</div>
                  </div>
                  <div>
                    <div><strong>Paraty – RJ</strong></div>
                    <div>Costa Verde & região</div>
                    <div>Atendimento presencial e online</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="page">
              <div className="page-inner">
                <div className="page-header">
                  <div className="brand">Paraty <span>Solar</span></div>
                  <div style={{ fontSize: '.8rem', color: 'var(--m)' }}>PROPOSTA COMERCIAL · {r.num_proposta || r.id}</div>
                </div>
                <div className="client-name">{r.cliente_nome || 'Cliente'},</div>
                <div className="client-loc">{[r.cidade, r.uf].filter(Boolean).join(' - ') || 'RJ'}</div>
                <p className="body">A fim de descrever o que será desenvolvido, apresentamos a proposta comercial, com as seguintes características a saber:</p>
                <h3 className="sec-title green">Descrição Geral</h3>
                <p className="body">Projeto que visa a implementação de um sistema de geração fotovoltaico {r.mode === 'offgrid' ? 'off-grid (autônomo)' : r.mode === 'hibrido' ? 'híbrido' : 'distribuído (on-grid)'}, a fim de {r.mode === 'offgrid' ? 'suprir o consumo local com autonomia energética' : 'gerar créditos energéticos que serão compensados na fatura de energia elétrica'}, trazendo sustentabilidade e uma economia significativa no valor da energia.</p>
                <h3 className="sec-title green">Requisitos de Implementação</h3>
                <p className="body">Para a implementação do sistema, a limitação se dá pelo número de módulos, no caso dimensionado, <strong>{r.modulos} módulos</strong> ({r.modulo_w || 550}W), os quais necessitam uma área de aproximadamente <strong>{r.area_m2} m²</strong>.</p>
                <h3 className="sec-title green">Instalação e Homologação</h3>
                <p className="body">A proposta conta com o projeto elétrico e a instalação do sistema. Dimensionamento alinhado à <strong>Lei 14.300/22</strong> e resoluções ANEEL.{r.grid_zero ? ' Sistema elegível a grid-zero (até 7,5 kWp).' : ''}</p>
                <div className="page-num">2</div>
              </div>
            </div>

            <div className="page">
              <div className="page-inner">
                <div className="page-header">
                  <div className="brand">Paraty <span>Solar</span></div>
                  <div style={{ fontSize: '.8rem', color: 'var(--m)' }}>{r.num_proposta || r.id}</div>
                </div>
                <h3 className="sec-title">Como Funciona o Investimento?</h3>
                <div className="flow">
                  <div className="flow-item">
                    <div className="flow-circle">$</div>
                    <div className="flow-label">Problema</div>
                    <div className="flow-val" style={{ color: '#c0392b' }}>{fmt(r.gasto_rs)}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--m)' }}>Valor alto na conta</div>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-item">
                    <div className="flow-circle green">☀</div>
                    <div className="flow-label">Solução</div>
                    <div className="flow-val">Energia Solar</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--m)' }}>Paraty Solar</div>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-item">
                    <div className="flow-circle navy">✓</div>
                    <div className="flow-label">Resultado</div>
                    <div className="flow-val" style={{ color: 'var(--g)' }}>{fmt(contaCom)}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--m)' }}>Conta após instalação</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', margin: '18px 0 8px' }}>
                  <div style={{ display: 'inline-block', background: 'var(--navy)', color: '#fff', padding: '8px 20px', borderRadius: 999, fontSize: '.82rem', fontWeight: 700 }}>ATUALMENTE POSSUÍMOS DUAS MANEIRAS DE VIABILIZAR O PROJETO</div>
                </div>
                <div className="two-col">
                  <div className="box orange-box">
                    <h4>📦 PARCELAMENTO</h4>
                    <ul>
                      <li>72× {fmt(parcela72)}</li>
                      <li>60× {fmt(parcela60)}</li>
                      <li>48× {fmt(parcela48)}</li>
                      <li>10× {fmt(parcela10)} (cartão)</li>
                      <li>6× {fmt(r.financiamento?.parcela_6x_sem_juros || Math.round((r.total || 0) / 6))} sem juros</li>
                    </ul>
                  </div>
                  <div className="box highlight">
                    <h4>💰 À VISTA</h4>
                    <div className="big-price" style={{ margin: '8px 0' }}>{fmt(r.total)}</div>
                    <p style={{ fontSize: '.8rem', color: '#555' }}>Sem juros · melhor payback</p>
                  </div>
                </div>
                <div className="page-num">3</div>
              </div>
            </div>

            <div className="page">
              <div className="page-inner">
                <div className="page-header">
                  <div className="brand">Paraty <span>Solar</span></div>
                  <div style={{ fontSize: '.8rem', color: 'var(--m)' }}>{r.num_proposta || r.id}</div>
                </div>
                <h3 className="sec-title">Dimensionamento e Economia</h3>
                <p className="body">Kit de <strong>{r.kwp} kWp</strong> · economia estimada <strong>{fmt(r.economia_mes)}</strong>/mês · <strong>{fmt(r.economia_ano)}</strong>/ano · payback ~<strong>{r.payback_anos} anos</strong>.</p>
                <ChartGeracao meses={r.meses} geracao={r.geracaoMensal} consumo={r.consumoMensal} />
                <div className="page-num">4</div>
              </div>
            </div>

            <div className="page">
              <div className="page-inner">
                <div className="page-header">
                  <div className="brand">Paraty <span>Solar</span></div>
                  <div style={{ fontSize: '.8rem', color: 'var(--m)' }}>{r.num_proposta || r.id}</div>
                </div>
                <h3 className="sec-title">Composição do Sistema</h3>
                <p className="body" style={{ marginBottom: 12 }}>
                  Investimento turnkey competitivo: <strong>{r.preco_kwp_label || (r.preco_kwp ? `R$ ${Number(r.preco_kwp).toLocaleString('pt-BR')}/kWp` : '')}</strong>
                  {' '}· {r.kwp} kWp · alinhado ao mercado 2026 (referência Leroy / Solfácil).
                </p>
                <table className="bom-table">
                  <thead><tr><th>Item</th><th>Marca</th><th>Qtd</th></tr></thead>
                  <tbody>
                    {(r.itens || []).map((it, i) => (
                      <tr key={i}><td>{it.item}</td><td>{it.marca || '—'}</td><td>{it.qtd}</td></tr>
                    ))}
                    <tr className="tot-row">
                      <td colSpan={2}>Investimento total (equipamentos + instalação + homologação)</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmt(r.total)}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="body" style={{ marginTop: 10, fontSize: '.85rem', color: 'var(--m)' }}>
                  Preço por kWp instalado: <strong>{fmt(r.preco_kwp || (r.total && r.kwp ? r.total / r.kwp : 0))}/kWp</strong>.
                  Valor competitivo frente a kits de varejo (Leroy e similares), com projeto, instalação e homologação inclusos.
                </p>
                <h3 className="sec-title" style={{ marginTop: 24 }}>Retorno de Investimento</h3>
                <p className="body">Payback simples em aproximadamente <strong>{r.payback_anos} anos</strong>. Em 15 anos, retorno acumulado estimado da ordem de <strong>{fmt(Math.max(0, lucro15))}</strong>.</p>
                <ChartRetorno total={r.total} economia_ano={r.economia_ano} />
                <div className="page-num">5</div>
              </div>
            </div>

            <div className="page">
              <div className="page-inner">
                <div className="page-header">
                  <div className="brand">Paraty <span>Solar</span></div>
                  <div style={{ fontSize: '.8rem', color: 'var(--m)' }}>{r.num_proposta || r.id}</div>
                </div>
                <h3 className="sec-title">Portfólio e Equipe</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {PHOTOS.portfolio.slice(0, 6).map((p, i) => (
                    <div key={i}>
                      <img src={p.src} alt={p.seg} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} loading="lazy" />
                      <div style={{ fontSize: '.7rem', marginTop: 4 }}>{p.seg} · {p.cid}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {PHOTOS.team.map((src, i) => (
                    <img key={i} src={src} alt="Equipe Paraty Solar" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10 }} loading="lazy" />
                  ))}
                </div>
                <div className="page-num">6</div>
              </div>
            </div>

            <div className="page">
              <div className="page-inner">
                <div className="page-header">
                  <div className="brand">Paraty <span>Solar</span></div>
                  <div style={{ fontSize: '.8rem', color: 'var(--m)' }}>{r.num_proposta || r.id}</div>
                </div>
                <h3 className="sec-title">Considerações Finais</h3>
                <ul className="notes-list">
                  <li>{r.notes?.lei || 'Dimensionamento alinhado à Lei 14.300/22 e REN ANEEL.'}</li>
                  <li>{r.notes?.garantia_modulos || '15 anos produto / 30 anos performance (módulos).'}</li>
                  <li>{r.notes?.garantia_inversor || '5–10 anos de garantia do inversor.'}</li>
                  <li>{r.notes?.preco || 'Investimento turnkey competitivo por kWp.'}</li>
                  {r.grid_zero && <li>Sistema elegível a <strong>grid-zero</strong> (potência ≤ 7,5 kWp).</li>}
                </ul>
                <div className="signature">
                  <p className="body" style={{ textAlign: 'left' }}>Atenciosamente,</p>
                  <div className="line" />
                  <div className="name">Paraty Solar</div>
                  <div style={{ fontSize: '.85rem', color: 'var(--m)' }}>Equipe Comercial</div>
                </div>
                <div className="footer-brand">
                  <div className="name">Paraty <span>Solar</span></div>
                  <div className="contact">
                    WhatsApp (12) 99705-4541 · contato@paratysolar.com.br · www.paratysolar.com.br<br />
                    Paraty – RJ · Costa Verde
                  </div>
                </div>
                <div className="page-num">7</div>
              </div>
            </div>
          </div>
        )}

        <div className="card no-print" id="gestao">
          <h3 style={{ marginBottom: 8 }}>Gestão de Propostas</h3>
          <p className="sub" style={{ marginBottom: 16 }}>
            Propostas geradas ficam registradas aqui. Precificação por kWp competitiva (referência mercado 2026 / Leroy).
          </p>
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: 14, marginBottom: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--g)' }}>💰 Tabela R$/kWp instalado (turnkey)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: '.85rem' }}>
              <div>
                <strong>On-Grid</strong>
                <div>≤4 kWp: R$ 3.100</div>
                <div>4–8: R$ 2.900</div>
                <div>8–15: R$ 2.700</div>
                <div>&gt;15: R$ 2.550</div>
              </div>
              <div>
                <strong>Híbrido</strong>
                <div>≤4: R$ 4.200</div>
                <div>4–8: R$ 3.900</div>
                <div>8–15: R$ 3.600</div>
                <div>&gt;15: R$ 3.400</div>
              </div>
              <div>
                <strong>Off-Grid</strong>
                <div>≤4: R$ 5.200</div>
                <div>4–8: R$ 4.800</div>
                <div>8–15: R$ 4.500</div>
                <div>&gt;15: R$ 4.200</div>
              </div>
            </div>
            <p style={{ fontSize: '.78rem', color: '#555', marginTop: 10, marginBottom: 0 }}>
              Mercado 2026: Solfácil ~R$ 2,45/Wp · Solar Task mediana ~R$ 2,74/Wp. Paraty Solar na faixa competitiva com instalação e homologação inclusas.
            </p>
          </div>
          <h4 style={{ marginBottom: 10 }}>Propostas registradas ({list.length})</h4>
          {!list.length && <p className="sub">Nenhuma proposta ainda (ou banco não configurado).</p>}
          <ul className="list">
            {list.map((p) => (
              <li key={p.id} onClick={() => openProposal(p)} style={{ cursor: 'pointer' }}>
                <span>
                  <strong>{p.cliente_nome || p.id}</strong>
                  {' · '}{p.mode}{' · '}{p.kwp} kWp
                  {p.status ? ` · ${p.status}` : ''}
                  {p.cidade ? ` · ${p.cidade}` : ''}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--g)' }}>{fmt(p.total || p.investimento)}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-out" style={{ marginTop: 12 }} onClick={loadList}>Atualizar lista</button>
        </div>
      </div>
    </>
  );
}
