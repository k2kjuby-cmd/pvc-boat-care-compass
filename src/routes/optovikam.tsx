import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Store, LifeBuoy, Wrench, Handshake, Truck, FileText, BadgePercent, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/optovikam")({
  head: () => seo("Оптовикам", "Оптовые поставки средств ухода и ремонта ПВХ-лодок НеСдует для магазинов, прокатов, мастерских и дилеров. Оставьте заявку на прайс.", "/optovikam"),
  validateSearch: (s: Record<string, unknown>) => ({ utm_source: typeof s.utm_source === "string" ? s.utm_source : undefined }),
  component: Wholesale,
});

const perks = [
  { icon: BadgePercent, title: "Оптовые цены", text: "Прайс высылаем после одобрения заявки." },
  { icon: FileText, title: "Материалы для продаж", text: "Инструкции и описания для ваших площадок." },
  { icon: Truck, title: "Поставки", text: "Условия доставки обсуждаем индивидуально." },
  { icon: Headphones, title: "Поддержка", text: "Отвечаем на вопросы по применению." },
];
const who = [
  { icon: Store, title: "Магазины" },
  { icon: LifeBuoy, title: "Прокаты" },
  { icon: Wrench, title: "Мастерские" },
  { icon: Handshake, title: "Дилеры" },
];

const schema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(200),
  company: z.string().trim().min(1, "Укажите компанию").max(200),
  city: z.string().trim().min(2, "Укажите город").max(120),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{4,39}$/, "Проверьте телефон"),
  messenger_type: z.enum(["max", "telegram", "whatsapp"]),
  messenger_contact: z.string().trim().max(120).optional(),
  business_type: z.enum(["shop", "rental", "workshop", "dealer", "other"], { errorMap: () => ({ message: "Выберите тип бизнеса" }) }),
  inn: z.string().trim().regex(/^(\d{10}|\d{12})$/, "ИНН — 10 или 12 цифр").optional().or(z.literal("")),
  sales_links: z.string().trim().max(2000).optional(),
  comment: z.string().trim().max(3000).optional(),
});

function Wholesale() {
  const { utm_source } = Route.useSearch();
  const [f, setF] = useState({ name: "", company: "", city: "", phone: "", messenger_type: "telegram", messenger_contact: "", business_type: "", inn: "", sales_links: "", comment: "" });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const p = schema.safeParse(f);
    if (!p.success) return toast.error(p.error.issues[0].message);
    if (!consent) return toast.error("Нужно согласие на обработку персональных данных");
    const source = (new FormData(e.currentTarget).get("source") as string) || "optovikam";
    setBusy(true);
    const { error } = await supabase.from("wholesale_leads").insert({
      ...p.data,
      messenger_contact: p.data.messenger_contact || null,
      inn: p.data.inn || null,
      sales_links: p.data.sales_links || null,
      comment: p.data.comment || null,
      source: source.slice(0, 200),
      consent: true,
    });
    setBusy(false);
    if (error) return toast.error("Не удалось отправить заявку. Попробуйте позже.");
    setDone(true);
  }

  return (
    <PageShell title="Оптовикам" lead="Работаем с магазинами, прокатами, мастерскими и дилерами. Оставьте заявку — менеджер проверит её и пришлёт оптовый прайс." crumbs={[{ label: "Оптовикам" }]}>
      <section>
        <h2 className="text-2xl uppercase">Преимущества</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
              <p.icon className="h-7 w-7 text-primary" aria-hidden />
              <h3 className="mt-4 text-lg">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl uppercase">Кому подходит</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {who.map((w) => (
            <div key={w.title} className="flex items-center gap-3 rounded-2xl bg-surface p-5">
              <w.icon className="h-6 w-6 text-primary" aria-hidden /><span className="font-display">{w.title}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl uppercase">Общие условия</h2>
        <ul className="mt-6 space-y-3 text-muted-foreground">
          <li>— Заявки рассматриваются вручную, после одобрения мы связываемся с вами.</li>
          <li>— Цены, минимальная партия и условия доставки сообщаются вместе с прайсом.</li>
          <li>— Работаем с юридическими лицами и ИП; частным мастерам — по согласованию.</li>
        </ul>
      </section>

      <section id="zayavka" className="mt-16 scroll-mt-24 rounded-3xl border border-border bg-card p-6 md:p-10">
        <h2 className="text-2xl uppercase md:text-3xl">Заявка на оптовый прайс</h2>
        {done ? (
          <p className="mt-6 text-lg">Спасибо! Заявка отправлена. Мы свяжемся с вами после проверки.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-5 md:grid-cols-2" noValidate>
            <input type="hidden" name="source" value={utm_source ? `optovikam:${utm_source}` : "optovikam"} />
            <Field label="Имя *"><Input value={f.name} onChange={set("name")} autoComplete="name" /></Field>
            <Field label="Компания *"><Input value={f.company} onChange={set("company")} autoComplete="organization" /></Field>
            <Field label="Город *"><Input value={f.city} onChange={set("city")} /></Field>
            <Field label="Телефон *"><Input type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="+7" /></Field>
            <Field label="MAX / Telegram / WhatsApp">
              <div className="flex gap-2">
                <Select value={f.messenger_type} onValueChange={(v) => setF({ ...f, messenger_type: v })}>
                  <SelectTrigger className="w-36" aria-label="Тип мессенджера"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="max">MAX</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={f.messenger_contact} onChange={set("messenger_contact")} placeholder="@ник или номер" />
              </div>
            </Field>
            <Field label="Тип бизнеса *">
              <Select value={f.business_type} onValueChange={(v) => setF({ ...f, business_type: v })}>
                <SelectTrigger aria-label="Тип бизнеса"><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="shop">Магазин</SelectItem>
                  <SelectItem value="rental">Прокат</SelectItem>
                  <SelectItem value="workshop">Мастерская</SelectItem>
                  <SelectItem value="dealer">Дилер</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="ИНН (необязательно)"><Input inputMode="numeric" value={f.inn} onChange={set("inn")} /></Field>
            <Field label="Ссылки на площадки продаж"><Input value={f.sales_links} onChange={set("sales_links")} placeholder="Сайт, Ozon, Авито…" /></Field>
            <div className="md:col-span-2"><Field label="Комментарий"><Textarea rows={4} value={f.comment} onChange={set("comment")} /></Field></div>
            <label className="flex items-start gap-2 text-sm text-muted-foreground md:col-span-2">
              <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
              <span>Я согласен на обработку персональных данных в соответствии с <Link to="/politika-konfidencialnosti" className="underline">политикой конфиденциальности</Link></span>
            </label>
            <div className="md:col-span-2"><Button type="submit" size="lg" disabled={busy} className="shadow-glow">{busy ? "Отправляем…" : "Отправить заявку"}</Button></div>
          </form>
        )}
      </section>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
