import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../services/db';
import { BlogPost } from '../types';
import AnalyticsCharts from '../components/admin/AnalyticsCharts';
import TrafficSources from '../components/admin/TrafficSources';
import Reports from '../components/admin/Reports';

const Analytics: React.FC = () => {
  const { locale } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await db.getPosts({ status: 'published' });
      setPosts(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'az' ? 'Analitika' : 'Аналитика'}
        </h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
        >
          <option value="7d">{locale === 'az' ? 'Son 7 gün' : 'Последние 7 дней'}</option>
          <option value="30d">{locale === 'az' ? 'Son 30 gün' : 'Последние 30 дней'}</option>
          <option value="90d">{locale === 'az' ? 'Son 90 gün' : 'Последние 90 дней'}</option>
          <option value="all">{locale === 'az' ? 'Hamısı' : 'Все'}</option>
        </select>
      </div>

      <AnalyticsCharts posts={posts} dateRange={dateRange} locale={locale} />
      <TrafficSources posts={posts} locale={locale} />
      <Reports locale={locale} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {locale === 'az' ? 'Populyar Məzmun' : 'Популярный контент'}
        </h2>
        <div className="space-y-3">
          {posts
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
            .slice(0, 10)
            .map((post, idx) => (
              <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.title[locale]}</p>
                    <p className="text-sm text-gray-500">
                      {post.viewCount || 0} {locale === 'az' ? 'baxış' : 'просмотров'} •{' '}
                      {post.categoryId}
                    </p>
                  </div>
                </div>
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                >
                  {locale === 'az' ? 'Bax' : 'Просмотр'}
                </a>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

