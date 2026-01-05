import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { forumsService } from '../services/api/forums';
import { Forum, ForumPost } from '../types';
import { usersService } from '../services/api/users';
import { formatDate } from '../utils/dateFormatter';
import SEO from '../components/SEO';
import ForumSidebar from '../components/forum/ForumSidebar';

const ForumTopicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const [forum, setForum] = useState<Forum | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [postLanguage, setPostLanguage] = useState<'az' | 'ru'>(locale);

  useEffect(() => {
    const loadForum = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const forumRes = await forumsService.getForumBySlug(slug);

        if (forumRes.data) {
          setForum(forumRes.data);
          // Load posts for this forum
          const { data: forumPosts } = await forumsService.getForumPosts(forumRes.data.id);
          setPosts(forumPosts || []);
        }
      } catch (error) {
        console.error('Error loading forum:', error);
      } finally {
        setLoading(false);
      }
    };

    loadForum();
  }, [slug]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !forum) {
      navigate('/login');
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert(locale === 'az' ? 'Başlıq və məzmun doldurulmalıdır' : 'Заголовок и содержание обязательны');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await forumsService.createForumPost(forum.id, {
        title: newPostTitle,
        content: newPostContent,
        isPinned: false,
        isSolved: false,
        viewCount: 0,
        upvoteCount: 0,
        downvoteCount: 0,
        replyCount: 0,
      });

      if (!error && data) {
        setPosts(prev => [data, ...prev]);
        setNewPostTitle('');
        setNewPostContent('');
        setPostLanguage(locale);
        setShowCreateForm(false);
        alert(locale === 'az' ? 'Müzakirə uğurla yaradıldı!' : 'Обсуждение успешно создано!');
      } else {
        alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(locale === 'az' 
        ? `Xəta baş verdi: ${error.message || 'Naməlum xəta'}` 
        : `Ошибка: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {locale === 'az' ? 'Forum tapılmadı' : 'Форум не найден'}
          </h2>
          <Link to="/forums" className="text-pink-600 hover:text-pink-700">
            {locale === 'az' ? 'Forumlara qayıt' : 'Вернуться к форумам'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${forum.name?.[locale] || forum.name?.az || 'Forum'} - ${locale === 'az' ? 'Forumlar' : 'Форумы'} - Anacan.az`}
        description={forum.description?.[locale] || forum.description?.az || ''}
        locale={locale}
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/forums"
              className="inline-flex items-center text-gray-600 hover:text-pink-600 font-medium mb-4 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {locale === 'az' ? 'Forumlara qayıt' : 'Вернуться к форумам'}
            </Link>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-4 mb-4">
                {forum.icon && (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${forum.color || 'bg-pink-100'}`}>
                    {forum.icon}
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{forum.name?.[locale] || forum.name?.az || 'Forum'}</h1>
                  {forum.description && (
                    <p className="text-gray-600 mt-2">{forum.description[locale] || forum.description.az || ''}</p>
                  )}
                </div>
              </div>
              
              {user ? (
                <button
                  onClick={() => {
                    setShowCreateForm(!showCreateForm);
                    setPostLanguage(locale);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-bold hover:from-pink-700 hover:to-rose-700 transition-all shadow-lg flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>{locale === 'az' ? 'Yeni Müzakirə Yarat' : 'Создать новое обсуждение'}</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  {locale === 'az' ? 'Giriş edin və müzakirə yaradın' : 'Войдите и создайте обсуждение'}
                </button>
              )}
            </div>
          </div>

          {/* Create Post Form */}
          {showCreateForm && user && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 border-2 border-pink-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {locale === 'az' ? 'Yeni Müzakirə Yarat' : 'Создать новое обсуждение'}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {locale === 'az' ? 'Dil:' : 'Язык:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPostLanguage('az')}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                      postLanguage === 'az'
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    AZ
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostLanguage('ru')}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                      postLanguage === 'ru'
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    RU
                  </button>
                </div>
              </div>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    {postLanguage === 'az' 
                      ? '💡 Müzakirəni Azərbaycan dilində yazırsınız. Digər istifadəçilər də bu dildə cavab verə bilərlər.'
                      : '💡 Вы пишете обсуждение на русском языке. Другие пользователи также могут отвечать на этом языке.'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {postLanguage === 'az' ? 'Başlıq (Azərbaycan)' : 'Заголовок (Русский)'} *
                  </label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-lg"
                    placeholder={postLanguage === 'az' 
                      ? 'Məsələn: Hamiləlikdə hansı vitaminlər lazımdır?' 
                      : 'Например: Какие витамины нужны во время беременности?'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {postLanguage === 'az' ? 'Məzmun (Azərbaycan)' : 'Содержание (Русский)'} *
                  </label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    required
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
                    placeholder={postLanguage === 'az' 
                      ? 'Sualınızı və ya fikrinizi ətraflı yazın...' 
                      : 'Подробно опишите ваш вопрос или мысль...'}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {newPostContent.length} {locale === 'az' ? 'simvol' : 'символов'}
                  </p>
                </div>
                <div className="flex space-x-4 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !newPostTitle.trim() || !newPostContent.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-bold hover:from-pink-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {submitting 
                      ? (locale === 'az' ? '⏳ Göndərilir...' : '⏳ Отправка...')
                      : (locale === 'az' ? '✨ Müzakirəni Yarat' : '✨ Создать обсуждение')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewPostTitle('');
                      setNewPostContent('');
                      setPostLanguage(locale);
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    {locale === 'az' ? 'Ləğv et' : 'Отмена'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <p className="text-gray-500 text-lg">
                  {locale === 'az' 
                    ? 'Hələ müzakirə yoxdur. İlk müzakirəni siz yaradın!'
                    : 'Обсуждений пока нет. Создайте первое обсуждение!'}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/forums/${slug}/${post.id}`}
                  className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-pink-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {post.isPinned && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                            📌 {locale === 'az' ? 'Sabitlənib' : 'Закреплено'}
                          </span>
                        )}
                        {post.isSolved && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                            ✓ {locale === 'az' ? 'Həll olunub' : 'Решено'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{post.replyCount} {locale === 'az' ? 'cavab' : 'ответов'}</span>
                        <span>{post.viewCount} {locale === 'az' ? 'baxış' : 'просмотров'}</span>
                        <span>{formatDate(new Date(post.createdAt), locale)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ForumSidebar currentForumId={forum.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForumTopicPage;

