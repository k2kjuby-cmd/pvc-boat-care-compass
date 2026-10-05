import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marketplaceLinks, settingsQuery } from "@/lib/site";

/** Renders marketplace buttons only for filled links; returns null when none. */
export function WhereToBuyButtons() {
  const { data } = useQuery(settingsQuery);
  const links = data ? marketplaceLinks(data) : [];
  if (!links.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {links.map((l) => (
        <Button key={l.name} asChild variant="outline" size="lg" className="bg-card">
          <a href={l.url} target="_blank" rel="noopener noreferrer">{l.name}<ExternalLink className="h-4 w-4" /></a>
        </Button>
      ))}
    </div>
  );
}

export function useHasMarketplaces() {
  const { data } = useQuery(settingsQuery);
  return data ? marketplaceLinks(data).length > 0 : false;
}
