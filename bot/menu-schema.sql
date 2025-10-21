-- Create menu table for menu page images
CREATE TABLE IF NOT EXISTS public.menu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to menu" ON public.menu
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated insert to menu" ON public.menu
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated update to menu" ON public.menu
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated delete from menu" ON public.menu
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create index on created_at for performance
CREATE INDEX IF NOT EXISTS menu_created_at_idx ON public.menu (created_at DESC);

-- Grant permissions
GRANT SELECT ON public.menu TO anon;
GRANT ALL ON public.menu TO authenticated;
GRANT ALL ON public.menu TO service_role;

-- Insert some example menu items (optional)
INSERT INTO public.menu (name, url, caption) VALUES
  ('Hlavní chod', 'https://example.com/menu1.jpg', 'Hlavní chod — U Dvou Sheriffů'),
  ('Delikatesa šéfkuchaře', 'https://example.com/menu2.jpg', 'Delikatesa šéfkuchaře'),
  ('Grilované speciality', 'https://example.com/menu3.jpg', 'Grilované speciality'),
  ('Dezerty a dobroty', 'https://example.com/menu4.jpg', 'Dezerty a dobroty')
ON CONFLICT DO NOTHING;