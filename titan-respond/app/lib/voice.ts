import {q} from './db';
export async function placeOutboundCall(lead:any){const provider=process.env.VOICE_PROVIDER||'demo';
 if(provider==='demo') return {provider:'demo',providerCallId:`demo_${Date.now()}_${lead.id.slice(0,8)}`};
 if(provider!=='vapi') throw new Error(`Unsupported VOICE_PROVIDER: ${provider}`);
 const key=process.env.VAPI_API_KEY, assistantId=process.env.VAPI_ASSISTANT_ID, phoneNumberId=process.env.VAPI_PHONE_NUMBER_ID; if(!key||!assistantId||!phoneNumberId) throw new Error('Vapi configuration incomplete');
 const r=await fetch('https://api.vapi.ai/call',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({assistantId,phoneNumberId,customer:{number:lead.phone,name:lead.name},assistantOverrides:{variableValues:{leadName:lead.name,service:lead.service||'your enquiry',leadId:lead.id,businessName:lead.organization_name}}})});
 const data=await r.json(); if(!r.ok) throw new Error(`Vapi ${r.status}: ${JSON.stringify(data).slice(0,500)}`); return {provider:'vapi',providerCallId:data.id as string};}
export async function enqueueCall(organizationId:string,leadId:string){await q(`INSERT INTO jobs(organization_id,type,payload) VALUES($1,'place_call',$2::jsonb)`,[organizationId,JSON.stringify({leadId})]); await q(`UPDATE leads SET status='queued',updated_at=now() WHERE id=$1 AND organization_id=$2 AND do_not_contact=false`,[leadId,organizationId]);}
