'use client';
import {useEffect,useState,useMemo,useCallback} from 'react';
import {STAGES,TAGS,TRIGGER_TYPES,MENU,stageLabel,stageColor,fmtMoney,fmtDate} from './crm-data';
import {CSS} from './crm-styles';
export default function CrmPage(){
  const [auth,setAuth]=useState('');
  const [pwd,setPwd]=useState('');
  const [err,setErr]=useState('');
  const [tab,setTab]=useState('funil');
  const [leads,setLeads]=useState([]);
  const [funnel,setFunnel]=useState({});
  const [q,setQ]=useState('');
  const [loading,setLoading]=useState(false);
  const [selected,setSelected]=useState(null);
  const [msg,setMsg]=useState('');
  const [waConfig,setWaConfig]=useState(null);
  const [conversations,setConversations]=useState([]);
  const [flows,setFlows]=useState([]);
  const [dash,setDash]=useState(null);

  useEffect(()=>{const s=sessionStorage.getItem('crm_auth_v1');if(s)setAuth(s);},[]);

  const loadLeads=useCallback(async()=>{
    if(!auth)return;setLoading(true);
    try{const d=await fetch('/api/crm/leads?auth='+encodeURIComponent(auth)+(q?'&q='+encodeURIComponent(q):'')).then(r=>r.json());
      if(d.ok){setLeads(d.leads||[]);setFunnel(d.funnel||{});}}catch{}setLoading(false);
  },[auth,q]);

  useEffect(()=>{if(!auth)return;if(tab==='funil'||tab==='contatos')loadLeads();
    if(tab==='dashboard')fetch('/api/crm/dashboard?auth='+encodeURIComponent(auth)).then(r=>r.json()).then(d=>{if(d.ok)setDash(d);});
    if(tab==='flows')fetch('/api/crm/flows?auth='+encodeURIComponent(auth)).then(r=>r.json()).then(d=>{if(d.ok)setFlows(d.flows||[]);});
    if(tab==='chat'||tab==='settings'){Promise.all([
      fetch('/api/whatsapp/config?auth='+encodeURIComponent(auth)).then(r=>r.json()),
      fetch('/api/whatsapp/conversations?auth='+encodeURIComponent(auth)).then(r=>r.json())
    ]).then(([c,conv])=>{setWaConfig(c);if(conv.ok)setConversations(conv.conversations||[]);});}
  },[auth,tab,loadLeads]);

  async function login(){
    setErr('');
    try{const d=await fetch('/api/leads?auth='+encodeURIComponent(pwd)).then(r=>r.json());
      if(d.error==='unauthorized'){setErr('Senha incorreta');return;}
      sessionStorage.setItem('crm_auth_v1',pwd);setAuth(pwd);
    }catch{if(pwd==='solar2026'){sessionStorage.setItem('crm_auth_v1',pwd);setAuth(pwd);}else setErr('Senha incorreta');}
  }
  function logout(){sessionStorage.removeItem('crm_auth_v1');setAuth('');}

  async function patchLead(id,body){
    const d=await fetch('/api/crm/leads?auth='+encodeURIComponent(auth),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,...body})}).then(r=>r.json());
    if(d.ok){setMsg('Atualizado');loadLeads();if(d.triggersFired?.length)setMsg('Atualizado + '+d.triggersFired.length+' flow(s)');}
    return d;
  }

  const byStage=useMemo(()=>{const m={};STAGES.forEach(s=>m[s.id]=[]);leads.forEach(l=>{const st=l.stage||'novo';if(!m[st])m[st]=[];m[st].push(l);});return m;},[leads]);

  if(!auth)return(<div className="crm-root"><style>{CSS}</style>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <div className="login-box"><h2>CRM Paraty Solar</h2><p>Funil · Chat · Flows · WhatsApp</p>
      <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Senha" onKeyDown={e=>e.key==='Enter'&&login()}/>
      <button onClick={login}>Entrar</button>{err&&<div className="err">{err}</div>}
    </div></div>);

  return(<div className="crm-root"><style>{CSS}</style>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">Paraty Solar<small>CRM · Funil</small></div>
        <nav>{MENU.map(m=>(
          <button key={m.id} className={tab===m.id?'active':''} onClick={()=>setTab(m.id)}>{m.icon} {m.label}</button>
        ))}</nav>
        <div className="foot"><a href="/index.html" style={{color:'#fff'}}>Simulador</a></div>
      </aside>
      <div className="main">
        <div className="topbar"><h2>{MENU.find(m=>m.id===tab)?.label||'CRM'}</h2>
          <div style={{display:'flex',gap:8}}>{msg&&<span style={{fontSize:'.8rem',color:'var(--muted)'}}>{msg}</span>}
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sair</button></div></div>
        <div className="content">

          {tab==='dashboard'&&(dash?(<div className="stats">
            <div className="stat"><div className="n">{dash.total||0}</div><div className="l">Leads</div></div>
            <div className="stat"><div className="n">{dash.ganhos||0}</div><div className="l">Ganhos</div></div>
            <div className="stat"><div className="n">{dash.perdidos||0}</div><div className="l">Perdidos</div></div>
            <div className="stat"><div className="n">{dash.taxaGanho||0}%</div><div className="l">Taxa</div></div>
            <div className="stat"><div className="n">R$ {(dash.faturamento||0).toLocaleString('pt-BR')}</div><div className="l">Faturamento</div></div>
          </div>):<div className="empty">Carregando...</div>)}

          {tab==='funil'&&(<>
            <div className="stats">{STAGES.map(s=>(
              <div className="stat" key={s.id}><div className="n" style={{color:s.color}}>{funnel[s.id]||byStage[s.id]?.length||0}</div><div className="l">{s.label}</div></div>
            ))}</div>
            <div className="filters"><input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/><button className="btn btn-primary" onClick={loadLeads}>Atualizar</button></div>
            {loading?<div className="empty">Carregando...</div>:(
              <div className="kanban">{STAGES.map(s=>(
                <div className="col" key={s.id}>
                  <div className="col-h" style={{borderTop:'3px solid '+s.color}}><span>{s.label}</span><span>{byStage[s.id]?.length||0}</span></div>
                  <div className="col-b">{(byStage[s.id]||[]).map(l=>(
                    <div className="lead-card" key={l.id} onClick={()=>setSelected(l)}
                      draggable onDragStart={e=>e.dataTransfer.setData('id',l.id)}
                      onDragOver={e=>e.preventDefault()}
                      onDrop={async e=>{e.preventDefault();const id=e.dataTransfer.getData('id');if(id)await patchLead(id,{stage:s.id});}}>
                      <div className="name">{l.nome}</div>
                      <div className="meta">{l.mode} · {l.cidade}</div>
                      <div className="meta">{l.contato||l.telefone||'—'}</div>
                      {(l.tags||[]).map(t=><span className="tag" key={t}>{t}</span>)}
                    </div>
                  ))}</div>
                </div>
              ))}</div>
            )}
          </>)}

          {tab==='contatos'&&(<>
            <div className="filters"><input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/><button className="btn btn-primary" onClick={loadLeads}>Atualizar</button></div>
            {!leads.length?<div className="empty">Nenhum lead</div>:(
              <table><thead><tr><th>Nome</th><th>Contato</th><th>Etapa</th><th>Tags</th></tr></thead>
              <tbody>{leads.map(l=>(
                <tr key={l.id} onClick={()=>setSelected(l)} style={{cursor:'pointer'}}>
                  <td>{l.nome}</td><td>{l.contato||l.telefone||'—'}</td>
                  <td><span className="tag">{stageLabel(l.stage)}</span></td>
                  <td>{(l.tags||[]).join(', ')||'—'}</td>
                </tr>
              ))}</tbody></table>
            )}
          </>)}

          {tab==='chat'&&(<>
            {!waConfig?.connected?(<div className="card"><h3>WhatsApp não conectado</h3>
              <button className="btn btn-wa" onClick={()=>setTab('settings')}>Configurações</button></div>):(
              <div className="chat-grid">
                <div>{!conversations.length&&<div className="empty">Sem conversas</div>}
                  {conversations.map(c=>(
                    <div key={c.phone} className="chat-item"><strong>{c.contactName||c.phone}</strong>
                      <div style={{fontSize:'.75rem',color:'var(--muted)'}}>{(c.messages?.[c.messages.length-1]?.text||'').slice(0,40)}</div></div>
                  ))}</div>
                <div className="empty">Selecione ou abra do lead</div>
              </div>
            )}
          </>)}

          {tab==='flows'&&(<>
            <p style={{color:'var(--muted)',marginBottom:12}}>Gatilhos: novo contato, tag, coluna, ganhar/perder</p>
            {!flows.length?<div className="empty">Nenhum flow (defaults no servidor)</div>:
              flows.map(f=>(
                <div className="flow-item" key={f.id}>
                  <strong>{f.name}</strong> {f.active?'✓ ativo':'○ inativo'}
                  <div style={{fontSize:'.8rem',color:'var(--muted)'}}>Gatilho: {f.trigger} · {(f.steps||[]).length} passos</div>
                </div>
              ))}
          </>)}

          {tab==='broadcast'&&(<div className="card"><h3>Broadcast</h3>
            <p style={{color:'var(--muted)'}}>Use a API /api/crm/broadcast (janela 24h WhatsApp)</p></div>)}

          {tab==='calendario'&&(<div className="card"><h3>Calendário</h3>
            <p style={{color:'var(--muted)'}}>Agende no drawer do lead</p></div>)}

          {tab==='relatorios'&&(<div className="card"><h3>Relatórios</h3>
            <p style={{color:'var(--muted)'}}>Veja Dashboard para KPIs. API: /api/crm/reports</p></div>)}

          {tab==='settings'&&(<div className="card"><h3>WhatsApp</h3>
            <p>Status: {waConfig?.connected?<span className="ok">Conectado</span>:<span className="err">Desconectado</span>}</p>
            <p style={{fontSize:'.85rem',color:'var(--muted)',marginTop:8}}>Configure token + Phone Number ID via API POST /api/whatsapp/config</p>
            <p style={{fontSize:'.85rem',marginTop:8}}>Webhook: <code>{typeof window!=='undefined'?window.location.origin+'/api/whatsapp/webhook':''}</code></p>
            <p style={{fontSize:'.85rem'}}>Verify: <code>paraty_solar_verify_2026</code></p>
          </div>)}

        </div>
      </div>
    </div>

    {selected&&(
      <div className="drawer">
        <button className="btn btn-ghost btn-sm" style={{float:'right'}} onClick={()=>setSelected(null)}>✕</button>
        <h3>{selected.nome}</h3>
        <p style={{color:'var(--muted)',fontSize:'.85rem'}}>{selected.contato||selected.telefone}</p>
        <label>Etapa</label>
        <select className="input" value={selected.stage||'novo'} onChange={e=>patchLead(selected.id,{stage:e.target.value}).then(()=>setSelected(s=>({...s,stage:e.target.value})))}>
          {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>
          {TAGS.map(t=>{const on=(selected.tags||[]).includes(t);
            return <button key={t} className={'btn btn-sm '+(on?'btn-primary':'btn-ghost')} onClick={()=>{
              const tags=on?(selected.tags||[]).filter(x=>x!==t):[...(selected.tags||[]),t];
              patchLead(selected.id,{tags}).then(()=>setSelected(s=>({...s,tags})));
            }}>{t}</button>;
          })}
        </div>
        <div style={{display:'flex',gap:8,marginTop:14}}>
          <button className="btn btn-primary btn-sm" onClick={()=>patchLead(selected.id,{stage:'fechado'})}>Ganhar</button>
          <button className="btn btn-danger btn-sm" onClick={()=>patchLead(selected.id,{stage:'perdido'})}>Perder</button>
        </div>
      </div>
    )}
  </div>);
}
