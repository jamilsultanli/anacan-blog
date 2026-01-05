import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { BlogPost } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SEOMetrics from '../components/admin/SEOMetrics';
import KeywordRankings from '../components/admin/KeywordRankings';

const SEODashboard: React.FC = () => {
  const { locale } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await db.getPosts({ status: 'published' });
      setPosts(data);
      setLoading(false);
    };
    loadData();
  }, []);

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
          {locale === 'az' ? 'SEO Dashboard' : 'SEO Панель'}
        </h1>
      </div>

      <SEOMetrics posts={posts} />
      <KeywordRankings posts={posts} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {locale === 'az' ? 'Ən Yaxşı Performans Göstərən Məqalələr' : 'Лучшие статьи по производительности'}
        </h2>
        <div className="space-y-3">
          {posts
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
            .slice(0, 10)
            .map((post, idx) => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.title[locale]}</p>
                    <p className="text-sm text-gray-500">
                      {post.viewCount || 0} {locale === 'az' ? 'baxış' : 'просмотров'}
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

export default SEODashboard;

