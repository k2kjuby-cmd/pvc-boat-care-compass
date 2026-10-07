import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { DilutionCalc } from "@/components/catalog/DilutionCalc";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/kalkulyator-razvedeniya")({
  head: () => seo("Калькулятор разведения", "Рассчитайте, сколько воды добавить к концентрату Clean+Black: режимы 1:10 и 1:30.", "/kalkulyator-razvedeniya"),
  component: () => (
    <PageShell title="Калькулятор разведения" lead="Для очистителя-концентрата Clean+Black: 1:10 — сильные загрязнения, 1:30 — регулярная мойка." crumbs={[{ label: "Калькулятор разведения" }]}>
      <div className="max-w-3xl"><DilutionCalc /></div>
      <Link to="/katalog/$slug" params={{ slug: "ochistitel-clean-black" }} className="mt-6 inline-block text-primary">Перейти к очистителю →</Link>
    </PageShell>
  ),
});
