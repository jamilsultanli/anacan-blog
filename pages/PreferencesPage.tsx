import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { categoriesService } from '../services/api/categories';
import { Category } from '../types';
import SEO from '../components/SEO';

const PreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [pregnancyStage, setPregnancyStage] = useState<string>('');
  const [babyAge, setBabyAge] = useState<string>('');
  const [emailDigest, setEmailDigest] = useState<'daily' | 'weekly' | 'monthly' | 'never'>('weekly');
  const [notifications, setNotifications] = useState({
    newPosts: true,
    comments: true,
    followers: true,
    forumReplies: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await categoriesService.getCategories();
      setCategories(data || []);
    };

    loadCategories();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // TODO: Save preferences to database
      // For now, save to localStorage
      const preferences = {
        selectedCategories,
        pregnancyStage,
        babyAge,
        emailDigest,
        notifications,
      };
      localStorage.setItem(`preferences_${user.id}`, JSON.stringify(preferences));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {locale === 'az' ? 'Giriş edin' : 'Войдите'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={locale === 'az' ? 'Parametrlər - Anacan.az' : 'Настройки - Anacan.az'}
        description={locale === 'az' 
          ? 'Məzmun və bildiriş parametrlərinizi tənzimləyin'
          : 'Настройте параметры контента и уведомлений'}
        locale={locale}
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {locale === 'az' ? 'Parametrlər' : 'Настройки'}
          </h1>

          <div className="space-y-8">
            {/* Content Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'az' ? 'Məzmun Parametrləri' : 'Настройки контента'}
              </h2>

              {/* Favorite Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {locale === 'az' ? 'Sevimli Kateqoriyalar' : 'Любимые категории'}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedCategories.includes(category.id)
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{category.icon}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {category.name[locale]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregnancy Stage */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'Hamiləlik Mərhələsi' : 'Этап беременности'}
                </label>
                <select
                  value={pregnancyStage}
                  onChange={(e) => setPregnancyStage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">{locale === 'az' ? 'Seçin' : 'Выберите'}</option>
                  <option value="planning">{locale === 'az' ? 'Planlaşdırma' : 'Планирование'}</option>
                  <option value="first-trimester">{locale === 'az' ? '1-ci Trimester' : '1-й триместр'}</option>
                  <option value="second-trimester">{locale === 'az' ? '2-ci Trimester' : '2-й триместр'}</option>
                  <option value="third-trimester">{locale === 'az' ? '3-cü Trimester' : '3-й триместр'}</option>
                  <option value="postpartum">{locale === 'az' ? 'Doğumdan sonra' : 'После родов'}</option>
                </select>
              </div>

              {/* Baby Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'Körpənin Yaşı' : 'Возраст малыша'}
                </label>
                <select
                  value={babyAge}
                  onChange={(e) => setBabyAge(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">{locale === 'az' ? 'Seçin' : 'Выберите'}</option>
                  <option value="0-3">{locale === 'az' ? '0-3 ay' : '0-3 месяца'}</option>
                  <option value="3-6">{locale === 'az' ? '3-6 ay' : '3-6 месяцев'}</option>
                  <option value="6-12">{locale === 'az' ? '6-12 ay' : '6-12 месяцев'}</option>
                  <option value="1-2">{locale === 'az' ? '1-2 yaş' : '1-2 года'}</option>
                  <option value="2+">{locale === 'az' ? '2+ yaş' : '2+ года'}</option>
                </select>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'az' ? 'Bildiriş Parametrləri' : 'Настройки уведомлений'}
              </h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">
                    {locale === 'az' ? 'Yeni məqalələr' : 'Новые статьи'}
                  </span>
                  <input
                    type="checkbox"
                    checked={notifications.newPosts}
                    onChange={(e) => setNotifications(prev => ({ ...prev, newPosts: e.target.checked }))}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">
                    {locale === 'az' ? 'Şərh cavabları' : 'Ответы на комментарии'}
                  </span>
                  <input
                    type="checkbox"
                    checked={notifications.comments}
                    onChange={(e) => setNotifications(prev => ({ ...prev, comments: e.target.checked }))}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">
                    {locale === 'az' ? 'Yeni izləyicilər' : 'Новые подписчики'}
                  </span>
                  <input
                    type="checkbox"
                    checked={notifications.followers}
                    onChange={(e) => setNotifications(prev => ({ ...prev, followers: e.target.checked }))}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">
                    {locale === 'az' ? 'Forum cavabları' : 'Ответы на форуме'}
                  </span>
                  <input
                    type="checkbox"
                    checked={notifications.forumReplies}
                    onChange={(e) => setNotifications(prev => ({ ...prev, forumReplies: e.target.checked }))}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                </label>
              </div>
            </div>

            {/* Email Digest */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'az' ? 'Email Xülasəsi' : 'Email дайджест'}
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'Tezlik' : 'Частота'}
                </label>
                <select
                  value={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="daily">{locale === 'az' ? 'Günlük' : 'Ежедневно'}</option>
                  <option value="weekly">{locale === 'az' ? 'Həftəlik' : 'Еженедельно'}</option>
                  <option value="monthly">{locale === 'az' ? 'Aylıq' : 'Ежемесячно'}</option>
                  <option value="never">{locale === 'az' ? 'Heç vaxt' : 'Никогда'}</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  saved
                    ? 'bg-green-600 text-white'
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                } disabled:opacity-50`}
              >
                {saving
                  ? (locale === 'az' ? 'Saxlanılır...' : 'Сохранение...')
                  : saved
                  ? (locale === 'az' ? '✓ Saxlandı' : '✓ Сохранено')
                  : (locale === 'az' ? 'Saxla' : 'Сохранить')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreferencesPage;

