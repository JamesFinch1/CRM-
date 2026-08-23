import {NextResponse} from 'next/server'; import {q} from '../../lib/db';
export async function GET(){try{await q('SELECT 1'); return NextResponse.json({ok:true,service:'titan-respond',time:new Date().toISOString()})}catch{return NextResponse.json({ok:false},{status:503})}}
