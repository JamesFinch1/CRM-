import crypto from 'node:crypto'; import {promisify} from 'node:util';
const scrypt=promisify(crypto.scrypt);
export const sha256=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
export const randomToken=(bytes=32)=>crypto.randomBytes(bytes).toString('base64url');
export async function hashPassword(password:string){const salt=crypto.randomBytes(16).toString('hex'); const key=await scrypt(password,salt,64) as Buffer; return `scrypt$${salt}$${key.toString('hex')}`}
export async function verifyPassword(password:string, stored:string){const [kind,salt,hex]=stored.split('$'); if(kind!=='scrypt'||!salt||!hex)return false; const key=await scrypt(password,salt,64) as Buffer; const a=Buffer.from(hex,'hex'), b=Buffer.from(key); return a.length===b.length&&crypto.timingSafeEqual(a,b)}
export function timingSafeText(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b); return x.length===y.length&&crypto.timingSafeEqual(x,y)}
export function eventKey(raw:string){return sha256(raw)}
