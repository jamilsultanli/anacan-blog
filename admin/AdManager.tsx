import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { adsService } from '../services/api/ads';
import { AdSpace, Ad } from '../types';
import AdSpaceEditor from '../components/admin/AdSpaceEditor';
import AdPlacement from '../components/admin/AdPlacement';
import AdAnalytics from '../components/admin/AdAnalytics';

const AdManager: React.FC = () => {
  const { locale } = useLanguage();
  const [adSpaces, setAdSpaces] = useState<AdSpace[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<AdSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'spaces' | 'ads' | 'analytics'>('spaces');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [spacesResult, adsResult] = await Promise.all([
        adsService.getAdSpaces(),
        adsService.getAds(),
      ]);

      if (spacesResult.error) throw spacesResult.error;
      if (adsResult.error) throw adsResult.error;

      setAdSpaces(spacesResult.data || []);
      setAds(adsResult.data || []);
    } catch (error) {
      console.error('Error loading ads:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {locale === 'az' ? 'Reklam İdarəetməsi' : 'Управление рекламой'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'az' 
                ? 'Reklam yerləri və reklamları idarə edin' 
                : 'Управляйте рекламными местами и рекламой'}
            </p>
          </div>
        </div>

        {/* Modern Card with Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-1">
            <div className="bg-white rounded-t-xl">
              <nav className="flex space-x-2 p-2">
                <button
                  onClick={() => setActiveTab('spaces')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'spaces'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {locale === 'az' ? '📍 Reklam Yerləri' : '📍 Рекламные места'}
                </button>
                <button
                  onClick={() => setActiveTab('ads')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'ads'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {locale === 'az' ? '📢 Reklamlar' : '📢 Реклама'}
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'analytics'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {locale === 'az' ? '📊 Analitika' : '📊 Аналитика'}
                </button>
              </nav>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-pink-600 font-semibold">Loading...</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'spaces' && (
                  <AdSpaceEditor
                    adSpaces={adSpaces}
                    onUpdate={loadData}
                    locale={locale}
                  />
                )}
                {activeTab === 'ads' && (
                  <AdPlacement
                    adSpaces={adSpaces}
                    ads={ads}
                    onUpdate={loadData}
                    locale={locale}
                  />
                )}
                {activeTab === 'analytics' && (
                  <AdAnalytics ads={ads} locale={locale} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdManager;
