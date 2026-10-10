import { describe, expect, it } from "vitest";
import { canSubmitSubscription, contactSchema, messengerLinks, organization, phoneHref } from "./contact-rules";

describe("contact rules", () => {
  it("hides empty messenger links", () => {
    expect(messengerLinks({ contact_max: "https://max.ru/u/test", contact_telegram: "", contact_whatsapp: " " })).toEqual([{ name: "MAX", url: "https://max.ru/u/test" }]);
  });
  it("uses a callable phone link", () => expect(phoneHref("+7 977 783-76-73")).toBe("tel:+79777837673"));
  it("uses brand phone and email without INN in Organization", () => {
    const result = organization({ contact_phone: "+7 977 783-76-73", contact_email: "mail@prokat.pw" });
    expect(result).toEqual({ "@context": "https://schema.org", "@type": "Organization", name: "НеСдует", telephone: "+7 977 783-76-73", email: "mail@prokat.pw" });
  });
  it("requires separate consent for news", () => {
    expect(canSubmitSubscription("news", true, false)).toBe(false);
    expect(canSubmitSubscription("news", true, true)).toBe(true);
  });
  it("requires data consent even for product notifications", () => {
    expect(canSubmitSubscription("product", false, true)).toBe(false);
    expect(canSubmitSubscription("product", true, false)).toBe(true);
  });
  it("contact form requires data consent and defaults newsletter off", () => {
    const data = { name: "Тест", phone: "+7 977 783-76-73", email: "", city: "", messenger_type: "max", messenger_contact: "", message: "Вопрос", consent: true };
    expect(contactSchema.parse(data).newsletter_consent).toBe(false);
    expect(contactSchema.safeParse({ ...data, consent: false }).success).toBe(false);
  });
});