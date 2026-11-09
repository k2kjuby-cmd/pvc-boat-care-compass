import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

// Admin-only: creates (or re-sends) a password-setup link for the approved lead and links the dealer account.
export const inviteDealer = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ leadId: z.string().uuid(), email: z.string().trim().email().max(254), origin: z.string().url() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (!isAdmin) throw new Error('Нет доступа');
    const { data: lead } = await context.supabase.from('wholesale_leads').select('id,status,name,phone,company,city,inn').eq('id', data.leadId).maybeSingle();
    if (!lead || lead.status !== 'approved') throw new Error('Сначала одобрите заявку');
    const redirectTo = `${new URL(data.origin).origin}/sozdat-parol`;
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    let userId: string | undefined;
    const inv = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, { redirectTo });
    if (inv.data?.user) userId = inv.data.user.id;
    else {
      for (let page = 1; page <= 20 && !userId; page++) {
        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
        userId = list?.users.find(u => u.email?.toLowerCase() === data.email.toLowerCase())?.id;
        if (!list || list.users.length < 200) break;
      }
      if (!userId) throw new Error('Не удалось отправить приглашение');
      const r = await supabaseAdmin.auth.resetPasswordForEmail(data.email, { redirectTo });
      if (r.error) throw new Error('Не удалось отправить письмо со ссылкой');
    }
    const { error } = await context.supabase.from('dealer_accounts').upsert({ user_id: userId, lead_id: lead.id, approved: true, email: data.email, contact_name: lead.name, phone: lead.phone, company: lead.company, city: lead.city, inn: lead.inn }, { onConflict: 'user_id', ignoreDuplicates: false });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type DealerRow = { variant_id: string; slug: string; name: string; volume_ml: number | null; weight_g: number | null; sku: string | null; retail_price: number; wholesale_price: number; minimum_quantity: number; level: string; next_quantity: number | null; next_discount: number | null };

export const getDealerCatalog = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ quantities: z.record(z.string().uuid(), z.number().int().min(1).max(1000000)).default({}) }).parse(v ?? {}))
  .handler(async ({ data, context }): Promise<DealerRow[]> => {
    const { data: account } = await context.supabase.from('dealer_accounts').select('approved').eq('user_id', context.userId).maybeSingle();
    if (!account?.approved) throw new Error('Доступ только одобренным дилерам');
    const { data: variants, error } = await context.supabase.from('product_variants').select('id,volume_ml,weight_g,sku,sort,sold_on_site,products!inner(name,slug,status,sort)').eq('products.status', 'published').eq('sold_on_site', true);
    if (error) throw error;
    const sorted = (variants ?? []).sort((a, b) => a.products.sort - b.products.sort || a.sort - b.sort);
    const rows = await Promise.all(sorted.map(async v => {
      const qty = data.quantities[v.id] ?? 1;
      const { data: q, error: e } = await context.supabase.rpc('dealer_quote', { _variant_id: v.id, _quantity: qty });
      if (e) throw new Error('Дилерский доступ закрыт');
      if (!q || typeof q !== 'object' || Array.isArray(q)) return null;
      return { variant_id: v.id, slug: v.products.slug, name: v.products.name, volume_ml: v.volume_ml, weight_g: v.weight_g, sku: v.sku, retail_price: Number(q['retail_price']), wholesale_price: Number(q['price']), minimum_quantity: Number(q['minimum_quantity']), level: String(q['level'] ?? ''), next_quantity: q['next_quantity'] == null ? null : Number(q['next_quantity']), next_discount: q['next_discount'] == null ? null : Number(q['next_discount']) };
    }));
    return rows.filter((r): r is DealerRow => r !== null);
  });

export const getPublicDealers = createServerFn({ method: 'GET' }).handler(async () => {
  const { requestOrderClient } = await import('./order-client.server');
  const sb = await requestOrderClient(process.env['SUPABASE_URL']!, process.env['SUPABASE_PUBLISHABLE_KEY']!);
  const { data, error } = await sb.rpc('public_dealers');
  if (error) return [];
  return (data ?? []).map(d => ({ company: d.company, city: d.city, public_address: d.public_address, map_lat: d.map_lat == null ? null : Number(d.map_lat), map_lng: d.map_lng == null ? null : Number(d.map_lng) }));
});
