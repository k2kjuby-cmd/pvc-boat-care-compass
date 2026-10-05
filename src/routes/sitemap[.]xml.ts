import { createFileRoute } from "@tanstack/react-router";

const PATHS = ["/", "/optovikam", "/katalog", "/dlya-masterskih", "/skoro", "/gde-kupit", "/o-brende", "/kontakty", "/dostavka-i-oplata", "/politika-konfidencialnosti", "/polzovatelskoe-soglashenie"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PATHS.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join("\n")}\n</urlset>`;
        return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
      },
    },
  },
});
