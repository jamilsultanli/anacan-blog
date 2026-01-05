-- Translations Management System
-- This allows admin to manage all UI strings dynamically

CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  namespace VARCHAR(100) DEFAULT 'common', -- common, admin, errors, etc.
  value_az TEXT NOT NULL,
  value_ru TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value_az TEXT,
  value_ru TEXT,
  value_json JSONB, -- For complex settings
  setting_type VARCHAR(50) DEFAULT 'text', -- text, number, boolean, json
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);
CREATE INDEX IF NOT EXISTS idx_translations_namespace ON translations(namespace);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- RLS Policies
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Translations: Public read, Admin write
CREATE POLICY "Translations are viewable by everyone" ON translations FOR SELECT USING (true);
CREATE POLICY "Translations are editable by admins" ON translations FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Site settings: Public read, Admin write
CREATE POLICY "Site settings are viewable by everyone" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Site settings are editable by admins" ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Trigger for updated_at
CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default translations
INSERT INTO translations (key, namespace, value_az, value_ru, description) VALUES
('heroTitle', 'common', 'Anacan.az — Səninlə bu yolda birgəyik', 'Anacan.az — Мы вместе на этом пути', 'Hero section title'),
('heroSubtitle', 'common', 'Azərbaycanın ən müasir ana platforması.', 'Самая современная платформа для мам в Азербайджане.', 'Hero section subtitle'),
('readMore', 'common', 'Oxumağa davam et', 'Читать далее', 'Read more button'),
('categories', 'common', 'Kateqoriyalar', 'Категории', 'Categories section title'),
('latestPosts', 'common', 'Son Yazılar', 'Последние статьи', 'Latest posts section title'),
('featuredPost', 'common', 'Günün Seçimi', 'Выбор дня', 'Featured post label'),
('searchPlaceholder', 'common', 'Mövzu və ya açar söz axtarın...', 'Поиск по теме или ключевому слову...', 'Search input placeholder'),
('allCategories', 'common', 'Hamısı', 'Все', 'All categories option'),
('save', 'common', 'Yadda saxla', 'Сохранить', 'Save button'),
('cancel', 'common', 'Ləğv et', 'Отмена', 'Cancel button'),
('delete', 'common', 'Sil', 'Удалить', 'Delete button'),
('edit', 'common', 'Düzəliş et', 'Редактировать', 'Edit button'),
('loading', 'common', 'Yüklənir...', 'Загрузка...', 'Loading text'),
('error', 'common', 'Xəta baş verdi', 'Произошла ошибка', 'Error message'),
('success', 'common', 'Uğurla tamamlandı', 'Успешно завершено', 'Success message')
ON CONFLICT (key) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value_az, value_ru, setting_type) VALUES
('siteName', 'Anacan.az', 'Anacan.az', 'text'),
('siteDescription', 'Azərbaycanın ən müasir ana platforması', 'Самая современная платформа для мам в Азербайджане', 'text'),
('defaultLanguage', 'az', 'az', 'text'),
('timezone', 'Asia/Baku', 'Asia/Baku', 'text'),
('maintenanceMode', 'false', 'false', 'boolean')
ON CONFLICT (key) DO NOTHING;

