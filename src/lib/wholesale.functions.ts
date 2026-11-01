import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
export const getDealerQuote = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:{variantId:string;quantity:number})=>z.object({variantId:z.string().uuid(),quantity:z.number().int().min(1).max(1000000)}).parse(v)).handler(async({data,context})=>{
  const {data:quote,error}=await context.supabase.rpc('dealer_quote',{_variant_id:data.variantId,_quantity:data.quantity});
  if(error) throw new Error('Оптовые цены доступны только одобренным дилерам');
  if(!quote || typeof quote!=='object' || Array.isArray(quote)) return null;
  return {price:Number(quote['price']),retail_price:Number(quote['retail_price']),minimum_quantity:Number(quote['minimum_quantity']),level:String(quote['level']??'')};
});