import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/skoro")({
  head: () => seo("Скоро: антиплесень", "Скоро в линейке НеСдует — средство против плесени для ПВХ-лодок. Подпишитесь на уведомление о старте продаж.", "/skoro"),
  component: Soon,
});

function Soon() {
  return (
    <PageShell title="Скоро: антиплесень" lead="Готовим средство против плесени для ПВХ-лодок. Оставьте e-mail — сообщим о старте продаж." crumbs={[{ label: "Скоро" }]}>
      <div className="drops-bg flex flex-col gap-6 rounded-3xl border border-armor/40 bg-card p-8 md:flex-row md:items-center md:justify-between md:p-12">
        <ShieldAlert className="h-16 w-16 text-armor" aria-hidden />
        <SubscribeForm topic="antimold" cta="Уведомить меня" />
      </div>
    </PageShell>
  );
}
