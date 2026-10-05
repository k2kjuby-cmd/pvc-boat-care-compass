import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Lightbulb, ClipboardList, PlayCircle } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/dlya-masterskih")({
  head: () => seo("Для мастерских", "Инструкции по ремонту ПВХ-лодок, секреты мастеров, разборы случаев и видео от НеСдует.", "/dlya-masterskih"),
  component: Blog,
});

const rubrics = [
  { icon: BookOpen, title: "Инструкции", text: "Пошаговый ремонт и уход." },
  { icon: Lightbulb, title: "Секреты мастеров", text: "Приёмы из практики." },
  { icon: ClipboardList, title: "Разбор случаев", text: "Реальные повреждения и решения." },
  { icon: PlayCircle, title: "Видео", text: "Смотрите, как это делается." },
];

function Blog() {
  return (
    <PageShell title="Для мастерских" lead="Экспертные материалы по ремонту и уходу за ПВХ-лодками." crumbs={[{ label: "Для мастерских" }]}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rubrics.map((r) => (
          <section key={r.title} className="rounded-2xl border border-border bg-card p-6">
            <r.icon className="h-8 w-8 text-primary" aria-hidden />
            <h2 className="mt-4 text-xl">{r.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
            <p className="mt-4 text-xs uppercase text-muted-foreground">Материалы готовятся</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
