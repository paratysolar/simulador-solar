'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';

const STAGES = [
  { id: 'novo', label: 'Novo', color: '#6b7280' },
  { id: 'contactado', label: 'Contactado', color: '#3b82f6' },
  { id: 'qualificado', label: 'Qualificado', color: '#8b5cf6' },
  { id: 'proposta', label: 'Proposta', color: '#f59e0b' },
  { id: 'negociacao', label: 'Negociação', color: '#f97316' },
  { id: 'fechado', label: 'Fechado', color: '#06cb3f' },
  { id: 'perdido', label: 'Perdido', color: '#ff4d4f' },
];
const TAGS = ['quente','morno','frio','residencial','comercial','rural','financiamento','à vista'];

const STYLES = `:root{--bg:#0a0a0a;--card:#111;--soft:#161616;--text:#f5f5f5;--muted:#a0a0a0;--accent:#06cb3f;--border:#2a2a2a;--danger:#ff4d4f;--wa:#25d366}*{box-sizing:border-box;margin:0;padding:0}body,.crm-root{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}.wrap{max-width:1280px;margin:0 auto;padding:20px 14px 50px}header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}h1{font-size:1.35rem;font-weight:600}h1 span{color:var(--accent)}a.back{color:var(--muted);text-decoration:none;font-size:.85rem}.tabs{display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap;border-bottom:1px solid var(--border);padding-bottom:10px}.tab{background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:10px;padding:9px 14px;cursor:pointer;font-family:inherit;font-size:.85rem}.tab.active{background:var(--accent);color:#0a0a0a;border-color:var(--accent);font-weight:600}.tab.wa.active{background:var(--wa);border-color:var(--wa);color:#0a0a0a}.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:10px;margin-bottom:18px}.stat{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center}.stat .n{font-size:1.4rem;font-weight:700;color:var(--accent)}.stat .l{font-size:.68rem;color:var(--muted);text-transform:uppercase}.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.filters select,.filters input,.filters button,.btn-primary,.btn-sm{background:var(--soft);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:9px 12px;font-family:inherit;font-size:.85rem}.filters button,.btn-primary{background:var(--accent);color:#0a0a0a;font-weight:600;cursor:pointer;border:none}.btn-sm{padding:6px 10px;font-size:.78rem;cursor:pointer}.btn-wa{background:var(--wa);color:#0a0a0a;font-weight:600;cursor:pointer;border:none;border-radius:10px;padding:10px 16px;font-family:inherit;font-size:.85rem}.btn-danger{background:transparent;border:1px solid var(--danger);color:var(--danger);border-radius:10px;padding:8px 12px;cursor:pointer;font-family:inherit}.btn-out{background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:10px;padding:8px 12px;cursor:pointer;font-family:inherit}.btn-link{background:none;border:none;color:var(--accent);cursor:pointer;font-size:.82rem;font-family:inherit}table{width:100%;border-collapse:collapse;background:var(--card);border-radius:12px;overflow:hidden;border:1px solid var(--border)}th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--border);font-size:.82rem}th{background:var(--soft);color:var(--muted);font-weight:500;font-size:.7rem;text-transform:uppercase}.badge{display:inline-block;padding:3px 9px;border-radius:100px;font-size:.7rem;font-weight:600}.empty{text-align:center;padding:40px 16px;color:var(--muted)}.login-box{max-width:360px;margin:80px auto;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;text-align:center}.login-box input{width:100%;margin-bottom:10px;background:var(--soft);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:12px;font-family:inherit}.login-box button{width:100%;background:var(--accent);color:#0a0a0a;font-weight:600;border:none;border-radius:10px;padding:12px;cursor:pointer;font-family:inherit}.err{color:var(--danger);font-size:.85rem;margin-top:8px}.ok{color:var(--accent);font-size:.85rem;margin-top:8px}.detail{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:50;padding:14px}.detail-card{background:var(--card);border:1px solid var(--border);border-radius:16px;max-width:640px;width:100%;max-height:88vh;overflow:auto;padding:22px}.detail-card pre{background:var(--soft);padding:12px;border-radius:10px;font-size:.75rem;overflow:auto;white-space:pre-wrap;margin-top:10px}.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:14px}.card h3{font-size:1rem;margin-bottom:8px}.card p,.card li{color:var(--muted);font-size:.88rem;line-height:1.45}.card input,.card textarea{width:100%;background:var(--soft);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:10px;font-family:inherit;margin:4px 0 10px}.card label{font-size:.75rem;color:var(--muted)}.status-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:100px;font-size:.78rem;font-weight:600}.status-pill.on{background:rgba(37,211,102,.15);color:var(--wa)}.status-pill.off{background:rgba(255,77,79,.12);color:var(--danger)}.kanban{display:flex;gap:10px;overflow-x:auto;padding-bottom:12px;min-height:420px}.col{min-width:200px;max-width:220px;flex:1;background:var(--soft);border-radius:12px;border:1px solid var(--border);display:flex;flex-direction:column}.col-h{padding:10px 12px;font-size:.78rem;font-weight:600;border-bottom:1px solid var(--border);display:flex;justify-content:space-between}.col-h .cnt{background:var(--card);padding:2px 8px;border-radius:100px;font-size:.72rem;color:var(--muted)}.col-b{padding:8px;flex:1;overflow-y:auto;max-height:520px}.lead-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:8px;cursor:pointer}.lead-card:hover{border-color:var(--accent)}.lead-card .name{font-weight:600;font-size:.85rem;margin-bottom:4px}.lead-card .meta{font-size:.72rem;color:var(--muted)}.lead-card .tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}.tag{font-size:.65rem;padding:2px 7px;border-radius:100px;background:rgba(6,203,63,.12);color:var(--accent)}.chat-grid{display:grid;grid-template-columns:260px 1fr;gap:12px;min-height:480px}@media(max-width:800px){.chat-grid{grid-template-columns:1fr}}.chat-list{display:grid;gap:8px;max-height:520px;overflow-y:auto}.chat-item{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;cursor:pointer}.chat-item:hover,.chat-item.active{border-color:var(--wa)}.chat-msgs{max-height:380px;overflow:auto;background:var(--soft);border-radius:12px;padding:12px;margin:10px 0}.msg{margin-bottom:10px;max-width:82%}.msg.inbound{margin-right:auto}.msg.outbound{margin-left:auto;text-align:right}.msg .bubble{display:inline-block;padding:8px 12px;border-radius:12px;font-size:.86rem}.msg.inbound .bubble{background:#1a2e1a;color:#d4f5d4}.msg.outbound .bubble{background:#1a2438;color:#c8d6ff}.msg .meta{font-size:.68rem;color:var(--muted);margin-top:2px}.send-row{display:flex;gap:8px}.send-row input{flex:1;background:var(--soft);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:10px;font-family:inherit}.flow-item{border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;background:var(--card)}.flow-item h4{font-size:.95rem;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center}.flow-steps{font-size:.8rem;color:var(--muted);margin-top:8px;margin-left:16px}.drawer-actions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.note-list{max-height:160px;overflow:auto;margin-top:8px}.note-item{font-size:.8rem;padding:8px;background:var(--soft);border-radius:8px;margin-bottom:6px}.note-item .at{font-size:.68rem;color:var(--muted)}`;

