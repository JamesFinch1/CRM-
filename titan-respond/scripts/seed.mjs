import pg from 'pg'; import crypto from 'node:crypto'; import {promisify} from 'node:util';
const scrypt=promisify(crypto.scrypt); const {Client}=pg; const url=process.env.DATABASE_URL; if(!url) throw new Error('DATABASE_URL required');
async function pw(p){const salt=crypto.randomBytes(16).toString('hex'); const buf=await scrypt(p,salt,64); return `scrypt$${salt}$${Buffer.from(buf).toString('hex')}`}
const c=new Client({connectionString:url}); await c.connect();
try { const orgName=process.env.SEED_ORG_NAME||'Titan Demo'; const slug=process.env.SEED_ORG_SLUG||'titan-demo'; const token=crypto.randomBytes(24).toString('hex'); const tokenHash=crypto.createHash('sha256').update(token).digest('hex');
 const org=(await c.query(`INSERT INTO organizations(name,slug,lead_capture_token_hash) VALUES($1,$2,$3) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,[orgName,slug,tokenHash])).rows[0];
 const email=(process.env.SEED_ADMIN_EMAIL||'owner@example.com').toLowerCase(); const pass=process.env.SEED_ADMIN_PASSWORD||'change-me-now'; const hash=await pw(pass);
 await c.query(`INSERT INTO users(organization_id,email,name,password_hash,role) VALUES($1,$2,$3,$4,'owner') ON CONFLICT DO NOTHING`,[org.id,email,'Owner',hash]);
 console.log(`Seeded ${slug}. Admin: ${email}`); console.log(`Lead capture token (save it now): ${token}`);
} finally {await c.end()}
