import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";

export const SITE_NAME = "НеСдует";

export const NAV = [
  { to: "/katalog", label: "Каталог" },
  { to: "/optovikam", label: "Оптовикам" },
  { to: "/dlya-masterskih", label: "Для мастерских" },
  { to: "/gde-kupit", label: "Где купить" },
  { to: "/o-brende", label: "О бренде" },
  { to: "/kontakty", label: "Контакты" },
] as const;

export type SiteSettings = {
  logo_url: string | null;
  ozon_url: string | null;
  wildberries_url: string | null;
  avito_url: string | null;
  yandex_market_url: string | null;
  own_shop_url: string | null;
  dealers_page_enabled: boolean;
  contact_phone: string | null;
  contact_email: string | null;
  contact_telegram: string | null;
  contact_max: string | null;
  contact_whatsapp: string | null;
  seller_name: string | null;
  seller_status: string | null;
  seller_inn: string | null;
  shipping_city: string | null;
  postal_address: string | null;
};

const EMPTY: SiteSettings = {
  logo_url: null, ozon_url: null, wildberries_url: null, avito_url: null,
  yandex_market_url: null, own_shop_url: null, dealers_page_enabled: false,
  contact_phone: null, contact_email: null, contact_telegram: null,
  contact_max: null, contact_whatsapp: null, seller_name: null, seller_status: null,
  seller_inn: null, shipping_city: null, postal_address: null,
};

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return EMPTY;
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_")) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (data as SiteSettings | null) ?? EMPTY;
});

export const settingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: () => getSiteSettings(),
  staleTime: 60_000,
});

export function marketplaceLinks(s: SiteSettings) {
  return [
    { name: "Ozon", url: s.ozon_url },
    { name: "Wildberries", url: s.wildberries_url },
    { name: "Авито", url: s.avito_url },
    { name: "Яндекс Маркет", url: s.yandex_market_url },
    { name: "Наш магазин", url: s.own_shop_url },
  ].filter((m): m is { name: string; url: string } => !!m.url && m.url.trim() !== "");
}

export function seo(title: string, description: string, path: string) {
  const full = `${title} — ${SITE_NAME}`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: path },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: path }],
  };
}
