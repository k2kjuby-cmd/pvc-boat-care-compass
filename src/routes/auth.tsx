import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { seo } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({ ...seo("Вход", "Вход для администратора и одобренных дилеров НеСдует.", "/auth"), meta: [...seo("Вход", "Вход для администратора и одобренных дилеров НеСдует.", "/auth").meta,{name:"robots",content:"noindex"}] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function goAfterSignIn() { const {data:{user}}=await supabase.auth.getUser(); if(!user)return;const {data}=await supabase.rpc("has_role",{_user_id:user.id,_role:"admin"}); if(data)nav({to:"/admin"});else {const {data:a}=await supabase.from("dealer_accounts").select("approved").eq("user_id",user.id).maybeSingle();nav({to:a?.approved?"/optovyj-prajs":"/admin"});} }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) goAfterSignIn(); });
    const { data } = supabase.auth.onAuthStateChange((e, s) => { if (e === "SIGNED_IN" && s) goAfterSignIn(); });
    return () => data.subscription.unsubscribe();
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
    if (mode === "up" && !res.data.session) toast.success("Проверьте почту и подтвердите адрес");
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Не удалось войти через Google");
  }

  return (
    <div className="container-site flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8">
        <h1 className="text-2xl uppercase">{mode === "in" ? "Вход" : "Регистрация"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Панель управления сайтом</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2"><Label htmlFor="em">E-mail</Label><Input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="pw">Пароль</Label><Input id="pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={busy}>{mode === "in" ? "Войти" : "Зарегистрироваться"}</Button>
        </form>
        <Button variant="outline" className="mt-3 w-full" onClick={google}>Продолжить с Google</Button>
        <button className="mt-4 w-full text-sm text-muted-foreground underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}
