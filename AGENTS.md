<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AGENTS

- Site-wide editable values (logo, marketplace links, contacts, dealers page toggle) live in the single-row `site_settings` table, read via `getSiteSettings` server fn — so admins change them without code.
- Public forms insert directly via RLS-limited anon INSERT (no SELECT) — keeps PII unreadable from the browser.
- Use plain Postgres types/constraints only (no Supabase-specific features in app tables) — keeps DB portable to other hosting.
- Each page uses `seo()` from `src/lib/site.ts` and `PageShell` for H1 + breadcrumbs (with JSON-LD) — consistent SEO.
- sitemap.xml is a server route built from the request origin — no hardcoded domain.
- Catalog data (products, lines, categories, variants, images, recommendations, problems) is read publicly via server fns in `src/lib/catalog.ts`; admin writes go through the browser client under RLS `has_role(admin)` — no service key in app code.
- Admin lives under `/_authenticated/admin`; the first signed-in user claims admin via `claim_first_admin()`, later admins are granted in `user_roles`.
- Product images live in a private bucket and are stored as long-lived signed URLs, because public buckets are blocked in this workspace.
- Product card sections render only when their field has data; empty-field placeholders appear only in admin inputs.
- Contact details and legal operator identity reuse `site_settings`; Organization is generated from those settings in the root head — edits propagate across every page.
- Public contact messages live in `contact_messages` with insert-only public access and admin-only reads; shared consent controls persist data and newsletter permissions separately — inquiries stay private and mailing consent remains optional outside newsletter signup.
- Retail prices are persisted by database triggers from the product reference grid unless a variant is manually overridden; use pricing.ts for matching admin previews and tests.
- Wholesale configuration and costs live in admin-only variant_wholesale, with dealer_accounts linked to approved leads; dealer_quote returns only safe calculated prices after checking the caller, so private costs never enter public or dealer exports.
- Router SSR dehydrates and hydrates its per-request QueryClient so public settings and catalog render consistently on first load.
- Cart stores only variant IDs and quantities locally; database RPCs authoritatively quote and atomically snapshot orders with verified request ownership, while private item margins remain admin-only.
- Checkout provider settings store secret references, never credential values; payments and shipping remain simulated until real adapters are connected.
- Dealer cabinet lives under `/_authenticated/kabinet`; dealers get access only via admin-sent invite links after lead approval, profile edits go through `dealer_update_profile` and the public map reads only consented+enabled dealers via `public_dealers()` — so dealers cannot change their own access or pricing.
