import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsQuery } from "@/lib/site";
import { messengerLinks, nonEmpty, phoneHref } from "@/lib/contact-rules";

export function ContactDetails({ compact = false }: { compact?: boolean }) {
  const { data: s } = useQuery(settingsQuery);
  if (!s) return null;
  return <div className="space-y-3 text-sm">
    {nonEmpty(s.seller_name) && <p>{s.seller_name}</p>}
    {nonEmpty(s.seller_status) && <p className="text-muted-foreground">{s.seller_status}</p>}
    {nonEmpty(s.seller_inn) && <p>ИНН: {s.seller_inn}</p>}
    {nonEmpty(s.contact_phone) && <a className="block hover:text-primary" href={phoneHref(s.contact_phone ?? "")}>{s.contact_phone}</a>}
    {nonEmpty(s.contact_email) && <a className="block break-all hover:text-primary" href={`mailto:${s.contact_email}`}>{s.contact_email}</a>}
    {!compact && nonEmpty(s.shipping_city) && <p>Город отправки заказов: {s.shipping_city}</p>}
    {nonEmpty(s.postal_address) && <p>Почтовый адрес: {s.postal_address}</p>}
    <div className="flex flex-wrap gap-2">{messengerLinks(s).map(m => <Button key={m.name} asChild size="sm" variant="outline"><a href={m.url} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" />Написать в {m.name}</a></Button>)}</div>
  </div>;
}