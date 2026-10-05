import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "./Header";
import { settingsQuery } from "@/lib/site";

const cols = [
  { title: "Продукция", links: [
    { to: "/katalog", label: "Каталог" },
    { to: "/skoro", label: "Скоро" },
    { to: "/gde-kupit", label: "Где купить" },
  ] },
  { title: "Партнёрам", links: [
    { to: "/optovikam", label: "Оптовикам" },
    { to: "/dlya-masterskih", label: "Для мастерских" },
  ] },
  { title: "Покупателям", links: [
    { to: "/dostavka-i-oplata", label: "Доставка и оплата" },
    { to: "/o-brende", label: "О бренде" },
    { to: "/kontakty", label: "Контакты" },
  ] },
] as const;

export function Footer() {
  const { data } = useQuery(settingsQuery);
  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="container-site grid gap-10 py-12 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">Система ухода и защиты ПВХ-лодок.</p>
          {(data?.contact_phone || data?.contact_email) && (
            <div className="mt-4 space-y-1 text-sm">
              {data.contact_phone && <a className="block hover:text-primary" href={`tel:${data.contact_phone}`}>{data.contact_phone}</a>}
              {data.contact_email && <a className="block hover:text-primary" href={`mailto:${data.contact_email}`}>{data.contact_email}</a>}
            </div>
          )}
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm uppercase text-muted-foreground">{c.title}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.to}><Link to={l.to} className="hover:text-primary">{l.label}</Link></li>
              ))}
              {c.title === "Партнёрам" && data?.dealers_page_enabled && (
                <li><Link to="/dilery" className="hover:text-primary">Наши дилеры</Link></li>
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-muted-foreground md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} НеСдует</span>
          <div className="flex gap-4">
            <Link to="/politika-konfidencialnosti" className="hover:text-foreground">Политика конфиденциальности</Link>
            <Link to="/polzovatelskoe-soglashenie" className="hover:text-foreground">Пользовательское соглашение</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
