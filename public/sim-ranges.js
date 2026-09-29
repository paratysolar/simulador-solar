/* Faixa de preco no resultado + download HTML (estilo Intelbras) */
(function () {
  function fmtMoney(n) {
    return 'R$ ' + Math.round(n).toLocaleString('pt-BR');
  }
  function enhance() {
    var r = window.__psr;
    if (!r) return;
    var el = document.getElementById('rValor');
    if (el && r.custoMin != null && r.custoMax != null) {
      el.textContent = 'Entre ' + fmtMoney(r.custoMin) + ' e ' + fmtMoney(r.custoMax);
    }
    var pb = document.getElementById('rPayback');
    if (pb && r.payback) pb.textContent = r.payback;
  }
  var _show = window.showResults;
  // Hook apos simular
  var obs = new MutationObserver(function () {
    if (document.getElementById('resultsWrap') && document.getElementById('resultsWrap').classList.contains('show')) {
      setTimeout(enhance, 50);
    }
  });
  var rw = document.getElementById('resultsWrap');
  if (rw) obs.observe(rw, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(enhance, 300);
  });
  // Baixar simulacao como HTML (nao texto)
  var origBaixar = window.baixarSimulacao;
  window.baixarSimulacao = function () {
    var r = window.__psr || (window.state && window.state.lastResult);
    if (!r) {
      if (typeof origBaixar === 'function') return origBaixar();
      return;
    }
    var nome = (document.getElementById('campoNome') && document.getElementById('campoNome').value) || 'Cliente';
    var local = (window.state && window.state.local) || '—';
    var hoje = new Date().toLocaleDateString('pt-BR');
    var cMin = r.custoMin != null ? r.custoMin : Math.round((r.custo || 0) * 0.9);
    var cMax = r.custoMax != null ? r.custoMax : Math.round((r.custo || 0) * 1.25);
    var vt = 'Entre ' + fmtMoney(cMin) + ' e ' + fmtMoney(cMax);
    var pb = r.payback || '—';
    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Simulação — Paraty Solar</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#f5f7fa;color:#1a2332}.header{background:linear-gradient(135deg,#0d7a3f,#0a5c2e);color:#fff;padding:28px 24px}.header h1{font-size:1.3rem}.sub{opacity:.9;font-size:.9rem;margin-top:4px}.card{max-width:700px;margin:24px auto;background:#fff;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.08);padding:28px}h2{text-align:center;margin-bottom:22px}.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}@media(max-width:560px){.grid{grid-template-columns:1fr}}.m{text-align:center;padding:14px 8px;border:1px solid #e8eef3;border-radius:10px;background:#fafbfc}.m .l{font-size:.7rem;color:#64748b;text-transform:uppercase;margin-bottom:4px}.m .v{font-size:1rem;font-weight:700;color:#0d7a3f}.note{margin-top:22px;padding:14px;background:#f0fdf4;border-left:4px solid #0d7a3f;border-radius:0 8px 8px 0;font-size:.85rem}.fine{margin-top:16px;font-size:.7rem;color:#94a3b8;text-align:center}.footer{background:#0a5c2e;color:#fff;padding:14px;text-align:center;font-size:.8rem}</style></head><body><div class="header"><h1>Simulador de Energia Solar</h1><div class="sub">Resultado em ' + hoje + '</div></div><div class="card"><h2>Resultado</h2><div class="grid"><div class="m"><div class="l">Potência instalada*</div><div class="v">' + (r.kwp || 0).toFixed(2).replace('.', ',') + ' kWp</div></div><div class="m"><div class="l">Área mínima*</div><div class="v">' + (r.area || 0) + ' m²</div></div><div class="m"><div class="l">Valor aproximado*</div><div class="v">' + vt + '</div></div><div class="m"><div class="l">Produção mensal*</div><div class="v">' + Number(r.geracaoMes || 0).toLocaleString('pt-BR') + ' kWh/mês</div></div><div class="m"><div class="l">Economia anual*</div><div class="v">' + fmtMoney(r.economiaAno || 0) + '</div></div><div class="m"><div class="l">Retorno do investimento*</div><div class="v">' + pb + '</div></div></div><div class="note"><strong>Cliente:</strong> ' + nome + '<br/><strong>Local:</strong> ' + local + '<br/><br/>Você pode adquirir seu sistema com a Paraty Solar à vista ou em parcelas.</div><p class="fine">*Valores aproximados. Variáveis como telhado, clima e estrutura podem alterar o valor final.</p></div><div class="footer">Paraty Solar · Costa Verde – RJ</div><script>setTimeout(function(){window.print()},400)<\/script></body></html>';
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'simulacao-paraty-solar.html';
    a.click();
    URL.revokeObjectURL(a.href);
  };
})();
