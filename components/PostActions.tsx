import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usersService } from '../services/api/users';
import { postLikesService } from '../services/api/postLikes';
import AddToReadingList from './AddToReadingList';

interface PostActionsProps {
  post: BlogPost;
}

const PostActions: React.FC<PostActionsProps> = ({ post }) => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showReadingListModal, setShowReadingListModal] = useState(false);

  useEffect(() => {
    const checkInteractions = async () => {
      if (!user) {
        // Get like count even if user is not logged in
        try {
          const { count } = await postLikesService.getLikeCount(post.id);
          setLikeCount(count);
        } catch (error) {
          console.error('Error getting like count:', error);
        }
        return;
      }

      try {
        // Check if user liked the post
        const { liked: userLiked } = await postLikesService.checkUserLiked(post.id, user.id);
        setLiked(userLiked);

        // Get like count
        const { count } = await postLikesService.getLikeCount(post.id);
        setLikeCount(count);

        // Check if user bookmarked the post (with error handling)
        try {
          const bookmarksResponse = await usersService.getBookmarks(user.id);
          if (!bookmarksResponse.error && bookmarksResponse.data) {
            const hasBookmark = bookmarksResponse.data.some(b => b.postId === post.id) || false;
            setBookmarked(hasBookmark);
          }
        } catch (bookmarkError) {
          // Bookmarks collection might not exist yet, just log and continue
          console.warn('Bookmarks feature not available:', bookmarkError);
          setBookmarked(false);
        }
      } catch (error) {
        console.error('Error checking interactions:', error);
      }
    };

    checkInteractions();
  }, [user, post.id]);

  const handleLike = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      if (liked) {
        const { error } = await postLikesService.removeLike(post.id);
        if (!error) {
          setLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
        }
      } else {
        const { error } = await postLikesService.addLike(post.id);
        if (!error) {
          setLiked(true);
          setLikeCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      if (bookmarked) {
        const { error } = await usersService.removeBookmark(post.id);
        if (!error) {
          setBookmarked(false);
        }
      } else {
        const { error } = await usersService.addBookmark(post.id);
        if (!error) {
          setBookmarked(true);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Show user-friendly message if bookmark feature is not available
      alert(locale === 'az' ? 'Bookmark funksiyası hazırda mövcud deyil.' : 'Функция закладок в настоящее время недоступна.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = post.title[locale];

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      alert(locale === 'az' ? 'Link kopyalandı!' : 'Ссылка скопирована!');
    }
  };

  return (
    <>
    <div className="flex items-center space-x-6 py-6 border-t border-b border-gray-200 my-8">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 ${
          liked
            ? 'bg-pink-100 text-pink-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
        <span>{likeCount}</span>
        <span className="hidden sm:inline">
          {locale === 'az' ? 'Bəyən' : 'Нравится'}
        </span>
      </button>

      <button
        onClick={handleBookmark}
        disabled={loading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 ${
          bookmarked
            ? 'bg-pink-100 text-pink-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <span className="text-xl">{bookmarked ? '🔖' : '📑'}</span>
        <span className="hidden sm:inline">
          {locale === 'az' ? 'Yadda saxla' : 'Сохранить'}
        </span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        <span className="text-xl">🔗</span>
        <span className="hidden sm:inline">
          {locale === 'az' ? 'Paylaş' : 'Поделиться'}
        </span>
      </button>

      {user && (
        <button
          onClick={() => setShowReadingListModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <span className="text-xl">📚</span>
          <span className="hidden sm:inline">
            {locale === 'az' ? 'Siyahıya əlavə et' : 'Добавить в список'}
          </span>
        </button>
      )}
    </div>
    {showReadingListModal && (
      <AddToReadingList
        postId={post.id}
        onClose={() => setShowReadingListModal(false)}
      />
    )}
    </>
  );
};

export default PostActions;
