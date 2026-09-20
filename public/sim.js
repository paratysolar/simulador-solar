/* Simulador Solar público — captura de leads. Sem qualquer referência ao CRM. */
let currentMode = null;
let ofLoads = [];
let lastResults = {};
let captchaA = 0, captchaB = 0;

const HSP_UF = {
  AC:4.6,AL:5.4,AP:4.8,AM:4.5,BA:5.5,CE:5.6,DF:5.2,ES:4.9,
  GO:5.3,MA:5.4,MT:5.2,MS:5.1,MG:5.0,PA:4.7,PB:5.5,PR:4.6,
  PE:5.5,PI:5.5,RJ:4.7,RN:5.6,RS:4.5,RO:4.8,RR:4.6,SC:4.4,
  SP:4.8,SE:5.4,TO:5.3
};

function formatBRL(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}
function formatCep(el) {
  let v = el.value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
  el.value = v;
}
function formatPhone(el) {
  let v = el.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10) v = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
  else if (v.length > 6) v = '(' + v.slice(0,2) + ') ' + v.slice(2,6) + '-' + v.slice(6);
  else if (v.length > 2) v = '(' + v.slice(0,2) + ') ' + v.slice(2);
  el.value = v;
}
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 3500);
}
function selectMode(mode) {
  currentMode = mode;
  document.getElementById('modeSelect').style.display = 'none';
  document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
  document.getElementById('panel-' + mode).classList.add('active');
  refreshCaptcha(mode === 'ongrid' ? 'og' : mode === 'offgrid' ? 'of' : mode === 'hibrido' ? 'hi' : 'roi');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function backToModes() {
  document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
  document.getElementById('modeSelect').style.display = 'block';
  currentMode = null;
}
function refreshCaptcha(prefix) {
  captchaA = 3 + Math.floor(Math.random() * 9);
  captchaB = 2 + Math.floor(Math.random() * 8);
  var el = document.getElementById(prefix + '-captcha-q');
  var ans = document.getElementById(prefix + '-captcha');
  if (el) el.textContent = captchaA + ' + ' + captchaB + ' = ?';
  if (ans) ans.value = '';
  window['captchaExpected_' + prefix] = captchaA + captchaB;
  window['formStarted_' + prefix] = Date.now();
}
async function buscarCep(cepRaw, prefix) {
  var cep = String(cepRaw || '').replace(/\D/g, '');
  var status = document.getElementById(prefix + '-cep-status');
  var cidade = document.getElementById(prefix + '-cidade');
  var logradouro = document.getElementById(prefix + '-logradouro');
  var bairro = document.getElementById(prefix + '-bairro');
  var uf = document.getElementById(prefix + '-uf');
  if (cep.length !== 8) {
    if (status) { status.textContent = ''; status.className = 'cep-status'; }
    return;
  }
  if (status) { status.textContent = 'Buscando endereço...'; status.className = 'cep-status'; }
  try {
    var res = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
    var data = await res.json();
    if (data.erro) {
      if (status) { status.textContent = 'CEP não encontrado'; status.className = 'cep-status err'; }
      return;
    }
    if (cidade) cidade.value = data.localidade || '';
    if (uf) uf.value = data.uf || '';
    if (logradouro) logradouro.value = data.logradouro || '';
    if (bairro) bairro.value = data.bairro || '';
    if (status) {
      status.textContent = '✓ ' + (data.logradouro || data.localidade) + (data.bairro ? ' — ' + data.bairro : '');
      status.className = 'cep-status ok';
    }
    var hspEl = document.getElementById(prefix + '-hsp');
    if (hspEl && HSP_UF[data.uf]) hspEl.value = HSP_UF[data.uf];
  } catch (e) {
    if (status) { status.textContent = 'Erro ao consultar CEP. Tente novamente.'; status.className = 'cep-status err'; }
  }
}
function getLeadFields(prefix) {
  return {
    nome: (document.getElementById(prefix + '-nome') || {}).value || '',
    celular: (document.getElementById(prefix + '-celular') || {}).value || '',
    cep: (document.getElementById(prefix + '-cep') || {}).value || '',
    logradouro: (document.getElementById(prefix + '-logradouro') || {}).value || '',
    numero: (document.getElementById(prefix + '-numero') || {}).value || '',
    complemento: (document.getElementById(prefix + '-complemento') || {}).value || '',
    bairro: (document.getElementById(prefix + '-bairro') || {}).value || '',
    cidade: (document.getElementById(prefix + '-cidade') || {}).value || '',
    uf: (document.getElementById(prefix + '-uf') || {}).value || '',
    captcha: (document.getElementById(prefix + '-captcha') || {}).value || '',
    website: (document.getElementById(prefix + '-website') || {}).value || '',
  };
}
function validateLead(prefix) {
  var f = getLeadFields(prefix);
  var phoneDigits = f.celular.replace(/\D/g, '');
  var cepDigits = f.cep.replace(/\D/g, '');
  var expected = window['captchaExpected_' + prefix];
  var started = window['formStarted_' + prefix] || 0;
  var errors = [];
  if (!f.nome || f.nome.trim().length < 3) errors.push('Informe o nome completo');
  if (phoneDigits.length < 10 || phoneDigits.length > 11) errors.push('Celular inválido (DDD + número)');
  if (cepDigits.length !== 8) errors.push('CEP inválido');
  if (!f.logradouro || f.logradouro.trim().length < 2) errors.push('Informe a rua (preencha o CEP)');
  if (!f.numero || !String(f.numero).trim()) errors.push('Informe o número do endereço');
  if (!f.cidade || !f.uf) errors.push('Cidade/UF obrigatórios (via CEP)');
  if (f.website) errors.push('Falha na verificação');
  if (String(f.captcha).trim() === '' || Number(f.captcha) !== Number(expected)) errors.push('Resolva a verificação anti-robô corretamente');
  if (started && Date.now() - started < 2500) errors.push('Aguarde um instante e tente novamente');
  return { ok: errors.length === 0, errors: errors, fields: f };
}
function calcularOnGrid() {
  var v = validateLead('og');
  if (!v.ok) { showToast(v.errors[0]); return; }
  var gasto = parseFloat(document.getElementById('og-gasto').value) || 0;
  var tarifa = parseFloat(document.getElementById('og-tarifa').value) || 0.95;
  var uf = v.fields.uf || 'SP';
  var hsp = HSP_UF[uf] || 4.8;
  var kwhMes = gasto / tarifa;
  var kwhDia = (kwhMes * 0.92) / 30;
  var kwp = kwhDia / (hsp * 0.78);
  var area = kwp * 6.5;
  var custo = kwp * 5100;
  var geracaoMes = kwp * hsp * 30 * 0.78;
  var economiaAno = geracaoMes * 12 * tarifa * 0.95;
  var payback = economiaAno > 0 ? custo / economiaAno : 0;
  document.getElementById('og-kwp').textContent = kwp.toFixed(2);
  document.getElementById('og-area').textContent = Math.ceil(area);
  document.getElementById('og-custo').textContent = formatBRL(custo);
  document.getElementById('og-geracao').textContent = Math.round(geracaoMes);
  document.getElementById('og-economia').textContent = formatBRL(economiaAno);
  document.getElementById('og-payback').textContent = payback.toFixed(1);
  document.getElementById('og-local-info').textContent = v.fields.cidade + ' / ' + uf + ' · HSP ' + hsp + ' h';
  document.getElementById('og-results').style.display = 'block';
  lastResults = {
    mode: 'ongrid', source: 'simulador',
    nome: v.fields.nome.trim(), contato: v.fields.celular, telefone: v.fields.celular.replace(/\D/g, ''),
    cep: v.fields.cep, logradouro: v.fields.logradouro, numero: v.fields.numero,
    complemento: v.fields.complemento, bairro: v.fields.bairro, cidade: v.fields.cidade, uf: v.fields.uf,
    endereco: [v.fields.logradouro, v.fields.numero, v.fields.complemento, v.fields.bairro, v.fields.cidade, v.fields.uf].filter(Boolean).join(', '),
    gasto: gasto, tarifa: tarifa, kwp: +kwp.toFixed(2), area: Math.ceil(area),
    custo: Math.round(custo), geracaoMes: Math.round(geracaoMes),
    economiaAno: Math.round(economiaAno), payback: +payback.toFixed(1),
    humanVerified: true, captchaOk: true, ts: new Date().toISOString()
  };
  capturarLead('ongrid');
}
function addLoad() {
  var desc = document.getElementById('of-desc').value.trim() || 'Equipamento';
  var w = parseFloat(document.getElementById('of-watts').value) || 0;
  var h = parseFloat(document.getElementById('of-horas').value) || 0;
  if (w <= 0) return;
  ofLoads.push({ desc: desc, w: w, h: h, wh: w * h });
  renderLoads();
  document.getElementById('of-desc').value = '';
}
function renderLoads() {
  var box = document.getElementById('of-loads');
  if (!box) return;
  box.innerHTML = ofLoads.map(function (l, i) {
    return '<div class="load-item">' + l.desc + ' · ' + l.w + 'W × ' + l.h + 'h = ' + Math.round(l.wh) + ' Wh <button type="button" onclick="ofLoads.splice(' + i + ',1);renderLoads()">✕</button></div>';
  }).join('');
}
function calcularOffGrid() {
  var v = validateLead('of');
  if (!v.ok) { showToast(v.errors[0]); return; }
  var whDia = ofLoads.reduce(function (s, l) { return s + l.wh; }, 0);
  if (whDia <= 0) { showToast('Adicione pelo menos uma carga'); return; }
  var uf = v.fields.uf || 'SP';
  var hsp = HSP_UF[uf] || 4.8;
  var diasAut = parseFloat(document.getElementById('of-autonomia').value) || 2;
  var kwp = (whDia / 1000) / (hsp * 0.7);
  var batKwh = (whDia * diasAut) / 1000 / 0.5;
  var custo = kwp * 6200 + batKwh * 1800;
  document.getElementById('of-kwp').textContent = kwp.toFixed(2);
  document.getElementById('of-bat').textContent = batKwh.toFixed(1);
  document.getElementById('of-custo').textContent = formatBRL(custo);
  document.getElementById('of-results').style.display = 'block';
  lastResults = {
    mode: 'offgrid', source: 'simulador',
    nome: v.fields.nome.trim(), contato: v.fields.celular, telefone: v.fields.celular.replace(/\D/g, ''),
    cep: v.fields.cep, logradouro: v.fields.logradouro, numero: v.fields.numero,
    complemento: v.fields.complemento, bairro: v.fields.bairro, cidade: v.fields.cidade, uf: v.fields.uf,
    endereco: [v.fields.logradouro, v.fields.numero, v.fields.bairro, v.fields.cidade, v.fields.uf].filter(Boolean).join(', '),
    whDia: Math.round(whDia), kwp: +kwp.toFixed(2), batKwh: +batKwh.toFixed(1), custo: Math.round(custo),
    humanVerified: true, captchaOk: true, ts: new Date().toISOString()
  };
  capturarLead('offgrid');
}
function calcularHibrido() {
  var v = validateLead('hi');
  if (!v.ok) { showToast(v.errors[0]); return; }
  var gasto = parseFloat(document.getElementById('hi-gasto').value) || 0;
  var tarifa = parseFloat(document.getElementById('hi-tarifa').value) || 0.95;
  var backup = parseFloat(document.getElementById('hi-backup').value) || 5;
  var uf = v.fields.uf || 'SP';
  var hsp = HSP_UF[uf] || 4.8;
  var kwhMes = gasto / tarifa;
  var kwp = ((kwhMes * 0.92) / 30) / (hsp * 0.78);
  var batKwh = backup;
  var custo = kwp * 5400 + batKwh * 2000;
  var economiaAno = kwp * hsp * 30 * 0.78 * 12 * tarifa * 0.9;
  document.getElementById('hi-kwp').textContent = kwp.toFixed(2);
  document.getElementById('hi-bat').textContent = batKwh.toFixed(1);
  document.getElementById('hi-custo').textContent = formatBRL(custo);
  document.getElementById('hi-economia').textContent = formatBRL(economiaAno);
  document.getElementById('hi-results').style.display = 'block';
  lastResults = {
    mode: 'hibrido', source: 'simulador',
    nome: v.fields.nome.trim(), contato: v.fields.celular, telefone: v.fields.celular.replace(/\D/g, ''),
    cep: v.fields.cep, logradouro: v.fields.logradouro, numero: v.fields.numero,
    complemento: v.fields.complemento, bairro: v.fields.bairro, cidade: v.fields.cidade, uf: v.fields.uf,
    endereco: [v.fields.logradouro, v.fields.numero, v.fields.bairro, v.fields.cidade, v.fields.uf].filter(Boolean).join(', '),
    gasto: gasto, kwp: +kwp.toFixed(2), batKwh: batKwh, custo: Math.round(custo), economiaAno: Math.round(economiaAno),
    humanVerified: true, captchaOk: true, ts: new Date().toISOString()
  };
  capturarLead('hibrido');
}
function calcularROI() {
  var v = validateLead('roi');
  if (!v.ok) { showToast(v.errors[0]); return; }
  var inv = parseFloat(document.getElementById('roi-investimento').value) || 0;
  var eco = parseFloat(document.getElementById('roi-economia').value) || 0;
  var anos = parseFloat(document.getElementById('roi-anos').value) || 25;
  var manut = parseFloat(document.getElementById('roi-manutencao').value) || 1;
  var deg = parseFloat(document.getElementById('roi-degradacao').value) || 0.7;
  var totalEco = 0;
  for (var y = 0; y < anos; y++) totalEco += eco * Math.pow(1 - deg / 100, y);
  var manutTotal = inv * (manut / 100) * anos;
  var liquido = totalEco - manutTotal - inv;
  var payback = eco > 0 ? inv / eco : 0;
  var roi = inv > 0 ? (liquido / inv) * 100 : 0;
  document.getElementById('roi-payback').textContent = payback.toFixed(1);
  document.getElementById('roi-total').textContent = formatBRL(totalEco);
  document.getElementById('roi-liquido').textContent = formatBRL(liquido);
  document.getElementById('roi-pct').textContent = roi.toFixed(0) + '%';
  document.getElementById('roi-results').style.display = 'block';
  lastResults = {
    mode: 'roi', source: 'simulador',
    nome: v.fields.nome.trim(), contato: v.fields.celular, telefone: v.fields.celular.replace(/\D/g, ''),
    cep: v.fields.cep, logradouro: v.fields.logradouro, numero: v.fields.numero,
    complemento: v.fields.complemento, bairro: v.fields.bairro, cidade: v.fields.cidade, uf: v.fields.uf,
    endereco: [v.fields.logradouro, v.fields.numero, v.fields.bairro, v.fields.cidade, v.fields.uf].filter(Boolean).join(', '),
    investimento: inv, economiaAno: eco, anos: anos, roi: +roi.toFixed(0), payback: +payback.toFixed(1),
    humanVerified: true, captchaOk: true, ts: new Date().toISOString()
  };
  capturarLead('roi');
}
async function capturarLead(mode) {
  if (!lastResults || lastResults.mode !== mode) {
    showToast('Preencha os dados e calcule novamente');
    return;
  }
  if (!lastResults.nome || !lastResults.telefone || !lastResults.humanVerified) {
    showToast('Dados de contato incompletos');
    return;
  }
  showToast('Enviando sua simulação...');
  try {
    var res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lastResults)
    });
    var data = await res.json();
    if (data.ok) {
      showToast('✓ Recebemos seus dados! Em breve entraremos em contato.');
      var btn = document.getElementById((mode === 'ongrid' ? 'og' : mode === 'offgrid' ? 'of' : mode === 'hibrido' ? 'hi' : 'roi') + '-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Solicitação enviada'; }
    } else {
      showToast(data.error || 'Não foi possível enviar. Tente de novo.');
    }
  } catch (err) {
    showToast('Falha de conexão. Verifique a internet e tente novamente.');
  }
}
document.addEventListener('DOMContentLoaded', function () {
  ['og', 'of', 'hi', 'roi'].forEach(refreshCaptcha);
});
