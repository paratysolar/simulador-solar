export const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{--teal:#0d9488;--teal-d:#0f766e;--teal-l:#14b8a6;--bg:#f8fafc;--card:#fff;--border:#e2e8f0;--text:#0f172a;--muted:#64748b;--soft:#f1f5f9;--danger:#ef4444;--ok:#10b981;--wa:#25d366}
body,.crm-root{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.layout{display:flex;min-height:100vh}
.sidebar{width:220px;background:var(--teal);color:#fff;display:flex;flex-direction:column;flex-shrink:0}
.sidebar .brand{padding:18px 16px;font-weight:700;font-size:1.05rem;border-bottom:1px solid rgba(255,255,255,.15)}
.sidebar .brand small{font-weight:400;opacity:.8;font-size:.7rem;display:block}
.sidebar nav{padding:10px 8px;flex:1;overflow-y:auto}
.sidebar nav button{width:100%;text-align:left;background:transparent;border:none;color:rgba(255,255,255,.9);padding:10px 12px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:.88rem;display:flex;align-items:center;gap:10px;margin-bottom:2px}
.sidebar nav button:hover{background:rgba(255,255,255,.12)}
.sidebar nav button.active{background:rgba(255,255,255,.22);font-weight:600}
.sidebar .foot{padding:12px;border-top:1px solid rgba(255,255,255,.15);font-size:.75rem;opacity:.85}
.main{flex:1;display:flex;flex-direction:column;min-width:0}
.topbar{background:var(--card);border-bottom:1px solid var(--border);padding:12px 20px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.topbar h2{font-size:1.1rem;font-weight:600}
.content{padding:20px;flex:1;overflow:auto}
.btn{border:none;border-radius:8px;padding:8px 14px;font-family:inherit;font-size:.85rem;cursor:pointer;font-weight:500}
.btn-primary{background:var(--teal);color:#fff}
.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--text)}
.btn-danger{background:transparent;border:1px solid var(--danger);color:var(--danger)}
.btn-wa{background:var(--wa);color:#fff}
.btn-sm{padding:5px 10px;font-size:.78rem}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:18px}
.stat{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px}
.stat .n{font-size:1.5rem;font-weight:700;color:var(--teal)}
.stat .l{font-size:.72rem;color:var(--muted);text-transform:uppercase;margin-top:2px}
.kanban{display:flex;gap:12px;overflow-x:auto;padding-bottom:12px;min-height:420px}
.col{min-width:210px;max-width:230px;flex:1;background:var(--soft);border-radius:12px;border:1px solid var(--border)}
.col-h{padding:12px;font-size:.8rem;font-weight:600;border-bottom:1px solid var(--border);display:flex;justify-content:space-between}
.col-b{padding:8px;flex:1;overflow-y:auto;max-height:560px}
.lead-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:8px;cursor:pointer}
.lead-card:hover{border-color:var(--teal)}
.lead-card .name{font-weight:600;font-size:.85rem}
.lead-card .meta{font-size:.72rem;color:var(--muted)}
.tag{font-size:.65rem;padding:2px 7px;border-radius:100px;background:rgba(13,148,136,.12);color:var(--teal);margin:2px}
table{width:100%;border-collapse:collapse;background:var(--card);border-radius:12px;overflow:hidden;border:1px solid var(--border)}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--border);font-size:.82rem}
th{background:var(--soft);color:var(--muted);font-size:.7rem;text-transform:uppercase}
.empty{text-align:center;padding:48px 16px;color:var(--muted)}
.login-box{max-width:380px;margin:100px auto;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:32px;text-align:center}
.login-box input{width:100%;margin-bottom:10px;background:var(--soft);border:1px solid var(--border);border-radius:10px;padding:12px}
.login-box button{width:100%;background:var(--teal);color:#fff;font-weight:600;border:none;border-radius:10px;padding:12px;cursor:pointer}
.err{color:var(--danger)}.ok{color:var(--ok)}
.modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px}
.modal{background:var(--card);border-radius:16px;max-width:640px;width:100%;max-height:90vh;overflow:auto;padding:24px}
.trigger-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}
.trigger-card{border:1px solid var(--border);border-radius:12px;padding:14px;cursor:pointer}
.trigger-card:hover,.trigger-card.sel{border-color:var(--teal);background:rgba(13,148,136,.06)}
.drawer{position:fixed;top:0;right:0;width:min(420px,100%);height:100vh;background:var(--card);border-left:1px solid var(--border);z-index:80;overflow-y:auto;padding:20px}
.chat-grid{display:grid;grid-template-columns:260px 1fr;gap:12px;min-height:480px}
@media(max-width:800px){.chat-grid{grid-template-columns:1fr}}
.chat-item{padding:12px;border:1px solid var(--border);border-radius:12px;margin-bottom:8px;cursor:pointer}
.chat-item.active{border-color:var(--wa)}
.chat-msgs{max-height:380px;overflow:auto;background:var(--soft);border-radius:12px;padding:12px;margin:10px 0}
.msg{margin-bottom:10px;max-width:82%}.msg.inbound{margin-right:auto}.msg.outbound{margin-left:auto;text-align:right}
.msg .bubble{display:inline-block;padding:8px 12px;border-radius:12px;font-size:.86rem}
.msg.inbound .bubble{background:#dcfce7}.msg.outbound .bubble{background:#e0e7ff}
.flow-item{border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;background:var(--card)}
.input{width:100%;padding:9px;border:1px solid var(--border);border-radius:8px;background:var(--soft);font-family:inherit;margin:4px 0 10px}
`;
