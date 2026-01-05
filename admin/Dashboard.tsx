import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { postsService } from '../services/api/posts';
import { categoriesService } from '../services/api/categories';
import { adsService } from '../services/api/ads';
import { storiesService } from '../services/api/stories';

const Dashboard: React.FC = () => {
  const { locale } = useLanguage();
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalCategories: 0,
    totalAds: 0,
    activeAds: 0,
    totalStories: 0,
    activeStories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [postsRes, categoriesRes, adsRes, storiesRes] = await Promise.all([
        postsService.getPosts({ limit: 1000 }),
        categoriesService.getCategories(),
        adsService.getAds(),
        storiesService.getStories(false),
      ]);

      const posts = postsRes.data || [];
      const categories = categoriesRes.data || [];
      const ads = adsRes.data || [];
      const stories = storiesRes.data || [];

      setStats({
        totalPosts: posts.length,
        publishedPosts: posts.filter(p => p.status === 'published').length,
        draftPosts: posts.filter(p => p.status === 'draft').length,
        totalCategories: categories.length,
        totalAds: ads.length,
        activeAds: ads.filter(a => a.isActive).length,
        totalStories: stories.length,
        activeStories: stories.filter(s => s.isActive).length,
      });

      // Recent posts (last 5)
      const recent = [...posts]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5);
      setRecentPosts(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'az' ? 'Dashboard' : 'Панель управления'}
        </h1>
        <Link
          to="/admin/posts/new"
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
        >
          {locale === 'az' ? '+ Yeni Məqalə' : '+ Новая статья'}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              {locale === 'az' ? 'Ümumi Məqalələr' : 'Всего статей'}
            </h3>
            <span className="text-2xl">📝</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalPosts}</div>
          <div className="mt-2 text-sm text-gray-600">
            <span className="text-green-600">{stats.publishedPosts}</span> {locale === 'az' ? 'yayımlanmış' : 'опубликовано'} •{' '}
            <span className="text-yellow-600">{stats.draftPosts}</span> {locale === 'az' ? 'qaralama' : 'черновик'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              {locale === 'az' ? 'Kateqoriyalar' : 'Категории'}
            </h3>
            <span className="text-2xl">📁</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalCategories}</div>
          <Link
            to="/admin/categories"
            className="mt-2 text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            {locale === 'az' ? 'İdarə et →' : 'Управлять →'}
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              {locale === 'az' ? 'Reklamlar' : 'Реклама'}
            </h3>
            <span className="text-2xl">📢</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalAds}</div>
          <div className="mt-2 text-sm text-gray-600">
            <span className="text-green-600">{stats.activeAds}</span> {locale === 'az' ? 'aktiv' : 'активных'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              {locale === 'az' ? 'Hekayələr' : 'Истории'}
            </h3>
            <span className="text-2xl">📸</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalStories}</div>
          <div className="mt-2 text-sm text-gray-600">
            <span className="text-green-600">{stats.activeStories}</span> {locale === 'az' ? 'aktiv' : 'активных'}
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {locale === 'az' ? 'Son Məqalələr' : 'Последние статьи'}
          </h2>
          <Link
            to="/admin/posts"
            className="text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            {locale === 'az' ? 'Hamısına bax →' : 'Посмотреть все →'}
          </Link>
        </div>
        {recentPosts.length > 0 ? (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                to={`/admin/posts/edit/${post.id}`}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title[locale]}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      📝
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {post.title[locale] || post.title.az || post.title.ru}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.status === 'published'
                        ? (locale === 'az' ? 'Yayımlanmış' : 'Опубликовано')
                        : (locale === 'az' ? 'Qaralama' : 'Черновик')}
                    </span>
                    <span>
                      {new Date(post.createdAt || Date.now()).toLocaleDateString(
                        locale === 'az' ? 'az-AZ' : 'ru-RU'
                      )}
                    </span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {locale === 'az' ? 'Hələ məqalə yoxdur' : 'Статей пока нет'}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/posts/new"
          className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border-2 border-pink-200 hover:border-pink-300 transition-all"
        >
          <div className="text-3xl mb-3">📝</div>
          <h3 className="font-bold text-gray-900 mb-2">
            {locale === 'az' ? 'Yeni Məqalə' : 'Новая статья'}
          </h3>
          <p className="text-sm text-gray-600">
            {locale === 'az' ? 'Yeni məqalə yaz və yayımla' : 'Напишите и опубликуйте новую статью'}
          </p>
        </Link>

        <Link
          to="/admin/categories"
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-300 transition-all"
        >
          <div className="text-3xl mb-3">📁</div>
          <h3 className="font-bold text-gray-900 mb-2">
            {locale === 'az' ? 'Kateqoriyalar' : 'Категории'}
          </h3>
          <p className="text-sm text-gray-600">
            {locale === 'az' ? 'Kateqoriyaları idarə et' : 'Управляйте категориями'}
          </p>
        </Link>

        <Link
          to="/admin/ads"
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 hover:border-green-300 transition-all"
        >
          <div className="text-3xl mb-3">📢</div>
          <h3 className="font-bold text-gray-900 mb-2">
            {locale === 'az' ? 'Reklamlar' : 'Реклама'}
          </h3>
          <p className="text-sm text-gray-600">
            {locale === 'az' ? 'Reklamları idarə et' : 'Управляйте рекламой'}
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

