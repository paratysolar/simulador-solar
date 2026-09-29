/* Modal R$150 + intercept simular */
(function () {
  function $(id) { return document.getElementById(id); }
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
    var gasto = 0;
    try {
      var raw = ($('campoGasto') && $('campoGasto').value || '').replace(/[^\d,.]/g, '');
      gasto = parseFloat(raw.replace(/\./g, '').replace(',', '.')) || parseFloat(raw.replace(',', '.')) || 0;
    } catch (e) {}
    if (window.state && window.state.gasto) gasto = window.state.gasto;
    var tipoEl = document.querySelector('.ib-type.selected');
    var tipo = tipoEl ? (tipoEl.getAttribute('data-tipo') || '') : '';
    if (tipo !== 'offgrid' && gasto > 0 && gasto < 150) {
      abrirModalBaixo();
      return;
    }
    if (typeof orig === 'function') return orig.apply(this, arguments);
  };
})();
