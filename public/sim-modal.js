/* Modal R$150 (somente on-grid / conta de luz) + faixa de preço */
(function () {
  function $(id) { return document.getElementById(id); }

  function isOffGrid() {
    // Preferência: estado interno do sim.js
    if (window.state && window.state.tipo === 'offgrid') return true;
    var tipoEl = document.querySelector('.ib-type.selected');
    var tipo = tipoEl ? (tipoEl.getAttribute('data-tipo') || '') : '';
    return tipo === 'offgrid';
  }

  window.abrirModalBaixo = function () {
    var m = $('modalBaixo');
    if (m) { m.hidden = false; document.body.style.overflow = 'hidden'; }
  };
  window.fecharModalBaixo = function () {
    var m = $('modalBaixo');
    if (m) { m.hidden = true; document.body.style.overflow = ''; }
  };
  window.sairSimulador = function () {
    fecharModalBaixo();
    try { window.location.href = '/'; } catch (e) { window.location.reload(); }
  };

  var orig = window.simular;
  window.simular = async function () {
    // Off-grid NÃO tem conta de luz — nunca exibir aviso de R$ 150
    if (isOffGrid()) {
      if (typeof orig === 'function') return orig.apply(this, arguments);
      return;
    }

    var gasto = 0;
    try {
      var raw = ($('campoGasto') && $('campoGasto').value || '').replace(/[^\d,.]/g, '');
      gasto = parseFloat(raw.replace(/\./g, '').replace(',', '.')) || parseFloat(raw.replace(',', '.')) || 0;
    } catch (e) {}
    // Só usa state.gasto se NÃO for off-grid (off-grid preenche gasto equivalente via Wh)
    if (!isOffGrid() && window.state && window.state.gasto) gasto = window.state.gasto;

    if (gasto > 0 && gasto < 150) {
      abrirModalBaixo();
      return;
    }
    if (typeof orig === 'function') return orig.apply(this, arguments);
  };

  function fmtMoney(n) {
    return 'R$ ' + Math.round(n).toLocaleString('pt-BR');
  }
  function applyFaixa() {
    var rVal = $('rValor');
    var rPb = $('rPayback');
    if (!rVal) return;
    var txt = rVal.textContent || '';
    if (txt.indexOf('Entre') === 0) return;
    var m = txt.replace(/[^\d]/g, '');
    var n = parseInt(m, 10) || 0;
    if (n > 0) {
      rVal.textContent = 'Entre ' + fmtMoney(Math.round(n * 0.9)) + ' e ' + fmtMoney(Math.round(n * 1.25));
    }
    if (rPb && rPb.textContent && rPb.textContent.indexOf('Entre') < 0) {
      var pb = parseFloat((rPb.textContent || '').replace(',', '.')) || 0;
      if (pb > 0) {
        var a = Math.max(2, Math.floor(pb * 1.6));
        var b = Math.max(a + 1, Math.ceil(pb * 2.2));
        rPb.textContent = 'Entre ' + a + ' e ' + b + ' anos';
      }
    }
  }
  var obs = new MutationObserver(function () {
    var rw = $('resultsWrap');
    if (rw && rw.classList.contains('show')) setTimeout(applyFaixa, 80);
  });
  document.addEventListener('DOMContentLoaded', function () {
    var rw = $('resultsWrap');
    if (rw) obs.observe(rw, { attributes: true, attributeFilter: ['class'] });
  });
})();
