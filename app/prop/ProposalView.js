'use client';
import { PHOTOS, fmt, fmtDec, ChartGeracao, ChartRetorno, TopBar } from './prop-helpers';

export default function ProposalView({ r, contaCom, parcela72, parcela60, parcela48, parcela10, lucro15, paybackTxt, onClose }) {
  if (!r) return null;
  return (
    <div id="proposta" className="proposta">
            <div className="toolbar no-print">
              <button className="btn" onClick={() => window.print()}>🖨 Imprimir / Salvar PDF</button>
              <button className="btn-out" onClick={() => onClose?.()}>Nova proposta</button>
            </div>
            {/* ========== PÁGINA 1 — CAPA ========== */}
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
                  <div className="cover-logo-name">Paraty <span>S<span className="accent">o</span>lar</span></div>
                  <div className="cover-logo-sub">Energia Solar · Paraty – RJ</div>
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
            {/* ========== PÁGINA 2 — INTRO ========== */}
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
            {/* ========== PÁGINA 3 — COMO FUNCIONA O INVESTIMENTO ========== */}
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
                    <div className="way-price" style={{ fontSize: '1.05rem', lineHeight: 1.35 }}>
                      Entre {fmtDec(r.total_min || Math.round((r.total || 0) * 0.9))} e {fmtDec(r.total_max || Math.round((r.total || 0) * 1.25))}
                    </div>
                    <p className="way-note">
                      Valor aproximado do sistema com instalação*. Aqui você não paga <strong>NENHUM JUROS</strong> e tem ótimo retorno sobre o investimento.
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
            {/* ========== PÁGINA 4 — DIMENSIONAMENTO ========== */}
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
                    <tr className="inv-row">
                      <td>Investimento aproximado*</td>
                      <td>
                        Entre {fmtDec(r.total_min || Math.round((r.total || 0) * 0.9))} e {fmtDec(r.total_max || Math.round((r.total || 0) * 1.25))}
                      </td>
                    </tr>
                    <tr>
                      <td>Prazo de entrega</td>
                      <td>Créditos sendo gerados em 90 (noventa) dias corridos, a contar do dia de fechamento do pedido.</td>
                    </tr>
                    <tr>
                      <td>Garantia</td>
                      <td>
                        25 anos de garantia de performance para os módulos;<br />
                        15 anos de garantia de fabricação para os módulos;<br />
                        10 anos de garantia para os inversores;<br />
                        Suporte gratuito Intelbras vitalício.
                      </td>
                    </tr>
                    <tr>
                      <td>Validade da proposta</td>
                      <td>15 (quinze) dias corridos a partir da data de emissão da proposta comercial.</td>
                    </tr>
                  </tbody>
                </table>
                <p className="fine-print">
                  Importante! O valor da parcela é baseado em uma taxa média, porém o Programa de Financiamentos passa por análise de critério interno e de forma independente e estão sujeitos à análise e aprovação de crédito e cadastro. Valores aproximados sujeitos a variáveis de telhado, estrutura e condições climáticas.
                </p>
                <div className="page-num">4</div>
              </div>
            </div>
            {/* ========== PÁGINA 5 — ROI ========== */}
            <div className="page">
              <div className="page-inner">
                <TopBar />
                <h3 className="title-blue" style={{ marginTop: 0, fontStyle: 'italic' }}>Retorno de Investimento</h3>
                <p className="body">
                  Neste caso, considerando a economia gerada pelo KIT solar, e aumento da fatura de energia elétrica em 10,00% a.a.,
                  o <strong>RETORNO DO INVESTIMENTO</strong> (payback aproximado) se dá em <strong>{paybackTxt}</strong>,
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
            {/* ========== PÁGINA 6 — PORTFÓLIO ========== */}
            <div className="page">
              <div className="page-inner">
                <TopBar />
                <h3 className="title-blue" style={{ marginTop: 0, fontStyle: 'italic' }}>Alguns de Nossos Projetos Instalados</h3>
                <div className="port-grid">
                  {PHOTOS.portfolio.map((p, i) => (
                    <div key={i} className="port-card">
                      <img src={p.src} alt={p.seg} loading="lazy" />
                      <div className="cap">
                        <strong>Segmento: {p.seg}</strong>
                        Cidade: {p.cid}<br />
                        Número de Módulos: {p.mods}<br />
                        Energia Gerada: {p.gen}<br />
                        Economia Mensal: {p.econ}
                      </div>
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
            {/* ========== PÁGINA 7 — FINAIS ========== */}
            <div className="page">
              <div className="page-inner">
                <TopBar />
                <h3 className="title-blue" style={{ marginTop: 0, fontStyle: 'italic' }}>Considerações Finais</h3>
                <p className="body">
                  O sistema ora proposto foi dimensionado mediante a uma estimativa de consumo, entretanto o kit é passível de expansão e adaptável às necessidades específicas do perfil do cliente.
                </p>
                <ul className="notes-list">
                  <li>{r.notes?.lei || 'Dimensionamento alinhado à Lei 14.300/22 e REN ANEEL.'}</li>
                  <li>15 anos de garantia de fabricação das placas / 25 anos de performance.</li>
                  <li>10 anos de garantia dos inversores.</li>
                  <li>Suporte gratuito Intelbras vitalício incluso.</li>
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
  );
}
