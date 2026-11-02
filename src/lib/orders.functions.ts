import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { cartItemsSchema,checkoutSchema,type CartQuote } from '@/lib/order-rules';
async function requestClient(){
  const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];if(!url||!key)throw new Error('Оформление недоступно');
  const authorization=getRequestHeader('authorization');
  const sb=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:authorization?{Authorization:authorization}:{},fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_')&&h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}});
  if(authorization){const token=authorization.replace(/^Bearer /i,'');const {data,error}=await sb.auth.getUser(token);if(error||!data.user)throw new Error('Войдите повторно');}
  return sb;
}
export const getCheckoutOptions=createServerFn({method:'GET'}).handler(async()=>{const sb=await requestClient();const {data,error}=await sb.rpc('checkout_options');if(error)throw new Error('Не удалось загрузить способы оформления');return data as unknown as {test_mode:boolean;yookassa:boolean;invoice:boolean;retail_delivery:string[];wholesale_delivery:string[];minimum_enabled:boolean;minimum_amount:number;shipping_city:string|null};});
export const quoteCart=createServerFn({method:'POST'}).inputValidator((d:unknown)=>cartItemsSchema.parse(d)).handler(async({data})=>{const sb=await requestClient();const {data:q,error}=await sb.rpc('cart_quote',{_items:data});if(error)throw new Error(error.message);return q as unknown as CartQuote;});
export const createOrder=createServerFn({method:'POST'}).inputValidator((d:unknown)=>checkoutSchema.parse(d)).handler(async({data})=>{const sb=await requestClient();const {data:o,error}=await sb.rpc('place_order',{_items:data.items,_customer:data.customer,_buyer_type:data.buyer_type,_delivery:data.delivery,_payment:data.payment});if(error)throw new Error(error.message);return o as unknown as {id:string;number:number;status:string;total:number;test_mode:boolean};});