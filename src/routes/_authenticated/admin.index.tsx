import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/site";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/")({ head:()=>seo("Управление товарами", "Товары и розничные цены НеСдует.", "/admin"), component: ProductsList });

const STATUS: Record<string, string> = { published: "Опубликован", soon: "Скоро", hidden: "Скрыт" };

function ProductsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id,slug,name,status,is_hit,product_lines(name),categories(name),product_variants(price)").order("sort");
      if (error) throw error;
      return data;
    },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl uppercase">Товары</h1>
        <Button asChild><Link to="/admin/tovar/$id" params={{ id: "new" }}>Добавить товар</Link></Button>
      </div>
      {isLoading ? <p className="mt-6 text-muted-foreground">Загрузка…</p> : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-left text-muted-foreground"><tr><th className="p-3">Название</th><th className="p-3">Линейка</th><th className="p-3">Категория</th><th className="p-3">Статус</th><th className="p-3">Цена от</th><th className="p-3">Хит</th></tr></thead>
            <tbody>
              {data?.map((p) => {
                const prices = p.product_variants.map((v) => v.price).filter((x): x is number => x != null);
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3"><Link to="/admin/tovar/$id" params={{ id: p.id }} className="text-primary hover:underline">{p.name}</Link></td>
                    <td className="p-3">{p.product_lines?.name ?? "—"}</td>
                    <td className="p-3">{p.categories?.name ?? "—"}</td>
                    <td className="p-3">{STATUS[p.status]}</td>
                    <td className="p-3">{prices.length ? formatPrice(Math.min(...prices.map(Number))) : "будет добавлено"}</td>
                    <td className="p-3">{p.is_hit ? "★" : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
