import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { forumsService } from '../services/api/forums';
import { usersService } from '../services/api/users';
import { ForumPost, ForumReply, UserProfile } from '../types';
import { formatDate } from '../utils/dateFormatter';
import SEO from '../components/SEO';
import ForumSidebar from '../components/forum/ForumSidebar';
import ForumReplyItem from '../components/forum/ForumReplyItem';

const ForumPostPage: React.FC = () => {
  const { slug, postId } = useParams<{ slug: string; postId: string }>();
  const { user } = useAuth();
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [postAuthor, setPostAuthor] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) return;
      
      setLoading(true);
      try {
        // Get forum post
        const { databases, DATABASE_ID, COLLECTIONS } = await import('../services/appwrite');
        const postDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.FORUM_POSTS, postId);
        
        // Increment view count
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.FORUM_POSTS,
          postId,
          { view_count: (postDoc.view_count || 0) + 1 }
        );

        const forumPost: ForumPost = {
          id: postDoc.$id,
          forumId: postDoc.forum_id,
          userId: postDoc.user_id,
          title: postDoc.title,
          content: postDoc.content,
          isPinned: postDoc.is_pinned || false,
          isSolved: postDoc.is_solved || false,
          isClosed: postDoc.is_closed || false,
          viewCount: (postDoc.view_count || 0) + 1,
          upvoteCount: postDoc.upvote_count || 0,
          downvoteCount: postDoc.downvote_count || 0,
          replyCount: postDoc.reply_count || 0,
          lastReplyAt: postDoc.last_reply_at,
          createdAt: postDoc.$createdAt,
          updatedAt: postDoc.$updatedAt,
        };
        setPost(forumPost);

        // Load author
        try {
          const { data: author } = await usersService.getUserProfile(postDoc.user_id);
          setPostAuthor(author);
        } catch (e) {
          console.error('Error loading author:', e);
        }

        // Load replies
        const { data: forumReplies } = await forumsService.getForumReplies(postId);
        
        // Recursively load user profiles for replies and nested replies
        const loadUserForReply = async (reply: ForumReply): Promise<ForumReply> => {
          try {
            let replyUser = null;
            if (reply.userId) {
              try {
                const userRes = await usersService.getUserProfile(reply.userId);
                if (userRes.data) {
                  // Map User to UserProfile format
                  replyUser = {
                    id: userRes.data.id,
                    name: userRes.data.fullName || userRes.data.username,
                    full_name: userRes.data.fullName,
                    username: userRes.data.username,
                    email: userRes.data.email,
                    avatar_url: userRes.data.avatarUrl,
                    bio: userRes.data.bio,
                    role: userRes.data.role || 'user',
                  };
                }
              } catch (e) {
                console.error('Error loading user for reply:', e);
              }
            }
            
            const replyWithUser = { ...reply, user: replyUser || undefined };
            
            // Load users for nested replies
            if (reply.replies && reply.replies.length > 0) {
              replyWithUser.replies = await Promise.all(
                reply.replies.map(loadUserForReply)
              );
            }
            
            return replyWithUser;
          } catch (e) {
            console.error('Error in loadUserForReply:', e);
            return reply;
          }
        };
        
        const repliesWithUsers = await Promise.all(
          (forumReplies || []).map(loadUserForReply)
        );
        
        setReplies(repliesWithUsers);
      } catch (error) {
        console.error('Error loading forum post:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post) {
      navigate('/login');
      return;
    }

    if (post.isClosed) {
      alert(locale === 'az' ? 'Bu müzakirə bağlıdır' : 'Это обсуждение закрыто');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await forumsService.createForumReply(post.id, replyContent);
      
      if (!error && data) {
        // Load user profile for the new reply
        try {
          const { data: replyUserData } = await usersService.getUserProfile(data.userId);
          if (replyUserData) {
            // Map User to UserProfile format
            const replyUser = {
              id: replyUserData.id,
              name: replyUserData.fullName || replyUserData.username,
              full_name: replyUserData.fullName,
              username: replyUserData.username,
              email: replyUserData.email,
              avatar_url: replyUserData.avatarUrl,
              bio: replyUserData.bio,
              role: replyUserData.role || 'user',
            };
            const replyWithUser = { ...data, user: replyUser };
            
            setReplies(prev => [...prev, replyWithUser]);
            setPost(prev => prev ? { ...prev, replyCount: (prev.replyCount || 0) + 1 } : null);
            setReplyContent('');
            setShowReplyForm(false);
          } else {
            // If user profile load fails, still add reply
            setReplies(prev => [...prev, data]);
            setPost(prev => prev ? { ...prev, replyCount: (prev.replyCount || 0) + 1 } : null);
            setReplyContent('');
            setShowReplyForm(false);
          }
        } catch (e) {
          console.error('Error loading user profile for reply:', e);
          // If user profile load fails, still add reply
          setReplies(prev => [...prev, data]);
          setPost(prev => prev ? { ...prev, replyCount: (prev.replyCount || 0) + 1 } : null);
          setReplyContent('');
          setShowReplyForm(false);
        }
      } else {
        alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
      }
    } catch (error) {
      console.error('Error creating reply:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  const [upvoted, setUpvoted] = useState(false);

  useEffect(() => {
    if (user && post) {
      checkUserVoted();
    }
  }, [user, post?.id]);

  const checkUserVoted = async () => {
    if (!user || !post) return;
    try {
      const { data } = await forumsService.checkUserVotedPost(post.id);
      setUpvoted(data || false);
    } catch (error) {
      // Ignore error
    }
  };

  const handleUpvote = async () => {
    if (!user || !post) {
      navigate('/login');
      return;
    }

    if (upvoted) {
      // Already voted, do nothing (or implement unvote if needed)
      return;
    }

    try {
      const { data, error } = await forumsService.upvoteForumPost(post.id);
      if (!error && data) {
        setPost(prev => prev ? { ...prev, upvoteCount: (prev.upvoteCount || 0) + 1 } : null);
        setUpvoted(true);
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleClosePost = async () => {
    if (!user || !post) return;
    if (post.userId !== user.id) return;

    if (!confirm(locale === 'az' 
      ? 'Müzakirəni bağlamaq istədiyinizə əminsiniz? Bağlandıqdan sonra cavab yazıla bilməz.' 
      : 'Вы уверены, что хотите закрыть обсуждение? После закрытия нельзя будет отвечать.')) {
      return;
    }

    try {
      const { data, error } = await forumsService.closeForumPost(post.id);
      if (!error && data) {
        setPost(data);
        alert(locale === 'az' ? 'Müzakirə bağlandı' : 'Обсуждение закрыто');
      } else {
        alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
      }
    } catch (error) {
      console.error('Error closing post:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {locale === 'az' ? 'Müzakirə tapılmadı' : 'Обсуждение не найдено'}
          </h2>
          <Link to={`/forums/${slug}`} className="text-pink-600 hover:text-pink-700">
            {locale === 'az' ? 'Forumlara qayıt' : 'Вернуться к форумам'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${post.title} - ${locale === 'az' ? 'Forum' : 'Форум'} - Anacan.az`}
        description={post.content.substring(0, 160)}
        locale={locale}
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link 
              to="/forums"
              className="text-gray-600 hover:text-pink-600 font-medium text-sm"
            >
              {locale === 'az' ? '← Forumlar' : '← Форумы'}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link 
              to={`/forums/${slug}`}
              className="text-gray-600 hover:text-pink-600 font-medium text-sm"
            >
              {locale === 'az' ? 'Forum' : 'Форум'}
            </Link>
          </div>

          {/* Post */}
          <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
            <div className="flex items-start justify-between mb-4">
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
                  {post.isClosed && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                      🔒 {locale === 'az' ? 'Bağlıdır' : 'Закрыто'}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-6 text-sm text-gray-600">
              {postAuthor ? (
                <Link to={`/profile/${postAuthor.id}`} className="flex items-center space-x-2 hover:text-pink-600">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-semibold text-xs">
                    {(postAuthor.full_name || postAuthor.username || postAuthor.name || 'U')[0].toUpperCase()}
                  </div>
                  <span>{postAuthor.full_name || postAuthor.username || postAuthor.name || 'İstifadəçi'}</span>
                </Link>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-semibold text-xs">
                    U
                  </div>
                  <span>Anonim</span>
                </div>
              )}
              <span>{formatDate(new Date(post.createdAt), locale)}</span>
              <span>{post.viewCount} {locale === 'az' ? 'baxış' : 'просмотров'}</span>
            </div>

            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleUpvote}
                  disabled={upvoted}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    upvoted
                      ? 'bg-pink-100 text-pink-600 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span>👍</span>
                  <span>{post.upvoteCount}</span>
                </button>
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  disabled={post.isClosed}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    post.isClosed
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                  }`}
                >
                  <span>💬</span>
                  <span>{post.replyCount} {locale === 'az' ? 'cavab' : 'ответов'}</span>
                </button>
              </div>
              {user && post.userId === user.id && !post.isClosed && (
                <button
                  onClick={handleClosePost}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  🔒 {locale === 'az' ? 'Müzakirəni bağla' : 'Закрыть обсуждение'}
                </button>
              )}
            </div>
          </div>

          {/* Reply Form */}
          {showReplyForm && user && !post.isClosed && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {locale === 'az' ? 'Cavab yaz' : 'Написать ответ'}
              </h3>
              <form onSubmit={handleReply} className="space-y-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder={locale === 'az' ? 'Cavabınızı yazın...' : 'Напишите ваш ответ...'}
                />
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50"
                  >
                    {submitting 
                      ? (locale === 'az' ? 'Göndərilir...' : 'Отправка...')
                      : (locale === 'az' ? 'Göndər' : 'Отправить')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent('');
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    {locale === 'az' ? 'Ləğv et' : 'Отмена'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Replies */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === 'az' ? 'Cavablar' : 'Ответы'} ({replies.length})
            </h2>
            {replies.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <p className="text-gray-500">
                  {locale === 'az' ? 'Hələ cavab yoxdur. İlk cavabı siz yazın!' : 'Ответов пока нет. Напишите первый ответ!'}
                </p>
              </div>
            ) : (
              replies.map((reply) => (
                <ForumReplyItem
                  key={reply.id}
                  reply={reply}
                  postId={post.id}
                  onReplyAdded={async () => {
                    // Reload replies with nested structure and user profiles
                    try {
                      const { data: forumReplies } = await forumsService.getForumReplies(post.id);
                      
                      // Recursively load user profiles
                      const loadUserForReply = async (r: ForumReply): Promise<ForumReply> => {
                        try {
                          let replyUser = null;
                          if (r.userId) {
                            try {
                              const userRes = await usersService.getUserProfile(r.userId);
                              if (userRes.data) {
                                // Map User to UserProfile format
                                replyUser = {
                                  id: userRes.data.id,
                                  name: userRes.data.fullName || userRes.data.username,
                                  full_name: userRes.data.fullName,
                                  username: userRes.data.username,
                                  email: userRes.data.email,
                                  avatar_url: userRes.data.avatarUrl,
                                  bio: userRes.data.bio,
                                  role: userRes.data.role || 'user',
                                };
                              }
                            } catch (e) {
                              console.error('Error loading user for reply:', e);
                            }
                          }
                          
                          const replyWithUser = { ...r, user: replyUser || undefined };
                          
                          // Load users for nested replies
                          if (r.replies && r.replies.length > 0) {
                            replyWithUser.replies = await Promise.all(
                              r.replies.map(loadUserForReply)
                            );
                          }
                          
                          return replyWithUser;
                        } catch (e) {
                          console.error('Error in loadUserForReply:', e);
                          return r;
                        }
                      };
                      
                      const repliesWithUsers = await Promise.all(
                        (forumReplies || []).map(loadUserForReply)
                      );
                      
                      setReplies(repliesWithUsers);
                    } catch (error) {
                      console.error('Error reloading replies:', error);
                    }
                  }}
                  level={0}
                />
              ))
            )}
          </div>
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

export default ForumPostPage;

