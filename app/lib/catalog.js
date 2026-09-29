/**
 * Catálogo Intelbras Loja Solar — preços unitários com ICMS embutido.
 * Fonte: PDF "Loja Solar - Intelbras" (revenda).
 *
 * Kits on-grid homologados: isenção de ICMS 15% sobre o valor dos produtos
 * (Convênio ICMS / legislação GD). Preço avulso já inclui ICMS → no kit
 * aplica-se desconto de 15% sobre subtotal de produtos.
 */

export const ICMS_RATE = 0.15; // isenção kits on-grid / híbrido homologado

/** @typedef {{ sku: string, nome: string, categoria: string, marca: string, preco: number, unidade?: string, potencia_w?: number, potencia_kw?: number, kwh?: number, ativo?: boolean }} Product */

/** @type {Product[]} */
export const CATALOG_PRODUCTS = [
  // ——— MÓDULOS ———
  { sku: '4301418', nome: 'Módulo Fotov. Monoc. EMSS-620B N-Type', categoria: 'modulos', marca: 'Intelbras', preco: 716.18, potencia_w: 620, unidade: 'un' },
  { sku: '4301405', nome: 'Módulo Fotov. Mono EMST-160M N-Type', categoria: 'modulos', marca: 'Intelbras', preco: 421.0, potencia_w: 160, unidade: 'un' },

  // ——— INVERSORES ON-GRID ———
  { sku: '1870974', nome: 'Inversor On-Grid IONS-3K M3 AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 2365.06, potencia_kw: 3, unidade: 'un' },
  { sku: '1870975', nome: 'Inversor On-Grid IONS-5K M5 AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 3837.84, potencia_kw: 5, unidade: 'un' },
  { sku: '1870977', nome: 'Inversor On-Grid IONS-6K M5 AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 4640.61, potencia_kw: 6, unidade: 'un' },
  { sku: '1871083', nome: 'Inversor On-Grid IONS-7,5K M7 AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 5240.56, potencia_kw: 7.5, unidade: 'un' },
  { sku: '4301386', nome: 'Inversor On-Grid IONS 10K M G2', categoria: 'inversores', marca: 'Intelbras', preco: 6369.07, potencia_kw: 10, unidade: 'un' },
  { sku: '1870971', nome: 'Inversor On-Grid IONS-12K T2 AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 9200.02, potencia_kw: 12, unidade: 'un' },
  { sku: '1870968', nome: 'Inversor On-Grid IONS-15K T2 AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 11215.55, potencia_kw: 15, unidade: 'un' },
  { sku: '1870972', nome: 'Inversor On-Grid IONS-15K T4-220V AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 13713.33, potencia_kw: 15, unidade: 'un' },
  { sku: '1870973', nome: 'Inversor On-Grid IONS-20K T4-220V AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 14575.66, potencia_kw: 20, unidade: 'un' },
  { sku: '1870967', nome: 'Inversor On-Grid IONS-25K T4 AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 14426.43, potencia_kw: 25, unidade: 'un' },
  { sku: '1870970', nome: 'Inversor On-Grid IONS-33K T4 AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 15895.34, potencia_kw: 33, unidade: 'un' },
  { sku: '1870984', nome: 'Inversor On-Grid IONS-50K T4 AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 17742.29, potencia_kw: 50, unidade: 'un' },
  { sku: '1870978', nome: 'Inversor On-Grid IONS-75K T6 AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 25448.5, potencia_kw: 75, unidade: 'un' },
  { sku: '1871082', nome: 'Inversor On-Grid IONS-75K T6-220V AFCI', categoria: 'inversores', marca: 'Intelbras', preco: 32467.61, potencia_kw: 75, unidade: 'un' },
  { sku: '1871081', nome: 'Inversor On-Grid IONS-2K M1 Micro', categoria: 'inversores', marca: 'Intelbras', preco: 1432.38, potencia_kw: 2, unidade: 'un' },
  { sku: '4301054', nome: 'Inversor On-Grid RGT-T 15K 220V AFCI', categoria: 'inversores', marca: 'Renovigi', preco: 14163.5, potencia_kw: 15, unidade: 'un' },
  { sku: '4301293', nome: 'Inversor On-Grid RGT-T 15K 380V AFCI', categoria: 'inversores', marca: 'Renovigi', preco: 8161.86, potencia_kw: 15, unidade: 'un' },
  { sku: '4301087', nome: 'Microinversor RGT-MI 2K 220V', categoria: 'inversores', marca: 'Renovigi', preco: 1187.94, potencia_kw: 2, unidade: 'un' },

  // ——— INVERSORES HÍBRIDO / OFF-GRID ———
  { sku: '4301385', nome: 'Inversor On-Grid IONS 6K M Híbrido', categoria: 'inversores', marca: 'Intelbras', preco: 10430.64, potencia_kw: 6, unidade: 'un' },
  { sku: '4842983', nome: 'Inversor Carregador SEN ICS 5002 G2', categoria: 'inversores', marca: 'Intelbras', preco: 4913.14, potencia_kw: 5, unidade: 'un' },
  { sku: '4842984', nome: 'Inversor Carregador SEN ICS 5001 G2', categoria: 'inversores', marca: 'Intelbras', preco: 5511.04, potencia_kw: 5, unidade: 'un' },

  // ——— BATERIAS ———
  { sku: '4301496', nome: 'Bateria Lítio Dyness 51,2V 100Ah (5,12 kWh)', categoria: 'baterias', marca: 'Dyness', preco: 8080.24, kwh: 5.12, unidade: 'un' },
  { sku: '1871087', nome: 'Bateria BCE 12-105Ah', categoria: 'baterias', marca: 'Intelbras', preco: 900.03, kwh: 1.26, unidade: 'un' },
  { sku: '1871088', nome: 'Bateria Estacionária Pb 12V 150Ah BCE 12-150', categoria: 'baterias', marca: 'Intelbras', preco: 1230.41, kwh: 1.8, unidade: 'un' },
  { sku: '1870872', nome: 'Gabinete Outdoor p/ 2 Baterias 105Ah', categoria: 'acessorios', marca: 'Intelbras', preco: 2463.41, unidade: 'un' },

  // ——— ESTRUTURA ———
  { sku: '1871078', nome: 'Perfil Smart X Paisagem (par) 2,60m MD02', categoria: 'estrutura', marca: 'Solar Group', preco: 87.93, unidade: 'par' },
  { sku: '1871079', nome: 'Perfil Smart X Retrato (par) 2,40m MD02', categoria: 'estrutura', marca: 'Solar Group', preco: 86.55, unidade: 'par' },
  { sku: '4300192', nome: 'Suporte Z para Micro Inversores', categoria: 'estrutura', marca: 'Solar Group', preco: 6.22, unidade: 'un' },

  // ——— STRINGBOX / PROTEÇÃO ———
  { sku: '1870745', nome: 'Protetor Stringbox 600V 1E-1S', categoria: 'acessorios', marca: 'Clamper', preco: 571.9, unidade: 'un' },
  { sku: '4301050', nome: 'Protetor Elétrico Stringbox 1040V 1E-1S', categoria: 'acessorios', marca: 'Clamper', preco: 547.08, unidade: 'un' },
  { sku: '4825016', nome: 'Protetor Elétrico Stringbox 600V 1E x 1S', categoria: 'acessorios', marca: 'Clamper', preco: 603.76, unidade: 'un' },
  { sku: '4300338', nome: 'Protetor Elet. Stringbox 1000V 4E-4S G2', categoria: 'acessorios', marca: 'Clamper', preco: 1633.52, unidade: 'un' },

  // ——— CABOS E CONECTORES ———
  { sku: '1870720', nome: 'Cabo Solar Vermelho 1kVCA 6mm', categoria: 'acessorios', marca: 'Intelbras', preco: 6.81, unidade: 'm' },
  { sku: '1870721', nome: 'Cabo Solar Preto 1kVCA 6mm', categoria: 'acessorios', marca: 'Intelbras', preco: 6.81, unidade: 'm' },
  { sku: '1870735', nome: 'Cabo Solar Vermelho 1kVCA 4mm', categoria: 'acessorios', marca: 'Intelbras', preco: 5.11, unidade: 'm' },
  { sku: '1870736', nome: 'Cabo Solar Preto 1kVCA 4mm', categoria: 'acessorios', marca: 'Intelbras', preco: 5.11, unidade: 'm' },
  { sku: '4301343', nome: 'Cabo Solar Verde 1kVCA 6mm', categoria: 'acessorios', marca: 'Intelbras', preco: 6.81, unidade: 'm' },
  { sku: '1870845', nome: 'Conector MC4 par FM/MC 1 via 1,5kV', categoria: 'acessorios', marca: 'Intelbras', preco: 13.83, unidade: 'par' },
  { sku: '4300001', nome: 'Conector CA T c/ chave remoção IONS-2K Micro', categoria: 'acessorios', marca: 'Intelbras', preco: 125.84, unidade: 'un' },
  { sku: '4300504', nome: 'Conector CA Tipo T c/ chave/borch Micro', categoria: 'acessorios', marca: 'Intelbras', preco: 88.12, unidade: 'un' },

  // ——— MONITORAMENTO / MEDIÇÃO ———
  { sku: '4300365', nome: 'Disp. Monit/Controle Fotov Logger1000B', categoria: 'acessorios', marca: 'Sungrow', preco: 4485.54, unidade: 'un' },
  { sku: '4300508', nome: 'Transformador de Corrente NCTK24 250A/333mV', categoria: 'acessorios', marca: 'Chint', preco: 699.68, unidade: 'un' },
  { sku: '4300518', nome: 'Medidor de Energia Trifásico DTSU666-20', categoria: 'acessorios', marca: 'Chint', preco: 1506.59, unidade: 'un' },
  { sku: '4301014', nome: 'Dispositivo Desligamento Rápido TS4-A-2F', categoria: 'acessorios', marca: 'Tigo', preco: 451.92, unidade: 'un' },
  { sku: '4301015', nome: 'Transmissor de Sinal RSS p/ Deslig. Rápido', categoria: 'acessorios', marca: 'Tigo', preco: 522.94, unidade: 'un' },
];

export function productBySku(sku) {
  return CATALOG_PRODUCTS.find((p) => p.sku === String(sku));
}

export function productsByCategory(cat) {
  return CATALOG_PRODUCTS.filter((p) => p.categoria === cat && p.ativo !== false);
}

/** Escolhe inversor on-grid pelo kWp do gerador (potência do inversor ≥ kwp, menor excesso). */
export function pickOnGridInverter(kwp) {
  const list = productsByCategory('inversores')
    .filter((p) => p.potencia_kw && !/híbrido|hibrido|carregador|micro/i.test(p.nome) && p.marca === 'Intelbras')
    .sort((a, b) => a.potencia_kw - b.potencia_kw);
  const fit = list.find((p) => p.potencia_kw >= kwp * 0.95) || list[list.length - 1];
  return fit || list[0];
}

export function pickHybridInverter(kwp) {
  const h = productBySku('4301385'); // 6k híbrido
  if (kwp <= 6.5) return h;
  return h;
}

export function pickOffGridInverter(kwp) {
  return productBySku('4842983') || productBySku('4842984');
}

export function pickModule(preferW = 620) {
  if (preferW >= 500) return productBySku('4301418');
  return productBySku('4301405') || productBySku('4301418');
}

/**
 * Monta BOM (bill of materials) de um kit.
 * Retorna itens com qtd, preco unitário (com ICMS) e total linha.
 */
export function buildKitBom({ mode = 'ongrid', kwp, modulos, batKwh = 0 }) {
  const items = [];
  const mod = pickModule(620);
  const nMod = modulos || Math.ceil((kwp * 1000) / (mod.potencia_w || 620));
  items.push({
    sku: mod.sku,
    item: mod.nome,
    marca: mod.marca,
    categoria: 'modulos',
    qtd: nMod,
    unit: mod.preco,
    total: round2(nMod * mod.preco),
  });

  let inv;
  if (mode === 'offgrid') inv = pickOffGridInverter(kwp);
  else if (mode === 'hibrido') inv = pickHybridInverter(kwp);
  else inv = pickOnGridInverter(kwp);

  if (inv) {
    const invQtd = mode === 'hibrido' && kwp > 6.5 ? Math.ceil(kwp / 6) : 1;
    items.push({
      sku: inv.sku,
      item: inv.nome,
      marca: inv.marca,
      categoria: 'inversores',
      qtd: invQtd,
      unit: inv.preco,
      total: round2(invQtd * inv.preco),
    });
  }

  // Stringbox
  const sb = productBySku('1870745') || productBySku('4301050');
  if (sb && mode !== 'offgrid') {
    items.push({
      sku: sb.sku,
      item: sb.nome,
      marca: sb.marca,
      categoria: 'acessorios',
      qtd: 1,
      unit: sb.preco,
      total: sb.preco,
    });
  }

  // Estrutura: ~1 par de perfil a cada 2 módulos
  const perfil = productBySku('1871078');
  if (perfil) {
    const nPerfil = Math.max(1, Math.ceil(nMod / 2));
    items.push({
      sku: perfil.sku,
      item: perfil.nome,
      marca: perfil.marca,
      categoria: 'estrutura',
      qtd: nPerfil,
      unit: perfil.preco,
      total: round2(nPerfil * perfil.preco),
    });
  }

  // Cabo solar: ~15m por kWp (ida+volta estimado)
  const caboV = productBySku('1870720');
  const caboP = productBySku('1870721');
  const metros = Math.max(20, Math.round(kwp * 15));
  if (caboV) {
    items.push({
      sku: caboV.sku,
      item: caboV.nome,
      marca: caboV.marca,
      categoria: 'acessorios',
      qtd: metros,
      unit: caboV.preco,
      total: round2(metros * caboV.preco),
    });
  }
  if (caboP) {
    items.push({
      sku: caboP.sku,
      item: caboP.nome,
      marca: caboP.marca,
      categoria: 'acessorios',
      qtd: metros,
      unit: caboP.preco,
      total: round2(metros * caboP.preco),
    });
  }

  // MC4: 1 par por módulo (aprox)
  const mc4 = productBySku('1870845');
  if (mc4) {
    items.push({
      sku: mc4.sku,
      item: mc4.nome,
      marca: mc4.marca,
      categoria: 'acessorios',
      qtd: nMod,
      unit: mc4.preco,
      total: round2(nMod * mc4.preco),
    });
  }

  // Baterias
  if (batKwh > 0) {
    const batLi = productBySku('4301496');
    if (batLi && batKwh >= 3) {
      const nBat = Math.max(1, Math.ceil(batKwh / (batLi.kwh || 5.12)));
      items.push({
        sku: batLi.sku,
        item: batLi.nome,
        marca: batLi.marca,
        categoria: 'baterias',
        qtd: nBat,
        unit: batLi.preco,
        total: round2(nBat * batLi.preco),
      });
    } else {
      const batPb = productBySku('1871088');
      if (batPb) {
        const nBat = Math.max(2, Math.ceil(batKwh / (batPb.kwh || 1.8)));
        items.push({
          sku: batPb.sku,
          item: batPb.nome,
          marca: batPb.marca,
          categoria: 'baterias',
          qtd: nBat,
          unit: batPb.preco,
          total: round2(nBat * batPb.preco),
        });
      }
    }
  }

  const subtotalComIcms = round2(items.reduce((s, i) => s + i.total, 0));
  // Kits on-grid e híbrido homologados: isenção ICMS 15%
  const isentoIcms = mode === 'ongrid' || mode === 'hibrido';
  const descontoIcms = isentoIcms ? round2(subtotalComIcms * ICMS_RATE) : 0;
  const subtotalProdutos = round2(subtotalComIcms - descontoIcms);

  return {
    items,
    subtotal_com_icms: subtotalComIcms,
    desconto_icms: descontoIcms,
    subtotal_produtos: subtotalProdutos,
    icms_isento: isentoIcms,
    modulo: mod,
    inversor: inv,
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
