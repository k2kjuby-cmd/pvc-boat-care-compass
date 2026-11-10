import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/site";
import { useServerFn } from "@tanstack/react-start";
import { inviteDealer } from "@/lib/dealer.functions";

export const Route = createFileRoute("/_authenticated/admin/zayavki")({ head: () => seo("Заявки и обращения", "Оптовые заявки и сообщения покупателей НеСдует.", "/admin/zayavki"), component: Leads });

const ST = { new: "Новая", approved: "Одобрена", rejected: "Отклонена" } as const;
const BT: Record<string, string> = { shop: "Магазин", rental: "Прокат", workshop: "Мастерская", dealer: "Дилер", other: "Другое" };

function Leads() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => (await supabase.from("wholesale_leads").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: messages = [] } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const invite = useServerFn(inviteDealer);
  async function sendInvite(id: string, current: string | null) {
    const email = (current || window.prompt("E-mail дилера для ссылки на создание пароля") || "").trim();
    if (!email) return;
    try { await invite({ data: { leadId: id, email, origin: window.location.origin } }); toast.success("Письмо со ссылкой отправлено"); qc.invalidateQueries(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Не удалось отправить письмо"); }
  }
  async function setStatus(id: string, status: "approved" | "rejected", email: string | null = null) {
    const { error } = await supabase.from("wholesale_leads").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-leads"] });
    if (status === "approved") await sendInvite(id, email);
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
              <span>{l.name}, {l.phone}{l.email ? `, ${l.email}` : ""}</span>
              <span>{l.messenger_type ? `${l.messenger_type}: ${l.messenger_contact ?? ""}` : ""}</span>
              <span>Тип: {BT[l.business_type] ?? l.business_type}{l.inn ? ` · ИНН ${l.inn}` : ""}</span>
              <span>Источник: {l.source ?? "—"}</span>
               <span>Рассылка: {l.newsletter_consent ? "согласие получено" : "нет согласия"}</span>
              {l.sales_links && <span className="md:col-span-2">Площадки: {l.sales_links}</span>}
              {l.comment && <span className="md:col-span-2">Комментарий: {l.comment}</span>}
            </div>
            {l.status === "approved" && <Button className="mt-3" size="sm" variant="outline" onClick={() => sendInvite(l.id, l.email)}>Отправить ссылку на пароль повторно</Button>}
            {l.status === "new" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => setStatus(l.id, "approved", l.email)}>Одобрить</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "rejected")}>Отклонить</Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <section className="mt-12">
        <h2 className="text-2xl uppercase">Обратная связь</h2>
        {messages.length === 0 && <p className="mt-6 text-muted-foreground">Сообщений пока нет.</p>}
        <div className="mt-6 space-y-3">{messages.map(m => <article key={m.id} className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-lg">{m.name}</h3><p className="mt-2 text-sm text-muted-foreground">{m.phone}{m.email && ` · ${m.email}`}{m.city && ` · ${m.city}`}</p>
          {m.messenger_contact && <p className="mt-2 text-sm">{m.messenger_type?.toUpperCase()}: {m.messenger_contact}</p>}
          <p className="mt-3 whitespace-pre-wrap break-words">{m.message}</p>
          <p className="mt-3 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("ru-RU")} · Обработка данных: {m.consent ? "согласие получено" : "нет согласия"} · Рассылка: {m.newsletter_consent ? "согласие получено" : "нет согласия"}</p>
        </article>)}</div>
      </section>
    </div>
  );
}
