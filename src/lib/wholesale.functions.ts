import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
export const getDealerQuote = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:{variantId:string;quantity:number})=>z.object({variantId:z.string().uuid(),quantity:z.number().int().min(1).max(1000000)}).parse(v)).handler(async({data,context})=>{
  const {data:quote,error}=await context.supabase.rpc('dealer_quote',{_variant_id:data.variantId,_quantity:data.quantity});
  if(error) throw new Error('Оптовые цены доступны только одобренным дилерам');
  if(!quote || typeof quote!=='object' || Array.isArray(quote)) return null;
  return {price:Number(quote['price']),retail_price:Number(quote['retail_price']),minimum_quantity:Number(quote['minimum_quantity']),level:String(quote['level']??'')};
});
export const getDealerPriceList = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {data:account}=await context.supabase.from('dealer_accounts').select('approved').eq('user_id',context.userId).maybeSingle();
  if(!account?.approved)throw new Error('Доступ только одобренным дилерам');
  const {data:variants,error}=await context.supabase.from('product_variants').select('id,volume_ml,weight_g,sku,products!inner(name,status)').eq('products.status','published');
  if(error)throw error;
  const rows=await Promise.all((variants??[]).map(async v=>{
    const {data:q,error:e}=await context.supabase.rpc('dealer_quote',{_variant_id:v.id,_quantity:1});
    if(e)throw new Error('Дилерский доступ закрыт');
    if(!q||typeof q!=='object'||Array.isArray(q))return null;
    return {name:v.products.name,volume_ml:v.volume_ml,weight_g:v.weight_g,sku:v.sku,retail_price:Number(q['retail_price']),wholesale_price:Number(q['price']),minimum_quantity:Number(q['minimum_quantity'])};
  }));
  return rows.filter(r=>r!==null);
});