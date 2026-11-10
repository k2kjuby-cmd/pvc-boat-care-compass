import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { seo } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => seo("Панель управления", "Управление сайтом НеСдует.", "/admin"),
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "Товары", exact: true },
  { to: "/admin/import", label: "Импорт / экспорт" },
  { to: "/admin/zayavki", label: "Заявки" },
  { to: "/admin/opt", label: "Опт" },
  { to: "/admin/dilery", label: "Дилеры" },
  { to: "/admin/zakazy", label: "Заказы" },
  { to: "/admin/nastrojki", label: "Настройки" },
] as const;

function AdminLayout() {
  const nav = useNavigate();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("claim_first_admin");
      if (error) throw error;
      return data === true;
    },
  });
  async function logout() {
    await supabase.auth.signOut();
    nav({ to: "/auth" });
  }
  if (isLoading) return <div className="container-site py-20 text-muted-foreground">Загрузка…</div>;
  if (!isAdmin)
    return (
      <div className="container-site py-20">
        <h1 className="text-2xl">Нет доступа</h1>
        <p className="mt-2 text-muted-foreground">У этого аккаунта нет прав администратора.</p>
        <Button className="mt-4" variant="outline" onClick={logout}>Выйти</Button>
      </div>
    );
  return (
    <div className="container-site py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Link key={t.to} to={t.to} activeOptions={{ exact: "exact" in t }} className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground" activeProps={{ className: "border-primary text-foreground" }}>{t.label}</Link>
          ))}
        </nav>
        <Button size="sm" variant="ghost" onClick={logout}>Выйти</Button>
      </div>
      <div className="mt-8"><Outlet /></div>
    </div>
  );
}
