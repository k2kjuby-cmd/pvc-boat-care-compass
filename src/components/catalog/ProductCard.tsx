import { Link } from "@tanstack/react-router";
import { Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, type CardProduct, type LineColor } from "@/lib/catalog";

const lineCls: Record<LineColor, string> = {
  lite: "bg-lite/15 text-lite",
  pro: "bg-pro/15 text-pro",
  armor: "bg-armor/15 text-armor",
  none: "bg-muted text-muted-foreground",
};

export function LineBadge({ line }: { line: { name: string; color: LineColor } | null }) {
  if (!line) return null;
  return <span className={`rounded-full px-2.5 py-0.5 font-display text-xs ${lineCls[line.color]}`}>{line.name}</span>;
}

export function ImagePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`drops-bg flex items-center justify-center bg-surface ${className}`}>
      <Droplet className="h-12 w-12 fill-primary/30 text-primary/60" aria-hidden />
    </div>
  );
}

export function ProductCard({ p }: { p: CardProduct }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary">
      <Link to="/katalog/$slug" params={{ slug: p.slug }} className="relative block aspect-square overflow-hidden">
        {p.image ? (
          <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
        {p.status === "soon" && <span className="absolute left-3 top-3 rounded-full bg-armor px-2.5 py-0.5 text-xs font-semibold text-background">Скоро</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="min-h-5"><LineBadge line={p.line} /></div>
        <h3 className="font-display text-base leading-tight">{p.name}</h3>
        {p.short_description && <p className="line-clamp-1 text-sm text-muted-foreground">{p.short_description}</p>}
        <div className="mt-auto flex flex-col items-start gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="whitespace-nowrap font-display text-lg">{p.minPrice != null ? `от ${formatPrice(p.minPrice)}` : ""}</span>
          <Button asChild size="sm" variant="secondary">
            <Link to="/katalog/$slug" params={{ slug: p.slug }}>Подробнее</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
