import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/catalog/CartProvider';
import { ORDER_STATUS, DELIVERY } from '@/lib/order-rules';
import { formatPrice } from '@/lib/catalog';
import { seo } from '@/lib/site';

export const Route = createFileRoute('/_authenticated/kabinet/zakazy')({ head: () => seo('Мои заказы', 'История заказов дилера НеСдует.', '/kabinet/zakazy'), component: Orders });

function Orders() {
  const cart = useCart(); const nav = useNavigate();
  const { data = [], isError } = useQuery({ queryKey: ['dealer-orders'], queryFn: async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return []; const { data, error } = await supabase.from('orders').select('id,number,created_at,status,total,delivery_method,tracking_number,order_items(variant_id,name,volume_ml,quantity,unit_price)').eq('user_id', user.id).order('created_at', { ascending: false }); if (error) throw error; return data ?? []; } });
  function repeat(items: { variant_id: string; quantity: number }[]) { cart.clear(); items.forEach(i => cart.set(i.variant_id, i.quantity)); toast.success('Позиции добавлены, цены пересчитаны по текущему прайсу'); nav({ to: '/korzina' }); }
  if (isError) return <p className="text-destructive">Не удалось загрузить заказы.</p>;
  if (data.length === 0) return <p className="text-muted-foreground">Заказов пока нет.</p>;
  return <div className="space-y-3">{data.map(o => <article key={o.id} className="rounded-lg border border-border bg-card p-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg">Заказ № {o.number}</h2><span className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString('ru-RU')} · {ORDER_STATUS[o.status as keyof typeof ORDER_STATUS] ?? o.status}</span></div>
    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">{o.order_items.map(i => <li key={i.variant_id}>{i.name}{i.volume_ml ? `, ${i.volume_ml} мл` : ''} — {i.quantity} шт. × {formatPrice(i.unit_price)}</li>)}</ul>
    <p className="mt-3">Итого: <span className="font-display">{formatPrice(o.total)}</span> · {DELIVERY[o.delivery_method as keyof typeof DELIVERY] ?? o.delivery_method}{o.tracking_number && ` · Трек-номер: ${o.tracking_number}`}</p>
    <Button className="mt-3" size="sm" variant="outline" onClick={() => repeat(o.order_items)}>Повторить заказ</Button>
  </article>)}</div>;
}
