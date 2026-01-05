import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsService } from '../services/api/posts';
import { BlogPost } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const PostList: React.FC = () => {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  
  // Check if user can create posts (admin or author only)
  const canCreatePost = user && (user.role === 'admin' || user.role === 'author');

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Get all posts (including drafts)
      const { data, error } = await postsService.getPosts({ 
        status: statusFilter === 'all' ? undefined : statusFilter 
      });
      
      if (error) {
        console.error('Error loading posts:', error);
        return;
      }
      
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'az' ? 'Məqaləni silmək istəyirsiniz?' : 'Удалить статью?')) {
      return;
    }
    
    try {
      const { error } = await postsService.deletePost(id);
      if (error) {
        alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
        return;
      }
      await loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {locale === 'az' ? '📝 Məqalələr' : '📝 Статьи'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'az' 
                ? 'Bütün məqalələri idarə edin' 
                : 'Управляйте всеми статьями'}
            </p>
          </div>
          {canCreatePost ? (
            <Link 
              to="/admin/posts/new" 
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
            >
              + {locale === 'az' ? 'Yeni Məqalə' : 'Новая статья'}
            </Link>
          ) : (
            <div className="px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-bold cursor-not-allowed">
              {locale === 'az' ? 'Yalnız admin/author' : 'Только admin/author'}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-semibold text-gray-700">
              {locale === 'az' ? '📊 Status:' : '📊 Статус:'}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            >
              <option value="all">{locale === 'az' ? 'Hamısı' : 'Все'}</option>
              <option value="draft">{locale === 'az' ? 'Qaralama' : 'Черновик'}</option>
              <option value="published">{locale === 'az' ? 'Yayımlanmış' : 'Опубликовано'}</option>
              <option value="archived">{locale === 'az' ? 'Arxivlənmiş' : 'Архивировано'}</option>
            </select>
            <button
              onClick={loadPosts}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              {locale === 'az' ? '🔄 Yenilə' : '🔄 Обновить'}
            </button>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {locale === 'az' ? 'Hələ məqalə yoxdur' : 'Статей пока нет'}
              </p>
              <Link
                to="/admin/posts/new"
                className="mt-4 inline-block text-pink-600 hover:text-pink-700 font-semibold"
              >
                {locale === 'az' ? '→ Yeni məqalə yarat' : '→ Создать новую статью'}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-gray-700 font-bold">{locale === 'az' ? 'Başlıq' : 'Заголовок'}</th>
                    <th className="px-6 py-4 text-gray-700 font-bold">{locale === 'az' ? 'Status' : 'Статус'}</th>
                    <th className="px-6 py-4 text-gray-700 font-bold">{locale === 'az' ? 'Tarix' : 'Дата'}</th>
                    <th className="px-6 py-4 text-gray-700 font-bold text-right">{locale === 'az' ? 'Əməliyyatlar' : 'Действия'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{post.title[locale] || post.title.az || post.title.ru}</div>
                        <div className="text-sm text-gray-500 mt-1">/{post.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-700' 
                            : post.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {post.status === 'published' 
                            ? (locale === 'az' ? 'Yayımlanmış' : 'Опубликовано')
                            : post.status === 'draft'
                            ? (locale === 'az' ? 'Qaralama' : 'Черновик')
                            : (locale === 'az' ? 'Arxivlənmiş' : 'Архивировано')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {post.published_at 
                          ? new Date(post.published_at).toLocaleDateString(locale === 'az' ? 'az-AZ' : 'ru-RU')
                          : post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString(locale === 'az' ? 'az-AZ' : 'ru-RU')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link 
                          to={`/admin/posts/edit/${post.id}`} 
                          className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-semibold hover:bg-pink-200 transition-all text-sm"
                        >
                          {locale === 'az' ? '✏️ Redaktə' : '✏️ Редактировать'}
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id)} 
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all text-sm"
                        >
                          {locale === 'az' ? '🗑️ Sil' : '🗑️ Удалить'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostList;
