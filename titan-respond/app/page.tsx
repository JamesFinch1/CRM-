import {redirect} from 'next/navigation'; import {getSessionUser} from './lib/auth'; import Dashboard from './dashboard-client';
export default async function Home(){const u=await getSessionUser(); if(!u)redirect('/login'); return <Dashboard user={u}/>}
