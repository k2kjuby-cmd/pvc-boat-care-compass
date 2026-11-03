import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Database } from "@/integrations/supabase/types";
import { seo } from "@/lib/site";
import { CheckoutSettings } from "@/components/catalog/CheckoutSettings";

export const Route = createFileRoute("/_authenticated/admin/nastrojki")({ head: () => seo("Настройки сайта", "Контакты и реквизиты НеСдует.", "/admin/nastrojki"), component: Settings });

type S = Database["public"]["Tables"]["site_settings"]["Row"];
const FIELDS: [keyof S, string][] = [
  ["logo_url", "Логотип (ссылка на файл)"], ["ozon_url", "Ozon"], ["wildberries_url", "Wildberries"], ["avito_url", "Авито"],
  ["yandex_market_url", "Яндекс Маркет"], ["own_shop_url", "Свой магазин"],
  ["seller_name", "ФИО продавца / оператор персональных данных"], ["seller_status", "Статус продавца"], ["seller_inn", "ИНН продавца"],
  ["contact_phone", "Телефон"], ["contact_email", "Электронная почта / обращения по персональным данным"],
  ["contact_max", "MAX"], ["contact_telegram", "Telegram"], ["contact_whatsapp", "WhatsApp"],
  ["shipping_city", "Город отправки заказов"], ["postal_address", "Почтовый адрес (пустое поле не публикуется)"],
];

function Settings() {
  const qc = useQueryClient();
  const [s, setS] = useState<S | null>(null);
  useEffect(() => { supabase.from("site_settings").select("*").eq("id", 1).single().then(({ data }) => setS(data)); }, []);
  if (!s) return <p className="text-muted-foreground">Загрузка…</p>;
  async function save() {
    if (!s) return;
    const { id: _id, ...rest } = s;
    const { error } = await supabase.from("site_settings").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) toast.error(error.message); else { toast.success("Сохранено"); qc.invalidateQueries({ queryKey: ["site-settings"] }); }
  }
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl uppercase">Настройки сайта</h1>
      <label className="flex items-center gap-3"><Switch checked={s.retail_minimum_enabled} onCheckedChange={v=>setS({...s,retail_minimum_enabled:v})}/> Минимальный заказ включён для розницы</label>
      <div><Label>Минимальная сумма заказа, ₽</Label><Input type="number" min="0" value={s.retail_minimum_amount} onChange={e=>setS({...s,retail_minimum_amount:Number(e.target.value)})}/></div>
      <div className="space-y-1.5"><Label>Налог и комиссия платёжной системы, %</Label><Input aria-label="Налог и комиссия платёжной системы, %" type="number" min="0" max="99" step="0.1" value={s.payment_tax_percent} onChange={e=>setS({...s,payment_tax_percent:Number(e.target.value)})}/></div>
      {FIELDS.map(([k, label]) => (
        <div key={k} className="space-y-1.5">
           <Label htmlFor={`setting-${k}`}>{label}</Label>
           <Input id={`setting-${k}`} value={(s[k] as string | null) ?? ""} placeholder="будет добавлено" onChange={(e) => setS({ ...s, [k]: e.target.value.trim() ? e.target.value : null })} />
        </div>
      ))}
      <label className="flex items-center gap-3"><Switch checked={s.dealers_page_enabled} onCheckedChange={(v) => setS({ ...s, dealers_page_enabled: v })} /> Показывать страницу «Наши дилеры»</label>
      <Button onClick={save}>Сохранить</Button>
      <CheckoutSettings/>
    </div>
  );
}
