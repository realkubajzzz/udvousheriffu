-- Oprava RLS policies pre cms_actions
-- Spustite v Supabase SQL Editor

-- Zrušíme existujúce policies
DROP POLICY IF EXISTS "cms_actions_read" ON public.cms_actions;
DROP POLICY IF EXISTS "cms_actions_write" ON public.cms_actions;

-- Vytvoríme nové policies
-- Public môže čítať len aktívne akcie (pre webstránky)
CREATE POLICY "cms_actions_public_read" ON public.cms_actions
  FOR SELECT TO anon
  USING (is_active = true);

-- Authenticated užívatelia môžu čítať všetky akcie (pre CMS)
CREATE POLICY "cms_actions_authenticated_read" ON public.cms_actions
  FOR SELECT TO authenticated
  USING (true);

-- Authenticated užívatelia môžu upravovať všetky akcie
CREATE POLICY "cms_actions_write" ON public.cms_actions
  FOR ALL TO authenticated
  USING (true);

-- Uistíme sa, že anon má SELECT prístup
GRANT SELECT ON public.cms_actions TO anon;