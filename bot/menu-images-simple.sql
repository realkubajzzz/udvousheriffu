-- Zjednodušená tabuľka pre menu obrázky (len URL linky)
DROP TABLE IF EXISTS public.menu_images;

CREATE TABLE IF NOT EXISTS public.menu_images (
  id bigserial primary key,
  image_url text not null,            -- priamy URL link na obrázok (napr. https://imgur.com/abc123.jpg)
  caption text,                       -- názov jedla (voliteľné)
  created_at timestamptz default now()
);

-- Zapni RLS + povoľ čítanie pre všetkých (web)
ALTER TABLE public.menu_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "menu_images_read" ON public.menu_images;
CREATE POLICY "menu_images_read"
ON public.menu_images
FOR SELECT
TO public
USING (true);

-- Povoľ authenticated užívateľom pridávanie/upravovanie/mazanie
CREATE POLICY "menu_images_insert" ON public.menu_images
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "menu_images_update" ON public.menu_images
FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "menu_images_delete" ON public.menu_images
FOR DELETE TO authenticated
USING (true);

-- Index pre výkon
CREATE INDEX IF NOT EXISTS menu_images_created_at_idx ON public.menu_images (created_at DESC);

-- Grants
GRANT SELECT ON public.menu_images TO anon;
GRANT ALL ON public.menu_images TO authenticated;
GRANT ALL ON public.menu_images TO service_role;