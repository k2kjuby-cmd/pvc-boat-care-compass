import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export function pub() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { fetch: (input,init) => { const h=new Headers(init?.headers); if(key.startsWith("sb_") && h.get("Authorization")===`Bearer ${key}`) h.delete("Authorization"); h.set("apikey",key); return fetch(input,{...init,headers:h}); } },
  });
}

export type LineColor = "lite" | "pro" | "armor" | "none";
export type Variant = Database["public"]["Tables"]["product_variants"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type UsageStep = { icon?: string; title: string; text: string };
export type Faq = { q: string; a: string };

export type CardProduct = {
  id: string; slug: string; name: string; short_description: string | null;
  status: "published" | "soon" | "hidden"; is_hit: boolean; suitable_for: string[];
  line: { name: string; color: LineColor } | null;
  category: { slug: string; name: string } | null;
  minPrice: number | null; volumes: number[]; image: string | null;
};

export const CARD_SELECT = "id,slug,name,short_description,status,is_hit,suitable_for,sort,product_lines(name,color),categories(slug,name),product_variants(volume_ml,price,image_url,sort),product_images(url,kind,sort)";

export type RawCard = {
  id: string; slug: string; name: string; short_description: string | null; status: CardProduct["status"]; is_hit: boolean; suitable_for: string[];
  product_lines: { name: string; color: string } | null;
  categories: { slug: string; name: string } | null;
  product_variants: { volume_ml: number | null; price: number | null; image_url: string | null; sort: number }[];
  product_images: { url: string; kind: string; sort: number }[];
};

export function toCard(r: RawCard): CardProduct {
  const prices = r.product_variants.map((v) => v.price).filter((p): p is number => p != null);
  const photos = [...r.product_images].filter((i) => i.kind === "photo").sort((a, b) => a.sort - b.sort);
  return {
    id: r.id, slug: r.slug, name: r.name, short_description: r.short_description, status: r.status, is_hit: r.is_hit, suitable_for: r.suitable_for ?? [],
    line: r.product_lines ? { name: r.product_lines.name, color: r.product_lines.color as LineColor } : null,
    category: r.categories,
    minPrice: prices.length ? Math.min(...prices.map(Number)) : null,
    volumes: [...new Set(r.product_variants.map((v) => v.volume_ml).filter((x): x is number => x != null).map(Number))].sort((a, b) => a - b),
    image: photos[0]?.url ?? r.product_variants.find((v) => v.image_url)?.image_url ?? null,
  };
}

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await pub().from("products").select(CARD_SELECT).neq("status", "hidden").order("sort");
  if (error) throw new Error(error.message);
  return (data as unknown as RawCard[]).map(toCard);
});

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = pub();
  const [c, p] = await Promise.all([
    sb.from("categories").select("slug,name").order("sort"),
    sb.from("problems").select("slug,title,icon,category_slug,is_soon").order("sort"),
  ]);
  return { categories: c.data ?? [], problems: p.data ?? [] };
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().regex(/^[a-z0-9-]+$/).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const sb = pub();
    const { data: p } = await sb
      .from("products")
      .select("*, product_lines(name,color), categories(slug,name), product_variants(*), product_images(*)")
      .eq("slug", data.slug)
      .neq("status", "hidden")
      .maybeSingle();
    if (!p) return null;
    const { data: recs } = await sb.from("product_recommendations").select("recommended_id,sort").eq("product_id", p.id).order("sort");
    const recIds = (recs ?? []).map((r) => r.recommended_id);
    const [recommended, similar] = await Promise.all([
      recIds.length ? sb.from("products").select(CARD_SELECT).in("id", recIds).neq("status", "hidden") : Promise.resolve({ data: [] }),
      p.category_id ? sb.from("products").select(CARD_SELECT).eq("category_id", p.category_id).neq("id", p.id).neq("status", "hidden").order("sort").limit(4) : Promise.resolve({ data: [] }),
    ]);
    const recCards = ((recommended.data ?? []) as unknown as RawCard[]).map(toCard).sort((a, b) => recIds.indexOf(a.id) - recIds.indexOf(b.id));
    const simCards = ((similar.data ?? []) as unknown as RawCard[]).map(toCard).filter((c) => !recIds.includes(c.id));
    const variants = [...(p.product_variants as Variant[])].sort((a, b) => a.sort - b.sort);
    const images = [...(p.product_images as ProductImage[])].sort((a, b) => a.sort - b.sort);
    return {
      ...p,
      line: p.product_lines as { name: string; color: LineColor } | null,
      category: p.categories as { slug: string; name: string } | null,
      variants, images,
      usage_steps: (Array.isArray(p.usage_steps) ? p.usage_steps : []) as UsageStep[],
      faq: (Array.isArray(p.faq) ? p.faq : []) as Faq[],
      recommended: recCards, similar: simCards,
    };
  });

export const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog(), staleTime: 60_000 });
export const taxonomyQuery = queryOptions({ queryKey: ["taxonomy"], queryFn: () => getCategories(), staleTime: 300_000 });
export const productQuery = (slug: string) => queryOptions({ queryKey: ["product", slug], queryFn: () => getProduct({ data: { slug } }), staleTime: 60_000 });

export const PRODUCT_TYPES = [
  { value: "boat", label: "Лодка" },
  { value: "sup", label: "SUP" },
  { value: "tent", label: "Палатка" },
  { value: "kayak", label: "Каяк" },
] as const;

export const formatPrice = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
export const formatVolume = (v: Pick<Variant, "volume_ml" | "weight_g">) =>
  v.volume_ml != null ? `${Number(v.volume_ml)} мл` : v.weight_g != null ? `${Number(v.weight_g)} г` : "";
