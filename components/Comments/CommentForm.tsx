import React, { useState } from 'react';
import { Comment } from '../../types';
import { commentsService } from '../../services/api/comments';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onCommentAdded: (comment: Comment) => void;
  onCancel?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentId,
  onCommentAdded,
  onCancel,
}) => {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError(null);
    setLoading(true);

    const { data, error: commentError } = await commentsService.createComment(
      postId,
      content.trim(),
      parentId
    );

    if (commentError) {
      setError(commentError.message);
    } else if (data) {
      onCommentAdded(data);
      setContent('');
      if (onCancel) {
        onCancel();
      }
    }

    setLoading(false);
  };

  const isReply = !!parentId;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.fullName || user.username || ''} 
              className="w-full h-full rounded-full object-cover" 
            />
          ) : (
            <span>{(user?.fullName || user?.username || user?.email?.split('@')[0] || 'U')[0].toUpperCase()}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {user?.fullName || user?.username || user?.email?.split('@')[0] || 'İstifadəçi'}
            </span>
            {isReply && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">
                {locale === 'az' ? 'Cavab yazırsınız' : 'Вы отвечаете'}
              </span>
            )}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isReply 
                ? (locale === 'az' ? 'Cavabınızı yazın...' : 'Напишите ваш ответ...')
                : (locale === 'az' ? 'Şərhinizi yazın...' : 'Напишите ваш комментарий...')
            }
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none transition-all"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {locale === 'az' ? 'Ləğv et' : 'Отмена'}
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading
            ? (locale === 'az' ? 'Göndərilir...' : 'Отправка...')
            : isReply
            ? (locale === 'az' ? 'Cavab göndər' : 'Отправить ответ')
            : (locale === 'az' ? 'Şərh göndər' : 'Отправить комментарий')}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
