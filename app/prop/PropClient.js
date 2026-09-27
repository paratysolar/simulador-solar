'use client';
import { useState, useEffect } from 'react';
import { STYLES } from './prop-styles';
import { PHOTOS, fmt, fmtDec, ChartGeracao, ChartRetorno, TopBar, DEFAULT_EQUIP } from './prop-helpers';
import ProposalView from './ProposalView';

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
  const [priceCfg, setPriceCfg] = useState(null);
  const [editMao, setEditMao] = useState(1320);
  const [editEquip, setEditEquip] = useState(DEFAULT_EQUIP);
  const [priceMsg, setPriceMsg] = useState('');
  const [priceBusy, setPriceBusy] = useState(false);
  const [showPriceEdit, setShowPriceEdit] = useState(false);
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
  async function loadPricing() {
    try {
      const res = await fetch('/api/pricing', { headers: { 'x-prop-auth': auth } });
      const data = await res.json();
      if (res.ok && data.config) {
        setPriceCfg(data.config);
        setEditMao(Number(data.config.mao_obra_kwp) || 1320);
        const eq = data.config.equip || DEFAULT_EQUIP;
        setEditEquip({
          ongrid: { ...DEFAULT_EQUIP.ongrid, ...(eq.ongrid || {}) },
          hibrido: { ...DEFAULT_EQUIP.hibrido, ...(eq.hibrido || {}) },
          offgrid: { ...DEFAULT_EQUIP.offgrid, ...(eq.offgrid || {}) },
        });
      } else if (data.fallback) {
        setPriceCfg(data.fallback);
        setEditMao(data.fallback.mao_obra_kwp || 1320);
        setEditEquip(data.fallback.equip || DEFAULT_EQUIP);
      }
    } catch {}
  }
  async function savePricing(e) {
    e?.preventDefault?.();
    setPriceBusy(true);
    setPriceMsg('');
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-prop-auth': auth },
        body: JSON.stringify({
          mao_obra_kwp: Number(editMao) || 1320,
          equip: editEquip,
          notes: `Mão de obra R$ ${editMao}/kWp em kits homologados (on-grid/híbrido).`,
          updated_by: 'prop-ui',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPriceMsg(data.error || 'Erro ao salvar');
        return;
      }
      setPriceCfg(data.config);
      setPriceMsg(data.message || 'Precificação salva com sucesso.');
      setShowPriceEdit(false);
    } catch (ex) {
      setPriceMsg(String(ex.message || ex));
    } finally {
      setPriceBusy(false);
    }
  }
  async function seedPricing() {
    setPriceBusy(true);
    setPriceMsg('');
    try {
      const res = await fetch('/api/pricing?seed=1', { headers: { 'x-prop-auth': auth } });
      const data = await res.json();
      if (res.ok && data.config) {
        setPriceCfg(data.config);
        setEditMao(Number(data.config.mao_obra_kwp) || 1320);
        const eq = data.config.equip || DEFAULT_EQUIP;
        setEditEquip({
          ongrid: { ...DEFAULT_EQUIP.ongrid, ...(eq.ongrid || {}) },
          hibrido: { ...DEFAULT_EQUIP.hibrido, ...(eq.hibrido || {}) },
          offgrid: { ...DEFAULT_EQUIP.offgrid, ...(eq.offgrid || {}) },
        });
        setPriceMsg('Tabelas de preço seedadas (mão de obra R$ 1.320/kWp).');
      } else {
        setPriceMsg(data.error || 'Falha no seed');
      }
    } catch (ex) {
      setPriceMsg(String(ex.message || ex));
    } finally {
      setPriceBusy(false);
    }
  }
  useEffect(() => {
    if (auth) {
      loadList();
      loadPricing();
    }
  }, [auth]);
  function turnkey(modeKey, faixa) {
    const equip = (editEquip[modeKey] && editEquip[modeKey][faixa]) || 0;
    const mo = modeKey === 'offgrid' ? 0 : (Number(editMao) || 1320);
    return equip + mo;
  }
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
  const contaCom = r ? Math.max(0, Math.round((r.gasto_rs || 0) - (r.economia_mes || 0))) : 0;
  const parcela72 = r ? Math.round((r.total || 0) * 0.0285) : 0;
  const parcela60 = r ? Math.round((r.total || 0) * 0.0315) : 0;
  const parcela48 = r ? Math.round((r.total || 0) * 0.036) : 0;
  const parcela10 = r ? Math.round((r.total || 0) / 10) : 0;
  const lucro15 = r ? Math.round((r.economia_ano || 0) * 15 * 1.4 - (r.total || 0)) : 0;
  const paybackMeses = r?.payback_anos ? Math.round(r.payback_anos * 12) : 0;
  const paybackTxt = paybackMeses
    ? `${paybackMeses} MESES ou ${Math.floor(paybackMeses / 12)} anos e ${paybackMeses % 12} meses`
    : '—';
  return (
    <>
      <style>{STYLES}</style>
      <div className="wrap">
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div className="logo-txt">Paraty <span>Solar</span></div>
            <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '1.35rem', color: 'var(--navy)' }}>Gerador de Propostas</h1>
            <p className="sub" style={{ color: 'var(--m)', fontSize: '.88rem' }}>Modelo comercial · On-Grid · Off-Grid · Híbrido</p>
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
        <ProposalView
          r={r}
          contaCom={contaCom}
          parcela72={parcela72}
          parcela60={parcela60}
          parcela48={parcela48}
          parcela10={parcela10}
          lucro15={lucro15}
          paybackTxt={paybackTxt}
        />
        <div className="card no-print" id="gestao">
          <h3 style={{ marginBottom: 8, fontFamily: 'Montserrat,sans-serif', color: 'var(--navy)' }}>Gestão de Propostas &amp; Precificação</h3>
          <p className="sub" style={{ marginBottom: 16, color: 'var(--m)', fontSize: '.88rem' }}>
            Tabelas de preço no banco (Neon). Mão de obra kits homologados: R$ {(editMao || 1320).toLocaleString('pt-BR')}/kWp.
            Cliente vê total turnkey sem unitário detalhado.
          </p>
          <div className="price-box">
            <div className="price-box-title">💰 Tabela R$/kWp instalado (turnkey = equip + mão de obra)</div>
            <div className="price-grid">
              <div>
                <strong>On-Grid</strong>
                <div>≤4: {fmt(turnkey('ongrid', 'base'))}</div>
                <div>4–8: {fmt(turnkey('ongrid', 'mid'))}</div>
                <div>8–15: {fmt(turnkey('ongrid', 'large'))}</div>
                <div>&gt;15: {fmt(turnkey('ongrid', 'xl'))}</div>
              </div>
              <div>
                <strong>Híbrido</strong>
                <div>≤4: {fmt(turnkey('hibrido', 'base'))}</div>
                <div>4–8: {fmt(turnkey('hibrido', 'mid'))}</div>
                <div>8–15: {fmt(turnkey('hibrido', 'large'))}</div>
                <div>&gt;15: {fmt(turnkey('hibrido', 'xl'))}</div>
              </div>
              <div>
                <strong>Off-Grid</strong>
                <div>≤4: {fmt(turnkey('offgrid', 'base'))}</div>
                <div>4–8: {fmt(turnkey('offgrid', 'mid'))}</div>
                <div>8–15: {fmt(turnkey('offgrid', 'large'))}</div>
                <div>&gt;15: {fmt(turnkey('offgrid', 'xl'))}</div>
              </div>
            </div>
            <div className="price-actions">
              <button type="button" className="btn-out" onClick={() => setShowPriceEdit(!showPriceEdit)}>
                {showPriceEdit ? 'Fechar edição' : 'Editar tabela de preços'}
              </button>
              <button type="button" className="btn-out" onClick={seedPricing} disabled={priceBusy}>
                {priceBusy ? '…' : 'Seed / reset defaults'}
              </button>
              <button type="button" className="btn-out" onClick={loadPricing}>Recarregar</button>
            </div>
            {priceMsg && <p className={priceMsg.includes('Erro') || priceMsg.includes('Falha') ? 'err' : 'ok-msg'}>{priceMsg}</p>}
          </div>
          {showPriceEdit && (
            <form className="price-edit" onSubmit={savePricing}>
              <h4>Editar precificação (banco)</h4>
              <div className="row">
                <div>
                  <label>Mão de obra (R$/kWp) — kits homologados</label>
                  <input type="number" min="0" step="10" value={editMao} onChange={(e) => setEditMao(e.target.value)} />
                  <small style={{ color: 'var(--m)' }}>Padrão: 1320 (on-grid/híbrido).</small>
                </div>
              </div>
              <p className="sub">Edite equipamentos via API POST /api/pricing. Tabela acima atualiza após seed/reload.</p>
              <button className="btn" type="submit" disabled={priceBusy}>{priceBusy ? 'Salvando…' : 'Salvar mão de obra no banco'}</button>
            </form>
          )}
          <h4 style={{ margin: '22px 0 10px' }}>Propostas registradas ({list.length})</h4>
          {!list.length && <p style={{ color: 'var(--m)', fontSize: '.9rem' }}>Nenhuma proposta ainda.</p>}
          <ul className="list">
            {list.map((p) => (
              <li key={p.id} onClick={() => openProposal(p)} style={{ cursor: 'pointer' }}>
                <span>
                  <strong>{p.cliente_nome || p.id}</strong>
                  {' · '}{p.mode}{' · '}{p.kwp} kWp
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
