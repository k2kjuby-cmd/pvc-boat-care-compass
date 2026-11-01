import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getDealerQuote } from '@/lib/wholesale.functions';
import { formatPrice } from '@/lib/catalog';
export function DealerPrice({variantId}:{variantId:string}) {
  const [quantity,setQuantity]=useState(1);
  const fetchQuote=useServerFn(getDealerQuote);
  const account=useQuery({queryKey:['dealer-access'],queryFn:async()=>{const {data:{user}}=await supabase.auth.getUser(); if(!user)return false; const {data}=await supabase.from('dealer_accounts').select('approved').eq('user_id',user.id).maybeSingle();return data?.approved===true;},retry:false});
  const quote=useQuery({queryKey:['dealer-price',variantId,quantity],queryFn:()=>fetchQuote({data:{variantId,quantity}}),enabled:account.data===true,retry:false});
  if(!account.data)return null;
  return <div className="mt-6 border-t border-border pt-4"><Label htmlFor="dealer-quantity">Количество одной фасовки, шт.</Label><Input id="dealer-quantity" className="mt-2 max-w-40" type="number" min="1" max="1000000" value={quantity} onChange={e=>setQuantity(Math.max(1,Math.min(1000000,Math.floor(Number(e.target.value)||1))))}/>{quote.data&&<div className="mt-3"><p className="font-display text-xl">Оптовая цена: {formatPrice(quote.data.price)}</p><p className="mt-1 text-sm text-muted-foreground">{quote.data.level} · Минимальная партия: {quote.data.minimum_quantity} шт.</p><p className="text-sm text-muted-foreground">РРЦ: {formatPrice(quote.data.retail_price)}</p></div>}{quote.isError&&<p className="mt-3 text-sm text-muted-foreground">Оптовая цена недоступна.</p>}</div>;
}