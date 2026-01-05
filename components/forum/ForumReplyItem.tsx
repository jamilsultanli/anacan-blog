import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ForumReply } from '../../types';
import { formatDate } from '../../utils/dateFormatter';
import { forumsService } from '../../services/api/forums';
import { usersService } from '../../services/api/users';
import { User, UserProfile } from '../../types';

interface ForumReplyItemProps {
  reply: ForumReply;
  postId: string;
  onReplyAdded?: () => void;
  level?: number;
}

const ForumReplyItem: React.FC<ForumReplyItemProps> = ({ 
  reply, 
  postId, 
  onReplyAdded,
  level = 0 
}) => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(reply.upvoteCount || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [editing, setEditing] = useState(false);
  const [currentReply, setCurrentReply] = useState(reply);

  React.useEffect(() => {
    // Use reply.user if available, otherwise load it
    if (reply.user) {
      setUserProfile(reply.user);
    } else if (reply.userId) {
      loadUserProfile();
    }
    checkUserVoted();
    setCurrentReply(reply);
    setEditContent(reply.content);
  }, [reply.userId, reply.user, reply.content]);

  const loadUserProfile = async () => {
    if (reply.userId && !reply.user) {
      try {
        const { data } = await usersService.getUserProfile(reply.userId);
        if (data) {
          // Map User to UserProfile format
          setUserProfile({
            id: data.id,
            name: data.fullName || data.username,
            full_name: data.fullName,
            username: data.username,
            email: data.email,
            avatar_url: data.avatarUrl,
            bio: data.bio,
            role: data.role || 'user',
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserProfile(null);
      }
    }
  };

  const checkUserVoted = async () => {
    if (!user || !reply.id) return;
    try {
      const { data } = await forumsService.checkUserVotedReply(reply.id);
      setUpvoted(data || false);
    } catch (error) {
      // Ignore error
    }
  };

  const handleUpvote = async () => {
    if (!user) return;
    
    try {
      if (upvoted) {
        // Remove upvote (simplified - in real app you'd need an unvote method)
        setUpvoteCount(prev => Math.max(0, prev - 1));
        setUpvoted(false);
      } else {
        await forumsService.upvoteForumReply(reply.id);
        setUpvoteCount(prev => prev + 1);
        setUpvoted(true);
      }
    } catch (error) {
      console.error('Error upvoting reply:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      // Create nested reply using the service
      const { data, error } = await forumsService.createForumReply(postId, replyContent, currentReply.id);
      
      if (!error && data) {
        setReplyContent('');
        setShowReplyForm(false);
        if (onReplyAdded) {
          onReplyAdded();
        }
      } else {
        alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
      }
    } catch (error: any) {
      console.error('Error creating reply:', error);
      alert(locale === 'az' 
        ? `Xəta baş verdi: ${error.message || 'Naməlum xəta'}` 
        : `Ошибка: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    setEditing(true);
    try {
      const { data, error } = await forumsService.updateForumReply(currentReply.id, editContent);
      
      if (!error && data) {
        setCurrentReply({ ...currentReply, content: data.content, updatedAt: data.updatedAt });
        setIsEditing(false);
        if (onReplyAdded) {
          onReplyAdded();
        }
      } else {
        alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
      }
    } catch (error: any) {
      console.error('Error updating reply:', error);
      alert(locale === 'az' 
        ? `Xəta baş verdi: ${error.message || 'Naməlum xəta'}` 
        : `Ошибка: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setEditing(false);
    }
  };

  const isOwnReply = user && currentReply.userId === user.id;
  const isAdmin = user?.role === 'admin' || user?.role === 'author';
  const canEditOrDelete = isOwnReply || isAdmin;

  const maxLevel = 3; // Maximum nesting level
  const isNested = level > 0;
  const marginLeft = level * 2; // 2rem per level

  // Load user profile for nested replies
  React.useEffect(() => {
    if (reply.replies && reply.replies.length > 0) {
      const loadNestedUsers = async () => {
        const { usersService } = await import('../../services/api/users');
        const updatedReplies = await Promise.all(
          reply.replies!.map(async (nestedReply) => {
            if (nestedReply.userId && !nestedReply.user) {
              try {
                const { data } = await usersService.getUserProfile(nestedReply.userId);
                return { ...nestedReply, user: data || undefined };
              } catch (e) {
                return nestedReply;
              }
            }
            return nestedReply;
          })
        );
        // Update parent reply with user-loaded nested replies
        if (updatedReplies.some((r, i) => r.user !== reply.replies![i].user)) {
          // Force re-render by updating state if needed
        }
      };
      loadNestedUsers();
    }
  }, [reply.replies]);

  // Render nested replies recursively
  const renderNestedReplies = () => {
    if (!currentReply.replies || currentReply.replies.length === 0) return null;
    
    return (
      <div className="mt-4 space-y-3">
        {currentReply.replies.map((nestedReply) => (
          <ForumReplyItem
            key={nestedReply.id}
            reply={nestedReply}
            postId={postId}
            onReplyAdded={onReplyAdded}
            level={level + 1}
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`${isNested ? 'border-l-4 border-pink-200 pl-4' : ''}`}
      style={{ marginLeft: `${marginLeft}rem` }}
    >
      <div className={`bg-white rounded-lg p-4 mb-3 ${isNested ? 'shadow-sm' : 'shadow-md border border-gray-200'}`}>
        {/* Reply Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
              {((reply.user || userProfile)?.full_name || (reply.user || userProfile)?.username || (reply.user || userProfile)?.name || 'A')[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {(reply.user || userProfile)?.full_name || (reply.user || userProfile)?.username || (reply.user || userProfile)?.name || 'Anonim'}
              </div>
              <div className="text-xs text-gray-500">
                {reply.createdAt ? formatDate(new Date(reply.createdAt), locale) : ''}
              </div>
            </div>
          </div>
          {reply.isHelpful && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
              ✓ {locale === 'az' ? 'Faydalı' : 'Полезно'}
            </span>
          )}
        </div>

        {/* Reply Content */}
        {!isEditing ? (
          <div className="text-gray-700 mb-4 whitespace-pre-wrap">
            {currentReply.content}
          </div>
        ) : (
          <div className="mb-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder={locale === 'az' ? 'Cavabınızı redaktə edin...' : 'Редактируйте ваш ответ...'}
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleEdit}
                disabled={editing || !editContent.trim()}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 text-sm"
              >
                {editing 
                  ? (locale === 'az' ? 'Saxlanılır...' : 'Сохранение...')
                  : (locale === 'az' ? 'Saxla' : 'Сохранить')}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(currentReply.content);
                }}
                disabled={editing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
              >
                {locale === 'az' ? 'Ləğv et' : 'Отмена'}
              </button>
            </div>
          </div>
        )}

        {/* Reply Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleUpvote}
              disabled={!user}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                upvoted
                  ? 'bg-pink-100 text-pink-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>👍</span>
              <span className="text-sm font-semibold">{upvoteCount}</span>
            </button>
            {user && level < maxLevel && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-pink-600 transition-colors"
              >
                {locale === 'az' ? 'Cavab ver' : 'Ответить'}
              </button>
            )}
            {canEditOrDelete && !isEditing && (
              <>
                {(isOwnReply || isAdmin) && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`px-3 py-1 text-sm transition-colors ${
                      isAdmin && !isOwnReply
                        ? 'text-blue-600 hover:text-blue-700'
                        : 'text-gray-600 hover:text-pink-600'
                    }`}
                    title={isAdmin && !isOwnReply ? (locale === 'az' ? 'Admin redaktəsi' : 'Редактирование администратором') : ''}
                  >
                    {locale === 'az' ? 'Redaktə et' : 'Редактировать'}
                    {isAdmin && !isOwnReply && (locale === 'az' ? ' (Admin)' : ' (Админ)')}
                  </button>
                )}
                <button
                  onClick={async () => {
                    if (!confirm(locale === 'az' ? 'Rəyi silmək istədiyinizə əminsiniz?' : 'Вы уверены, что хотите удалить ответ?')) {
                      return;
                    }
                    try {
                      const { error } = await forumsService.deleteForumReply(currentReply.id);
                      if (!error && onReplyAdded) {
                        onReplyAdded();
                      } else if (error) {
                        alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
                      }
                    } catch (error) {
                      console.error('Error deleting reply:', error);
                      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
                    }
                  }}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  {locale === 'az' ? 'Sil' : 'Удалить'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && user && (
          <form onSubmit={handleSubmitReply} className="mt-4 pt-4 border-t border-gray-200">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={locale === 'az' ? 'Cavabınızı yazın...' : 'Напишите ответ...'}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 mb-2"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                {submitting 
                  ? (locale === 'az' ? 'Göndərilir...' : 'Отправка...')
                  : (locale === 'az' ? 'Cavab göndər' : 'Отправить ответ')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                {locale === 'az' ? 'Ləğv et' : 'Отмена'}
              </button>
            </div>
          </form>
        )}

        {/* Nested Replies */}
        {renderNestedReplies()}
      </div>
    </div>
  );
};

export default ForumReplyItem;

