import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { forumsService } from '../services/api/forums';
import { Forum, ForumPost } from '../types';
import SEO from '../components/SEO';
import ForumSidebar from '../components/forum/ForumSidebar';
import { formatDate } from '../utils/dateFormatter';

const ForumsPage: React.FC = () => {
  const { locale } = useLanguage();
  const [forums, setForums] = useState<Forum[]>([]);
  const [recentPosts, setRecentPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await forumsService.getForums();
      setForums(data || []);

      // Load recent posts
      const { databases, DATABASE_ID, COLLECTIONS, Query } = await import('../services/appwrite');
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(10),
        ]
      );

      const posts: ForumPost[] = (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        forumId: doc.forum_id,
        userId: doc.user_id,
        title: doc.title,
        content: doc.content,
        isPinned: doc.is_pinned || false,
        isSolved: doc.is_solved || false,
        viewCount: doc.view_count || 0,
        upvoteCount: doc.upvote_count || 0,
        downvoteCount: doc.downvote_count || 0,
        replyCount: doc.reply_count || 0,
        createdAt: doc.$createdAt,
      }));

      // Get forum slugs
      const postsWithForums = await Promise.all(
        posts.map(async (post) => {
          try {
            const forum = await databases.getDocument(DATABASE_ID, COLLECTIONS.FORUMS, post.forumId);
            return { ...post, forumSlug: forum.slug, forumName: forum };
          } catch (e) {
            return { ...post, forumSlug: '', forumName: null };
          }
        })
      );

      setRecentPosts(postsWithForums as any);
    } catch (error) {
      console.error('Error loading forums:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title={locale === 'az' ? 'Forumlar - Anacan.az' : 'Форумы - Anacan.az'}
        description={locale === 'az' 
          ? 'Analar üçün müzakirə platforması. Suallarınızı verin, təcrübələrinizi paylaşın.'
          : 'Платформа для обсуждений для мам. Задавайте вопросы, делитесь опытом.'}
        locale={locale}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              {locale === 'az' ? '💬 Forumlar' : '💬 Форумы'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              {locale === 'az' 
                ? 'Digər analarla müzakirə edin, suallarınızı verin və təcrübələrinizi paylaşın'
                : 'Обсуждайте с другими мамами, задавайте вопросы и делитесь опытом'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Forum Categories */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">
                    {locale === 'az' ? '📁 Forum Kateqoriyaları' : '📁 Категории форумов'}
                  </h2>
                </div>
                {loading ? (
                  <div className="p-6">
                    <div className="space-y-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                ) : forums.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500">
                      {locale === 'az' ? 'Hələ forum yoxdur' : 'Форумы пока нет'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {forums.map((forum) => (
                      <Link
                        key={forum.id}
                        to={`/forums/${forum.slug}`}
                        className="block p-6 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${forum.color ? `bg-[${forum.color}]20` : 'bg-pink-100'}`}>
                            {forum.icon || '💬'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
                              {forum.name?.[locale] || forum.name?.az || 'Forum'}
                            </h3>
                            {forum.description && (
                              <p className="text-gray-600 text-sm line-clamp-1 mb-2">
                                {forum.description[locale] || forum.description.az || ''}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{forum.postCount || 0} {locale === 'az' ? 'müzakirə' : 'обсуждений'}</span>
                            </div>
                          </div>
                          <svg className="w-6 h-6 text-gray-400 group-hover:text-pink-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Discussions */}
              {recentPosts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">
                      {locale === 'az' ? '🔥 Son Müzakirələr' : '🔥 Последние обсуждения'}
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {recentPosts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/forums/${(post as any).forumSlug}/${post.id}`}
                        className="block p-6 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              {(post as any).forumName && (post as any).forumName.name && (
                                <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded">
                                  {(post as any).forumName.name[locale] || (post as any).forumName.name.az || 'Forum'}
                                </span>
                              )}
                              {post.isPinned && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                                  📌
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-1">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {post.content}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{post.replyCount || 0} {locale === 'az' ? 'cavab' : 'ответов'}</span>
                              <span>{post.viewCount || 0} {locale === 'az' ? 'baxış' : 'просмотров'}</span>
                              <span>{post.createdAt ? formatDate(new Date(post.createdAt), locale) : ''}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ForumSidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForumsPage;

