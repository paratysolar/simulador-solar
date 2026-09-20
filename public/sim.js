let currentMode = null;
let ofLoads = [];
let lastResults = {};

const HSP_UF = {
  AC:4.6,AL:5.4,AP:4.8,AM:4.5,BA:5.5,CE:5.6,DF:5.2,ES:4.9,
  GO:5.3,MA:5.4,MT:5.2,MS:5.1,MG:5.0,PA:4.7,PB:5.5,PR:4.6,
  PE:5.5,PI:5.5,RJ:4.7,RN:5.6,RS:4.5,RO:4.8,RR:4.6,SC:4.4,
  SP:4.8,SE:5.4,TO:5.3
};

function formatBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}
function formatCep(el) {
  let v = el.value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
  el.value = v;
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 3200);
}
function selectMode(mode) {
  currentMode = mode;
  document.getElementById('modeSelect').style.display = 'none';
  document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
  document.getElementById('panel-' + mode).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function backToModes() {
  document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
  document.getElementById('modeSelect').style.display = 'block';
  currentMode = null;
}

async function buscarCep(cepRaw, prefix) {
  var cep = cepRaw.replace(/\D/g, '');
  var status = document.getElementById(prefix + '-cep-status');
  var cidade = document.getElementById(prefix + '-cidade');
  if (cep.length !== 8) {
    status.textContent = '';
    status.className = 'cep-status';
    return;
  }
  status.textContent = 'Buscando...';
  status.className = 'cep-status';
  try {
    var res = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
    var data = await res.json();
    if (data.erro) {
      status.textContent = 'CEP nao encontrado';
      status.className = 'cep-status err';
      cidade.value = '';
      return;
    }
    cidade.value = data.localidade + ' / ' + data.uf;
    status.textContent = 'OK ' + (data.bairro || data.localidade);
    status.className = 'cep-status ok';
    var hspEl = document.getElementById(prefix + '-hsp');
    if (hspEl && HSP_UF[data.uf]) hspEl.value = HSP_UF[data.uf];
  } catch (e) {
    status.textContent = 'Erro ao consultar CEP';
    status.className = 'cep-status err';
  }
}

['og', 'of', 'hi', 'roi'].forEach(function (prefix) {
  var cb = document.getElementById(prefix + '-human');
  var btn = document.getElementById(prefix + '-btn');
  if (cb && btn) {
    cb.addEventListener('change', function () {
      btn.disabled = !cb.checked;
    });
  }
});

function calcularOnGrid() {
  var gasto = parseFloat(document.getElementById('og-gasto').value) || 0;
  var tarifa = parseFloat(document.getElementById('og-tarifa').value) || 0.95;
  var cidade = document.getElementById('og-cidade').value;
  var uf = (cidade.split('/').pop() || 'SP').trim();
  var hsp = HSP_UF[uf] || 4.8;
  var kwhMes = gasto / tarifa;
  var kwhDia = (kwhMes * 0.92) / 30;
  var kwp = kwhDia / (hsp * 0.78);
  var area = kwp * 6.5;
  var custo = kwp * 5100;
  var geracaoMes = kwp * hsp * 30 * 0.78;
  var economiaAno = geracaoMes * 12 * tarifa * 0.95;
  var payback = custo / economiaAno;
  document.getElementById('og-kwp').textContent = kwp.toFixed(2);
  document.getElementById('og-area').textContent = Math.ceil(area);
  document.getElementById('og-custo').textContent = formatBRL(custo);
  document.getElementById('og-geracao').textContent = Math.round(geracaoMes);
  document.getElementById('og-economia').textContent = formatBRL(economiaAno);
  document.getElementById('og-payback').textContent = payback.toFixed(1);
  document.getElementById('og-local-info').textContent = cidade
    ? ('Local: ' + cidade + ' | HSP medio: ' + hsp + ' h')
    : ('HSP medio usado: ' + hsp + ' h');
  document.getElementById('og-results').style.display = 'block';
  lastResults = {
    mode: 'ongrid',
    tipo: document.getElementById('og-tipo').value,
    cep: document.getElementById('og-cep').value,
    cidade: cidade,
    gasto: gasto, tarifa: tarifa,
    kwp: +kwp.toFixed(2), area: Math.ceil(area),
    custo: Math.round(custo), geracaoMes: Math.round(geracaoMes),
    economiaAno: Math.round(economiaAno), payback: +payback.toFixed(1),
    nome: document.getElementById('og-nome').value,
    contato: document.getElementById('og-contato').value,
    ts: new Date().toISOString()
  };
}

function addLoad() {
  var desc = document.getElementById('of-desc').value.trim() || 'Equipamento';
  var pot = parseFloat(document.getElementById('of-pot').value) || 0;
  var qtd = parseInt(document.getElementById('of-qtd').value, 10) || 1;
  var horas = parseFloat(document.getElementById('of-horas').value) || 0;
  if (pot <= 0) return;
  ofLoads.push({ desc: desc, pot: pot, qtd: qtd, horas: horas, wh: pot * qtd * horas });
  document.getElementById('of-desc').value = '';
  document.getElementById('of-pot').value = '';
  renderLoads();
}
function removeLoad(i) {
  ofLoads.splice(i, 1);
  renderLoads();
}
function renderLoads() {
  var body = document.getElementById('of-loads-body');
  body.innerHTML = ofLoads.map(function (l, i) {
    return '<tr><td>' + l.desc + '</td><td>' + l.pot + '</td><td>' + l.qtd + '</td><td>' +
      l.horas + '</td><td>' + Math.round(l.wh) + '</td><td><button class="remove-btn" onclick="removeLoad(' +
      i + ')">x</button></td></tr>';
  }).join('');
  var total = ofLoads.reduce(function (s, l) { return s + l.wh; }, 0);
  document.getElementById('of-total-wh').textContent = Math.round(total);
}

function calcularOffGrid() {
  var totalWh = ofLoads.reduce(function (s, l) { return s + l.wh; }, 0);
  if (totalWh <= 0) { showToast('Adicione pelo menos uma carga'); return; }
  var autonomia = parseFloat(document.getElementById('of-autonomia').value) || 2;
  var batType = document.getElementById('of-bateria').value;
  var dod = batType === 'lfp' ? 0.80 : 0.50;
  var tensao = parseFloat(document.getElementById('of-tensao').value) || 24;
  var hsp = parseFloat(document.getElementById('of-hsp').value) || 4.8;
  var energiaNecessaria = totalWh * autonomia * 1.25;
  var ah = energiaNecessaria / (tensao * dod);
  var kwp = (totalWh * 1.2) / (hsp * 1000 * 0.75);
  var potSimultanea = ofLoads.reduce(function (s, l) { return s + l.pot * l.qtd; }, 0);
  var inv = Math.ceil(potSimultanea * 1.5 / 500) * 500;
  var custo = kwp * 14000 + (ah * tensao / 1000) * 1800;
  document.getElementById('of-r-consumo').textContent = Math.round(totalWh);
  document.getElementById('of-r-ah').textContent = Math.ceil(ah);
  document.getElementById('of-r-kwp').textContent = kwp.toFixed(2);
  document.getElementById('of-r-inv').textContent = inv;
  document.getElementById('of-r-custo').textContent = formatBRL(custo);
  document.getElementById('of-results').style.display = 'block';
  lastResults = {
    mode: 'offgrid',
    cep: document.getElementById('of-cep').value,
    cidade: document.getElementById('of-cidade').value,
    loads: ofLoads, totalWh: Math.round(totalWh),
    autonomia: autonomia, batType: batType, tensao: tensao, hsp: hsp,
    ah: Math.ceil(ah), kwp: +kwp.toFixed(2), inv: inv, custo: Math.round(custo),
    contato: document.getElementById('of-contato').value,
    ts: new Date().toISOString()
  };
}

function calcularHibrido() {
  var gasto = parseFloat(document.getElementById('hi-gasto').value) || 0;
  var tarifa = parseFloat(document.getElementById('hi-tarifa').value) || 0.95;
  var backupH = parseFloat(document.getElementById('hi-backup').value) || 6;
  var cargasW = parseFloat(document.getElementById('hi-cargas').value) || 2000;
  var cidade = document.getElementById('hi-cidade').value;
  var uf = (cidade.split('/').pop() || 'SP').trim();
  var hsp = HSP_UF[uf] || 4.8;
  var kwhMes = gasto / tarifa;
  var kwhDia = (kwhMes * 0.90) / 30;
  var kwp = kwhDia / (hsp * 0.78);
  var batKwh = (cargasW * backupH / 1000) / 0.85;
  var custo = kwp * 5200 + batKwh * 2200 + 3500;
  var geracaoMes = kwp * hsp * 30 * 0.78;
  var economiaAno = geracaoMes * 12 * tarifa * 0.92;
  var payback = custo / economiaAno;
  document.getElementById('hi-kwp').textContent = kwp.toFixed(2);
  document.getElementById('hi-bat').textContent = batKwh.toFixed(1);
  document.getElementById('hi-custo').textContent = formatBRL(custo);
  document.getElementById('hi-economia').textContent = formatBRL(economiaAno);
  document.getElementById('hi-payback').textContent = payback.toFixed(1);
  document.getElementById('hi-results').style.display = 'block';
  lastResults = {
    mode: 'hibrido',
    cep: document.getElementById('hi-cep').value,
    cidade: cidade, gasto: gasto, tarifa: tarifa, backupH: backupH, cargasW: cargasW,
    kwp: +kwp.toFixed(2), batKwh: +batKwh.toFixed(1),
    custo: Math.round(custo), economiaAno: Math.round(economiaAno),
    payback: +payback.toFixed(1),
    contato: document.getElementById('hi-contato').value,
    ts: new Date().toISOString()
  };
}

function calcularROI() {
  var investimento = parseFloat(document.getElementById('roi-investimento').value) || 0;
  var economiaAnual = parseFloat(document.getElementById('roi-economia').value) || 0;
  var anos = parseFloat(document.getElementById('roi-anos').value) || 25;
  var manutencao = parseFloat(document.getElementById('roi-manutencao').value) || 0;
  var degradacao = parseFloat(document.getElementById('roi-degradacao').value) || 0.5;
  var fatorMedio = 1 - (degradacao / 100) * (anos / 2);
  var economiaBruta = economiaAnual * anos * fatorMedio;
  var economiaLiquida = economiaBruta - manutencao;
  var roi = investimento > 0 ? ((economiaLiquida - investimento) / investimento) * 100 : 0;
  var payback = economiaAnual > 0 ? investimento / economiaAnual : 0;
  document.getElementById('roi-result').textContent = roi.toFixed(0) + '%';
  document.getElementById('roi-payback').textContent = payback.toFixed(1) + ' anos';
  document.getElementById('roi-economia-total').textContent = formatBRL(economiaLiquida);
  document.getElementById('roi-results').style.display = 'block';
  lastResults = {
    mode: 'roi',
    investimento: investimento, economiaAnual: economiaAnual, anos: anos,
    manutencao: manutencao, degradacao: degradacao,
    roi: +roi.toFixed(0), payback: +payback.toFixed(1),
    economiaLiquida: Math.round(economiaLiquida),
    ts: new Date().toISOString()
  };
}

['roi-investimento', 'roi-economia', 'roi-anos', 'roi-manutencao', 'roi-degradacao'].forEach(function (id) {
  var el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', function () {
      if (document.getElementById('roi-human').checked) calcularROI();
    });
  }
});

async function capturarLead(mode) {
  if (!lastResults || lastResults.mode !== mode) {
    showToast('Calcule primeiro para gerar o lead');
    return;
  }
  try {
    var leads = JSON.parse(localStorage.getItem('simulador_leads') || '[]');
    leads.push(lastResults);
    localStorage.setItem('simulador_leads', JSON.stringify(leads));
  } catch (e) {}
  showToast('Enviando lead...');
  try {
    var res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lastResults)
    });
    var data = await res.json();
    if (data.ok && data.saved) showToast('Lead salvo no banco (Vercel) OK');
    else if (data.ok) showToast('Lead registrado (fallback)');
    else showToast('Erro: ' + (data.error || 'falha'));
  } catch (err) {
    console.error(err);
    showToast('Falha de rede. Lead ficou no navegador.');
  }
}

console.log('Simulador Solar OK. API /api/leads | CRM /crm');
