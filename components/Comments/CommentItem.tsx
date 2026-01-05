import React, { useState } from 'react';
import { Comment } from '../../types';
import { commentsService } from '../../services/api/comments';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate } from '../../utils/dateFormatter';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onDeleted: (commentId: string) => void;
  onUpdated: (comment: Comment) => void;
  onReplyAdded: (comment: Comment) => void;
  depth?: number;
}

type ReactionType = 'like' | 'love' | 'helpful' | 'laugh' | 'wow' | 'sad' | 'angry';

const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  helpful: '💡',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😠',
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onDeleted,
  onUpdated,
  onReplyAdded,
  depth = 0,
}) => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions || []);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const maxDepth = 3;
  const isReply = depth > 0;

  // Get user display name - never show "Anonim"
  const getUserDisplayName = () => {
    if (comment.user?.fullName) return comment.user.fullName;
    if (comment.user?.username) return comment.user.username;
    // Try to get from account if available
    if (user?.fullName) return user.fullName;
    if (user?.username) return user.username;
    // Last resort: use email prefix or generic name
    return 'İstifadəçi';
  };

  const handleDelete = async () => {
    if (!confirm(locale === 'az' ? 'Şərhi silmək istədiyinizə əminsiniz?' : 'Вы уверены, что хотите удалить комментарий?')) {
      return;
    }

    setLoading(true);
    const { error } = await commentsService.deleteComment(comment.id);
    if (!error) {
      onDeleted(comment.id);
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;

    setLoading(true);
    const { data, error } = await commentsService.updateComment(comment.id, editContent);
    if (!error && data) {
      onUpdated(data);
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleReaction = async (reactionType: ReactionType) => {
    if (!user) return;

    const hasReaction = reactions.some(
      r => r.userId === user.id && r.reactionType === reactionType
    );

    setLoading(true);
    
    if (hasReaction) {
      const { error } = await commentsService.removeReaction(comment.id, reactionType);
      if (!error) {
        setReactions(reactions.filter(r => !(r.userId === user.id && r.reactionType === reactionType)));
      }
    } else {
      // Remove any existing reaction from this user first
      const existingReaction = reactions.find(r => r.userId === user.id);
      if (existingReaction) {
        await commentsService.removeReaction(comment.id, existingReaction.reactionType);
      }
      
      const { data, error } = await commentsService.addReaction(comment.id, reactionType);
      if (!error && data) {
        setReactions([
          ...reactions.filter(r => r.userId !== user.id),
          data
        ]);
      }
    }
    
    setLoading(false);
    setShowReactionPicker(false);
  };

  const isOwnComment = user?.id === comment.userId;
  const isAdmin = user?.role === 'admin' || user?.role === 'author';
  const canEditOrDelete = isOwnComment || isAdmin;
  
  // Count reactions by type
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.reactionType] = (acc[r.reactionType] || 0) + 1;
    return acc;
  }, {} as Record<ReactionType, number>);

  const userReaction = user ? reactions.find(r => r.userId === user.id) : null;

  return (
    <div className={`${isReply ? 'ml-6 md:ml-8 border-l-2 border-pink-200 pl-4 md:pl-6' : ''}`}>
      <div className={`bg-white rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow ${isReply ? 'bg-pink-50/30 border border-pink-100' : ''}`}>
        <div className="flex items-start space-x-3 md:space-x-4">
          {/* Avatar */}
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0 shadow-md">
            {comment.user?.avatarUrl ? (
              <img 
                src={comment.user.avatarUrl} 
                alt={getUserDisplayName()} 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <span>{getUserDisplayName()[0].toUpperCase()}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className="font-bold text-gray-900 text-sm md:text-base">
                {getUserDisplayName()}
              </span>
              {isReply && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">
                  {locale === 'az' ? 'Cavab' : 'Ответ'}
                </span>
              )}
              <span className="text-xs md:text-sm text-gray-500">
                {formatDate(comment.createdAt, locale, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
                  rows={4}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdate}
                    disabled={loading || !editContent.trim()}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {locale === 'az' ? 'Yadda saxla' : 'Сохранить'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    {locale === 'az' ? 'Ləğv et' : 'Отмена'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-700 whitespace-pre-wrap mb-4 leading-relaxed text-sm md:text-base">
                  {comment.content}
                </p>

                {/* Reactions */}
                <div className="flex items-center flex-wrap gap-3 mb-3">
                  {/* Reaction Picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowReactionPicker(!showReactionPicker)}
                      disabled={!user || loading}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <span>😊</span>
                      <span className="text-xs">{locale === 'az' ? 'Reaksiya' : 'Реакция'}</span>
                    </button>
                    
                    {showReactionPicker && user && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl p-2 border border-gray-200 z-10 flex items-center space-x-1">
                        {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => handleReaction(type)}
                            disabled={loading}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl hover:scale-125 transition-transform ${
                              userReaction?.reactionType === type ? 'bg-pink-100' : 'hover:bg-gray-100'
                            }`}
                            title={type}
                          >
                            {REACTION_EMOJIS[type]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Display Reactions */}
                  {Object.entries(reactionCounts).map(([type, count]) => {
                    if (count === 0) return null;
                    const reactionType = type as ReactionType;
                    const isActive = userReaction?.reactionType === reactionType;
                    return (
                      <button
                        key={type}
                        onClick={() => handleReaction(reactionType)}
                        disabled={!user || loading}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          isActive
                            ? 'bg-pink-100 text-pink-700 border border-pink-300'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span>{REACTION_EMOJIS[reactionType]}</span>
                        <span>{count}</span>
                      </button>
                    );
                  })}

                  {/* Reply Button */}
                  {user && depth < maxDepth && (
                    <button
                      onClick={() => setIsReplying(!isReplying)}
                      className="text-sm text-gray-600 hover:text-pink-600 font-medium transition-colors"
                    >
                      {locale === 'az' ? 'Cavab ver' : 'Ответить'}
                    </button>
                  )}

                  {/* Edit/Delete */}
                  {canEditOrDelete && (
                    <>
                      {isOwnComment && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-sm text-gray-600 hover:text-pink-600 font-medium transition-colors"
                        >
                          {locale === 'az' ? 'Redaktə et' : 'Редактировать'}
                        </button>
                      )}
                      {isAdmin && !isOwnComment && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          title={locale === 'az' ? 'Admin redaktəsi' : 'Редактирование администратором'}
                        >
                          {locale === 'az' ? 'Redaktə et (Admin)' : 'Редактировать (Админ)'}
                        </button>
                      )}
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
                      >
                        {locale === 'az' ? 'Sil' : 'Удалить'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {isReplying && user && depth < maxDepth && (
        <div className="mt-4 ml-6 md:ml-8">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onCommentAdded={(reply) => {
              onReplyAdded(reply);
              setIsReplying(false);
            }}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onDeleted={onDeleted}
              onUpdated={onUpdated}
              onReplyAdded={onReplyAdded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
