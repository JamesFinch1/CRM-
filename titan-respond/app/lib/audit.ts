import {q} from './db';
export async function audit(organizationId:string|null,userId:string|null,action:string,entityType?:string,entityId?:string,metadata:any={}){await q(`INSERT INTO audit_log(organization_id,actor_user_id,action,entity_type,entity_id,metadata) VALUES($1,$2,$3,$4,$5,$6::jsonb)`,[organizationId,userId,action,entityType||null,entityId||null,JSON.stringify(metadata)])}
