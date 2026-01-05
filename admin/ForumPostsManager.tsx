import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { forumsService } from '../services/api/forums';
import { Forum, ForumPost } from '../types';
import { formatDate } from '../utils/dateFormatter';
import { Link } from 'react-router-dom';

const ForumPostsManager: React.FC = () => {
  const { locale } = useLanguage();
  const [forums, setForums] = useState<Forum[]>([]);
  const [selectedForumId, setSelectedForumId] = useState<string>('');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    loadForums();
  }, []);

  useEffect(() => {
    if (selectedForumId) {
      loadPosts(selectedForumId);
    } else {
      setPosts([]);
    }
  }, [selectedForumId]);

  const loadForums = async () => {
    setLoading(true);
    try {
      const { data, error } = await forumsService.getForums(false); // Get all forums, not just active
      if (error) throw error;
      setForums(data || []);
      if (data && data.length > 0 && !selectedForumId) {
        setSelectedForumId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (forumId: string) => {
    setPostsLoading(true);
    try {
      const { data, error } = await forumsService.getForumPosts(forumId, 100);
      if (error) throw error;
      
      // Load user profiles for posts
      const { usersService } = await import('../services/api/users');
      const postsWithUsers = await Promise.all(
        (data || []).map(async (post: ForumPost) => {
          if (post.userId) {
            try {
              const userRes = await usersService.getUserProfile(post.userId);
              return { ...post, user: userRes.data || null };
            } catch (e) {
              return post;
            }
          }
          return post;
        })
      );
      
      setPosts(postsWithUsers);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm(locale === 'az' ? 'Müzakirəni silmək istəyirsiniz?' : 'Удалить обсуждение?')) {
      return;
    }

    try {
      // Delete post using Appwrite directly
      const { databases, DATABASE_ID, COLLECTIONS } = await import('../services/appwrite');
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.FORUM_POSTS, postId);
      await loadPosts(selectedForumId);
      alert(locale === 'az' ? 'Müzakirə silindi' : 'Обсуждение удалено');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  const handlePinPost = async (postId: string, isPinned: boolean) => {
    try {
      const { databases, DATABASE_ID, COLLECTIONS } = await import('../services/appwrite');
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        postId,
        { is_pinned: !isPinned }
      );
      await loadPosts(selectedForumId);
    } catch (error: any) {
      console.error('Error pinning post:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  const handleMarkSolved = async (postId: string, isSolved: boolean) => {
    try {
      const { databases, DATABASE_ID, COLLECTIONS } = await import('../services/appwrite');
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        postId,
        { is_solved: !isSolved }
      );
      await loadPosts(selectedForumId);
    } catch (error: any) {
      console.error('Error marking solved:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'az' ? 'Forum Müzakirələri' : 'Обсуждения форумов'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Forums List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {locale === 'az' ? 'Forum Kateqoriyaları' : 'Категории форумов'}
            </h2>
            {loading ? (
              <div className="animate-pulse space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : forums.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {locale === 'az' ? 'Forum yoxdur' : 'Форумы отсутствуют'}
              </p>
            ) : (
              <div className="space-y-2">
                {forums.map((forum) => (
                  <button
                    key={forum.id}
                    onClick={() => setSelectedForumId(forum.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedForumId === forum.id
                        ? 'bg-pink-100 text-pink-700 font-semibold'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{forum.icon || '💬'}</span>
                      <span className="text-sm">{forum.name[locale]}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Posts List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {!selectedForumId ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">
                  {locale === 'az' ? 'Forum seçin' : 'Выберите форум'}
                </p>
              </div>
            ) : postsLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600 mx-auto"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">
                  {locale === 'az' ? 'Bu forumda müzakirə yoxdur' : 'В этом форуме нет обсуждений'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'az' ? 'Başlıq' : 'Заголовок'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'az' ? 'Müəllif' : 'Автор'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'az' ? 'Cavablar' : 'Ответы'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'az' ? 'Baxışlar' : 'Просмотры'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'az' ? 'Tarix' : 'Дата'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'az' ? 'Status' : 'Статус'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'az' ? 'Əməliyyatlar' : 'Действия'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {post.isPinned && (
                              <span className="text-yellow-500">📌</span>
                            )}
                            {post.isSolved && (
                              <span className="text-green-500">✓</span>
                            )}
                            <Link
                              to={`/forums/${forums.find(f => f.id === selectedForumId)?.slug}/${post.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-pink-600 line-clamp-1 max-w-xs"
                              target="_blank"
                            >
                              {post.title}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.user?.name || 'Anonim'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.replyCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.viewCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.createdAt ? formatDate(new Date(post.createdAt), locale) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            {post.isPinned && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                📌 {locale === 'az' ? 'Sabitlənib' : 'Закреплено'}
                              </span>
                            )}
                            {post.isSolved && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                ✓ {locale === 'az' ? 'Həll olunub' : 'Решено'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handlePinPost(post.id, post.isPinned)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title={post.isPinned ? (locale === 'az' ? 'Sabitləməni ləğv et' : 'Открепить') : (locale === 'az' ? 'Sabitlə' : 'Закрепить')}
                          >
                            📌
                          </button>
                          <button
                            onClick={() => handleMarkSolved(post.id, post.isSolved)}
                            className="text-green-600 hover:text-green-900"
                            title={post.isSolved ? (locale === 'az' ? 'Həll olunmuş işarəsini ləğv et' : 'Снять отметку решено') : (locale === 'az' ? 'Həll olunub işarələ' : 'Отметить решено')}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-900"
                            title={locale === 'az' ? 'Sil' : 'Удалить'}
                          >
                            🗑️
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
    </div>
  );
};

export default ForumPostsManager;

