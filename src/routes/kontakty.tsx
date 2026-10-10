import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { ContactDetails } from "@/components/site/ContactDetails";
import { ContactForm } from "@/components/site/ContactForm";
import { seo, settingsQuery } from "@/lib/site";

export const Route = createFileRoute("/kontakty")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  head: () => seo("Контакты", "Контакты бренда НеСдует: телефон, e-mail, мессенджеры.", "/kontakty"),
  component: PKontakty,
});

function PKontakty() {
  return (
    <PageShell title="Контакты" lead="Свяжитесь с нами удобным способом." crumbs={[{ label: "Контакты" }]}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
        <section><h2 className="mb-6 text-2xl">НеСдует</h2><ContactDetails /></section>
        <section><h2 className="mb-6 text-2xl">Обратная связь</h2><ContactForm /></section>
      </div>
    </PageShell>
  );
}
