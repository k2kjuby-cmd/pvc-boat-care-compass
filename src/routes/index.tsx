import { createFileRoute, Link } from "@tanstack/react-router";
import { Scissors, Waves, Wind, Sparkles, ShieldAlert, ArrowRight, Search, Package, Wrench, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";
import { seo, settingsQuery } from "@/lib/site";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { WhereToBuyButtons, useHasMarketplaces } from "@/components/site/WhereToBuy";

export const Route = createFileRoute("/")({
  head: () => seo("Лодка не травит", "НеСдует — система ухода и защиты ПВХ-лодок: ремонт проколов и швов, герметизация, очистка и защита. Опт для магазинов, прокатов и мастерских.", "/"),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: Home,
});

const problems = [
  { icon: Scissors, title: "Прокол или порез", tag: "prokol" },
  { icon: Waves, title: "Травит шов", tag: "shov" },
  { icon: Wind, title: "Лодка сдувается понемногу", tag: "germetik" },
  { icon: Sparkles, title: "Грязная и выцветшая лодка", tag: "uhod" },
  { icon: ShieldAlert, title: "Плесень", tag: "plesen", soon: true },
];

const steps = [
  { icon: Search, title: "Найдите проблему", text: "Выберите, что случилось с лодкой." },
  { icon: Package, title: "Подберите средство", text: "Система подскажет нужный набор." },
  { icon: Wrench, title: "Сделайте по инструкции", text: "Пошаговые материалы от мастеров." },
  { icon: CheckCircle2, title: "Выходите на воду", text: "Лодка держит давление." },
];

function Home() {
  const hasShops = useHasMarketplaces();
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={hero} alt="ПВХ-лодка в брызгах воды" width={1600} height={1104} className="absolute inset-0 h-full w-full object-cover opacity-70" fetchPriority="high" />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="container-site relative flex min-h-[78vh] flex-col justify-end pb-16 pt-32 md:pb-24">
          <span className="mb-4 w-fit rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">Система ухода за ПВХ</span>
          <h1 className="max-w-3xl text-5xl uppercase leading-[0.95] md:text-7xl">Лодка<br />не травит</h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground md:text-xl">Ремонт, герметизация, очистка и защита ПВХ-лодок — одна система, понятные шаги.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="shadow-glow"><Link to="/katalog">Подобрать средство <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="secondary"><Link to="/optovikam" hash="zayavka">Оптовый прайс</Link></Button>
          </div>
        </div>
      </section>

      <section className="container-site py-20">
        <h2 className="text-3xl uppercase md:text-4xl">Какая у вас проблема?</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {problems.map((p) => (
            <Link key={p.tag} to={p.soon ? "/skoro" : "/katalog"} search={p.soon ? {} : { problema: p.tag }} className="group relative flex min-h-36 flex-col justify-between rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary">
              <p.icon className="h-8 w-8 text-primary" aria-hidden />
              <span className="font-display text-base leading-tight">{p.title}</span>
              {p.soon && <span className="absolute right-3 top-3 rounded-full bg-armor/20 px-2 py-0.5 text-[10px] uppercase text-armor">Скоро</span>}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-site">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl uppercase md:text-4xl">Хиты</h2>
          <Link to="/katalog" className="text-sm text-primary">Весь каталог →</Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {[["Lite", "bg-lite/15 text-lite"], ["Pro", "bg-pro/15 text-pro"], ["Armor", "bg-armor/15 text-armor"]].map(([n, c]) => (
            <span key={n} className={`rounded-full px-4 py-1.5 font-display text-sm ${c}`}>{n}</span>
          ))}
        </div>
        <p className="mt-4 text-muted-foreground">Линейка заплаток Lite, Pro и Armor появится в каталоге совсем скоро.</p>
      </section>

      <section className="container-site py-20">
        <div className="drops-bg relative overflow-hidden rounded-3xl bg-red-grad p-8 md:p-14">
          <h2 className="max-w-2xl text-3xl uppercase md:text-5xl">Оптовикам, прокатам и мастерским</h2>
          <p className="mt-4 max-w-xl text-primary-foreground/85">Магазины, прокаты, ремонтные мастерские и дилеры — работаем напрямую. Оставьте заявку и получите оптовый прайс.</p>
          <Button asChild size="lg" variant="secondary" className="mt-8"><Link to="/optovikam" hash="zayavka">Получить оптовый прайс <ArrowRight /></Link></Button>
        </div>
      </section>

      <section className="container-site">
        <h2 className="text-3xl uppercase md:text-4xl">Как это работает</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <s.icon className="h-8 w-8 text-primary" aria-hidden />
                <span className="font-display text-4xl text-foreground/15">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {hasShops && (
        <section className="container-site pt-20">
          <h2 className="text-3xl uppercase md:text-4xl">Где купить</h2>
          <div className="mt-8"><WhereToBuyButtons /></div>
        </section>
      )}

      <section className="container-site pt-20">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 md:grid-cols-2 md:items-center md:p-12">
          <div>
            <h2 className="text-2xl uppercase md:text-3xl">Новости и секреты мастеров</h2>
            <p className="mt-3 text-muted-foreground">Новинки, инструкции и разборы случаев — без спама.</p>
          </div>
          <SubscribeForm />
        </div>
      </section>
    </>
  );
}
