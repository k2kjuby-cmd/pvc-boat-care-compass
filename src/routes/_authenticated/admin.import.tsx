import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/import")({ component: ImportExport });

const COLS = ["slug", "name", "line", "category", "status", "is_hit", "short_description", "volume_ml", "weight_g", "sku", "price", "stock", "gross_weight_g", "sold_on_site", "ozon_url", "wildberries_url", "avito_url", "yandex_market_url", "image_url"] as const;
type Row = Partial<Record<(typeof COLS)[number], string | number | boolean | null>>;

const s = (v: unknown) => (v == null || v === "" ? null : String(v).trim());
const n = (v: unknown) => (v == null || v === "" ? null : Number(String(v).replace(",", ".")));
const b = (v: unknown) => ["1", "true", "да", "yes"].includes(String(v ?? "").toLowerCase().trim());

function ImportExport() {
  const qc = useQueryClient();
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function exportFile(type: "xlsx" | "csv") {
    const XLSX = await import("xlsx");
    const { data } = await supabase.from("products").select("slug,name,status,is_hit,short_description,product_lines(slug),categories(slug),product_variants(*)").order("sort");
    const rows: Row[] = [];
    for (const p of data ?? []) {
      const base = { slug: p.slug, name: p.name, line: p.product_lines?.slug ?? "", category: p.categories?.slug ?? "", status: p.status, is_hit: p.is_hit, short_description: p.short_description ?? "" };
      const vs = p.product_variants.length ? p.product_variants : [null];
      for (const v of vs) rows.push({ ...base, ...(v ? { volume_ml: v.volume_ml, weight_g: v.weight_g, sku: v.sku, price: v.price, stock: v.stock, gross_weight_g: v.gross_weight_g, sold_on_site: v.sold_on_site, ozon_url: v.ozon_url, wildberries_url: v.wildberries_url, avito_url: v.avito_url, yandex_market_url: v.yandex_market_url, image_url: v.image_url } : {}) });
    }
    const ws = XLSX.utils.json_to_sheet(rows, { header: [...COLS] });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Товары");
    XLSX.writeFile(wb, `nesduet-tovary.${type}`, { bookType: type });
  }

  async function importFile(f: File) {
    setBusy(true);
    const out: string[] = [];
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await f.arrayBuffer());
      const rows = XLSX.utils.sheet_to_json<Row>(wb.Sheets[wb.SheetNames[0]!]!, { defval: null });
      const [{ data: lines }, { data: cats }] = await Promise.all([supabase.from("product_lines").select("id,slug"), supabase.from("categories").select("id,slug")]);
      const ids = new Map<string, string>();
      for (const [i, r] of rows.entries()) {
        const slug = s(r.slug);
        if (!slug || !/^[a-z0-9-]+$/.test(slug)) { out.push(`Строка ${i + 2}: неверный slug`); continue; }
        let pid = ids.get(slug);
        if (!pid) {
          const status = s(r.status);
          const prod = {
            slug, name: s(r.name) ?? slug,
            line_id: lines?.find((l) => l.slug === s(r.line))?.id ?? null,
            category_id: cats?.find((c) => c.slug === s(r.category))?.id ?? null,
            status: (status === "published" || status === "soon" || status === "hidden" ? status : "hidden") as "published" | "soon" | "hidden",
            is_hit: b(r.is_hit), short_description: s(r.short_description),
          };
          const { data, error } = await supabase.from("products").upsert(prod, { onConflict: "slug" }).select("id").single();
          if (error) { out.push(`Строка ${i + 2}: ${error.message}`); continue; }
          pid = data.id; ids.set(slug, pid);
        }
        if (r.volume_ml == null && r.weight_g == null && !s(r.sku)) continue;
        const v = {
          product_id: pid, volume_ml: n(r.volume_ml), weight_g: n(r.weight_g), sku: s(r.sku), price: n(r.price), stock: n(r.stock), gross_weight_g: n(r.gross_weight_g),
          sold_on_site: r.sold_on_site == null ? true : b(r.sold_on_site),
          ozon_url: s(r.ozon_url), wildberries_url: s(r.wildberries_url), avito_url: s(r.avito_url), yandex_market_url: s(r.yandex_market_url), image_url: s(r.image_url),
        };
        let q = supabase.from("product_variants").select("id").eq("product_id", pid);
        q = v.sku ? q.eq("sku", v.sku) : v.volume_ml != null ? q.eq("volume_ml", v.volume_ml) : q.eq("weight_g", v.weight_g!);
        const { data: ex } = await q.maybeSingle();
        const res = ex ? await supabase.from("product_variants").update(v).eq("id", ex.id) : await supabase.from("product_variants").insert(v);
        if (res.error) out.push(`Строка ${i + 2}: ${res.error.message}`);
      }
      out.unshift(`Обработано строк: ${rows.length}, товаров: ${ids.size}`);
      qc.invalidateQueries();
      toast.success("Импорт завершён");
    } catch (e) {
      out.push((e as Error).message);
    }
    setLog(out);
    setBusy(false);
  }

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl uppercase">Импорт и экспорт</h1>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg">Экспорт</h2>
        <p className="mt-1 text-sm text-muted-foreground">Одна строка — одна фасовка. Этот же файл можно отредактировать и загрузить обратно.</p>
        <div className="mt-4 flex gap-2"><Button onClick={() => exportFile("xlsx")}>Скачать Excel</Button><Button variant="outline" onClick={() => exportFile("csv")}>Скачать CSV</Button></div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg">Импорт (CSV или Excel)</h2>
        <p className="mt-1 text-sm text-muted-foreground">Колонки: {COLS.join(", ")}. Товар ищется по slug, фасовка — по SKU или объёму. status: published / soon / hidden. line: lite / pro / armor. category: remont / germetizaciya / ochistka / aksessuary.</p>
        <input className="mt-4" type="file" accept=".csv,.xlsx,.xls" disabled={busy} onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
        {log.length > 0 && <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-background p-3 text-xs">{log.join("\n")}</pre>}
      </section>
    </div>
  );
}
