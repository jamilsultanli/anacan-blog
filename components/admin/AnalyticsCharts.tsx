import React, { useMemo } from 'react';
import { BlogPost } from '../../types';

interface AnalyticsChartsProps {
  posts: BlogPost[];
  dateRange: '7d' | '30d' | '90d' | 'all';
  locale: 'az' | 'ru';
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ posts, dateRange, locale }) => {
  const stats = useMemo(() => {
    const totalViews = posts.reduce((sum, post) => sum + (post.viewCount || 0), 0);
    const totalPosts = posts.length;
    const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;
    const topPost = posts.reduce((top, post) => 
      (post.viewCount || 0) > (top.viewCount || 0) ? post : top,
      posts[0] || null
    );

    return {
      totalViews,
      totalPosts,
      avgViews,
      topPostViews: topPost ? (topPost.viewCount || 0) : 0,
    };
  }, [posts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-2">
          {locale === 'az' ? 'Ümumi Baxış' : 'Всего просмотров'}
        </div>
        <div className="text-3xl font-bold text-pink-600">{stats.totalViews.toLocaleString()}</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-2">
          {locale === 'az' ? 'Ümumi Məqalə' : 'Всего статей'}
        </div>
        <div className="text-3xl font-bold text-blue-600">{stats.totalPosts}</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-2">
          {locale === 'az' ? 'Orta Baxış' : 'Среднее просмотров'}
        </div>
        <div className="text-3xl font-bold text-green-600">{stats.avgViews.toLocaleString()}</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-2">
          {locale === 'az' ? 'Ən Populyar' : 'Самый популярный'}
        </div>
        <div className="text-3xl font-bold text-purple-600">{stats.topPostViews.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;

