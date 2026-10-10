ALTER TABLE public.site_settings ADD COLUMN seller_name text, ADD COLUMN seller_status text, ADD COLUMN seller_inn text, ADD COLUMN contact_max text, ADD COLUMN contact_whatsapp text, ADD COLUMN shipping_city text, ADD COLUMN postal_address text;
ALTER TABLE public.wholesale_leads ADD COLUMN newsletter_consent boolean NOT NULL DEFAULT false;
ALTER TABLE public.subscribers ADD COLUMN newsletter_consent boolean NOT NULL DEFAULT false;
ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_news_consent CHECK (topic <> 'news' OR newsletter_consent = true) NOT VALID;
CREATE TABLE public.contact_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(),
 name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
 phone text NOT NULL CHECK (phone ~ '^[+0-9][0-9 ()-]{4,39}$'),
 email text CHECK (email IS NULL OR (char_length(email) <= 254 AND email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')),
 city text CHECK (city IS NULL OR char_length(city) <= 120),
 messenger_type text CHECK (messenger_type IN ('max','telegram','whatsapp')),
 messenger_contact text CHECK (messenger_contact IS NULL OR char_length(messenger_contact) <= 120),
 message text NOT NULL CHECK (char_length(message) BETWEEN 2 AND 3000),
 consent boolean NOT NULL CHECK (consent = true), newsletter_consent boolean NOT NULL DEFAULT false,
 source text NOT NULL DEFAULT 'kontakty' CHECK (char_length(source) <= 200)
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY contact_public_insert ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (consent = true);
CREATE POLICY contact_admin_access ON public.contact_messages FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));