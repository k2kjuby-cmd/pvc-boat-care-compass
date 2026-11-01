import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PRODUCT_TYPES, type UsageStep, type Faq } from "@/lib/catalog";
import { ICONS } from "@/components/catalog/StepIcon";
import { WholesaleFields } from "@/components/catalog/WholesaleFields";
import { retailPrice, wholesalePrice, type WholesaleRule } from "@/lib/pricing";
import { seo } from "@/lib/site";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/tovar/$id")({ head: () => seo("Редактирование товара", "Цены, фасовки и описание товара НеСдует.", "/admin/tovar"), component: Editor });

type P = Database["public"]["Tables"]["products"]["Row"];
type V = Database["public"]["Tables"]["product_variants"]["Row"];
type I = Database["public"]["Tables"]["product_images"]["Row"];
const TBA = "будет добавлено";

const emptyProduct = (): Partial<P> => ({ name: "", slug: "", status: "hidden", is_hit: false, has_dilution_calc: false, suitable_for: ["boat"], usage_steps: [], faq: [], sort: 0 });

function Editor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const [p, setP] = useState<Partial<P>>(emptyProduct());
  const [variants, setVariants] = useState<Partial<V>[]>([]);
  const [images, setImages] = useState<I[]>([]);
  const [recs, setRecs] = useState<string[]>([]);
  const [wholesale, setWholesale] = useState<Record<string, WholesaleRule>>({});
  const priceMeta = useQuery({ queryKey: ["admin-pricing"], queryFn: async () => { const [l,t] = await Promise.all([supabase.from("wholesale_levels").select("*").order("sort"),supabase.from("site_settings").select("payment_tax_percent").eq("id",1).single()]); return { levels:l.data??[], tax:t.data?.payment_tax_percent??6 }; } });
  const [busy, setBusy] = useState(false);

  const meta = useQuery({
    queryKey: ["admin-meta"],
    queryFn: async () => {
      const [l, c, all] = await Promise.all([
        supabase.from("product_lines").select("id,name").order("sort"),
        supabase.from("categories").select("id,name").order("sort"),
        supabase.from("products").select("id,name").order("sort"),
      ]);
      return { lines: l.data ?? [], cats: c.data ?? [], all: all.data ?? [] };
    },
  });

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const [{ data: prod }, { data: vs }, { data: ims }, { data: rs }] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).single(),
        supabase.from("product_variants").select("*").eq("product_id", id).order("sort"),
        supabase.from("product_images").select("*").eq("product_id", id).order("sort"),
        supabase.from("product_recommendations").select("recommended_id").eq("product_id", id).order("sort"),
      ]);
      if (prod) setP(prod);
      setVariants(vs ?? []);
      if (vs?.length) { const {data:w}=await supabase.from("variant_wholesale").select("*").in("variant_id",vs.map(v=>v.id)); setWholesale(Object.fromEntries((w??[]).map(x=>[x.variant_id,x]))); }
      setImages(ims ?? []);
      setRecs((rs ?? []).map((r) => r.recommended_id));
    })();
  }, [id, isNew]);

  const steps = (p.usage_steps as UsageStep[] | undefined) ?? [];
  const faq = (p.faq as Faq[] | undefined) ?? [];
  const set = <K extends keyof P>(k: K, v: P[K]) => setP((x) => ({ ...x, [k]: v }));
  const txt = (k: keyof P) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setP((x) => ({ ...x, [k]: e.target.value || null }));

  async function save() {
    if (!p.name || !p.slug || !/^[a-z0-9-]+$/.test(p.slug)) { toast.error("Нужны название и адрес (латиница, цифры, дефис)"); return; }
    const warnings: string[] = [];
    for (const v of variants) {
      const w = wholesale[v.id ?? ""] ?? {};
      const price = retailPrice(p,v.volume_ml,v.retail_override,v.price);
      try { if(price!=null) { for(const l of priceMeta.data?.levels??[]) wholesalePrice(price,w,l.discount_percent,priceMeta.data?.tax??6);
        if(w.cost_price!=null) { const candidates=[price,w.base_price].filter((x):x is number=>x!=null); if(candidates.some(x=>x<=0 || (x-x*(priceMeta.data?.tax??6)/100-Number(w.cost_price))/x*100 < (w.minimum_margin_percent??30))) warnings.push(`${v.volume_ml??""} мл: маржа ниже минимальной`); }
      }} catch(e) { toast.error((e as Error).message); return; }
    }
    if(warnings.length && !window.confirm(warnings.join("\n")+"\nСохранить несмотря на предупреждение?")) return;
    setBusy(true);
    try {
      const { id: _omit, created_at: _c, ...body } = p as P;
      const payload = { ...body, name: p.name, slug: p.slug, updated_at: new Date().toISOString() };
      const { data: saved, error } = isNew
        ? await supabase.from("products").insert(payload).select("id").single()
        : await supabase.from("products").update(payload).eq("id", id).select("id").single();
      if (error) throw error;
      const pid = saved.id;
      // variants: upsert existing, insert new, delete removed
      const { data: existing } = await supabase.from("product_variants").select("id").eq("product_id", pid);
      const keep = variants.flatMap((v) => v.id ? [v.id] : []);
      const toDelete = (existing ?? []).map((e) => e.id).filter((x) => !keep.includes(x));
      if (toDelete.length) await supabase.from("product_variants").delete().in("id", toDelete);
      for (const [i, v] of variants.entries()) {
        const row = { ...v, product_id: pid, sort: i, sku: v.sku || null };
        const r = v.id ? await supabase.from("product_variants").update(row).eq("id", v.id).select("id").single() : await supabase.from("product_variants").insert(row).select("id").single();
        if (r.error) throw r.error;
        const w=wholesale[v.id ?? `new-${i}`]??{};
        const wr=await supabase.from("variant_wholesale").upsert({variant_id:r.data.id,base_price:w.base_price??null,minimum_quantity:w.minimum_quantity??10,ozon_price:w.ozon_price??null,max_discount_percent:w.max_discount_percent??null,cost_price:w.cost_price??null,minimum_margin_percent:w.minimum_margin_percent??30});
        if(wr.error) throw wr.error;
      }
      await supabase.from("product_recommendations").delete().eq("product_id", pid);
      if (recs.length) await supabase.from("product_recommendations").insert(recs.map((r, i) => ({ product_id: pid, recommended_id: r, sort: i })));
      for (const [i, im] of images.entries()) await supabase.from("product_images").update({ kind: im.kind, is_render: im.is_render, alt: im.alt, sort: i }).eq("id", im.id);
      qc.invalidateQueries();
      toast.success("Сохранено");
      if (isNew) nav({ to: "/admin/tovar/$id", params: { id: pid } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function upload(files: FileList | null) {
    if (!files || isNew) return;
    for (const f of Array.from(files)) {
      const path = `${id}/${crypto.randomUUID()}-${f.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const up = await supabase.storage.from("product-images").upload(path, f);
      if (up.error) { toast.error(up.error.message); continue; }
      const { data: s } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (!s) continue;
      const { data: row } = await supabase.from("product_images").insert({ product_id: id, url: s.signedUrl, kind: "photo", sort: images.length }).select("*").single();
      if (row) setImages((x) => [...x, row]);
    }
  }

  async function removeImage(im: I) {
    await supabase.from("product_images").delete().eq("id", im.id);
    setImages((x) => x.filter((i) => i.id !== im.id));
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl uppercase">{isNew ? "Новый товар" : p.name}</h1>
        <Button onClick={save} disabled={busy}>{busy ? "Сохраняем…" : "Сохранить"}</Button>
      </div>

      <Block title="Основное">
        <div className="grid gap-4 md:grid-cols-2">
          <F label="Название"><Input value={p.name ?? ""} onChange={txt("name")} /></F>
          <F label="Адрес страницы (латиница)"><Input value={p.slug ?? ""} onChange={txt("slug")} placeholder="antiprokol" /></F>
          <F label="Линейка">
            <select className="h-10 w-full rounded-md border border-input bg-background px-3" value={p.line_id ?? ""} onChange={(e) => set("line_id", e.target.value || null)}>
              <option value="">— нет —</option>{meta.data?.lines.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </F>
          <F label="Категория (задача)">
            <select className="h-10 w-full rounded-md border border-input bg-background px-3" value={p.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)}>
              <option value="">— нет —</option>{meta.data?.cats.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </F>
          <F label="Статус">
            <select className="h-10 w-full rounded-md border border-input bg-background px-3" value={p.status ?? "hidden"} onChange={(e) => set("status", e.target.value as P["status"])}>
              <option value="published">Опубликован</option><option value="soon">Скоро</option><option value="hidden">Скрыт</option>
            </select>
          </F>
          <F label="Порядок"><Input type="number" value={p.sort ?? 0} onChange={(e) => set("sort", Number(e.target.value))} /></F>
          <div className="md:col-span-2"><F label="Краткое описание"><Input value={p.short_description ?? ""} onChange={txt("short_description")} placeholder={TBA} /></F></div>
          <div className="flex flex-wrap gap-6 md:col-span-2">
            <Check label="Хит (на главной)" v={!!p.is_hit} on={(v) => set("is_hit", v)} />
            <Check label="Калькулятор разведения" v={!!p.has_dilution_calc} on={(v) => set("has_dilution_calc", v)} />
          </div>
          <div className="md:col-span-2">
            <Label>Подходит для</Label>
            <div className="mt-2 flex flex-wrap gap-6">
              {PRODUCT_TYPES.map((t) => (
                <Check key={t.value} label={t.label} v={(p.suitable_for ?? []).includes(t.value)} on={(v) => set("suitable_for", v ? [...(p.suitable_for ?? []), t.value] : (p.suitable_for ?? []).filter((x) => x !== t.value))} />
              ))}
            </div>
          </div>
        </div>
      </Block>

      <Block title="Розничная цена по эталону">
        <Check label="Автоматическая сетка 100 / 300 / 500 / 1000 / 5000 мл" v={!!p.auto_pricing} on={v=>set("auto_pricing",v)} />
        {p.auto_pricing && <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <F label="Эталонная фасовка, мл"><select aria-label="Эталонная фасовка" className="h-10 w-full rounded-md border border-input bg-background px-3" value={p.reference_volume_ml??""} onChange={e=>set("reference_volume_ml",e.target.value?Number(e.target.value):null)}><option value="">Выберите</option>{[100,300,500,1000,5000].map(v=><option key={v}>{v}</option>)}</select></F>
          <F label="Цена эталона, ₽"><Input aria-label="Цена эталона" type="number" min="1" value={p.reference_price??""} onChange={e=>set("reference_price",e.target.value?Number(e.target.value):null)}/></F>
          <F label="Шаг, процентных пунктов"><Input aria-label="Шаг цены" type="number" min="0" max="24.99" step="0.1" value={p.pricing_step_percent??10} onChange={e=>set("pricing_step_percent",Number(e.target.value))}/></F>
        </div>}
      </Block>
      <Block title="Фасовки">
        <div className="space-y-3">
          {variants.map((v, i) => {
            const up = (k: keyof V, val: unknown) => setVariants((xs) => xs.map((x, j) => (j === i ? { ...x, [k]: val } : x)));
            const num = (k: keyof V) => (e: React.ChangeEvent<HTMLInputElement>) => up(k, e.target.value === "" ? null : Number(e.target.value));
            const str = (k: keyof V) => (e: React.ChangeEvent<HTMLInputElement>) => up(k, e.target.value || null);
            return (
              <div key={v.id ?? i} className="grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-6">
                <F label="Объём, мл"><Input type="number" value={v.volume_ml ?? ""} onChange={num("volume_ml")} /></F>
                <F label="Вес, г"><Input type="number" value={v.weight_g ?? ""} onChange={num("weight_g")} /></F>
                <F label="SKU"><Input value={v.sku ?? ""} onChange={str("sku")} /></F>
                <F label="Розничная цена, ₽"><Input type="number" disabled={!!p.auto_pricing && v.retail_override===false} value={retailPrice(p,v.volume_ml,v.retail_override,v.price)??""} onChange={num("price")} />{p.auto_pricing&&<Check label="Ручная цена" v={v.retail_override!==false} on={x=>up("retail_override",x)}/>}</F>
                <F label="Остаток"><Input type="number" value={v.stock ?? ""} onChange={num("stock")} placeholder={TBA} /></F>
                <F label="Вес с упаковкой, г"><Input type="number" value={v.gross_weight_g ?? ""} onChange={num("gross_weight_g")} /></F>
                <F label="Ozon"><Input value={v.ozon_url ?? ""} onChange={str("ozon_url")} /></F>
                <F label="Wildberries"><Input value={v.wildberries_url ?? ""} onChange={str("wildberries_url")} /></F>
                <F label="Авито"><Input value={v.avito_url ?? ""} onChange={str("avito_url")} /></F>
                <F label="Яндекс Маркет"><Input value={v.yandex_market_url ?? ""} onChange={str("yandex_market_url")} /></F>
                <F label="Фото этикетки/тары (ссылка)"><Input value={v.image_url ?? ""} onChange={str("image_url")} /></F>
                <div className="flex items-end justify-between gap-2">
                  <Check label="Продаётся на сайте" v={v.sold_on_site !== false} on={(x) => up("sold_on_site", x)} />
                  <Button size="icon" variant="ghost" onClick={() => setVariants((xs) => xs.filter((_, j) => j !== i))} aria-label="Удалить фасовку"><Trash2 /></Button>
                </div>
                <WholesaleFields value={wholesale[v.id??`new-${i}`]??{}} onChange={w=>setWholesale(x=>({...x,[v.id??`new-${i}`]:w}))} retail={retailPrice(p,v.volume_ml,v.retail_override,v.price)} tax={priceMeta.data?.tax??6} levels={priceMeta.data?.levels??[]}/>
              </div>
            );
          })}
          <Button variant="outline" onClick={() => setVariants((x) => [...x, { sold_on_site: true, retail_override: !p.auto_pricing }])}><Plus /> Фасовка</Button>
        </div>
      </Block>

      <Block title="Изображения">
        {isNew ? <p className="text-muted-foreground">Сначала сохраните товар.</p> : (
          <>
            <input type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)} />
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {images.map((im, i) => (
                <div key={im.id} className="space-y-2 rounded-xl border border-border bg-card p-2">
                  <img src={im.url} alt="" className="aspect-square w-full rounded-lg object-cover" />
                  <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={im.kind} onChange={(e) => setImages((xs) => xs.map((x, j) => (j === i ? { ...x, kind: e.target.value } : x)))}>
                    <option value="photo">Фото товара</option><option value="label">Этикетка</option><option value="package">Тара / упаковка</option>
                  </select>
                  <Check label="Рендер (иллюстративное)" v={im.is_render} on={(v) => setImages((xs) => xs.map((x, j) => (j === i ? { ...x, is_render: v } : x)))} />
                  <Button size="sm" variant="ghost" onClick={() => removeImage(im)}><Trash2 /> Удалить</Button>
                </div>
              ))}
            </div>
          </>
        )}
      </Block>

      <Block title="Содержание карточки">
        <div className="grid gap-4">
          <F label="Для чего"><Textarea rows={3} value={p.purpose ?? ""} onChange={txt("purpose")} placeholder={TBA} /></F>
          <F label="Предупреждения и ограничения"><Textarea rows={3} value={p.warnings ?? ""} onChange={txt("warnings")} placeholder={TBA} /></F>
          <F label="Состав"><Textarea rows={2} value={p.composition ?? ""} onChange={txt("composition")} placeholder={TBA} /></F>
          <F label="Срок выдержки"><Input value={p.cure_time ?? ""} onChange={txt("cure_time")} placeholder={TBA} /></F>
          <F label="Видео (ссылка для встраивания, https)"><Input value={p.video_url ?? ""} onChange={txt("video_url")} placeholder="https://rutube.ru/play/embed/…" /></F>
        </div>
      </Block>

      <Block title="Как применять (шаги)">
        <div className="space-y-3">
          {steps.map((s, i) => {
            const up = (patch: Partial<UsageStep>) => set("usage_steps", steps.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <div key={i} className="grid gap-2 rounded-xl border border-border bg-card p-3 md:grid-cols-[140px_1fr_2fr_auto]">
                <select className="h-10 rounded-md border border-input bg-background px-2" value={s.icon ?? "droplet"} onChange={(e) => up({ icon: e.target.value })}>
                  {Object.keys(ICONS).map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <Input value={s.title} onChange={(e) => up({ title: e.target.value })} placeholder="Заголовок шага" />
                <Input value={s.text} onChange={(e) => up({ text: e.target.value })} placeholder="Текст шага" />
                <Button size="icon" variant="ghost" onClick={() => set("usage_steps", steps.filter((_, j) => j !== i))} aria-label="Удалить шаг"><Trash2 /></Button>
              </div>
            );
          })}
          <Button variant="outline" onClick={() => set("usage_steps", [...steps, { icon: "droplet", title: "", text: "" }])}><Plus /> Шаг</Button>
        </div>
      </Block>

      <Block title="FAQ">
        <div className="space-y-3">
          {faq.map((f, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-border bg-card p-3 md:grid-cols-[1fr_2fr_auto]">
              <Input value={f.q} onChange={(e) => set("faq", faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} placeholder="Вопрос" />
              <Input value={f.a} onChange={(e) => set("faq", faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} placeholder="Ответ" />
              <Button size="icon" variant="ghost" onClick={() => set("faq", faq.filter((_, j) => j !== i))} aria-label="Удалить"><Trash2 /></Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => set("faq", [...faq, { q: "", a: "" }])}><Plus /> Вопрос</Button>
        </div>
      </Block>

      <Block title="Рекомендуем к этому товару">
        <div className="grid gap-2 md:grid-cols-2">
          {meta.data?.all.filter((x) => x.id !== id).map((x) => (
            <Check key={x.id} label={x.name} v={recs.includes(x.id)} on={(v) => setRecs((r) => (v ? [...r, x.id] : r.filter((y) => y !== x.id)))} />
          ))}
        </div>
      </Block>

      <Button onClick={save} disabled={busy} size="lg">{busy ? "Сохраняем…" : "Сохранить"}</Button>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-4 text-lg uppercase">{title}</h2>{children}</section>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
function Check({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return <label className="flex items-center gap-2 text-sm"><Checkbox checked={v} onCheckedChange={(x) => on(x === true)} />{label}</label>;
}
