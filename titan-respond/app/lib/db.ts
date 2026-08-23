import {Pool, PoolClient, QueryResultRow} from 'pg';
const globalPg=globalThis as unknown as {titanPool?:Pool};
export const pool=globalPg.titanPool ?? new Pool({connectionString:process.env.DATABASE_URL,max:10,ssl:process.env.NODE_ENV==='production'?{rejectUnauthorized:false}:undefined});
if(process.env.NODE_ENV!=='production') globalPg.titanPool=pool;
export async function q<T extends QueryResultRow=QueryResultRow>(text:string, values:any[]=[]){return pool.query<T>(text,values)}
export async function tx<T>(fn:(c:PoolClient)=>Promise<T>){const c=await pool.connect(); try{await c.query('BEGIN'); const out=await fn(c); await c.query('COMMIT'); return out}catch(e){await c.query('ROLLBACK'); throw e}finally{c.release()}}
