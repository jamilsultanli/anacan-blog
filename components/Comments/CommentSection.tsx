import React, { useEffect, useState } from 'react';
import { Comment } from '../../types';
import { commentsService } from '../../services/api/comments';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    const { data, error: commentsError } = await commentsService.getCommentsByPost(postId);
    if (commentsError) {
      setError(commentsError.message);
    } else {
      setComments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleCommentAdded = (newComment: Comment) => {
    if (newComment.parentId) {
      // It's a reply, update the parent comment
      const updateCommentWithReply = (comments: Comment[]): Comment[] => {
        return comments.map(c => {
          if (c.id === newComment.parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment],
            };
          }
          return {
            ...c,
            replies: c.replies ? updateCommentWithReply(c.replies) : [],
          };
        });
      };
      setComments(updateCommentWithReply(comments));
    } else {
      // It's a new top-level comment
      setComments([...comments, newComment]);
    }
  };

  const handleCommentDeleted = (commentId: string) => {
    const removeComment = (comments: Comment[]): Comment[] => {
      return comments
        .filter(c => c.id !== commentId)
        .map(c => ({
          ...c,
          replies: c.replies ? removeComment(c.replies) : [],
        }));
    };
    setComments(removeComment(comments));
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    const updateComment = (comments: Comment[]): Comment[] => {
      return comments.map(c => {
        if (c.id === updatedComment.id) {
          return updatedComment;
        }
        return {
          ...c,
          replies: c.replies ? updateComment(c.replies) : [],
        };
      });
    };
    setComments(updateComment(comments));
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">{locale === 'az' ? 'Şərhlər yüklənir...' : 'Загрузка комментариев...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
          {locale === 'az' ? 'Şərhlər' : 'Комментарии'}
          <span className="ml-2 text-pink-600">({comments.length})</span>
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Comment Form */}
      {user ? (
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 md:p-8 border border-pink-100">
          <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center border border-gray-200">
          <p className="text-gray-700 mb-4 text-lg">
            {locale === 'az' 
              ? 'Şərh yazmaq üçün giriş edin' 
              : 'Войдите, чтобы оставить комментарий'}
          </p>
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg"
          >
            {locale === 'az' ? 'Giriş et' : 'Войти'}
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-lg">{locale === 'az' ? 'Hələ şərh yoxdur' : 'Комментариев пока нет'}</p>
            <p className="text-sm mt-2">{locale === 'az' ? 'İlk şərh yazan siz olun!' : 'Будьте первым, кто оставит комментарий!'}</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onDeleted={handleCommentDeleted}
              onUpdated={handleCommentUpdated}
              onReplyAdded={handleCommentAdded}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
