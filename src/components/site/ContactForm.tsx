import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConsentFields } from "./ConsentFields";
import { contactSchema } from "@/lib/contact-rules";

export function ContactForm() {
  const [f, setF] = useState({ name: "", phone: "", email: "", city: "", messenger_type: "max", messenger_contact: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = contactSchema.safeParse({ ...f, consent, newsletter_consent: newsletter });
    if (!p.success) { toast.error(p.error.issues[0]?.message ?? "Проверьте форму"); return; }
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert({ ...p.data, email: p.data.email || null, city: p.data.city || null, messenger_contact: p.data.messenger_contact || null });
    setBusy(false);
    if (error) { toast.error("Не удалось отправить сообщение. Попробуйте позже."); return; }
    setDone(true);
  }
  if (done) return <p role="status" className="text-lg">Спасибо! Ваше сообщение отправлено.</p>;
  return <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
    {([['name','Имя *'], ['phone','Телефон *'], ['email','Электронная почта'], ['city','Город']] as const).map(([key,label]) => <div key={key} className="space-y-2"><Label htmlFor={`contact-${key}`}>{label}</Label><Input id={`contact-${key}`} type={key === "phone" ? "tel" : key === "email" ? "email" : "text"} required={key === "name" || key === "phone"} maxLength={key === "email" ? 254 : key === "phone" ? 40 : key === "city" ? 120 : 200} value={f[key]} onChange={e => setF({ ...f, [key]: e.target.value })} /></div>)}
    <div className="space-y-2 sm:col-span-2"><Label htmlFor="contact-messenger">MAX / Telegram / WhatsApp</Label><div className="flex gap-2"><Select value={f.messenger_type} onValueChange={v => setF({ ...f, messenger_type: v })}><SelectTrigger className="w-36 shrink-0" aria-label="Тип мессенджера"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="max">MAX</SelectItem><SelectItem value="telegram">Telegram</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem></SelectContent></Select><Input id="contact-messenger" maxLength={120} value={f.messenger_contact} placeholder="Ник или номер" onChange={e => setF({ ...f, messenger_contact: e.target.value })} /></div></div>
    <div className="space-y-2 sm:col-span-2"><Label htmlFor="contact-message">Сообщение *</Label><Textarea id="contact-message" required minLength={2} maxLength={3000} rows={5} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} /></div>
    <div className="sm:col-span-2"><ConsentFields consent={consent} newsletter={newsletter} onConsent={setConsent} onNewsletter={setNewsletter} /></div>
    <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Отправляем…" : "Отправить сообщение"}</Button></div>
  </form>;
}