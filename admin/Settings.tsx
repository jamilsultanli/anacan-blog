import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SiteSettings from '../components/admin/SiteSettings';
import EmailSettings from '../components/admin/EmailSettings';

const Settings: React.FC = () => {
  const { locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'site' | 'email' | 'api'>('site');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'az' ? 'Parametrlər' : 'Настройки'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-2">
            <button
              onClick={() => setActiveTab('site')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'site'
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {locale === 'az' ? 'Sayt Parametrləri' : 'Настройки сайта'}
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'email'
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {locale === 'az' ? 'Email Parametrləri' : 'Настройки email'}
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'api'
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {locale === 'az' ? 'API Açarları' : 'API ключи'}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'site' && <SiteSettings locale={locale} />}
          {activeTab === 'email' && <EmailSettings locale={locale} />}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'Gemini API Key' : 'Gemini API ключ'}
                </label>
                <input
                  type="password"
                  value="••••••••••••••••"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {locale === 'az'
                    ? 'API açarı .env.local faylında saxlanılır'
                    : 'API ключ хранится в файле .env.local'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'Appwrite Endpoint' : 'Appwrite Endpoint'}
                </label>
                <input
                  type="text"
                  value="••••••••••••••••"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'Appwrite Project ID' : 'Appwrite Project ID'}
                </label>
                <input
                  type="text"
                  value="••••••••••••••••"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

