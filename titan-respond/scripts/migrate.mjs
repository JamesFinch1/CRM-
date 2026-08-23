import pg from 'pg'; import fs from 'node:fs/promises'; import path from 'node:path';
const {Client}=pg; const url=process.env.DATABASE_URL; if(!url) throw new Error('DATABASE_URL required');
const client=new Client({connectionString:url}); await client.connect();
try { const files=(await fs.readdir('db')).filter(f=>f.endsWith('.sql')).sort(); for(const file of files){ console.log('Applying',file); await client.query(await fs.readFile(path.join('db',file),'utf8')); } } finally { await client.end(); }
