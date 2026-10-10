import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { seo, settingsQuery } from "@/lib/site";
import { nonEmpty } from "@/lib/contact-rules";

export const Route = createFileRoute("/politika-konfidencialnosti")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  head: () => seo("Политика конфиденциальности", "Политика обработки персональных данных на сайте НеСдует.", "/politika-konfidencialnosti"),
  component: PPolitikaKonfidencialnosti,
});

function PPolitikaKonfidencialnosti() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  return (
    <PageShell title="Политика конфиденциальности" crumbs={[{ label: "Политика конфиденциальности" }]}>
      <div className="max-w-3xl space-y-8 text-muted-foreground">
        <p className="border-l-2 border-primary pl-4 text-foreground">Черновик — требует проверки юристом.</p>
        <section><h2 className="mb-3 text-xl text-foreground">1. Оператор персональных данных</h2>
          {nonEmpty(s.seller_name) && <p>Оператор: {s.seller_name}.</p>}
          {nonEmpty(s.seller_inn) && <p>ИНН: {s.seller_inn}.</p>}
          {nonEmpty(s.contact_email) && <p>Контакт для обращений по персональным данным: <a className="underline" href={`mailto:${s.contact_email}`}>{s.contact_email}</a>.</p>}
        </section>
        <section><h2 className="mb-3 text-xl text-foreground">2. Какие данные собираются</h2><p>В зависимости от заполненной формы: имя, телефон, электронная почта, город, тип и контакт мессенджера, компания, тип бизнеса, ИНН дилера, ссылки на площадки, комментарий и данные заказов. Данные заказов будут обрабатываться при запуске оформления заказов.</p></section>
        <section><h2 className="mb-3 text-xl text-foreground">3. Цели обработки</h2><ul className="list-disc space-y-2 pl-5"><li>Обработка заказов, оптовых заявок и обращений.</li><li>Связь с покупателем и ответы на вопросы.</li><li>Уведомления о появлении выбранного товара по запросу пользователя.</li><li>Рассылка новостей — только при отдельном согласии, которое по умолчанию не отмечено.</li></ul></section>
        <section><h2 className="mb-3 text-xl text-foreground">4. Согласие и срок хранения</h2><p>Для отправки форм требуется согласие на обработку персональных данных. Согласие на рассылку даётся отдельно. Конкретные сроки хранения, основания и порядок удаления данных требуют уточнения и проверки юристом; сроки в этом черновике не установлены.</p></section>
        <section><h2 className="mb-3 text-xl text-foreground">5. Права пользователя</h2><p>Пользователь вправе запросить сведения об обработке своих данных, уточнение неточных данных, прекращение обработки и удаление данных в предусмотренных законом случаях, а также отозвать согласие. Порядок рассмотрения обращений требует проверки юристом.</p></section>
        <section><h2 className="mb-3 text-xl text-foreground">6. Отзыв согласия</h2><p>Для отзыва согласия на обработку данных или рассылку направьте обращение{nonEmpty(s.contact_email) && <> на <a className="underline" href={`mailto:${s.contact_email}`}>{s.contact_email}</a></>}, указав, какое согласие отзывается и контакт, использованный в форме. Необходимый порядок подтверждения обращения и сроки ответа требуют проверки юристом.</p></section>
      </div>
    </PageShell>
  );
}
