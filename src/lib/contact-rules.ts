import { z } from "zod";

export function nonEmpty(value?: string | null) { return value?.trim() || null; }
export function phoneHref(value: string) { return `tel:${value.replace(/[^+\d]/g, "")}`; }
export function messengerLinks(s: { contact_max?: string | null; contact_telegram?: string | null; contact_whatsapp?: string | null }) {
  return [
    { name: "MAX", url: nonEmpty(s.contact_max) },
    { name: "Telegram", url: nonEmpty(s.contact_telegram) },
    { name: "WhatsApp", url: nonEmpty(s.contact_whatsapp) },
  ].filter((m): m is { name: string; url: string } => !!m.url && /^https:\/\//i.test(m.url));
}
export function organization(s: { contact_phone?: string | null; contact_email?: string | null }) {
  return { "@context": "https://schema.org", "@type": "Organization", name: "НеСдует",
    ...(nonEmpty(s.contact_phone) ? { telephone: nonEmpty(s.contact_phone) } : {}),
    ...(nonEmpty(s.contact_email) ? { email: nonEmpty(s.contact_email) } : {}),
  };
}
export function canSubmitSubscription(topic: string, consent: boolean, newsletterConsent: boolean) {
  return consent && (topic !== "news" || newsletterConsent);
}
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(200),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{4,39}$/, "Проверьте телефон"),
  email: z.string().trim().email("Проверьте e-mail").max(254).or(z.literal("")),
  city: z.string().trim().max(120),
  messenger_type: z.enum(["max", "telegram", "whatsapp"]),
  messenger_contact: z.string().trim().max(120),
  message: z.string().trim().min(2, "Напишите сообщение").max(3000),
  consent: z.literal(true, { errorMap: () => ({ message: "Нужно согласие на обработку персональных данных" }) }),
  newsletter_consent: z.boolean().default(false),
});