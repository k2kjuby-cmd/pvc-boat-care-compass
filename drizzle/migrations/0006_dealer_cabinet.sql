ALTER TABLE public.wholesale_leads ADD COLUMN email text CHECK (email IS NULL OR length(email)<=254);
ALTER TABLE public.dealer_accounts
 ADD COLUMN individual_discount_percent numeric CHECK (individual_discount_percent IS NULL OR individual_discount_percent BETWEEN 0 AND 50),
 ADD COLUMN admin_notes text,
 ADD COLUMN map_consent boolean NOT NULL DEFAULT false,
 ADD COLUMN map_enabled boolean NOT NULL DEFAULT false,
 ADD COLUMN contact_name text, ADD COLUMN phone text, ADD COLUMN email text, ADD COLUMN company text,
 ADD COLUMN inn text, ADD COLUMN kpp text, ADD COLUMN ogrn text, ADD COLUMN legal_address text, ADD COLUMN bank_details text,
 ADD COLUMN city text, ADD COLUMN public_address text, ADD COLUMN map_lat numeric, ADD COLUMN map_lng numeric;

CREATE OR REPLACE FUNCTION public.dealer_update_profile(_p jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Требуется вход'; END IF;
 IF coalesce(length(_p->>'contact_name'),0)>200 OR coalesce(length(_p->>'phone'),0)>40 OR coalesce(length(_p->>'email'),0)>254 OR coalesce(length(_p->>'company'),0)>200
  OR (coalesce(_p->>'inn','')<>'' AND _p->>'inn' !~ '^([0-9]{10}|[0-9]{12})$') OR (coalesce(_p->>'kpp','')<>'' AND _p->>'kpp' !~ '^[0-9]{9}$')
  OR (coalesce(_p->>'ogrn','')<>'' AND _p->>'ogrn' !~ '^([0-9]{13}|[0-9]{15})$') OR coalesce(length(_p->>'legal_address'),0)>500 OR coalesce(length(_p->>'bank_details'),0)>2000
  OR coalesce(length(_p->>'city'),0)>120 OR coalesce(length(_p->>'public_address'),0)>300 THEN RAISE EXCEPTION 'Проверьте данные профиля'; END IF;
 UPDATE public.dealer_accounts SET contact_name=nullif(_p->>'contact_name',''),phone=nullif(_p->>'phone',''),email=nullif(_p->>'email',''),company=nullif(_p->>'company',''),inn=nullif(_p->>'inn',''),kpp=nullif(_p->>'kpp',''),ogrn=nullif(_p->>'ogrn',''),legal_address=nullif(_p->>'legal_address',''),bank_details=nullif(_p->>'bank_details',''),city=nullif(_p->>'city',''),public_address=nullif(_p->>'public_address',''),map_consent=coalesce((_p->>'map_consent')::boolean,false)
 WHERE user_id=auth.uid() AND approved;
 IF NOT FOUND THEN RAISE EXCEPTION 'Кабинет доступен одобренным дилерам'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.dealer_update_profile(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dealer_update_profile(jsonb) TO authenticated;

CREATE TABLE public.dealer_materials(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(), kind text NOT NULL DEFAULT 'text' CHECK (kind IN ('instruction','photo','text')), title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200), body text, url text, sort integer NOT NULL DEFAULT 0);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.dealer_materials TO authenticated;
GRANT ALL ON public.dealer_materials TO service_role;
ALTER TABLE public.dealer_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY dealer_materials_admin ON public.dealer_materials FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY dealer_materials_dealer ON public.dealer_materials FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.dealer_accounts d WHERE d.user_id=auth.uid() AND d.approved));

CREATE OR REPLACE FUNCTION public.dealer_quote(_variant_id uuid,_quantity integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE account public.dealer_accounts; w public.variant_wholesale; retail numeric; tax numeric; lvl public.wholesale_levels; chosen_name text; discount numeric:=0; capped numeric; result_price numeric; floor_price numeric; next_qty integer; next_disc numeric; need integer; BEGIN IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Требуется вход'; END IF; SELECT * INTO account FROM public.dealer_accounts WHERE user_id=auth.uid() AND approved AND EXISTS(SELECT 1 FROM public.wholesale_leads WHERE id=lead_id AND status='approved'); IF NOT FOUND THEN RAISE EXCEPTION 'Оптовые цены доступны одобренным дилерам'; END IF; IF _quantity < 1 OR _quantity > 1000000 THEN RAISE EXCEPTION 'Некорректное количество'; END IF; SELECT v.price INTO retail FROM public.product_variants v JOIN public.products p ON p.id=v.product_id WHERE v.id=_variant_id AND p.status='published'; IF retail IS NULL THEN RETURN NULL; END IF; SELECT * INTO w FROM public.variant_wholesale WHERE variant_id=_variant_id; IF NOT FOUND THEN RETURN NULL; END IF; SELECT payment_tax_percent INTO tax FROM public.site_settings WHERE id=1;
 FOR lvl IN SELECT * FROM public.wholesale_levels ORDER BY sort LOOP
  IF ((NOT lvl.manual_only AND (lvl.quantity_multiplier IS NULL OR _quantity >= w.minimum_quantity*lvl.quantity_multiplier)) OR lvl.id=account.manual_level_id) AND lvl.discount_percent >= discount THEN discount:=lvl.discount_percent; chosen_name:=lvl.name; END IF;
 END LOOP;
 IF account.individual_discount_percent IS NOT NULL AND account.individual_discount_percent > discount THEN discount:=account.individual_discount_percent; chosen_name:='Индивидуальная скидка'; END IF;
 capped:=least(discount,coalesce(w.max_discount_percent,100));
 FOR lvl IN SELECT * FROM public.wholesale_levels WHERE NOT manual_only AND quantity_multiplier IS NOT NULL AND discount_percent > capped AND least(discount_percent,coalesce(w.max_discount_percent,100)) > capped ORDER BY discount_percent LOOP
  need:=ceil(w.minimum_quantity*lvl.quantity_multiplier)::integer;
  IF need > _quantity THEN next_qty:=need; next_disc:=least(lvl.discount_percent,coalesce(w.max_discount_percent,100)); EXIT; END IF;
 END LOOP;
 result_price:=round(retail*(1-capped/100)); IF w.cost_price IS NOT NULL THEN IF 1-w.minimum_margin_percent/100-coalesce(tax,6)/100 <= 0 THEN RAISE EXCEPTION 'Некорректные настройки маржи'; END IF; floor_price:=ceil(w.cost_price/(1-w.minimum_margin_percent/100-coalesce(tax,6)/100)); result_price:=greatest(result_price,floor_price); END IF;
 RETURN jsonb_build_object('variant_id',_variant_id,'retail_price',retail,'price',result_price,'quantity',_quantity,'minimum_quantity',w.minimum_quantity,'level',chosen_name,'next_quantity',next_qty,'next_discount',next_disc); END $$;
REVOKE ALL ON FUNCTION public.dealer_quote(uuid,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dealer_quote(uuid,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.public_dealers() RETURNS TABLE(company text, city text, public_address text, map_lat numeric, map_lng numeric) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT coalesce(d.company,l.company), coalesce(d.city,l.city), d.public_address, d.map_lat, d.map_lng FROM public.dealer_accounts d JOIN public.wholesale_leads l ON l.id=d.lead_id
 WHERE d.approved AND d.map_consent AND d.map_enabled AND (SELECT dealers_page_enabled FROM public.site_settings WHERE id=1) ORDER BY 2,1 $$;
REVOKE ALL ON FUNCTION public.public_dealers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_dealers() TO anon, authenticated;