(function(){
function $(id){return document.getElementById(id)}
function fmtMoney(n){return 'R$ '+Math.round(n).toLocaleString('pt-BR')}
function enhance(){
  var pot=$('rPotencia'),val=$('rValor'),pb=$('rPayback'),prod=$('rProd'),econ=$('rEcon'),area=$('rArea');
  if(!pot||!val)return;
  var kwp=parseFloat((pot.textContent||'').replace(/[^\d,.]/g,'').replace(',','.'))||0;
  if(kwp<=0)return;
  var cfg=null;
  try{cfg=JSON.parse(localStorage.getItem('ps_price_cfg')||'null')}catch(e){}
  var ck=kwp<=4?3100:kwp<=8?2900:kwp<=15?2750:2920;
  if(cfg&&cfg.ongrid){
    if(kwp<=4&&cfg.ongrid.base)ck=cfg.ongrid.base;
    else if(kwp<=8&&cfg.ongrid.mid)ck=cfg.ongrid.mid;
    else if(kwp<=15&&cfg.ongrid.large)ck=cfg.ongrid.large;
    else if(cfg.ongrid.xl)ck=cfg.ongrid.xl;
  }
  var fMin=(cfg&&cfg.faixa_min)?cfg.faixa_min/100:0.90;
  var fMax=(cfg&&cfg.faixa_max)?cfg.faixa_max/100:1.25;
  var custo=Math.round(kwp*ck),cMin=Math.round(custo*fMin),cMax=Math.round(custo*fMax);
  var ea=parseInt((econ&&econ.textContent||'').replace(/[^\d]/g,''),10)||0;
  var pa=ea>0?custo/ea:0,pbMin=Math.max(2,Math.floor(pa*1.6)),pbMax=Math.max(pbMin+1,Math.ceil(pa*2.2));
  var gm=parseFloat((prod&&prod.textContent||'').replace(/[^\d,.]/g,'').replace(',','.'))||0;
  var ar=parseFloat((area&&area.textContent||'').replace(/[^\d,.]/g,'').replace(',','.'))||0;
  if(ar>kwp*5.5){ar=Math.round(kwp*4.05);if(area)area.textContent=ar+' m²'}
  window.__psr={kwp:kwp,area:ar,custo:custo,custoMin:cMin,custoMax:cMax,geracaoMes:gm,economiaAno:ea,payback:'Entre '+pbMin+' e '+pbMax+' anos',pbMin:pbMin,pbMax:pbMax};
  val.textContent='Entre '+fmtMoney(cMin)+' e '+fmtMoney(cMax);
  if(pb)pb.textContent='Entre '+pbMin+' e '+pbMax+' anos';
  if(prod){
    var pt=(prod.textContent||'').trim();
    if(pt&&!/mês/i.test(pt))prod.textContent=pt.replace(/\s*kWh.*/i,'')+' kWh/ mês';
  }
}
var t=setInterval(function(){
  if(typeof window.simular!=='function')return;
  clearInterval(t);
  var o=window.simular;
  window.simular=async function(){await o.apply(this,arguments);setTimeout(enhance,80)};
},40);
window.baixarSimulacao=function(){
  var r=window.__psr;if(!r){enhance();r=window.__psr}if(!r)return;
  var nome=($('campoNome')&&$('campoNome').value)||'Cliente';
  var local=($('campoLocal')&&$('campoLocal').value)||'—';
  var hoje=new Date().toLocaleDateString('pt-BR');
  var vt='Entre '+fmtMoney(r.custoMin)+' e '+fmtMoney(r.custoMax);
  var html='<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Simulação — Paraty Solar</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#f5f7fa;color:#1a2332}.header{background:linear-gradient(135deg,#0d7a3f,#0a5c2e);color:#fff;padding:28px 24px}.header h1{font-size:1.3rem}.sub{opacity:.9;font-size:.9rem;margin-top:4px}.card{max-width:700px;margin:24px auto;background:#fff;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.08);padding:28px}h2{text-align:center;margin-bottom:22px}.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}@media(max-width:560px){.grid{grid-template-columns:1fr}}.m{text-align:center;padding:14px 8px;border:1px solid #e8eef3;border-radius:10px;background:#fafbfc}.m .l{font-size:.7rem;color:#64748b;text-transform:uppercase;margin-bottom:4px}.m .v{font-size:1rem;font-weight:700;color:#0d7a3f}.note{margin-top:22px;padding:14px;background:#f0fdf4;border-left:4px solid #0d7a3f;border-radius:0 8px 8px 0;font-size:.85rem}.fine{margin-top:16px;font-size:.7rem;color:#94a3b8;text-align:center}.footer{background:#0a5c2e;color:#fff;padding:14px;text-align:center;font-size:.8rem}</style></head><body><div class="header"><h1>Simulador de Energia Solar</h1><div class="sub">Resultado em '+hoje+'</div></div><div class="card"><h2>Resultado</h2><div class="grid"><div class="m"><div class="l">Potência instalada*</div><div class="v">'+r.kwp.toFixed(2).replace('.',',')+' kWp</div></div><div class="m"><div class="l">Área mínima*</div><div class="v">'+r.area+' m²</div></div><div class="m"><div class="l">Valor aproximado*</div><div class="v">'+vt+'</div></div><div class="m"><div class="l">Produção mensal*</div><div class="v">'+Number(r.geracaoMes).toLocaleString('pt-BR')+' kWh/mês</div></div><div class="m"><div class="l">Economia anual*</div><div class="v">'+fmtMoney(r.economiaAno)+'</div></div><div class="m"><div class="l">Retorno do investimento*</div><div class="v">'+r.payback+'</div></div></div><div class="note"><strong>Cliente:</strong> '+nome+'<br/><strong>Local:</strong> '+local+'<br/><br/>Você pode adquirir seu sistema com a Paraty Solar à vista ou em parcelas.</div><p class="fine">*Valores aproximados. Variáveis como telhado, clima e estrutura podem alterar o valor final.</p></div><div class="footer">Paraty Solar · Costa Verde – RJ</div><script>setTimeout(function(){window.print()},400)<\/script></body></html>';
  var blob=new Blob([html],{type:'text/html;charset=utf-8'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='simulacao-paraty-solar.html';a.click();URL.revokeObjectURL(a.href);
};
})();
