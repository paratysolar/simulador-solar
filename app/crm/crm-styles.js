export const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{--teal:#0d9488;--teal-d:#0f766e;--teal-l:#14b8a6;--bg:#f1f5f9;--card:#fff;--border:#e2e8f0;--text:#0f172a;--muted:#64748b;--soft:#f8fafc;--danger:#ef4444;--ok:#10b981;--wa:#25d366}
body,.crm-root{font-family:Inter,system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.layout{display:flex;min-height:100vh}
.sidebar{width:220px;background:var(--teal);color:#fff;display:flex;flex-direction:column;flex-shrink:0}
.sidebar .brand{padding:18px 16px;font-weight:700;font-size:1.05rem;border-bottom:1px solid rgba(255,255,255,.15)}
.sidebar .brand small{font-weight:400;opacity:.8;font-size:.7rem;display:block}
.nav{flex:1;padding:10px 8px;overflow-y:auto}
.nav button{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:0;background:transparent;color:rgba(255,255,255,.9);border-radius:8px;cursor:pointer;font-size:.9rem;text-align:left;margin-bottom:2px}
.nav button:hover{background:rgba(255,255,255,.12)}
.nav button.active{background:rgba(255,255,255,.22);font-weight:600}
.nav button .badge{margin-left:auto;background:#fbbf24;color:#78350f;font-size:.65rem;padding:2px 6px;border-radius:4px;font-weight:700}
.main{flex:1;display:flex;flex-direction:column;min-width:0}
.topbar{background:var(--card);border-bottom:1px solid var(--border);padding:12px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.topbar h1{font-size:1.15rem;font-weight:600}
.content{padding:20px;flex:1;overflow:auto}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px}
.card h3{font-size:.95rem;margin-bottom:8px}
.btn{border:0;border-radius:8px;padding:8px 14px;font-size:.85rem;cursor:pointer;font-weight:500;display:inline-flex;align-items:center;gap:6px}
.btn-primary{background:var(--teal);color:#fff}
.btn-primary:hover{background:var(--teal-d)}
.btn-ghost{background:var(--soft);color:var(--text);border:1px solid var(--border)}
.btn-danger{background:var(--danger);color:#fff}
.btn-wa{background:var(--wa);color:#fff}
.btn-sm{padding:5px 10px;font-size:.8rem}
.input,select,textarea{width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-size:.9rem;margin:4px 0 10px;background:#fff}
label{font-size:.8rem;color:var(--muted);font-weight:500}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px}
.stat{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px}
.stat .n{font-size:1.5rem;font-weight:700}
.stat .l{font-size:.75rem;color:var(--muted);margin-top:2px}
.kanban{display:flex;gap:12px;overflow-x:auto;padding-bottom:12px;min-height:420px}
.col{min-width:220px;max-width:260px;background:var(--soft);border-radius:12px;display:flex;flex-direction:column;border:1px solid var(--border)}
.col-h{padding:12px;font-weight:600;font-size:.85rem;display:flex;justify-content:space-between;align-items:center;background:#fff;border-radius:12px 12px 0 0;border-bottom:1px solid var(--border)}
.col-b{padding:8px;flex:1;overflow-y:auto;max-height:60vh}
.lead-card{background:#fff;border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:8px;cursor:grab;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.lead-card:hover{border-color:var(--teal-l)}
.lead-card .name{font-weight:600;font-size:.9rem}
.lead-card .meta{font-size:.75rem;color:var(--muted);margin-top:2px}
.tag{display:inline-block;background:#ccfbf1;color:#0f766e;font-size:.65rem;padding:2px 6px;border-radius:4px;margin:2px 2px 0 0}
.modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px}
.modal{background:#fff;border-radius:14px;padding:22px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 50px rgba(0,0,0,.2)}
.modal.wide{max-width:640px}
.modal h3{margin-bottom:14px;color:var(--teal)}
.empty{text-align:center;padding:40px;color:var(--muted)}
.ok{color:var(--ok);font-size:.85rem;margin-top:6px}
.err{color:var(--danger);font-size:.85rem;margin-top:6px}
.pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.7rem;font-weight:600}
.pill.on{background:#d1fae5;color:#065f46}
.pill.off{background:#fee2e2;color:#991b1b}
.chat-layout{display:grid;grid-template-columns:280px 1fr;gap:12px;height:calc(100vh - 140px);min-height:400px}
.chat-list{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow-y:auto}
.chat-item{padding:12px;border-bottom:1px solid var(--border);cursor:pointer}
.chat-item:hover,.chat-item.active{background:var(--soft)}
.chat-panel{background:var(--card);border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column}
.chat-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px}
.msg{max-width:75%}
.msg.inbound{align-self:flex-start}
.msg.outbound{align-self:flex-end}
.msg .bubble{padding:8px 12px;border-radius:12px;font-size:.9rem}
.msg.inbound .bubble{background:var(--soft);border:1px solid var(--border)}
.msg.outbound .bubble{background:#d1fae5;color:#064e3b}
.flow-item{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px}
.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center}
.filters input,.filters select{margin:0;width:auto;min-width:140px}
.drawer{position:fixed;right:0;top:0;bottom:0;width:360px;background:#fff;border-left:1px solid var(--border);padding:18px;overflow-y:auto;z-index:50;box-shadow:-4px 0 24px rgba(0,0,0,.08)}
.funnel-chart{display:flex;align-items:flex-end;gap:0;height:220px;padding:16px 8px;background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.funnel-bar{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;position:relative;min-width:0}
.funnel-bar .bar{width:100%;background:linear-gradient(180deg,#14b8a6,#0d9488);border-radius:4px 4px 0 0;transition:height .3s;min-height:4px}
.funnel-bar .lbl{font-size:.65rem;color:var(--muted);text-align:center;margin-top:6px;line-height:1.2}
.funnel-bar .cnt{font-size:.75rem;font-weight:700;color:var(--teal-d)}
.report-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}
.report-side{display:flex;gap:0;margin-bottom:16px;flex-wrap:wrap}
.report-side button{padding:8px 14px;border:1px solid var(--border);background:#fff;cursor:pointer;font-size:.85rem}
.report-side button:first-child{border-radius:8px 0 0 8px}
.report-side button:last-child{border-radius:0 8px 8px 0}
.report-side button.active{background:var(--teal);color:#fff;border-color:var(--teal)}
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0d9488,#0f766e)}
.login-box{background:#fff;padding:32px;border-radius:16px;width:100%;max-width:360px;box-shadow:0 20px 40px rgba(0,0,0,.15)}
table{width:100%;border-collapse:collapse;background:var(--card);border-radius:12px;overflow:hidden;border:1px solid var(--border)}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--border);font-size:.85rem}
th{background:var(--soft);font-weight:600;color:var(--muted)}
.steps{display:flex;gap:8px;margin:12px 0;font-size:.8rem}
.steps span{opacity:.5}
.steps span.done{opacity:1;color:var(--teal);font-weight:600}
@media(max-width:900px){.sidebar{width:56px}.chat-layout{grid-template-columns:1fr}.drawer{width:100%}}
`;
