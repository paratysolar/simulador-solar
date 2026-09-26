/* Simulador estilo Intelbras — layout da foto */
(function () {
  'use strict';

  const state = {
    tipo: '',
    local: '',
    cidade: '',
    uf: '',
    cep: '',
    gasto: 0,
    captchaN1: 0,
    captchaN2: 0,
    captchaSum: 0,
    lastResult: null,
    equipamentos: [],
    whDia: 0,
    dimensao: null,
  };

  const HSP = {
    AC: 4.5, AL: 5.2, AP: 4.6, AM: 4.4, BA: 5.4, CE: 5.5, DF: 5.2, ES: 4.8,
    GO: 5.3, MA: 5.1, MT: 5.2, MS: 5.1, MG: 5.0, PA: 4.7, PB: 5.4, PR: 4.6,
    PE: 5.3, PI: 5.4, RJ: 4.5, RN: 5.5, RS: 4.5, RO: 4.8, RR: 4.5, SC: 4.4,
    SP: 4.7, SE: 5.3, TO: 5.2,
  };

  function $(id) { return document.getElementById(id); }

  function toast(msg) {
    const t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
  }

  function genCaptcha() {
    state.captchaN1 = 2 + Math.floor(Math.random() * 8);
    state.captchaN2 = 1 + Math.floor(Math.random() * 9);
    state.captchaSum = state.captchaN1 + state.captchaN2;
    const q = $('captchaQ');
    if (q) q.textContent = state.captchaN1 + ' + ' + state.captchaN2;
  }

  function showContact() {
    const el = $('step4');
    if (!el || el.style.display === 'block') return;
    el.style.display = 'block';
    genCaptcha();
    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }

  window.selectTipo = function (el) {
    document.querySelectorAll('.ib-type').forEach((t) => t.classList.remove('selected'));
    el.classList.add('selected');
    state.tipo = el.getAttribute('data-tipo') || '';
    const og = $('stepOffgrid');
    const gastoStep = $('step3');
    if (state.tipo === 'offgrid') {
      if (og) og.style.display = 'block';
      if (gastoStep) gastoStep.style.display = 'none';
    } else {
      if (og) og.style.display = 'none';
      if (gastoStep) gastoStep.style.display = '';
    }
    tryShowContact();
  };

  window.toggleDim = function (kind) {
    if (kind === 'embarcacao') {
      const on = $('chkEmbarcacao') && $('chkEmbarcacao').checked;
      if ($('dimEmbarcacao')) $('dimEmbarcacao').style.display = on ? 'flex' : 'none';
    } else {
      const on = $('chkMotorhome') && $('chkMotorhome').checked;
      if ($('dimMotorhome')) $('dimMotorhome').style.display = on ? 'flex' : 'none';
    }
    onEquipChange();
  };

  window.onEquipChange = function () {
    const ids = ['eqIlum','eqTv','eqInfo','eqAr','eqEletro','eqPort'];
    const selected = [];
    let watts = 0;
    ids.forEach((id) => {
      const sel = $(id);
      if (!sel) return;
      Array.from(sel.selectedOptions).forEach((opt) => {
        const parts = (opt.value || '').split('|');
        const w = parseFloat(parts[1]) || 0;
        const hrs = id === 'eqAr' ? 6 : id === 'eqEletro' ? 4 : id === 'eqIlum' ? 5 : 3;
        selected.push({ id: parts[0], nome: opt.text, watts: w, horas: hrs, wh: w * hrs });
        watts += w * hrs;
      });
    });
    const dim = {};
    if ($('chkEmbarcacao') && $('chkEmbarcacao').checked) {
      dim.embarcacao = {
        tipo: ($('embTipo') && $('embTipo').value) || '',
        comprimento: parseFloat($('embComp') && $('embComp').value) || 0,
        largura: parseFloat($('embLarg') && $('embLarg').value) || 0,
      };
      const c = dim.embarcacao.comprimento || 5;
      watts += c * 80;
    }
    if ($('chkMotorhome') && $('chkMotorhome').checked) {
      dim.motorhome = {
        tipo: ($('mhTipo') && $('mhTipo').value) || '',
        comprimento: parseFloat($('mhComp') && $('mhComp').value) || 0,
        largura: parseFloat($('mhLarg') && $('mhLarg').value) || 0,
      };
      const c = dim.motorhome.comprimento || 6;
      watts += c * 100;
    }
    state.equipamentos = selected;
    state.whDia = Math.round(watts);
    state.dimensao = Object.keys(dim).length ? dim : null;
    state.gasto = (state.whDia / 1000) * 30 * 0.95;

    const warn = $('ogEquipWarn');
    if (warn) {
      if (selected.length < 1 && !state.dimensao) {
        warn.textContent = 'Selecione no mínimo 1 equipamento';
        warn.className = 'og-warn';
      } else {
        warn.textContent = selected.length + ' equipamento(s) selecionado(s)';
        warn.className = 'og-warn ok';
      }
    }
    const sum = $('ogSummary');
    if (sum) {
      sum.style.display = state.whDia > 0 ? 'block' : 'none';
      if ($('ogWhDia')) $('ogWhDia').textContent = state.whDia.toLocaleString('pt-BR');
      if ($('ogKwhMes')) $('ogKwhMes').textContent = Math.round(state.whDia * 30 / 1000).toLocaleString('pt-BR');
    }
    tryShowContact();
  };

  let cepTimer = null;
  window.onLocalInput = function (input) {
    const v = (input.value || '').trim();
    state.local = v;
    const digits = v.replace(/\D/g, '');
    clearTimeout(cepTimer);
    if (digits.length === 8) {
      if (/^\d{8}$/.test(digits) && !/[,\-]/.test(v)) {
        input.value = digits.slice(0, 5) + '-' + digits.slice(5);
      }
      cepTimer = setTimeout(() => buscarCep(digits), 400);
    }
    tryShowContact();
  };

  async function buscarCep(cep) {
    const st = $('cepStatus');
    try {
      if (st) { st.textContent = 'Buscando endereço…'; st.className = 'ib-cep-status'; }
      const res = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
      const data = await res.json();
      if (data.erro) {
        if (st) {
          st.textContent = 'CEP não encontrado — digite o endereço manualmente.';
          st.className = 'ib-cep-status err';
        }
        return;
      }
      const addr = [data.logradouro, data.bairro, data.localidade + ' - ' + data.uf, data.cep]
        .filter(Boolean).join(', ');
      const input = $('campoLocal');
      if (input) input.value = addr;
      state.local = addr;
      state.cidade = data.localidade || '';
      state.uf = data.uf || '';
      state.cep = data.cep || cep;
      if (st) { st.textContent = '✓ Endereço encontrado'; st.className = 'ib-cep-status ok'; }
      tryShowContact();
    } catch (e) {
      if (st) { st.textContent = 'Não foi possível consultar o CEP.'; st.className = 'ib-cep-status err'; }
    }
  }

  window.usarLocalizacao = function () {
    if (!navigator.geolocation) {
      toast('Geolocalização não disponível neste navegador.');
      return;
    }
    const st = $('cepStatus');
    if (st) { st.textContent = 'Obtendo localização…'; st.className = 'ib-cep-status'; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
          latitude + '&lon=' + longitude + '&zoom=18&addressdetails=1';
        const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
        const data = await res.json();
        const a = data.address || {};
        const parts = [
          a.road || a.pedestrian,
          a.suburb || a.neighbourhood,
          a.city || a.town || a.village,
          a.state,
          a.postcode,
        ].filter(Boolean);
        const addr = parts.join(', ');
        const input = $('campoLocal');
        if (input) input.value = addr || (latitude.toFixed(5) + ', ' + longitude.toFixed(5));
        state.local = input ? input.value : addr;
        state.cidade = a.city || a.town || a.village || '';
        const stName = (a.state || '').toUpperCase();
        const ufMap = {
          'SÃO PAULO': 'SP', 'RIO DE JANEIRO': 'RJ', 'MINAS GERAIS': 'MG', 'BAHIA': 'BA',
          'PARANÁ': 'PR', 'RIO GRANDE DO SUL': 'RS', 'PERNAMBUCO': 'PE', 'CEARÁ': 'CE',
          'PARÁ': 'PA', 'SANTA CATARINA': 'SC', 'GOIÁS': 'GO', 'MARANHÃO': 'MA',
          'PARAÍBA': 'PB', 'ESPÍRITO SANTO': 'ES', 'PIAUÍ': 'PI', 'ALAGOAS': 'AL',
          'MATO GROSSO': 'MT', 'MATO GROSSO DO SUL': 'MS', 'DISTRITO FEDERAL': 'DF',
          'RIO GRANDE DO NORTE': 'RN', 'TOCANTINS': 'TO', 'SERGIPE': 'SE',
          'RONDÔNIA': 'RO', 'ACRE': 'AC', 'AMAZONAS': 'AM', 'AMAPÁ': 'AP', 'RORAIMA': 'RR',
        };
        state.uf = ufMap[stName] || (stName.length === 2 ? stName : 'SP');
        state.cep = (a.postcode || '').replace(/\D/g, '');
        if (st) { st.textContent = '✓ Localização obtida'; st.className = 'ib-cep-status ok'; }
        tryShowContact();
      } catch (e) {
        if (st) { st.textContent = 'Não foi possível obter o endereço.'; st.className = 'ib-cep-status err'; }
      }
    }, () => {
      if (st) { st.textContent = 'Permissão de localização negada.'; st.className = 'ib-cep-status err'; }
      toast('Permita o acesso à localização ou digite o CEP.');
    }, { timeout: 12000 });
  };

  window.onGastoInput = function (input) {
    const raw = (input.value || '').replace(/[^\d,.]/g, '');
    const num = parseFloat(raw.replace(/\./g, '').replace(',', '.')) ||
      parseFloat(raw.replace(',', '.')) || 0;
    state.gasto = num;
    if (num >= 50) input.classList.add('valid');
    else input.classList.remove('valid');
    tryShowContact();
  };

  function tryShowContact() {
    const localOk = state.local.length >= 5;
    const gastoOk = state.tipo === 'offgrid'
      ? (state.equipamentos.length >= 1 || state.dimensao)
      : state.gasto >= 50;
    if (state.tipo && localOk && gastoOk) {
      showContact();
      checkReady();
    }
  }

  window.formatPhone = function (input) {
    let d = (input.value || '').replace(/\D/g, '').slice(0, 11);
    if (d.length > 6) {
      input.value = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    } else if (d.length > 2) {
      input.value = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    } else {
      input.value = d;
    }
  };

  window.checkReady = function () {
    const nome = ($('campoNome') && $('campoNome').value || '').trim();
    const email = ($('campoEmail') && $('campoEmail').value || '').trim();
    const cel = ($('campoCelular') && $('campoCelular').value || '').replace(/\D/g, '');
    const priv = $('chkPriv') && $('chkPriv').checked;
    const cap = parseInt($('captchaA') && $('captchaA').value, 10);
    const ok =
      state.tipo &&
      state.local.length >= 5 &&
      (state.tipo === 'offgrid' ? (state.equipamentos.length >= 1 || state.dimensao) : state.gasto >= 50) &&
      nome.length >= 2 &&
      email.includes('@') &&
      cel.length >= 10 &&
      priv &&
      cap === state.captchaSum;
    const btn = $('btnSimular');
    if (btn) btn.disabled = !ok;
    ['campoNome', 'campoEmail', 'campoCelular'].forEach((id) => {
      const el = $(id);
      if (!el) return;
      const v = (el.value || '').trim();
      const good =
        (id === 'campoNome' && v.length >= 2) ||
        (id === 'campoEmail' && v.includes('@')) ||
        (id === 'campoCelular' && v.replace(/\D/g, '').length >= 10);
      el.classList.toggle('valid', !!good);
    });
  };

  function calcular() {
    const tarifa = 0.95;
    const hsp = HSP[state.uf] || 4.8;
    let consumoKwh, kwp, batKwh = 0;
    if (state.tipo === 'offgrid' && state.whDia > 0) {
      const whDia = state.whDia;
      consumoKwh = (whDia * 30) / 1000;
      kwp = (whDia * 1.3) / (hsp * 1000);
      kwp = Math.max(0.4, Math.round(kwp * 100) / 100);
      batKwh = Math.round((whDia * 2) / 500) / 10;
    } else {
      consumoKwh = state.gasto / tarifa;
      kwp = (consumoKwh * 1.05) / (hsp * 30);
      if (state.tipo === 'offgrid') kwp *= 1.35;
      kwp = Math.max(1.2, Math.round(kwp * 10) / 10);
    }
    const area = Math.round(kwp * 6.5 * 10) / 10;
    let custoKwp;
    if (state.tipo === 'offgrid') {
      custoKwp = kwp <= 4 ? 5200 : kwp <= 8 ? 4800 : kwp <= 15 ? 4500 : 4200;
    } else {
      custoKwp = kwp <= 4 ? 3100 : kwp <= 8 ? 2900 : kwp <= 15 ? 2700 : 2550;
    }
    const custo = Math.round(kwp * custoKwp);
    const geracaoMes = Math.round(kwp * hsp * 30);
    const economiaMes = state.tipo === 'offgrid'
      ? consumoKwh * tarifa
      : Math.min(state.gasto * 0.92, geracaoMes * tarifa * 0.95);
    const economiaAno = Math.round(economiaMes * 12);
    const paybackAnos = economiaAno > 0 ? (custo / economiaAno) : 0;
    const paybackStr = paybackAnos < 1
      ? Math.round(paybackAnos * 12) + ' meses'
      : paybackAnos.toFixed(1).replace('.', ',') + ' anos';
    return {
      kwp, area, custo, geracaoMes, economiaAno,
      payback: paybackStr, paybackAnos, tarifa, hsp, batKwh,
      whDia: state.whDia,
      mode: state.tipo === 'offgrid' ? 'offgrid' : 'ongrid',
    };
  }

  function fmtMoney(n) {
    return 'R$ ' + Math.round(n).toLocaleString('pt-BR');
  }

  function showResults(r) {
    $('rPotencia').textContent = r.kwp.toFixed(1).replace('.', ',') + ' kWp';
    $('rArea').textContent = r.area + ' m²';
    $('rValor').textContent = fmtMoney(r.custo);
    $('rProd').textContent = r.geracaoMes.toLocaleString('pt-BR') + ' kWh';
    $('rEcon').textContent = fmtMoney(r.economiaAno);
    $('rPayback').textContent = r.payback;
    const isOff = r.mode === 'offgrid';
    const mb = $('metricBat');
    const mw = $('metricWh');
    if (mb) {
      mb.style.display = isOff && r.batKwh ? '' : 'none';
      if ($('rBat') && r.batKwh) $('rBat').textContent = r.batKwh + ' kWh';
    }
    if (mw) {
      mw.style.display = isOff && r.whDia ? '' : 'none';
      if ($('rWh') && r.whDia) $('rWh').textContent = r.whDia.toLocaleString('pt-BR') + ' Wh/dia';
    }
    const eqBox = $('ogResultEquip');
    if (eqBox) {
      if (isOff && ((state.equipamentos && state.equipamentos.length) || state.dimensao)) {
        const lines = (state.equipamentos || []).map((e) => e.nome + ' (' + e.wh + ' Wh/dia)');
        if (state.dimensao && state.dimensao.embarcacao) {
          const e = state.dimensao.embarcacao;
          lines.push('Embarcação ' + (e.tipo || '') + ' ' + e.comprimento + 'm × ' + e.largura + 'm');
        }
        if (state.dimensao && state.dimensao.motorhome) {
          const e = state.dimensao.motorhome;
          lines.push('MotorHome/Trailer ' + (e.tipo || '') + ' ' + e.comprimento + 'm × ' + e.largura + 'm');
        }
        eqBox.innerHTML = '<strong>Equipamentos considerados:</strong><br>' + lines.join('<br>');
        eqBox.style.display = 'block';
      } else {
        eqBox.style.display = 'none';
      }
    }
    $('formWrap').style.display = 'none';
    $('resultsWrap').classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.simular = async function () {
    const hp = $('hpField');
    if (hp && hp.value) return;

    const nome = ($('campoNome').value || '').trim();
    const email = ($('campoEmail').value || '').trim();
    const celular = ($('campoCelular').value || '').replace(/\D/g, '');
    const origem = ($('campoOrigem') && $('campoOrigem').value) || '';

    const gastoOk = state.tipo === 'offgrid'
      ? (state.equipamentos.length >= 1 || state.dimensao)
      : state.gasto >= 50;
    if (!state.tipo || !gastoOk || nome.length < 2 || celular.length < 10) {
      toast('Preencha todos os campos obrigatórios.');
      return;
    }
    const cap = parseInt($('captchaA').value, 10);
    if (cap !== state.captchaSum) {
      toast('Resolva a verificação corretamente.');
      genCaptcha();
      return;
    }

    const r = calcular();
    state.lastResult = r;
    showResults(r);

    try {
      const payload = {
        mode: r.mode,
        nome, email,
        telefone: celular, celular, contato: celular,
        local: state.local, logradouro: state.local, endereco: state.local,
        cidade: state.cidade, uf: state.uf, cep: state.cep,
        gasto: state.gasto, tarifa: r.tarifa,
        kwp: r.kwp, area: r.area, custo: r.custo,
        geracaoMes: r.geracaoMes, economiaAno: r.economiaAno, payback: r.payback,
        origem, source: 'simulador', tipoLocal: state.tipo,
        equipamentos: state.equipamentos, dimensao: state.dimensao, whDia: state.whDia,
        batKwh: r.batKwh,
        humanVerified: true, captchaOk: true,
        captcha: cap, captchaExpected: state.captchaSum,
        website: '', ts: new Date().toISOString(),
      };
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn('Lead API:', err);
      }
    } catch (e) {
      console.warn('Lead send failed', e);
    }
  };

  window.simularNovamente = function () {
    $('resultsWrap').classList.remove('show');
    $('formWrap').style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.solicitarOrcamento = function () {
    toast('Em breve um consultor entrará em contato com seu orçamento completo!');
  };

  window.baixarSimulacao = function () {
    const r = state.lastResult;
    if (!r) return;
    const nome = ($('campoNome') && $('campoNome').value) || 'Cliente';
    const lines = [
      'Simulação Solar — Paraty Solar',
      '================================',
      'Cliente: ' + nome,
      'Local: ' + state.local,
      'Tipo: ' + state.tipo,
      'Gasto mensal: R$ ' + state.gasto.toFixed(2),
      '',
      'Potência instalada: ' + r.kwp.toFixed(1) + ' kWp',
      'Área mínima: ' + r.area + ' m²',
      'Valor aproximado: ' + fmtMoney(r.custo),
      'Produção mensal: ' + r.geracaoMes + ' kWh',
      'Economia anual: ' + fmtMoney(r.economiaAno),
      'Payback: ' + r.payback,
      '',
      'Valores aproximados. Consulte um especialista para orçamento formal.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'simulacao-solar-paraty.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  genCaptcha();
})();
