import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; to?: string };

export function PageShell({ title, lead, crumbs, children }: { title: string; lead?: string; crumbs: Crumb[]; children?: ReactNode }) {
  const all: Crumb[] = [{ label: "Главная", to: "/" }, ...crumbs];
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.to ? { item: c.to } : {}) })),
  };
  return (
    <div className="container-site pt-6">
      <nav aria-label="Хлебные крошки" className="text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          {all.map((c, i) => (
            <li key={i} className="flex items-center gap-1">
              {c.to && i < all.length - 1 ? <Link to={c.to} className="hover:text-foreground">{c.label}</Link> : <span aria-current="page" className="text-foreground">{c.label}</span>}
              {i < all.length - 1 && <ChevronRight className="h-3 w-3" aria-hidden />}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl uppercase md:text-5xl">{title}</h1>
        {lead && <p className="mt-4 text-lg text-muted-foreground">{lead}</p>}
      </header>
      <div className="mt-10">{children}</div>
    </div>
  );
}

export function StubNote({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-muted-foreground">{children}</div>;
}
