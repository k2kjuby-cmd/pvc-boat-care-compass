import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Menu, X, Droplet, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV, settingsQuery } from "@/lib/site";
import { messengerLinks, nonEmpty, phoneHref } from "@/lib/contact-rules";

export function Logo() {
  const { data } = useQuery(settingsQuery);
  if (data?.logo_url) return <img src={data.logo_url} alt="НеСдует" className="h-9 w-auto" />;
  return (
    <span className="flex items-center gap-2 font-display text-xl tracking-wide">
      <Droplet className="h-6 w-6 fill-primary text-primary" aria-hidden />
      НЕСДУЕТ
    </span>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { data } = useQuery(settingsQuery);
  const max = data ? messengerLinks(data).find(m => m.name === "MAX") : undefined;
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="НеСдует — на главную" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-4 xl:flex" aria-label="Основное меню">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {nonEmpty(data?.contact_phone) && <Button asChild size="icon" variant="ghost"><a href={phoneHref(data?.contact_phone ?? "")} aria-label={`Позвонить: ${data?.contact_phone}`} title={data?.contact_phone ?? "Телефон"}><Phone className="size-4" /></a></Button>}
          {max && <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex"><a href={max.url} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" />Написать в MAX</a></Button>}
          <Button asChild size="sm" className="hidden sm:inline-flex shadow-glow">
            <Link to="/optovikam" hash="zayavka">Оптовый прайс</Link>
          </Button>
          <Button variant="ghost" size="icon" className="xl:hidden" aria-label={open ? "Закрыть меню" : "Открыть меню"} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background xl:hidden" aria-label="Мобильное меню">
          <div className="container-site flex flex-col py-4">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-3 text-lg font-display">
                {n.label}
              </Link>
            ))}
            {nonEmpty(data?.contact_phone) && <a href={phoneHref(data?.contact_phone ?? "")} className="flex items-center gap-2 py-3"><Phone className="size-4" />{data?.contact_phone}</a>}
            {max && <Button asChild variant="outline" className="mt-3"><a href={max.url} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" />Написать в MAX</a></Button>}
            <Button asChild className="mt-4">
              <Link to="/optovikam" hash="zayavka" onClick={() => setOpen(false)}>Оптовый прайс</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
