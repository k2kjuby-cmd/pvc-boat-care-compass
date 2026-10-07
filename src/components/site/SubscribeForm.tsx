import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({ email: z.string().trim().email("Проверьте e-mail").max(254) });

export function SubscribeForm({ topic = "news", cta = "Подписаться", productId }: { topic?: "news" | "antimold" | "product"; cta?: string; productId?: string }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse({ email });
    if (!p.success) { toast.error(p.error.issues[0]?.message ?? "Проверьте e-mail"); return; }
    if (!consent) { toast.error("Нужно согласие на обработку персональных данных"); return; }
    setBusy(true);
    const { error } = await supabase.from("subscribers").insert({ email: p.data.email.toLowerCase(), topic, consent: true, product_id: productId ?? null });
    setBusy(false);
    if (error && error.code !== "23505") { toast.error("Не удалось отправить. Попробуйте позже."); return; }
    setDone(true);
  }

  if (done) return <p className="font-display text-lg text-foreground">Спасибо! Вы в списке.</p>;
  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input type="email" required placeholder="Ваш e-mail" aria-label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-background" />
        <Button type="submit" disabled={busy} className="h-11">{cta}</Button>
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
        <span>Согласен на обработку персональных данных согласно <Link to="/politika-konfidencialnosti" className="underline">политике конфиденциальности</Link></span>
      </label>
    </form>
  );
}
