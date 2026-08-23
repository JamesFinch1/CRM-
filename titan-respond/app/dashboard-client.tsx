'use client';
import {useEffect,useMemo,useState} from 'react'; import {useRouter} from 'next/navigation';
type User={name:string;organizationName:string};
type Lead={id:string;name:string;phone:string;email?:string;service?:string;source:string;status:string;createdAt:string;appointmentAt?:string;estimatedValue?:number;notes?:string};
const statuses=['new','queued','calling','qualified','booked','won','lost','do_not_contact'];
export default function Dashboard({user}:{user:User}){const [leads,setLeads]=useState<Lead[]>([]),[busy,setBusy]=useState(''),[error,setError]=useState(''); const router=useRouter();
 const load=async()=>{const r=await fetch('/api/leads',{cache:'no-store'}); if(r.status===401)return router.push('/login'); const d=await r.json(); if(!r.ok)throw new Error(d.error||'Unable to load leads'); setLeads(d)}; useEffect(()=>{load().catch(e=>setError(e.message))},[]);
 const stats=useMemo(()=>({total:leads.length,active:leads.filter(l=>['new','queued','calling','qualified'].includes(l.status)).length,booked:leads.filter(l=>l.status==='booked').length,won:leads.filter(l=>l.status==='won').reduce((a,l)=>a+(l.estimatedValue||0),0),pipeline:leads.filter(l=>!['lost','do_not_contact'].includes(l.status)).reduce((a,l)=>a+(l.estimatedValue||0),0)}),[leads]);
 async function json(url:string,opts:any={}){const r=await fetch(url,{...opts,headers:{'Content-Type':'application/json',...(opts.headers||{})}}); const d=await r.json().catch(()=>({})); if(!r.ok)throw new Error(d.error||'Request failed'); return d}
async function addLead(e:any){

  e.preventDefault();

  setError('');

  setBusy('add');

  const form = e.currentTarget;

  const f = new FormData(form);

  try {

    await json('/api/leads',{

      method:'POST',

      body:JSON.stringify(Object.fromEntries(f))

    });

    form.reset();

    await load();

  } catch(e:any) {

    setError(e.message);

  } finally {

    setBusy('');

  }

}
 async function call(id:string){setError('');setBusy(id);try{await json(`/api/leads/${id}/call`,{method:'POST'});await load()}catch(e:any){setError(e.message)}finally{setBusy('')}}
 async function status(id:string,status:string){setError('');try{await json(`/api/leads/${id}/status`,{method:'POST',body:JSON.stringify({status})});await load()}catch(e:any){setError(e.message)}}
 async function logout(){await fetch('/api/auth/logout',{method:'POST'});router.push('/login');router.refresh()}
 return <main><header><div><span className="eyebrow">TITAN DIGITAL</span><h1>Titan Respond</h1><p>{user.organizationName} · signed in as {user.name}</p></div><div className="headerActions"><span className="badge">Production build</span><button onClick={logout}>Sign out</button></div></header>
 <section className="hero"><div><h2>Turn more enquiries into customers.</h2><p>Capture every lead, queue instant AI callbacks, qualify prospects, book appointments and measure commercial outcomes.</p><div className="flow">Lead → AI callback → Qualification → Booking → Follow-up → Revenue</div></div><div className="heroCard"><strong>Revenue operating system</strong><span>Fast response</span><span>Consistent follow-up</span><span>Tenant-safe CRM</span><span>Measured outcomes</span></div></section>
 {error&&<div className="error">{error}</div>}
 <section className="stats"><article><b>{stats.total}</b><span>Total leads</span></article><article><b>{stats.active}</b><span>Active opportunities</span></article><article><b>{stats.booked}</b><span>Bookings</span></article><article><b>£{stats.pipeline.toLocaleString()}</b><span>Open pipeline</span></article><article><b>£{stats.won.toLocaleString()}</b><span>Won value</span></article></section>
 <section className="grid"><div className="panel"><div className="panelHead"><div><span className="eyebrow">CRM</span><h3>Lead pipeline</h3></div><button onClick={()=>load().catch(e=>setError(e.message))}>Refresh</button></div><div className="table">{leads.length===0&&<p className="hint">No leads yet.</p>}{leads.map(l=><div className="row" key={l.id}><div><strong>{l.name}</strong><small>{l.service||'General enquiry'} · {l.source}</small></div><select className={`status ${l.status}`} value={l.status} onChange={e=>status(l.id,e.target.value)}>{statuses.map(s=><option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}</select><div><strong>{l.estimatedValue!=null?`£${l.estimatedValue.toLocaleString()}`:'—'}</strong><small>{l.appointmentAt?new Date(l.appointmentAt).toLocaleString('en-GB'):'No booking yet'}</small></div><button disabled={busy===l.id||l.status==='do_not_contact'} onClick={()=>call(l.id)}>{busy===l.id?'Queued…':'AI call'}</button></div>)}</div></div>
 <aside className="panel"><span className="eyebrow">CAPTURE</span><h3>Add a new lead</h3><form onSubmit={addLead}><input name="name" placeholder="Customer name" required/><input name="phone" placeholder="Phone number" required/><input name="email" type="email" placeholder="Email"/><input name="service" placeholder="Service needed"/><select name="source"><option>Website</option><option>Google Ads</option><option>Missed call</option><option>Facebook</option><option>Referral</option></select><input name="estimatedValue" type="number" min="0" step="0.01" placeholder="Estimated value (£)"/><select name="consentBasis"><option value="">Contact basis not recorded</option><option value="requested_callback">Requested callback</option><option value="existing_customer">Existing customer</option><option value="contract_step">Necessary to progress enquiry</option></select><button className="primary" disabled={busy==='add'}>{busy==='add'?'Adding…':'Capture lead'}</button></form><p className="hint">For real website/advert integrations, use the authenticated public lead API rather than exposing dashboard credentials.</p></aside></section>
 <section className="features"><article><h4>01 · Capture</h4><p>Authenticated server-to-server lead intake.</p></article><article><h4>02 · Respond</h4><p>Queued voice calls with retry-safe processing.</p></article><article><h4>03 · Convert</h4><p>Qualification, booking and do-not-contact tools.</p></article><article><h4>04 · Measure</h4><p>Pipeline, won value, call records and audit history.</p></article></section></main>}
