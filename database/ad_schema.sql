-- Ad Spaces Table
CREATE TABLE IF NOT EXISTS ad_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  position TEXT NOT NULL, -- header, sidebar, footer, in-content
  width INTEGER,
  height INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads Table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_space_id UUID REFERENCES ad_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- banner, text, native, video, sponsored
  content TEXT, -- HTML content or text
  image_url TEXT,
  video_url TEXT,
  link_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Clicks Table
CREATE TABLE IF NOT EXISTS ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Impressions Table
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for ad_spaces
ALTER TABLE ad_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ad spaces are viewable by everyone"
  ON ad_spaces FOR SELECT
  USING (true);

CREATE POLICY "Ad spaces are editable by admins"
  ON ad_spaces FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- RLS Policies for ads
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active ads are viewable by everyone"
  ON ads FOR SELECT
  USING (is_active = true);

CREATE POLICY "Ads are editable by admins"
  ON ads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- RLS Policies for ad_clicks
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ad clicks are insertable by everyone"
  ON ad_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Ad clicks are viewable by admins"
  ON ad_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- RLS Policies for ad_impressions
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ad impressions are insertable by everyone"
  ON ad_impressions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Ad impressions are viewable by admins"
  ON ad_impressions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ads_ad_space_id ON ads(ad_space_id);
CREATE INDEX IF NOT EXISTS idx_ads_is_active ON ads(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_id ON ad_impressions(ad_id);