function stageLabel(id){return STAGES.find(s=>s.id===id)?.label||id}
function stageColor(id){return STAGES.find(s=>s.id===id)?.color||'#6b7280'}

export default function CrmPage(){
  const [auth,setAuth]=useState('');
  const [pwd,setPwd]=useState('');
  const [err,setErr]=useState('');
  const [tab,setTab]=useState('funil');
  const [leads,setLeads]=useState([]);
  const [funnel,setFunnel]=useState({});
  const [q,setQ]=useState('');
  const [stageFilter,setStageFilter]=useState('');
  const [loading,setLoading]=useState(false);
  const [selected,setSelected]=useState(null);
  const [noteText,setNoteText]=useState('');
  const [msg,setMsg]=useState('');
  const [waConfig,setWaConfig]=useState(null);
  const [conversations,setConversations]=useState([]);
  const [activeChat,setActiveChat]=useState(null);
  const [replyText,setReplyText]=useState('');
  const [waMsg,setWaMsg]=useState('');
  const [waErr,setWaErr]=useState('');
  const [flows,setFlows]=useState([]);
  const [formToken,setFormToken]=useState('');
  const [formPhoneId,setFormPhoneId]=useState('');
  const [formWabaId,setFormWabaId]=useState('');
  const [formDisplay,setFormDisplay]=useState('');
  const [formBusiness,setFormBusiness]=useState('Paraty Solar');

  useEffect(()=>{const s=sessionStorage.getItem('crm_auth_v1');if(s)setAuth(s)},[]);

  const loadLeads=useCallback(async()=>{
    if(!auth)return;setLoading(true);
    try{let url='/api/crm/leads?auth='+encodeURIComponent(auth);
      if(stageFilter)url+='&stage='+stageFilter;if(q)url+='&q='+encodeURIComponent(q);
      const res=await fetch(url);const data=await res.json();
      if(data.ok){setLeads(data.leads||[]);setFunnel(data.funnel||{})}
    }catch{}setLoading(false);
  },[auth,stageFilter,q]);

  const loadWa=useCallback(async()=>{
    if(!auth)return;
    try{const[c,conv]=await Promise.all([
      fetch('/api/whatsapp/config?auth='+encodeURIComponent(auth)).then(r=>r.json()),
      fetch('/api/whatsapp/conversations?auth='+encodeURIComponent(auth)).then(r=>r.json()),
    ]);setWaConfig(c);if(conv.ok)setConversations(conv.conversations||[])}catch{}
  },[auth]);

  const loadFlows=useCallback(async()=>{
    if(!auth)return;
    try{const res=await fetch('/api/crm/flows?auth='+encodeURIComponent(auth));const data=await res.json();
      if(data.ok)setFlows(data.flows||[])}catch{}
  },[auth]);

  useEffect(()=>{if(!auth)return;if(tab==='funil'||tab==='leads')loadLeads();if(tab==='chat'||tab==='settings')loadWa();if(tab==='flows')loadFlows()},[auth,tab,loadLeads,loadWa,loadFlows]);

  async function login(){setErr('');try{const res=await fetch('/api/leads?auth='+encodeURIComponent(pwd));const data=await res.json();
    if(data.error==='unauthorized'){setErr('Senha incorreta');return}sessionStorage.setItem('crm_auth_v1',pwd);setAuth(pwd)
  }catch{if(pwd==='solar2026'){sessionStorage.setItem('crm_auth_v1',pwd);setAuth(pwd)}else setErr('Senha incorreta')}}
  function logout(){sessionStorage.removeItem('crm_auth_v1');setAuth('');setLeads([])}

  async function patchLead(id,body){
    const res=await fetch('/api/crm/leads?auth='+encodeURIComponent(auth),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,...body})});
    const data=await res.json();
    if(data.ok){setMsg('Atualizado');loadLeads();if(selected?.id===id)setSelected(s=>s?{...s,...body,notes:data.crm?.notes||s.notes,stage:data.crm?.stage||body.stage||s.stage,tags:data.crm?.tags||body.tags||s.tags}:s)}
    else setMsg(data.error||'Erro');return data;
  }

  async function sendReply(){
    if(!activeChat||!replyText.trim())return;setWaErr('');setWaMsg('');
    try{const res=await fetch('/api/whatsapp/send?auth='+encodeURIComponent(auth),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:activeChat.phone,text:replyText.trim()})});
      const data=await res.json();if(data.ok){setWaMsg('Enviado (grátis na janela 24h)');setReplyText('');loadWa()}else setWaErr(data.error||'Falha')
    }catch(e){setWaErr(String(e.message||e))}
  }

  async function runFlow(flowId,lead){
    const res=await fetch('/api/crm/flows?auth='+encodeURIComponent(auth),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'run',flowId,lead})});
    const data=await res.json();
    if(data.ok){setMsg('Flow executado');for(const r of data.results||[])if(r.step==='set_stage'&&r.stage)await patchLead(lead.id,{stage:r.stage})}
    else setMsg(data.error||'Erro no flow');
  }

  async function toggleFlow(id){
    await fetch('/api/crm/flows?auth='+encodeURIComponent(auth),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'toggle',id})});loadFlows();
  }

  async function saveManualConfig(){
    setWaErr('');setWaMsg('');if(!formToken||!formPhoneId){setWaErr('Token e Phone Number ID obrigatórios');return}
    const res=await fetch('/api/whatsapp/config?auth='+encodeURIComponent(auth),{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({accessToken:formToken,phoneNumberId:formPhoneId,wabaId:formWabaId,displayPhone:formDisplay,businessName:formBusiness||'Paraty Solar'})});
    const data=await res.json();if(data.ok){setWaMsg('WhatsApp conectado!');loadWa();setFormToken('')}else setWaErr(data.error||'Falha');
  }

  function openChatForLead(lead){
    const phone=String(lead.telefone||lead.contato||'').replace(/\D/g,'');
    if(!phone){setMsg('Lead sem telefone');return}setTab('chat');
    const existing=conversations.find(c=>c.phone.includes(phone)||phone.includes(c.phone));
    setActiveChat(existing||{phone,contactName:lead.nome,messages:[]});
  }

  const byStage=useMemo(()=>{const map={};STAGES.forEach(s=>{map[s.id]=[]});leads.forEach(l=>{const st=l.stage||'novo';if(!map[st])map[st]=[];map[st].push(l)});return map},[leads]);
  const webhookUrl=typeof window!=='undefined'?window.location.origin+'/api/whatsapp/webhook':'';

  if(!auth)return(<div className="crm-root"><style>{STYLES}</style><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <div className="login-box"><h2>CRM Paraty Solar</h2><p>Funil · Chat · Flows · WhatsApp</p>
      <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Senha" onKeyDown={e=>e.key==='Enter'&&login()}/>
      <button onClick={login}>Entrar</button>{err&&<div className="err">{err}</div>}</div></div>);

  return(<div className="crm-root"><style>{STYLES}</style><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <div className="wrap">
      <header><div><h1>CRM <span>Paraty Solar</span></h1><a className="back" href="/index.html">← Simulador</a></div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>{msg&&<span style={{fontSize:'.8rem',color:'var(--muted)'}}>{msg}</span>}<button className="btn-out" onClick={logout}>Sair</button></div></header>
      <div className="tabs">
        <button className={'tab'+(tab==='funil'?' active':'')} onClick={()=>setTab('funil')}>Funil</button>
        <button className={'tab'+(tab==='leads'?' active':'')} onClick={()=>setTab('leads')}>Leads</button>
        <button className={'tab wa'+(tab==='chat'?' active':'')} onClick={()=>setTab('chat')}>Chat</button>
        <button className={'tab'+(tab==='flows'?' active':'')} onClick={()=>setTab('flows')}>Flows</button>
        <button className={'tab'+(tab==='settings'?' active':'')} onClick={()=>setTab('settings')}>Configurações</button>
      </div>

      {tab==='funil'&&(<>
        <div className="stats">{STAGES.map(s=>(<div className="stat" key={s.id}><div className="n" style={{color:s.color}}>{funnel[s.id]||byStage[s.id]?.length||0}</div><div className="l">{s.label}</div></div>))}</div>
        <div className="filters"><input type="search" placeholder="Buscar lead..." value={q} onChange={e=>setQ(e.target.value)}/><button onClick={loadLeads}>Atualizar</button></div>
        {loading?<div className="empty">Carregando...</div>:(
          <div className="kanban">{STAGES.map(s=>(<div className="col" key={s.id}>
            <div className="col-h" style={{borderTop:'3px solid '+s.color}}><span>{s.label}</span><span className="cnt">{byStage[s.id]?.length||0}</span></div>
            <div className="col-b">{(byStage[s.id]||[]).map(l=>(<div className="lead-card" key={l.id} onClick={()=>setSelected(l)}>
              <div className="name">{l.nome}</div><div className="meta">{l.mode} · {l.cidade}</div><div className="meta">{l.contato||l.telefone||'—'}</div>
              {l.tags?.length>0&&<div className="tags">{l.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div>}
            </div>))}</div></div>))}</div>)}
      </>)}

      {tab==='leads'&&(<>
        <div className="filters"><select value={stageFilter} onChange={e=>setStageFilter(e.target.value)}><option value="">Todas etapas</option>{STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
          <input type="search" placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/><button onClick={loadLeads}>Atualizar</button></div>
        {loading?<div className="empty">Carregando...</div>:!leads.length?<div className="empty">Nenhum lead.</div>:(
          <table><thead><tr><th>Nome</th><th>Contato</th><th>Cidade</th><th>Modo</th><th>Etapa</th><th>Tags</th><th></th></tr></thead>
          <tbody>{leads.map(l=>(<tr key={l.id}><td>{l.nome}</td><td>{l.contato||l.telefone||'—'}</td><td>{l.cidade}</td><td>{l.mode}</td>
            <td><span className="badge" style={{background:stageColor(l.stage)+'22',color:stageColor(l.stage)}}>{stageLabel(l.stage)}</span></td>
            <td>{(l.tags||[]).join(', ')||'—'}</td>
            <td><button className="btn-link" onClick={()=>setSelected(l)}>Abrir</button> <button className="btn-link" onClick={()=>openChatForLead(l)}>Chat</button></td></tr>))}</tbody></table>)}
      </>)}

      {tab==='chat'&&(<>
        {!waConfig?.connected?(<div className="card"><h3>WhatsApp não conectado</h3><p>Vá em Configurações.</p>
          <button className="btn-wa" style={{marginTop:10}} onClick={()=>setTab('settings')}>Configurações</button></div>):(
          <div className="chat-grid"><div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong style={{fontSize:'.9rem'}}>Conversas</strong><button className="btn-link" onClick={loadWa}>Atualizar</button></div>
            <div className="chat-list">{!conversations.length&&<div className="empty" style={{padding:16}}>Nenhuma mensagem ainda.</div>}
              {conversations.map(c=>(<div key={c.phone} className={'chat-item'+(activeChat?.phone===c.phone?' active':'')} onClick={()=>setActiveChat(c)}>
                <div style={{fontWeight:600,fontSize:'.88rem'}}>{c.contactName||c.phone}</div>
                <div style={{fontSize:'.75rem',color:'var(--muted)'}}>{(c.messages[c.messages.length-1]?.text||'').slice(0,50)}</div></div>))}</div></div>
            <div>{activeChat?(<>
              <div style={{fontWeight:600,marginBottom:6}}>{activeChat.contactName||activeChat.phone}<span style={{color:'var(--muted)',fontWeight:400,marginLeft:8,fontSize:'.85rem'}}>{activeChat.phone}</span></div>
              <div className="chat-msgs">{(activeChat.messages||[]).map((m,i)=>(<div key={i} className={'msg '+(m.direction||'inbound')}>
                <div className="bubble">{m.text||'['+m.type+']'}</div>
                <div className="meta">{m.direction==='outbound'?'Você':'Cliente'} · {String(m.receivedAt||'').slice(0,19).replace('T',' ')}</div></div>))}</div>
              <div className="send-row"><input value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Escreva a mensagem..." onKeyDown={e=>e.key==='Enter'&&sendReply()}/><button className="btn-wa" onClick={sendReply}>Enviar</button></div>
              {waMsg&&<div className="ok">{waMsg}</div>}{waErr&&<div className="err">{waErr}</div>}</>):<div className="empty">Selecione uma conversa</div>}</div></div>)}
      </>)}

      {tab==='flows'&&(<>
        <div className="card"><h3>Flows de conversa e funil</h3><p>Automação para volume inicial. Triggers por etapa ou execução manual.</p></div>
        {flows.map(f=>(<div className="flow-item" key={f.id}>
          <h4><span>{f.name} {f.active?<span className="status-pill on">Ativo</span>:<span className="status-pill off">Inativo</span>}</span>
            <button className="btn-sm" onClick={()=>toggleFlow(f.id)}>{f.active?'Desativar':'Ativar'}</button></h4>
          <div style={{fontSize:'.8rem',color:'var(--muted)'}}>Trigger: {f.trigger} {f.triggerStage?'→ '+stageLabel(f.triggerStage):''}</div>
          <ol className="flow-steps">{(f.steps||[]).map((s,i)=>(<li key={i}>{s.type==='message'&&<>Mensagem: “{(s.text||'').slice(0,80)}…”</>}{s.type==='set_stage'&&<>Mover para: {stageLabel(s.stage)}</>}{s.type==='wait'&&<>Aguardar {s.minutes||0} min</>}</li>))}</ol>
          <select style={{width:'100%',marginTop:8,background:'var(--soft)',border:'1px solid var(--border)',color:'var(--text)',borderRadius:10,padding:8}} defaultValue=""
            onChange={e=>{const lead=leads.find(l=>l.id===e.target.value);if(lead)runFlow(f.id,lead);e.target.value=''}}>
            <option value="">Executar em lead...</option>{leads.slice(0,40).map(l=><option key={l.id} value={l.id}>{l.nome} — {stageLabel(l.stage)}</option>)}</select></div>))}
        {!flows.length&&<div className="empty">Carregando flows...</div>}
      </>)}

      {tab==='settings'&&(<>
        <div className="card"><h3>Status WhatsApp</h3>{waConfig?.connected?(<>
          <span className="status-pill on">● Conectado</span>
          <p style={{marginTop:10}}>Número: <strong>{waConfig.displayPhone||'—'}</strong><br/>Phone ID: <code>{waConfig.phoneNumberId}</code></p>
          <button className="btn-danger" onClick={async()=>{if(confirm('Desconectar?')){await fetch('/api/whatsapp/config?auth='+encodeURIComponent(auth),{method:'DELETE'});setWaConfig({connected:false})}}}>Desconectar</button>
        </>):<span className="status-pill off">● Desconectado</span>}</div>
        <div className="card"><h3>Conectar Meta / WhatsApp</h3><p>Parceiro Meta · recursos gratuitos.</p>
          <label>Access Token</label><input type="password" value={formToken} onChange={e=>setFormToken(e.target.value)} placeholder="EAAG..."/>
          <label>Phone Number ID</label><input value={formPhoneId} onChange={e=>setFormPhoneId(e.target.value)}/>
          <label>WABA ID</label><input value={formWabaId} onChange={e=>setFormWabaId(e.target.value)}/>
          <label>Número exibição</label><input value={formDisplay} onChange={e=>setFormDisplay(e.target.value)} placeholder="+55..."/>
          <label>Empresa</label><input value={formBusiness} onChange={e=>setFormBusiness(e.target.value)}/>
          <button className="btn-primary" onClick={saveManualConfig}>Salvar conexão</button>
          {waMsg&&<div className="ok">{waMsg}</div>}{waErr&&<div className="err">{waErr}</div>}</div>
        <div className="card"><h3>Webhook</h3><p><code style={{wordBreak:'break-all'}}>{webhookUrl}</code></p>
          <p>Verify Token: <code>paraty_solar_verify_2026</code> · Campo: <strong>messages</strong></p></div>
        <div className="card"><h3>Banco de dados</h3><p><strong>Vercel Blob</strong> — leads, crm/meta.json, flows, mensagens WhatsApp</p></div>
      </>)}
    </div>

    {selected&&(<div className="detail" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
      <div className="detail-card">
        <button className="btn-link" style={{float:'right',fontSize:'1.3rem'}} onClick={()=>setSelected(null)}>×</button>
        <h3>{selected.nome}</h3>
        <p style={{color:'var(--muted)',fontSize:'.88rem',marginBottom:8}}>{selected.cidade} · {selected.mode} · {selected.contato||selected.telefone||'sem telefone'}</p>
        <label style={{fontSize:'.75rem',color:'var(--muted)'}}>Etapa do funil</label>
        <div className="drawer-actions">{STAGES.map(s=>(<button key={s.id} className="btn-sm" style={{borderColor:selected.stage===s.id?s.color:undefined,background:selected.stage===s.id?s.color+'33':undefined,color:selected.stage===s.id?s.color:undefined}} onClick={()=>patchLead(selected.id,{stage:s.id})}>{s.label}</button>))}</div>
        <label style={{fontSize:'.75rem',color:'var(--muted)'}}>Classificação</label>
        <div className="drawer-actions">{TAGS.map(t=>(<button key={t} className="btn-sm" style={{background:(selected.tags||[]).includes(t)?'rgba(6,203,63,.2)':undefined,color:(selected.tags||[]).includes(t)?'var(--accent)':undefined}} onClick={()=>{const tags=selected.tags||[];const next=tags.includes(t)?tags.filter(x=>x!==t):[...tags,t];patchLead(selected.id,{tags:next})}}>{t}</button>))}</div>
        <div className="drawer-actions"><button className="btn-wa" onClick={()=>openChatForLead(selected)}>Abrir Chat WhatsApp</button></div>
        <label style={{fontSize:'.75rem',color:'var(--muted)'}}>Telefone WhatsApp</label>
        <input defaultValue={selected.telefone||selected.contato||''} placeholder="5511999999999" onBlur={e=>{const v=e.target.value.trim();if(v&&v!==(selected.telefone||selected.contato))patchLead(selected.id,{telefone:v})}} style={{width:'100%',background:'var(--soft)',border:'1px solid var(--border)',color:'var(--text)',borderRadius:10,padding:10,marginBottom:10}}/>
        <label style={{fontSize:'.75rem',color:'var(--muted)'}}>Nova nota</label>
        <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={2} style={{width:'100%',background:'var(--soft)',border:'1px solid var(--border)',color:'var(--text)',borderRadius:10,padding:10}}/>
        <button className="btn-primary" style={{marginTop:6}} onClick={()=>{if(noteText.trim()){patchLead(selected.id,{note:noteText.trim()});setNoteText('')}}}>Salvar nota</button>
        <div className="note-list">{(selected.notes||[]).map((n,i)=>(<div className="note-item" key={i}><div>{n.text}</div><div className="at">{String(n.at||'').slice(0,19).replace('T',' ')}</div></div>))}</div>
        <details style={{marginTop:14}}><summary style={{cursor:'pointer',color:'var(--muted)',fontSize:'.85rem'}}>Dados do simulador</summary><pre>{JSON.stringify(selected.data||selected,null,2)}</pre></details>
      </div></div>)}
  </div>);
}
