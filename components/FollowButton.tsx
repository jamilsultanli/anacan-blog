import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { followsService } from '../services/api/follows';

interface FollowButtonProps {
  userId: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId, onFollowChange }) => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || user.id === userId) {
        setChecking(false);
        return;
      }

      try {
        const { isFollowing: following } = await followsService.checkIsFollowing(user.id, userId);
        setIsFollowing(following);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setChecking(false);
      }
    };

    checkFollowStatus();
  }, [user, userId]);

  const handleFollow = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        const { error } = await followsService.unfollowUser(userId);
        if (!error) {
          setIsFollowing(false);
          onFollowChange?.(false);
        }
      } else {
        const { error } = await followsService.followUser(userId);
        if (!error) {
          setIsFollowing(true);
          onFollowChange?.(true);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === userId || checking) {
    return null;
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        isFollowing
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-pink-600 text-white hover:bg-pink-700'
      }`}
    >
      {loading
        ? (locale === 'az' ? 'Gözləyin...' : 'Подождите...')
        : isFollowing
        ? (locale === 'az' ? 'İzləyirsiniz' : 'Вы подписаны')
        : (locale === 'az' ? 'İzlə' : 'Подписаться')}
    </button>
  );
};

export default FollowButton;

