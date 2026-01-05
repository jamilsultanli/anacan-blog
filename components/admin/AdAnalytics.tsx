import React, { useMemo } from 'react';
import { Ad } from '../../types';

interface AdAnalyticsProps {
  ads: Ad[];
  locale: 'az' | 'ru';
}

const AdAnalytics: React.FC<AdAnalyticsProps> = ({ ads, locale }) => {
  const stats = useMemo(() => {
    const totalClicks = ads.reduce((sum, ad) => sum + ad.clickCount, 0);
    const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressionCount, 0);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const activeAds = ads.filter((ad) => ad.isActive).length;

    return {
      totalClicks,
      totalImpressions,
      ctr: ctr.toFixed(2),
      activeAds,
      totalAds: ads.length,
    };
  }, [ads]);

  const topAds = useMemo(() => {
    return [...ads]
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 10);
  }, [ads]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-2">
            {locale === 'az' ? 'Ümumi Kliklər' : 'Всего кликов'}
          </div>
          <div className="text-3xl font-bold text-pink-600">{stats.totalClicks}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-2">
            {locale === 'az' ? 'Ümumi Görüntülənmə' : 'Всего показов'}
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalImpressions}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-2">
            {locale === 'az' ? 'CTR' : 'CTR'}
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.ctr}%</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-2">
            {locale === 'az' ? 'Aktiv Reklamlar' : 'Активные рекламы'}
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {stats.activeAds} / {stats.totalAds}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {locale === 'az' ? 'Ən Yaxşı Performans Göstərən Reklamlar' : 'Лучшие рекламы по производительности'}
        </h3>
        <div className="space-y-3">
          {topAds.length > 0 ? (
            topAds.map((ad, idx) => {
              const ctr = ad.impressionCount > 0
                ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2)
                : '0.00';
              return (
                <div
                  key={ad.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ad.title}</p>
                      <p className="text-sm text-gray-500">
                        {ad.clickCount} klik • {ad.impressionCount} görüntülənmə • {ctr}% CTR
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-8">
              {locale === 'az' ? 'Hələ reklam yoxdur' : 'Рекламы пока нет'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdAnalytics;

