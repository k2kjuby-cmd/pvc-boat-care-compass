import { getRequestHeader } from '@tanstack/react-start/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
export async function requestOrderClient(url:string,key:string){
  const authorization=getRequestHeader('authorization');
  const sb=createClient<Database>(url,key,{
    auth:{persistSession:false,autoRefreshToken:false},
    global:{
      headers:authorization?{Authorization:authorization}:{},
      fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_')&&h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});},
    },
  });
  if(authorization){const token=authorization.replace(/^Bearer /i,'');const {data,error}=await sb.auth.getUser(token);if(error||!data.user)throw new Error('Войдите повторно');}
  return sb;
}