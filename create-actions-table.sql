-- Vytvorenie tabuľky cms_actions pre správu akcií
-- Spustite v Supabase SQL Editor

-- 1. Vytvorenie hlavnej tabuľky pre akcie
CREATE TABLE IF NOT EXISTS public.cms_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT cms_actions_title_check CHECK (length(title) > 0),
  CONSTRAINT cms_actions_sort_order_check CHECK (sort_order >= 0)
);

-- 2. Indexy pre rýchle vyhľadávanie
CREATE INDEX IF NOT EXISTS cms_actions_active_idx ON public.cms_actions (is_active);
CREATE INDEX IF NOT EXISTS cms_actions_dates_idx ON public.cms_actions (start_date, end_date);
CREATE INDEX IF NOT EXISTS cms_actions_sort_idx ON public.cms_actions (sort_order, created_at);

-- 3. Row Level Security (RLS) nastavenia
ALTER TABLE public.cms_actions ENABLE ROW LEVEL SECURITY;

-- Politiky pre prístup
-- Anonymní užívatelia môžu čítať len aktívne akcie (pre webstránky)
CREATE POLICY "cms_actions_public_read" ON public.cms_actions
  FOR SELECT TO anon
  USING (is_active = true);

-- Authentifikovaní užívatelia môžu čítať všetky akcie (pre CMS)
CREATE POLICY "cms_actions_authenticated_read" ON public.cms_actions
  FOR SELECT TO authenticated
  USING (true);

-- Authentifikovaní užívatelia môžu upravovať všetky akcie (pre CMS)
CREATE POLICY "cms_actions_write" ON public.cms_actions
  FOR ALL TO authenticated
  USING (true);

-- 4. Oprávnenia pre rôzne roly
GRANT SELECT ON public.cms_actions TO anon;
GRANT SELECT ON public.cms_actions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cms_actions TO authenticated;
GRANT ALL ON public.cms_actions TO service_role;

-- 5. Automatické aktualizovanie updated_at stĺpca
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pre automatické nastavenie updated_at
DROP TRIGGER IF EXISTS update_cms_actions_updated_at ON public.cms_actions;
CREATE TRIGGER update_cms_actions_updated_at
    BEFORE UPDATE ON public.cms_actions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Pridanie testových dát (voliteľné - môžete odstrániť ak nechcete)
INSERT INTO public.cms_actions (
    title,
    description,
    image_url,
    is_active,
    start_date,
    end_date,
    sort_order
) VALUES 
(
    'Večer so šerifom',
    'Špecialny tematický večer s country hudbou a western menu. Príďte v western oblečení a užite si autentickú atmosféru Divokého západu!',
    'https://images.unsplash.com/photo-1544191696-15693072e1a2?w=400&h=300&fit=crop&crop=center',
    true,
    '2024-11-15',
    '2024-11-15',
    1
),
(
    'Degustačný večer',
    'Ochutnajte naše najlepšie jedlá v špeciálnom 5-chodovom menu s párovaním vín. Každý chod je starostlivo pripravený s prémiovými surovinami.',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&crop=center',
    true,
    '2024-12-01',
    '2024-12-01',
    2
),
(
    'Študentská zľava',
    'Každý študent so študentským preukazom má 20% zľavu na celé menu! Zľava platí na všetky jedlá a nápoje (okrem alkoholických nápojov).',
    null,
    true,
    '2024-10-01',
    '2024-12-31',
    3
)
ON CONFLICT DO NOTHING;

-- 7. Kontrola či sa tabuľka vytvorila správne
SELECT 
    'Tabuľka cms_actions bola úspešne vytvorená!' as message,
    count(*) as pocet_zaznamov
FROM public.cms_actions;