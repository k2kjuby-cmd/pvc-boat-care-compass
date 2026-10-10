import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { seo, settingsQuery } from "@/lib/site";
import { nonEmpty } from "@/lib/contact-rules";

export const Route = createFileRoute("/polzovatelskoe-soglashenie")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  head: () => seo("Пользовательское соглашение", "Пользовательское соглашение сайта НеСдует.", "/polzovatelskoe-soglashenie"),
  component: PPolzovatelskoeSoglashenie,
});

function PPolzovatelskoeSoglashenie() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  return (
    <PageShell title="Пользовательское соглашение" crumbs={[{ label: "Пользовательское соглашение" }]}>
      <div className="max-w-3xl space-y-8 text-muted-foreground">
        <p className="border-l-2 border-primary pl-4 text-foreground">Черновик — требует проверки юристом.</p>
        <section><h2 className="mb-3 text-xl text-foreground">1. Продавец и общие положения</h2>{nonEmpty(s.seller_name) && <p>Продавец: {s.seller_name}{nonEmpty(s.seller_status) && <>, {s.seller_status}</>}.</p>}{nonEmpty(s.seller_inn) && <p>ИНН: {s.seller_inn}.</p>}</section>
        {["2. Использование сайта и материалов", "3. Оформление и подтверждение заказа", "4. Цена и порядок оплаты", "5. Доставка и получение", "6. Возврат и рассмотрение претензий", "7. Права, обязанности и ответственность"].map(title => <section key={title}><h2 className="mb-3 text-xl text-foreground">{title}</h2><p>Раздел ожидает согласования. Конкретные условия пока не установлены.</p></section>)}
        <section><h2 className="mb-3 text-xl text-foreground">8. Обращения</h2>{nonEmpty(s.contact_email) && <a className="underline" href={`mailto:${s.contact_email}`}>{s.contact_email}</a>}</section>
      </div>
    </PageShell>
  );
}
