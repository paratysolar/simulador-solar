export const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Open+Sans:wght@400;600;700&display=swap');
:root{--navy:#0a2d6b;--blue:#1a4fad;--orange:#f5a623;--orange2:#e8940f;--g:#16a34a;--red:#dc2626;--m:#64748b;--ink:#1e293b;--line:#e2e8f0;--bg:#f1f5f9}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Open Sans',system-ui,sans-serif;background:var(--bg);color:var(--ink);line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.wrap{max-width:920px;margin:0 auto;padding:20px 16px 80px}
.logo-txt{font-family:Montserrat,sans-serif;font-weight:800;font-size:1.35rem;color:#22c55e}
.logo-txt span{color:#94a3b8}
.card{background:#fff;border-radius:16px;padding:24px;margin-bottom:20px;box-shadow:0 4px 24px rgba(15,23,42,.06);border:1px solid var(--line)}
.card h1{font-family:Montserrat,sans-serif;font-size:1.4rem;color:var(--navy);margin-bottom:4px}
.sub{color:var(--m);font-size:.9rem;margin-bottom:16px}
.login{max-width:380px;margin:12vh auto;text-align:center}
.login input{width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:10px;font-size:1rem;margin-bottom:12px}
.err{color:var(--red);font-size:.88rem;margin:8px 0}
.ok-msg{color:#15803d;font-size:.88rem;margin-top:10px;font-weight:600}
.btn{background:linear-gradient(135deg,var(--navy),var(--blue));color:#fff;border:none;border-radius:10px;padding:12px 22px;font-weight:700;font-size:.95rem;cursor:pointer;font-family:Montserrat,sans-serif}
.btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(10,45,107,.25)}
.btn:disabled{opacity:.6;cursor:not-allowed}
.btn-out{background:#fff;color:var(--navy);border:1.5px solid var(--navy);border-radius:10px;padding:10px 18px;font-weight:600;font-size:.88rem;cursor:pointer;font-family:Montserrat,sans-serif}
.modes{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap}
.mode{flex:1;min-width:100px;padding:12px;border:2px solid var(--line);border-radius:12px;background:#fff;font-weight:700;font-family:Montserrat,sans-serif;color:var(--m);cursor:pointer;font-size:.9rem}
.mode.on{border-color:var(--navy);color:var(--navy);background:#eff6ff}
label{display:block;font-size:.8rem;font-weight:600;color:var(--m);margin:10px 0 4px}
input,select{width:100%;padding:11px 12px;border:1.5px solid var(--line);border-radius:10px;font-size:.95rem;font-family:inherit}
input:focus,select:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 3px rgba(26,79,173,.12)}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.row.four{grid-template-columns:1fr 1fr 1fr 1fr}
.toolbar{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.proposta{margin-top:8px}
.page{background:#fff;border-radius:4px;margin-bottom:24px;box-shadow:0 8px 40px rgba(15,23,42,.1);overflow:hidden;page-break-after:always}
.page-inner{padding:28px 36px 48px;min-height:980px;position:relative}
.page-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:12px;border-bottom:3px solid var(--navy)}
.brand-mark{font-family:Montserrat,sans-serif;font-weight:800;font-size:1.15rem;color:#22c55e;letter-spacing:-.02em}
.brand-mark span{color:#94a3b8}
.brand-mark .accent{color:#f97316}
.page-num{position:absolute;bottom:16px;right:28px;font-size:.8rem;color:var(--m);font-weight:600}
.cover{min-height:1050px;display:flex;flex-direction:column;background:#fff}
.cover-top{background:linear-gradient(160deg,#0a2d6b 0%,#0d3a8a 40%,#1560bd 100%);padding:56px 40px 48px;text-align:center;color:#fff;position:relative;overflow:hidden}
.cover-top::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 20% 30%,rgba(255,255,255,.06) 0%,transparent 50%),repeating-linear-gradient(60deg,transparent,transparent 40px,rgba(255,255,255,.025) 40px,rgba(255,255,255,.025) 80px);pointer-events:none}
.cover-top h1{font-family:Montserrat,sans-serif;font-weight:900;font-size:3.2rem;line-height:1.05;letter-spacing:.02em;text-transform:uppercase;position:relative;z-index:1;text-shadow:0 2px 20px rgba(0,0,0,.2)}
.cover-top .tagline{font-family:Montserrat,sans-serif;font-weight:600;font-size:1.25rem;color:var(--orange);margin-top:18px;line-height:1.4;position:relative;z-index:1}
.cover-circles{display:flex;justify-content:center;align-items:flex-end;gap:18px;margin-top:40px;position:relative;z-index:1}
.cover-circles img{width:140px;height:140px;border-radius:50%;object-fit:cover;border:5px solid var(--orange);box-shadow:0 8px 28px rgba(0,0,0,.35)}
.cover-circles img.main{width:175px;height:175px;border-width:6px;margin-bottom:8px}
.cover-mid{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:36px 24px;background:#fff}
.cover-logo-name{font-family:Montserrat,sans-serif;font-weight:800;font-size:2.4rem;color:#22c55e;letter-spacing:-.03em}
.cover-logo-name span{color:#64748b}
.cover-logo-name .accent{color:#f97316}
.cover-logo-sub{font-size:.95rem;color:var(--m);margin-top:4px;letter-spacing:.08em;text-transform:uppercase;font-weight:600}
.cover-footer{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:24px 40px 32px;background:linear-gradient(180deg,#f8fafc,#eef2f7);border-top:1px solid var(--line);font-size:.88rem;color:#475569;line-height:1.7}
.cover-footer strong{color:var(--navy)}
.title-orange{font-family:Montserrat,sans-serif;font-weight:800;font-size:1.15rem;color:var(--orange2);letter-spacing:.04em;margin-bottom:8px;text-transform:uppercase}
.title-blue{font-family:Montserrat,sans-serif;font-weight:700;font-size:1.2rem;color:var(--navy);margin:22px 0 10px}
.client-name{font-family:Montserrat,sans-serif;font-weight:700;font-size:1.35rem;color:var(--ink);margin-top:6px}
.client-loc{color:var(--m);font-size:.95rem;margin-bottom:16px}
.body{font-size:.95rem;color:#334155;line-height:1.7;margin-bottom:12px}
.intro-grid{display:grid;grid-template-columns:1.35fr 1fr;gap:24px;align-items:start;margin-bottom:8px}
.intro-illust{display:flex;align-items:center;justify-content:center}
.intro-illust img{max-width:100%;max-height:200px;border-radius:12px;object-fit:cover;box-shadow:0 6px 24px rgba(15,23,42,.12)}
.flow-page{background:linear-gradient(180deg,#fff 55%,#e0f0fa 100%)}
.flow-title{font-family:Montserrat,sans-serif;font-weight:700;font-size:1.55rem;color:var(--navy);text-align:center;margin-bottom:28px}
.flow-top{display:flex;align-items:flex-start;justify-content:center;gap:8px;margin-bottom:28px}
.flow-step{text-align:center;flex:1;max-width:180px}
.flow-icon{width:72px;height:72px;border-radius:50%;background:var(--orange);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto 10px;box-shadow:0 6px 20px rgba(245,166,35,.4)}
.flow-lbl{font-family:Montserrat,sans-serif;font-weight:800;font-size:.78rem;letter-spacing:.06em;color:var(--navy);text-transform:uppercase;margin-bottom:4px}
.flow-desc{font-size:.82rem;color:#64748b;line-height:1.35}
.flow-val{font-family:Montserrat,sans-serif;font-weight:800;font-size:1.15rem;margin-top:6px}
.flow-val.red{color:var(--red)}.flow-val.green{color:var(--g)}
.flow-arrow{font-size:1.6rem;color:var(--orange);font-weight:700;padding-top:22px}
.banner-blue{background:linear-gradient(90deg,var(--navy),var(--blue));color:#fff;text-align:center;padding:12px 20px;border-radius:8px;font-family:Montserrat,sans-serif;font-weight:700;font-size:.88rem;letter-spacing:.04em;margin:8px 0 22px;box-shadow:0 4px 16px rgba(10,45,107,.25)}
.two-ways{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:28px}
.way{text-align:center;padding:8px 12px}
.way-icon{width:64px;height:64px;border-radius:50%;background:var(--orange);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin:0 auto 12px;box-shadow:0 4px 16px rgba(245,166,35,.35)}
.way h4{font-family:Montserrat,sans-serif;font-weight:800;font-size:1rem;color:var(--navy);letter-spacing:.04em;margin-bottom:10px}
.way ul{list-style:none;text-align:left;display:inline-block;margin-bottom:12px}
.way ul li{font-size:.92rem;color:#334155;padding:3px 0;font-weight:600}
.way ul li::before{content:'● ';color:var(--orange);font-size:.7rem}
.way-price{font-family:Montserrat,sans-serif;font-weight:900;font-size:1.55rem;color:var(--navy);margin:8px 0 12px}
.way-note{font-size:.82rem;color:#64748b;line-height:1.55;text-align:left}
.resultado-final{text-align:center;padding:20px 16px 8px}
.rf-icon{width:68px;height:68px;border-radius:50%;background:var(--orange);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.7rem;margin:0 auto 12px;box-shadow:0 6px 20px rgba(245,166,35,.4)}
.rf-lbl{font-family:Montserrat,sans-serif;font-weight:800;font-size:.95rem;color:var(--navy);letter-spacing:.06em}
.rf-sub{font-size:.9rem;color:#475569;margin:8px 0 14px;line-height:1.5}
.lucro-box{display:inline-block;background:#fff;border:3px solid var(--orange);border-radius:10px;padding:12px 28px;font-family:Montserrat,sans-serif;font-weight:800;font-size:1.2rem;color:var(--navy);box-shadow:0 4px 16px rgba(245,166,35,.2)}
.kit-list{margin:12px 0 18px 4px;padding-left:18px}
.kit-list li{font-size:.95rem;color:#334155;margin-bottom:6px;line-height:1.45}
.kit-list li::marker{color:var(--orange)}
.conta-line{font-size:1rem;margin:6px 0;color:#334155}
.conta-line .sem{color:var(--red);font-weight:800}
.conta-line .com{color:var(--g);font-weight:800}
.conta-line .gen{color:var(--blue);font-weight:800}
.fin-logos{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:12px 0 14px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px}
.fin-lbl{font-size:.82rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.04em}
.fin-brands{display:flex;align-items:center;gap:12px}
.fin-bv,.fin-santander{display:inline-flex;align-items:center;line-height:0}
.fin-bv svg,.fin-santander svg{display:block;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.cond-table{width:100%;border-collapse:collapse;margin:16px 0;font-size:.88rem;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(15,23,42,.06)}
.cond-table td{padding:11px 14px;border-bottom:1px solid #dbeafe;vertical-align:top}
.cond-table tr:nth-child(odd){background:#eff6ff}
.cond-table tr:nth-child(even){background:#fff}
.cond-table td:first-child{font-weight:700;color:var(--navy);width:28%;white-space:nowrap}
.cond-table .inv-row{background:var(--navy)!important;color:#fff}
.cond-table .inv-row td{color:#fff;font-weight:800;font-size:1rem;border-bottom:none}
.fine-print{font-size:.75rem;color:#94a3b8;line-height:1.5;margin-top:10px;font-style:italic}
.chart-wrap{margin:20px 0;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid var(--line)}
.chart-wrap h4{font-family:Montserrat,sans-serif;font-weight:700;font-size:.95rem;color:var(--navy);text-align:center;margin-bottom:14px}
.gen-chart{display:flex;align-items:flex-end;justify-content:space-between;gap:4px;height:160px;padding:0 4px}
.gen-col{flex:1;display:flex;flex-direction:column;align-items:center;height:100%}
.gen-bar{width:12px;border-radius:3px 3px 0 0;min-height:2px}
.gen-bar.g{background:linear-gradient(180deg,#22c55e,#16a34a)}
.gen-bar.c{background:#94a3b8}
.gen-lbl{font-size:.65rem;color:var(--m);margin-top:4px;font-weight:600}
.bar-chart{display:flex;align-items:flex-end;justify-content:space-between;gap:3px;height:220px;padding:8px 4px 0;border-bottom:2px solid #cbd5e1}
.bar-col{flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end}
.bar{width:100%;max-width:28px;border-radius:4px 4px 0 0;min-height:3px}
.bar.pos{background:linear-gradient(180deg,#60a5fa,#2563eb)}
.bar.neg{background:linear-gradient(180deg,#f87171,#dc2626);border-radius:0 0 4px 4px}
.bar-lbl{font-size:.62rem;color:var(--m);margin-top:4px;font-weight:600}
.port-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:12px}
.port-card{border-radius:12px;overflow:hidden;background:#fff;border:1px solid var(--line);box-shadow:0 4px 16px rgba(15,23,42,.06)}
.port-card img{width:100%;height:130px;object-fit:cover;display:block}
.port-card .cap{padding:10px 12px;font-size:.78rem;color:#475569;line-height:1.45}
.port-card .cap strong{display:block;color:var(--navy);font-size:.82rem;margin-bottom:2px}
.notes-list{margin:12px 0 24px 4px;padding-left:18px}
.notes-list li{font-size:.92rem;color:#334155;margin-bottom:8px;line-height:1.5}
.notes-list li::marker{color:var(--orange)}
.signature{margin-top:36px;text-align:center}
.signature .line{width:220px;height:1px;background:#94a3b8;margin:28px auto 8px}
.signature .name{font-family:Montserrat,sans-serif;font-weight:700;font-size:1rem;color:var(--navy)}
.footer-contact{margin-top:40px;padding:18px;background:linear-gradient(135deg,#0a2d6b,#1a4fad);color:#fff;border-radius:12px;text-align:center;font-size:.9rem;line-height:1.7}
.footer-contact strong{font-family:Montserrat,sans-serif;font-size:1.05rem}
.price-box{background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:14px 16px;margin-bottom:18px}
.price-box-title{font-weight:700;margin-bottom:10px;color:var(--g);font-size:.95rem}
.price-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;font-size:.85rem;line-height:1.55}
.price-grid strong{display:block;margin-bottom:4px;color:var(--navy)}
.price-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.price-edit{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:18px}
.price-edit h4{margin:0 0 12px;font-family:Montserrat,sans-serif;color:var(--navy);font-size:1rem}
.price-edit .equip-block{margin:14px 0;padding-top:10px;border-top:1px dashed #e2e8f0}
.price-edit .equip-block strong{display:block;margin-bottom:8px;color:var(--navy);font-size:.9rem}
.list{list-style:none}
.list li{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line);font-size:.9rem}
.list li:hover{background:#f8fafc}
.list li:last-child{border-bottom:none}
@media print{body{background:#fff}.no-print,.toolbar,.card.no-print{display:none!important}.wrap{max-width:100%;padding:0}.page{box-shadow:none;margin:0;border-radius:0;page-break-after:always;max-width:100%}.page-inner{min-height:auto;padding:20px 28px 36px}.cover{min-height:100vh}.cover-top{padding:40px 28px 28px}.cover-top h1{font-size:2.6rem}.cover-circles img{width:120px;height:120px}.cover-circles img.main{width:148px;height:148px}}
@media (max-width:640px){.page-inner{padding:20px 16px 40px;min-height:auto}.cover-top h1{font-size:2rem}.cover-circles{gap:8px}.cover-circles img{width:90px;height:90px}.cover-circles img.main{width:110px;height:110px}.cover-footer{grid-template-columns:1fr;font-size:.8rem}.flow-top{flex-wrap:wrap}.two-ways{grid-template-columns:1fr}.intro-grid{grid-template-columns:1fr}.port-grid{grid-template-columns:1fr 1fr}.row,.row.four{grid-template-columns:1fr}.price-grid{grid-template-columns:1fr}}
`;
