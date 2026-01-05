import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { userActivitiesService } from '../services/api/userActivities';
import { UserActivity } from '../types';
import { formatDate } from '../utils/dateFormatter';

interface UserActivityFeedProps {
  userId: string;
  limit?: number;
}

const UserActivityFeed: React.FC<UserActivityFeedProps> = ({ userId, limit = 20 }) => {
  const { locale } = useLanguage();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      try {
        const { data } = await userActivitiesService.getUserActivities(userId, limit);
        setActivities(data || []);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [userId, limit]);

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'post_liked':
        return '❤️';
      case 'post_bookmarked':
        return '🔖';
      case 'comment_created':
        return '💬';
      case 'post_viewed':
        return '👁️';
      case 'followed_user':
        return '👤';
      default:
        return '📝';
    }
  };

  const getActivityText = (activity: UserActivity) => {
    const date = formatDate(new Date(activity.createdAt), locale);
    switch (activity.type) {
      case 'post_liked':
        return locale === 'az' 
          ? `Məqaləni bəyəndi • ${date}`
          : `Понравилась статья • ${date}`;
      case 'post_bookmarked':
        return locale === 'az'
          ? `Məqaləni yadda saxladı • ${date}`
          : `Сохранил статью • ${date}`;
      case 'comment_created':
        return locale === 'az'
          ? `Şərh yazdı • ${date}`
          : `Написал комментарий • ${date}`;
      case 'post_viewed':
        return locale === 'az'
          ? `Məqalə oxudu • ${date}`
          : `Прочитал статью • ${date}`;
      case 'followed_user':
        return locale === 'az'
          ? `İstifadəçiyə abunə oldu • ${date}`
          : `Подписался на пользователя • ${date}`;
      default:
        return date;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-16"></div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-gray-500">
          {locale === 'az' ? 'Hələ fəaliyyət yoxdur' : 'Активности пока нет'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start space-x-4 p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
        >
          <div className="text-2xl flex-shrink-0">{getActivityIcon(activity.type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">{getActivityText(activity)}</p>
            {activity.targetType === 'post' && (
              <Link
                to={`/blog/${activity.targetId}`}
                className="text-sm text-pink-600 hover:text-pink-700 mt-1 block truncate"
              >
                {locale === 'az' ? 'Məqaləyə bax →' : 'Посмотреть статью →'}
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserActivityFeed;

