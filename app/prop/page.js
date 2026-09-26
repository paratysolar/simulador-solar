'use client';

import { useState, useEffect } from 'react';
import { STYLES } from './prop-styles';

const PHOTOS = {
  cover1: '/prop-photos/20250211_161337.jpg',
  cover2: '/prop-photos/WhatsApp_Image_2026-09-06_at_153548.jpg',
  cover3: '/prop-photos/20240827_142325.jpg',
  portfolio: [
    { src: '/prop-photos/20240222_095716.jpg', seg: 'Residencial', cid: 'Paraty - RJ' },
    { src: '/prop-photos/20240224_110459.jpg', seg: 'Comercial', cid: 'Paraty - RJ' },
    { src: '/prop-photos/20240224_110913.jpg', seg: 'Residencial', cid: 'Paraty - RJ' },
    { src: '/prop-photos/20240615_102913.jpg', seg: 'Residencial', cid: 'Região - RJ' },
    { src: '/prop-photos/20240827_142325.jpg', seg: 'Residencial', cid: 'Paraty - RJ' },
    { src: '/prop-photos/20250211_161402.jpg', seg: 'Residencial', cid: 'Costa Verde - RJ' },
    { src: '/prop-photos/20250211_161418.jpg', seg: 'Residencial', cid: 'Costa Verde - RJ' },
    { src: '/prop-photos/WhatsApp_Image_2026-09-06_at_153554.jpg', seg: 'Residencial', cid: 'Paraty - RJ' },
    { src: '/prop-photos/20240505_155359.jpg', seg: 'Instalação', cid: 'Equipe Paraty' },
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
function fmtDec(n) {
  return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 140 }}>
              <div className="gen-bar g" style={{ height: `${(geracao[i] / max) * 140}px` }} title={`Geração: ${geracao[i]}`} />
              <div className="gen-bar c" style={{ height: `${((consumo?.[i] || 0) / max) * 140}px` }} title={`Consumo: ${consumo?.[i] || 0}`} />
            </div>
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
  for (let y = 0; y <= 15; y++) {
    if (y === 0) { bars.push({ y: 0, v: Math.round(-(total || 0)) }); continue; }
    acum += anual * Math.pow(1.1, y - 1) * Math.pow(0.995, y - 1);
    bars.push({ y, v: Math.round(acum) });
  }
  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.v)), 1);
  return (
    <div className="chart-wrap">
      <h4>Retorno de Investimento</h4>
      <div className="bar-chart">
        {bars.map((b) => (
          <div key={b.y} className="bar-col">
            <div className="bar" style={{ height: `${(Math.abs(b.v) / maxAbs) * 180}px`, background: b.v >= 0 ? '#7dd3fc' : '#fda4af' }} title={`Ano ${b.y}: ${fmt(b.v)}`} />
            <span className="bar-lbl">{b.y}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="page-topbar">
      <div className="brand-mark">Paraty <span>Solar</span></div>
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
            <p style={{ color: 'var(--m)', fontSize: '.88rem' }}>Modelo comercial · On-Grid · Off-Grid · Híbrido</p>
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
                <div className="cover-top">
                  <h1>PROPOSTA<br />COMERCIAL</h1>
                  <p className="tagline">Inovação e sustentabilidade<br />para o seu projeto</p>
                  <div className="cover-circles">
                    <img src={PHOTOS.cover1} alt="Projeto" />
                    <img src={PHOTOS.cover2} alt="Instalação" className="main" />
                    <img src={PHOTOS.cover3} alt="Sistema solar" />
                  </div>
                </div>
                <div className="cover-mid">
                  <div className="cover-logo-name">Paraty <span>Solar</span></div>
                  <div className="cover-logo-sub">Energia Solar</div>
                </div>
                <div className="cover-footer">
                  <div>
                    <div>📱 (12) 99705-4541</div>
                    <div>✉ contato@paratysolar.com.br</div>
                    <div>🌐 www.paratysolar.com.br</div>
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
                <TopBar />
                <div className="title-orange">PROPOSTA COMERCIAL</div>
                <div className="client-name">{r.cliente_nome || 'Cliente'},</div>
                <div className="client-loc">{[r.cidade, r.uf].filter(Boolean).join(' - ') || 'RJ'}</div>
                <p className="body" style={{ fontWeight: 600, marginBottom: 18 }}>
                  A fim de descrever o que será desenvolvido, apresentamos a proposta comercial, com as seguintes características a saber:
                </p>
                <div className="intro-grid">
                  <div>
                    <h3 className="title-blue" style={{ marginTop: 0 }}>Descrição Geral</h3>
                    <p className="body">
                      Projeto que visa a implementação de um sistema de geração fotovoltaico{' '}
                      {r.mode === 'offgrid' ? 'off-grid (autônomo)' : r.mode === 'hibrido' ? 'híbrido' : 'distribuído'},
                      a fim de {r.mode === 'offgrid'
                        ? 'suprir o consumo local com autonomia energética'
                        : 'gerar créditos energéticos os quais serão compensados na fatura de energia elétrica'},
                      trazendo sustentabilidade e uma economia de até 95% no valor da fatura de energia elétrica.
                    </p>
                  </div>
                  <div className="intro-illust">
                    <img src={PHOTOS.cover2} alt="Sistema solar" style={{ maxHeight: 180 }} />
                  </div>
                </div>
                <h3 className="title-blue">Requisitos de Implementação</h3>
                <p className="body">
                  Para a implementação do sistema, a limitação se dá pelo número de placas, no caso dimensionado,{' '}
                  <strong>{r.modulos} placas</strong>, as quais necessitam uma área de aproximadamente{' '}
                  <strong>{r.area_m2} m²</strong>.
                </p>
                <h3 className="title-blue">Instalação e Homologação</h3>
                <p className="body">
                  A proposta conta com o projeto elétrico e a instalação do sistema de geração distribuída. Para uma correta instalação há necessidade de avaliação e inspeção prévia, tendo um profissional responsável pelo projeto.
                </p>
                <p className="body">
                  {r.mode !== 'offgrid' && 'A homologação do sistema junto à concessionária está contemplada, haverá orientações em relação aos procedimentos a serem tomados com a companhia elétrica. '}
                  Dimensionamento alinhado à <strong>Lei 14.300/22</strong> e resoluções ANEEL.
                  {r.grid_zero ? ' Sistema elegível a grid-zero (até 7,5 kWp).' : ''}
                </p>
                <div className="page-num">2</div>
              </div>
            </div>

            <div className="page">
              <div className="page-inner flow-page">
                <TopBar />
                <h2 className="flow-title">Como Funciona o Investimento?</h2>
                <div className="flow-top">
                  <div className="flow-step">
                    <div className="flow-icon">📋</div>
                    <div className="flow-lbl">Problema</div>
                    <div className="flow-desc">Valor alto na<br />conta de luz</div>
                    <div className="flow-val red">{fmtDec(r.gasto_rs)}</div>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">
                    <div className="flow-icon sol">☀</div>
                    <div className="flow-lbl">Solução</div>
                    <div className="flow-desc">Energia Solar<br />Paraty Solar</div>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">
                    <div className="flow-icon">💰</div>
                    <div className="flow-lbl">Resultado</div>
                    <div className="flow-desc">Valor após a<br />instalação do sistema</div>
                    <div className="flow-val green">{fmtDec(contaCom)}</div>
                  </div>
                </div>
                <div className="banner-blue">ATUALMENTE POSSUÍMOS DUAS MANEIRAS DE VIABILIZAR O PROJETO</div>
                <div className="two-ways">
                  <div className="way">
                    <div className="way-icon">📅</div>
                    <h4>PARCELAMENTO</h4>
                    <ul>
                      <li>72x {fmtDec(parcela72)}</li>
                      <li>60x {fmtDec(parcela60)}</li>
                      <li>48x {fmtDec(parcela48)}</li>
                      <li>10x {fmtDec(parcela10)} (cartão)</li>
                    </ul>
                    <p className="way-note">
                      Aqui você troca uma <strong>DÍVIDA</strong> por um <strong>INVESTIMENTO</strong>. Pois o valor mensal que antes era utilizado no pagamento da conta de luz, agora é usado para pagar o financiamento do sistema, sem a necessidade de um valor inicial de investimento.
                    </p>
                  </div>
                  <div className="way">
                    <div className="way-icon">💵</div>
                    <h4>À VISTA</h4>
                    <div className="way-price">{fmtDec(r.total)}</div>
                    <p className="way-note">
                      Aqui você tem a grande vantagem de não pagar <strong>NENHUM JUROS</strong> sobre o investimento e ainda tem um ótimo tempo de retorno sobre o valor investido.
                    </p>
                  </div>
                </div>
                <div className="resultado-final">
                  <div className="rf-icon">🏆</div>
                  <div className="rf-lbl">RESULTADO FINAL</div>
                  <div className="rf-sub">
                    Ambas as soluções chegam em um mesmo resultado:<br />
                    <strong>DINHEIRO NO SEU BOLSO</strong>
                  </div>
                  <div className="lucro-box">
                    Lucro de {fmt(Math.max(0, lucro15))} em 15 anos
                  </div>
                </div>
                <div className="page-num">3</div>
              </div>
            </div>

            <div className="page">
              <div className="page-inner">
                <TopBar />
                <h3 className="title-blue" style={{ marginTop: 0, fontStyle: 'italic' }}>Dimensionamento do Projeto</h3>
                <p className="body">
                  Considerando o perfil do cliente, e o previsto consumo médio, chegamos a um KIT de{' '}
                  <strong>{r.kwp} kWp</strong>, o que equivale no cenário atual, uma redução de{' '}
                  <strong>{fmt(r.economia_mes)}</strong> na fatura de energia elétrica. O KIT de geração distribuída é composto por:
                </p>
                <ul className="kit-list">
                  <li>{r.modulos} módulos de {r.modulo_w || 550}Wp;</li>
                  <li>{r.inversor || '1 inversor On-Grid'};</li>
                  <li>Conectores MC4;</li>
                  <li>Estruturas de fixação;</li>
                  <li>Cabo solar especial;</li>
                  <li>Projeto elétrico, instalação e homologação.</li>
                </ul>
                {r.baterias && (
                  <p className="body">Baterias: {r.baterias.kwh} kWh ({r.baterias.tipo})</p>
                )}
                <p className="conta-line">
                  Sua conta <span className="sem">SEM</span> energia solar: <span className="sem">{fmtDec(r.gasto_rs)}</span>.
                </p>
                <p className="conta-line">
                  Sua conta <span className="com">COM</span> energia solar Paraty Solar: <span className="com">{fmtDec(contaCom)}</span>.
                </p>
                <p className="conta-line">
                  Energia gerada com o sistema solar Paraty Solar: <span className="gen">{r.geracao_mes} kWh</span>/mês.
                </p>
                {r.geracaoMensal && (
                  <ChartGeracao meses={r.meses} geracao={r.geracaoMensal} consumo={r.consumoMensal} />
                )}
                <h3 className="title-blue">Condições Gerais de Fornecimento</h3>
                <table className="cond-table">
                  <tbody>
                    <tr><td>72x</td><td>{fmtDec(parcela72)}</td></tr>
                    <tr><td>60x</td><td>{fmtDec(parcela60)}</td></tr>
                    <tr><td>48x</td><td>{fmtDec(parcela48)}</td></tr>
                    <tr><td>10x (cartão)</td><td>{fmtDec(parcela10)}</td></tr>
                    <tr className="inv-row"><td>Investimento</td><td>{fmtDec(r.total)}</td></tr>
                    <tr>
                      <td>Prazo de entrega</td>
                      <td>Créditos sendo gerados em 90 (noventa) dias corridos, a contar do dia de fechamento do pedido.</td>
                    </tr>
                    <tr>
                      <td>Garantia</td>
                      <td>
                        25 anos de garantia de performance para os módulos;<br />
                        15 anos de garantia de fabricação para os módulos;<br />
                        5–10 anos de garantia para o inversor conforme modelo.
                      </td>
                    </tr>
                    <tr>
                      <td>Validade da proposta</td>
                      <td>15 (quinze) dias corridos a partir da data de emissão da proposta comercial.</td>
                    </tr>
                  </tbody>
                </table>
                <p className="fine-print">
                  Importante! O valor da parcela é baseado em uma taxa média, porém o Programa de Financiamentos passa por análise de critério interno e de forma independente e estão sujeitos à análise e aprovação de crédito e cadastro.
                </p>
                <div className="page-num">4</div>
              </div>
            </div>

            <div className="page">
              <div className="page-inner">
                <TopBar />
                <h3 className="title-blue" style={{ marginTop: 0, fontStyle: 'italic' }}>Retorno de Investimento</h3>
                <p className="body">
                  Neste caso, considerando a economia gerada pelo KIT solar, e aumento da fatura de energia elétrica em 10,00% a.a.,
                  o <strong>RETORNO DO INVESTIMENTO</strong> (payback simples) se dá em <strong>{paybackTxt}</strong>,
                  e após isso o valor da fatura que seria pago para a concessionária é lucro para o investidor,
                  portanto em uma análise de 15 anos, teria um retorno de <strong>{fmt(Math.max(0, lucro15))}</strong>,
                  sendo a vida útil mínima das placas fotovoltaicas igual a 25 anos.
                </p>
                <ChartRetorno total={r.total} economia_ano={r.economia_ano} />
                <p className="body" style={{ marginTop: 20 }}>
                  Resumindo, podemos observar, que se a opção for <strong>NÃO</strong> colocar o Sistema de Energia Solar Fotovoltaica Paraty Solar,
                  você estaria automaticamente perdendo uma quantia de exatamente <strong>{fmt(Math.max(0, lucro15))}</strong>, em 15 anos,
                  esse valor será pago para a concessionária de energia elétrica.
                </p>
                <p className="body">
                  Portanto a energia solar fotovoltaica é hoje um dos melhores investimentos em renda fixa, e pode ser comparado com a poupança para ver a diferença gritante de rentabilidade.
                </p>
                <div className="page-num">5</div>
              </div>
            </div>

            <div className="page">
              <div className="page-inner">
                <TopBar />
                <h3 className="title-blue" style={{ marginTop: 0, fontStyle: 'italic' }}>Alguns de Nossos Projetos Instalados</h3>
                <div className="port-grid">
                  {PHOTOS.portfolio.map((p, i) => (
                    <div key={i} className="port-card">
                      <img src={p.src} alt={p.seg} loading="lazy" />
                      <div className="cap">{p.seg} · {p.cid}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 28 }}>
                  <h3 className="title-blue">Nossa equipe em campo</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {PHOTOS.team.map((src, i) => (
                      <img key={i} src={src} alt="Equipe Paraty Solar" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10 }} loading="lazy" />
                    ))}
                  </div>
                </div>
                <div className="page-num">6</div>
              </div>
            </div>

            <div className="page">
              <div className="page-inner">
                <TopBar />
                <h3 className="title-blue" style={{ marginTop: 0, fontStyle: 'italic' }}>Considerações Finais</h3>
                <p className="body">
                  O sistema ora proposto foi dimensionado mediante a uma estimativa de consumo, entretanto o kit é passível de expansão e adaptável às necessidades específicas do perfil do cliente.
                </p>
                <ul className="notes-list">
                  <li>{r.notes?.lei || 'Dimensionamento alinhado à Lei 14.300/22 e REN ANEEL.'}</li>
                  <li>{r.notes?.garantia_modulos || '15 anos produto / 30 anos performance (módulos).'}</li>
                  <li>{r.notes?.garantia_inversor || '5–10 anos de garantia do inversor conforme modelo.'}</li>
                  <li>{r.notes?.preco || 'Investimento turnkey competitivo por kWp (mercado 2026).'}</li>
                  {r.grid_zero && <li>Sistema elegível a <strong>grid-zero</strong> (potência ≤ 7,5 kWp).</li>}
                </ul>
                <div className="signature">
                  <p className="body" style={{ textAlign: 'left' }}>Atenciosamente,</p>
                  <div className="line" />
                  <div className="name">Paraty Solar</div>
                  <div style={{ fontSize: '.85rem', color: 'var(--m)' }}>Equipe Comercial</div>
                  <div className="line" style={{ marginTop: 40 }} />
                  <div className="name">{r.cliente_nome || 'Cliente'}</div>
                  <div style={{ marginTop: 28, fontSize: '.9rem', color: '#64748b' }}>
                    {[r.cidade, r.uf].filter(Boolean).join(' / ') || 'Paraty - RJ'}
                    {r.validade ? `, validade até ${r.validade}` : ''}
                  </div>
                </div>
                <div className="footer-contact">
                  <strong>Paraty Solar</strong><br />
                  Fone/WhatsApp: (12) 99705-4541<br />
                  contato@paratysolar.com.br<br />
                  www.paratysolar.com.br<br />
                  Paraty – RJ · Costa Verde
                </div>
                <div className="page-num">7</div>
              </div>
            </div>
          </div>
        )}

        <div className="card no-print" id="gestao">
          <h3 style={{ marginBottom: 8, fontFamily: 'Montserrat,sans-serif', color: 'var(--navy)' }}>Gestão de Propostas</h3>
          <p style={{ marginBottom: 16, color: 'var(--m)', fontSize: '.88rem' }}>
            Propostas geradas ficam registradas aqui. Precificação por kWp competitiva (mercado 2026).
          </p>
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: 14, marginBottom: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--g)' }}>💰 Tabela R$/kWp instalado (turnkey)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: '.85rem' }}>
              <div><strong>On-Grid</strong><div>≤4: R$ 3.100</div><div>4–8: R$ 2.900</div><div>8–15: R$ 2.700</div><div>>15: R$ 2.550</div></div>
              <div><strong>Híbrido</strong><div>≤4: R$ 4.200</div><div>4–8: R$ 3.900</div><div>8–15: R$ 3.600</div><div>>15: R$ 3.400</div></div>
              <div><strong>Off-Grid</strong><div>≤4: R$ 5.200</div><div>4–8: R$ 4.800</div><div>8–15: R$ 4.500</div><div>>15: R$ 4.200</div></div>
            </div>
          </div>
          <h4 style={{ marginBottom: 10 }}>Propostas registradas ({list.length})</h4>
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
