import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { forumsService } from '../../services/api/forums';
import { Forum, ForumPost } from '../../types';
import { formatDate } from '../../utils/dateFormatter';

interface ForumSidebarProps {
  currentForumId?: string;
}

const ForumSidebar: React.FC<ForumSidebarProps> = ({ currentForumId }) => {
  const { locale } = useLanguage();
  const [popularForums, setPopularForums] = useState<Forum[]>([]);
  const [recentPosts, setRecentPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSidebarData();
  }, []);

  const loadSidebarData = async () => {
    setLoading(true);
    try {
      // Load popular forums (by post count)
      const { data: forums } = await forumsService.getForums();
      const sortedForums = (forums || [])
        .sort((a, b) => (b.postCount || 0) - (a.postCount || 0))
        .slice(0, 5);
      setPopularForums(sortedForums);

      // Load recent posts from all forums
      const { databases, DATABASE_ID, COLLECTIONS, Query } = await import('../../services/appwrite');
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(5),
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

      // Get forum slugs for posts
      const postsWithForums = await Promise.all(
        posts.map(async (post) => {
          try {
            const forum = await databases.getDocument(DATABASE_ID, COLLECTIONS.FORUMS, post.forumId);
            return { ...post, forumSlug: forum.slug };
          } catch (e) {
            return { ...post, forumSlug: '' };
          }
        })
      );

      setRecentPosts(postsWithForums as any);
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Popular Forums */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🔥</span>
          {locale === 'az' ? 'Populyar Forumlar' : 'Популярные форумы'}
        </h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {popularForums.map((forum) => (
              <Link
                key={forum.id}
                to={`/forums/${forum.slug}`}
                className={`block p-3 rounded-lg transition-colors ${
                  currentForumId === forum.id
                    ? 'bg-pink-50 border border-pink-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{forum.icon || '💬'}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {forum.name?.[locale] || forum.name?.az || 'Forum'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {forum.postCount || 0} {locale === 'az' ? 'müzakirə' : 'обсуждений'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📌</span>
          {locale === 'az' ? 'Son Müzakirələr' : 'Последние обсуждения'}
        </h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : recentPosts.length === 0 ? (
          <p className="text-sm text-gray-500">
            {locale === 'az' ? 'Hələ müzakirə yoxdur' : 'Обсуждений пока нет'}
          </p>
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                to={`/forums/${(post as any).forumSlug}/${post.id}`}
                className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                  {post.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{post.replyCount || 0} {locale === 'az' ? 'cavab' : 'ответов'}</span>
                  <span>{post.createdAt ? formatDate(new Date(post.createdAt), locale) : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">
          {locale === 'az' ? 'Forum Statistikası' : 'Статистика форума'}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">
              {locale === 'az' ? 'Ümumi Forumlar' : 'Всего форумов'}
            </span>
            <span className="font-bold text-xl">{popularForums.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">
              {locale === 'az' ? 'Ümumi Müzakirələr' : 'Всего обсуждений'}
            </span>
            <span className="font-bold text-xl">
              {popularForums.reduce((sum, f) => sum + (f.postCount || 0), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumSidebar;

