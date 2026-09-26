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
    { src: '/prop-photos/20240505_155359.jpg', seg: 'Instala\u00e7\u00e3o', cid: 'Equipe Paraty', mod: '\u2014', gen: '\u2014', econ: 'Comissionamento' },
    { src: '/prop-photos/20240615_102913.jpg', seg: 'Residencial', cid: 'Regi\u00e3o - RJ', mod: '16', gen: '640', econ: 'R$ 560' },
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
      <h4>Gera\u00e7\u00e3o estimada \u00d7 Consumo informado (kWh/m\u00eas)</h4>
      <div className="gen-chart">
        {meses.map((m, i) => (
          <div key={m} className="gen-col">
            <div className="gen-bar g" style={{ height: `${(geracao[i] / max) * 140}px` }} title={`Gera\u00e7\u00e3o: ${geracao[i]}`} />
            <div className="gen-bar c" style={{ height: `${((consumo?.[i] || 0) / max) * 140}px` }} title={`Consumo: ${consumo?.[i] || 0}`} />
            <span className="gen-lbl">{m}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10, fontSize: '.78rem' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--g)', borderRadius: 2, marginRight: 4 }} /> Gera\u00e7\u00e3o</span>
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
            <div
              className="bar"
              style={{
                height: `${(Math.abs(b.v) / maxAbs) * 160}px`,
                background: b.v >= 0 ? '#5b9bd5' : '#e74c3c',
              }}
              title={`Ano ${b.y}: ${fmt(b.v)}`}
            />
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
      if (!res.ok) {
        setLoginErr(data.error || 'Falha no login');
        return;
      }
      sessionStorage.setItem('prop_auth', pwd);
      setAuth(pwd);
    } catch {
      setLoginErr('Erro de conex\u00e3o');
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
          tarifa: form.tarifa ? Number(form.tarifa) : 0.95,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || data.hint || 'Erro ao gerar');
        return;
      }
      const p = data.proposal;
      const full = p.payload ? { ...p, ...(typeof p.payload === 'string' ? JSON.parse(p.payload) : p.payload) } : p;
      setResult({ ...full, cliente_nome: form.cliente_nome, cidade: form.cidade, uf: form.uf, cliente_telefone: form.cliente_telefone });
      loadList();
      setTimeout(() => document.getElementById('proposta')?.scrollIntoView({ behavior: 'smooth' }), 200);
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
          <p className="sub">Acesso restrito \u2014 m\u00f3dulo comercial</p>
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
            <p className="sub">Modelo comercial \u00b7 On-Grid \u00b7 Off-Grid \u00b7 H\u00edbrido</p>
          </div>
          <button className="btn-out" onClick={logout}>Sair</button>
        </div>

        <div className="card no-print">
          <div className="modes">
            {['ongrid', 'offgrid', 'hibrido'].map((m) => (
              <button key={m} type="button" className={'mode' + (mode === m ? ' on' : '')} onClick={() => setMode(m)}>
                {m === 'ongrid' ? 'On-Grid' : m === 'offgrid' ? 'Off-Grid' : 'H\u00edbrido'}
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
                <label>Celular / WhatsApp</label>
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
            <label>Endere\u00e7o</label>
            <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            <div className="row">
              <div>
                <label>Cidade</label>
                <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
              </div>
              {mode === 'offgrid' ? (
                <div>
                  <label>Consumo di\u00e1rio (Wh/dia)</label>
                  <input type="number" min="50" value={form.wh_dia} onChange={(e) => setForm({ ...form, wh_dia: e.target.value })} required />
                </div>
              ) : (
                <div>
                  <label>Gasto m\u00e9dio mensal (R$)</label>
                  <input type="number" min="50" value={form.gasto_rs} onChange={(e) => setForm({ ...form, gasto_rs: e.target.value })} required />
                </div>
              )}
            </div>
            <div className="row">
              <div>
                <label>Tarifa (R$/kWh)</label>
                <input type="number" step="0.01" min="0.3" value={form.tarifa} onChange={(e) => setForm({ ...form, tarifa: e.target.value })} />
              </div>
            </div>
            {err && <p className="err">{err}</p>}
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Gerando\u2026' : 'Gerar proposta comercial \u203a'}
            </button>
          </form>
        </div>

        {r && (
          <div id="proposta" className="proposta">
            <div className="toolbar no-print">
              <button className="btn" onClick={() => window.print()}>\ud83d\udda8 Imprimir / Salvar PDF</button>
              <button className="btn-out" onClick={() => setResult(null)}>Nova proposta</button>
            </div>

            <div className="page">
              <div className="cover">
                <div>
                  <div style={{ fontSize: '.9rem', letterSpacing: '.2em', opacity: .8 }}>PARATY SOLAR</div>
                  <h1>PROPOSTA<br />COMERCIAL</h1>
                  <p className="tagline">Inova\u00e7\u00e3o e sustentabilidade<br />para o seu projeto</p>
                </div>
                <div className="cover-circles">
                  <img src={PHOTOS.cover1} alt="Projeto Paraty" />
                  <img src={PHOTOS.cover2} alt="Instala\u00e7\u00e3o" className="main" />
                  <img src={PHOTOS.cover3} alt="Sistema solar" />
                </div>
                <div className="cover-brand">
                  <div className="name">Paraty <span>Solar</span></div>
                  <div className="sub-b">Energia Solar</div>
                </div>
                <div className="cover-footer">
                  <div>
                    <div>\ud83d\udcf1 (12) 99705-4541</div>
                    <div>\ud83c\udf10 www.paratysolar.com.br</div>
                    <div>\u2709 contato@paratysolar.com.br</div>
                  </div>
                  <div>
                    <div><strong>Paraty \u2013 RJ</strong></div>
                    <div>Costa Verde & regi\u00e3o</div>
                    <div>Atendimento presencial e online</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="page">
              <div className="page-inner">
                <div className="page-header">
                  <div className="brand">Paraty <span>Solar</span></div>
                  <div style={{ fontSize: '.8rem', color: 'var(--m)' }}>PROPOSTA COMERCIAL \u00b7 {r.num_proposta || r.id}</div>
                </div>
                <div className="client-name">{r.cliente_nome || 'Cliente'},</div>
                <div className="client-loc">{[r.cidade, r.uf].filter(Boolean).join(' - ') || 'RJ'}</div>
                <p className="body">A fim de descrever o que ser\u00e1 desenvolvido, apresentamos a proposta comercial, com as seguintes caracter\u00edsticas a saber:</p>
                <h3 className="sec-title green">Descri\u00e7\u00e3o Geral</h3>
                <p className="body">Projeto que visa a implementa\u00e7\u00e3o de um sistema de gera\u00e7\u00e3o fotovoltaico {r.mode === 'offgrid' ? 'off-grid (aut\u00f4nomo)' : r.mode === 'hibrido' ? 'h\u00edbrido' : 'distribu\u00eddo (on-grid)'}, a fim de {r.mode === 'offgrid' ? 'suprir o consumo local com autonomia energ\u00e9tica' : 'gerar cr\u00e9ditos energ\u00e9ticos que ser\u00e3o compensados na fatura de energia el\u00e9trica'}, trazendo sustentabilidade e uma economia significativa no valor da energia.</p>
                <h3 className="sec-title green">Requisitos de Implementa\u00e7\u00e3o</h3>
                <p className="body">Para a implementa\u00e7\u00e3o do sistema, a limita\u00e7\u00e3o se d\u00e1 pelo n\u00famero de m\u00f3dulos, no caso dimensionado, <strong>{r.modulos} m\u00f3dulos</strong> ({r.modulo_w || 450}W), os quais necessitam uma \u00e1rea de aproximadamente <strong>{r.area_m2} m\u00b2</strong>.</p>
                <h3 className="sec-title green">Instala\u00e7\u00e3o e Homologa\u00e7\u00e3o</h3>
                <p className="body">A proposta conta com o projeto el\u00e9trico e a instala\u00e7\u00e3o do sistema. Para uma correta instala\u00e7\u00e3o h\u00e1 necessidade de avalia\u00e7\u00e3o e inspe\u00e7\u00e3o pr\u00e9via, tendo um profissional respons\u00e1vel pelo projeto.</p>
                <p className="body">{r.mode !== 'offgrid' && 'A homologa\u00e7\u00e3o do sistema junto \u00e0 concession\u00e1ria est\u00e1 contemplada, com orienta\u00e7\u00f5es em rela\u00e7\u00e3o aos procedimentos a serem tomados com a companhia el\u00e9trica. '}Dimensionamento alinhado \u00e0 <strong>Lei 14.300/22</strong> e resolu\u00e7\u00f5es ANEEL.{r.grid_zero ? ' Sistema eleg\u00edvel a grid-zero (at\u00e9 7,5 kWp).' : ''}</p>
                <div className="page-num">2</div>
              </div>
            </div>

            {/* PLACEHOLDER_REST - will complete with second push if needed */}
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
                  <div className="flow-arrow">\u2192</div>
                  <div className="flow-item">
                    <div className="flow-circle green">\u2600</div>
                    <div className="flow-label">Solu\u00e7\u00e3o</div>
                    <div className="flow-val">Energia Solar</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--m)' }}>Paraty Solar</div>
                  </div>
                  <div className="flow-arrow">\u2192</div>
                  <div className="flow-item">
                    <div className="flow-circle navy">\u2713</div>
                    <div className="flow-label">Resultado</div>
                    <div className="flow-val" style={{ color: 'var(--g)' }}>{fmt(contaCom)}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--m)' }}>Conta ap\u00f3s instala\u00e7\u00e3o</div>
                  </div>
                </div>
                <div className="footer-brand">
                  <div className="name">Paraty <span>Solar</span></div>
                  <div className="contact">
                    Energia solar com instala\u00e7\u00e3o e suporte local<br />
                    WhatsApp (12) 99705-4541 \u00b7 contato@paratysolar.com.br \u00b7 www.paratysolar.com.br<br />
                    Paraty \u2013 RJ \u00b7 Costa Verde
                  </div>
                </div>
                <div className="page-num">7</div>
              </div>
            </div>
          </div>
        )}

        <div className="card no-print">
          <h3 style={{ marginBottom: 12 }}>\u00daltimas propostas</h3>
          {!list.length && <p style={{ color: 'var(--m)', fontSize: '.9rem' }}>Nenhuma proposta gerada ainda.</p>}
          {list.slice(0, 8).map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => openProposal(p)}>
              <div>
                <strong>{p.cliente_nome || 'Cliente'}</strong>
                <div style={{ fontSize: '.8rem', color: 'var(--m)' }}>{p.num_proposta || p.id} \u00b7 {p.mode}</div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--g)' }}>{fmt(p.total)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
