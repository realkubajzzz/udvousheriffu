-- SQL kód pre vytvorenie tabuľky recenzií
-- Spustiť v Supabase SQL editore

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT false,
    discord_user_id VARCHAR(255),
    discord_username VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pre rýchlejšie vyhľadávanie
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_date ON reviews(date_created DESC);

-- RLS (Row Level Security) nastavenia
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy pre čítanie (všetci môžu čítať schválené recenzie)
CREATE POLICY "Anyone can read approved reviews" ON reviews
    FOR SELECT USING (is_approved = true);

-- Policy pre neoautentifikovaných užívateľov (verejnosť)
CREATE POLICY "Public can read approved reviews" ON reviews
    FOR SELECT TO anon USING (is_approved = true);

-- Policy pre autentifikovaných užívateľov (všetky recenzie)
CREATE POLICY "Authenticated users can read all reviews" ON reviews
    FOR SELECT TO authenticated USING (true);

-- Policy pre vkladanie (iba autentifikovaní užívatelia)
CREATE POLICY "Authenticated users can insert reviews" ON reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy pre update (iba admin/moderátori)
CREATE POLICY "Admin can update reviews" ON reviews
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy pre delete (iba admin/moderátori)
CREATE POLICY "Admin can delete reviews" ON reviews
    FOR DELETE USING (auth.role() = 'authenticated');

-- Komentáre k tabuľke
COMMENT ON TABLE reviews IS 'Tabuľka pre ukladanie recenzií od zákazníkov';
COMMENT ON COLUMN reviews.customer_name IS 'Meno zákazníka';
COMMENT ON COLUMN reviews.rating IS 'Hodnotenie 1-5 hviezdičiek';
COMMENT ON COLUMN reviews.review_text IS 'Text recenzie';
COMMENT ON COLUMN reviews.is_approved IS 'Či je recenzia schválená na zobrazenie';
COMMENT ON COLUMN reviews.discord_user_id IS 'Discord ID užívateľa (ak z Discordu)';
COMMENT ON COLUMN reviews.discord_username IS 'Discord meno užívateľa';