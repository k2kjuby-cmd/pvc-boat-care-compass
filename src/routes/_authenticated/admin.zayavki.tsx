import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/zayavki")({ component: Leads });

const ST = { new: "Новая", approved: "Одобрена", rejected: "Отклонена" } as const;
const BT: Record<string, string> = { shop: "Магазин", rental: "Прокат", workshop: "Мастерская", dealer: "Дилер", other: "Другое" };

function Leads() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => (await supabase.from("wholesale_leads").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  async function setStatus(id: string, status: "approved" | "rejected") {
    const { error } = await supabase.from("wholesale_leads").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin-leads"] });
  }
  return (
    <div>
      <h1 className="text-2xl uppercase">Оптовые заявки</h1>
      <div className="mt-6 space-y-3">
        {data?.length === 0 && <p className="text-muted-foreground">Заявок пока нет.</p>}
        {data?.map((l) => (
          <div key={l.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-display">{l.company} · {l.city}</div>
              <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("ru-RU")} · {ST[l.status]}</span>
            </div>
            <div className="mt-2 grid gap-1 text-sm text-muted-foreground md:grid-cols-2">
              <span>{l.name}, {l.phone}</span>
              <span>{l.messenger_type ? `${l.messenger_type}: ${l.messenger_contact ?? ""}` : ""}</span>
              <span>Тип: {BT[l.business_type] ?? l.business_type}{l.inn ? ` · ИНН ${l.inn}` : ""}</span>
              <span>Источник: {l.source ?? "—"}</span>
              {l.sales_links && <span className="md:col-span-2">Площадки: {l.sales_links}</span>}
              {l.comment && <span className="md:col-span-2">Комментарий: {l.comment}</span>}
            </div>
            {l.status === "new" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => setStatus(l.id, "approved")}>Одобрить</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "rejected")}>Отклонить</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
