import React, { useState } from 'react';

interface SiteSettingsProps {
  locale: 'az' | 'ru';
}

const SiteSettings: React.FC<SiteSettingsProps> = ({ locale }) => {
  const [formData, setFormData] = useState({
    siteName: 'Anacan.az',
    siteDescription: '',
    defaultLanguage: 'az',
    timezone: 'Asia/Baku',
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // This would typically save to database
    setTimeout(() => {
      alert(locale === 'az' ? 'Parametrlər yadda saxlanıldı' : 'Настройки сохранены');
      setLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'az' ? 'Sayt Adı' : 'Название сайта'}
        </label>
        <input
          type="text"
          value={formData.siteName}
          onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'az' ? 'Sayt Təsviri' : 'Описание сайта'}
        </label>
        <textarea
          value={formData.siteDescription}
          onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'Varsayılan Dil' : 'Язык по умолчанию'}
          </label>
          <select
            value={formData.defaultLanguage}
            onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          >
            <option value="az">Azərbaycan</option>
            <option value="ru">Русский</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'Vaxt Zonası' : 'Часовой пояс'}
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          >
            <option value="Asia/Baku">Asia/Baku (GMT+4)</option>
            <option value="Europe/Moscow">Europe/Moscow (GMT+3)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.maintenanceMode}
            onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {locale === 'az' ? 'Baxım Rejimi' : 'Режим обслуживания'}
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors disabled:opacity-50"
      >
        {loading
          ? (locale === 'az' ? 'Yadda saxlanılır...' : 'Сохранение...')
          : (locale === 'az' ? 'Yadda Saxla' : 'Сохранить')}
      </button>
    </form>
  );
};

export default SiteSettings;

