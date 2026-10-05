import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Menu, X, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV, settingsQuery } from "@/lib/site";

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
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="НеСдует — на главную" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Основное меню">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex shadow-glow">
            <Link to="/optovikam" hash="zayavka">Оптовый прайс</Link>
          </Button>
          <button className="rounded-lg p-2 lg:hidden" aria-label={open ? "Закрыть меню" : "Открыть меню"} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-background lg:hidden" aria-label="Мобильное меню">
          <div className="container-site flex flex-col py-4">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-3 text-lg font-display">
                {n.label}
              </Link>
            ))}
            <Button asChild className="mt-4">
              <Link to="/optovikam" hash="zayavka" onClick={() => setOpen(false)}>Оптовый прайс</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
