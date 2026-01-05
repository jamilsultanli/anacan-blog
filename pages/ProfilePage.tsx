import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usersService } from '../services/api/users';
import { postsService } from '../services/api/posts';
import { followsService } from '../services/api/follows';
import { userActivitiesService } from '../services/api/userActivities';
import { BlogPost, User, UserStats } from '../types';
import { db } from '../services/db';
import BlogCard from '../components/BlogCard';
import FollowButton from '../components/FollowButton';
import UserActivityFeed from '../components/UserActivityFeed';

const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { locale } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks' | 'activity'>('posts');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const userId = id || currentUser?.id;
      
      if (!userId) {
        setLoading(false);
        return;
      }

      // Load user profile
      const { data: userData } = await usersService.getUserProfile(userId);
      setUser(userData);

      // Load user posts if viewing own profile or if user is author
      if (userId === currentUser?.id || userData?.role === 'author' || userData?.role === 'admin') {
        const { data: postsData } = await usersService.getUserPosts(userId);
        setPosts(postsData || []);
      }

      // Load user stats
      const { data: userStats } = await userActivitiesService.getUserStats(userId);
      setStats(userStats);

      // Load follow counts
      const { followers, following } = await followsService.getFollowCounts(userId);
      setFollowersCount(followers);
      setFollowingCount(following);

      setLoading(false);
    };

    loadProfile();
  }, [id, currentUser]);

  // Load bookmarks when tab changes
  useEffect(() => {
    const loadBookmarks = async () => {
      if (activeTab !== 'bookmarks' || !currentUser) return;
      
      setBookmarksLoading(true);
      try {
        const { data: bookmarks, error } = await usersService.getBookmarks(currentUser.id);
        
        if (!error && bookmarks && bookmarks.length > 0) {
          // Fetch actual post data for each bookmark
          const postPromises = bookmarks.map(async (bookmark) => {
            try {
              const { data: postData } = await postsService.getPostById(bookmark.postId);
              return postData;
            } catch (e) {
              console.error('Error loading bookmarked post:', e);
              return null;
            }
          });

          const loadedPosts = (await Promise.all(postPromises)).filter((p): p is BlogPost => p !== null);
          setBookmarkedPosts(loadedPosts);
        } else {
          setBookmarkedPosts([]);
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
        setBookmarkedPosts([]);
      } finally {
        setBookmarksLoading(false);
      }
    };

    loadBookmarks();
  }, [activeTab, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50/30">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center space-x-4">
              <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
              <div className="space-y-3 flex-1">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {locale === 'az' ? 'İstifadəçi tapılmadı' : 'Пользователь не найден'}
          </h2>
          <Link to="/" className="text-pink-600 hover:text-pink-700">
            {locale === 'az' ? 'Ana səhifəyə qayıt' : 'Вернуться на главную'}
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user.id === currentUser?.id;

  const handleFollowChange = (isFollowing: boolean) => {
    setFollowersCount(prev => isFollowing ? prev + 1 : Math.max(0, prev - 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header with Cover */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 relative">
            {isOwnProfile && (
              <button className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
                {locale === 'az' ? 'Örtük şəkli dəyiş' : 'Изменить обложку'}
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 -mt-20 md:-mt-16">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-5xl font-bold text-white border-4 border-white shadow-lg">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName || user.username || ''} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{(user.fullName || user.username || user.email || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
                {isOwnProfile && (
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-pink-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {user.fullName || user.username || user.email}
                </h1>
                {user.username && (
                  <p className="text-gray-500 mb-2">@{user.username}</p>
                )}
                {user.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
                )}
                
                {/* Stats */}
                <div className="flex flex-wrap gap-6 justify-center md:justify-start mb-4">
                  <Link to={`/profile/${user.id}/followers`} className="text-center hover:opacity-80 transition-opacity">
                    <div className="text-2xl font-bold text-gray-900">{followersCount}</div>
                    <div className="text-sm text-gray-500">{locale === 'az' ? 'İzləyici' : 'Подписчиков'}</div>
                  </Link>
                  <Link to={`/profile/${user.id}/following`} className="text-center hover:opacity-80 transition-opacity">
                    <div className="text-2xl font-bold text-gray-900">{followingCount}</div>
                    <div className="text-sm text-gray-500">{locale === 'az' ? 'İzləyir' : 'Подписок'}</div>
                  </Link>
                  {stats && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{stats.postsRead}</div>
                        <div className="text-sm text-gray-500">{locale === 'az' ? 'Oxunub' : 'Прочитано'}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{stats.commentsMade}</div>
                        <div className="text-sm text-gray-500">{locale === 'az' ? 'Şərh' : 'Комментариев'}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{stats.bookmarksCount}</div>
                        <div className="text-sm text-gray-500">{locale === 'az' ? 'Yadda saxlanılan' : 'Закладок'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                {isOwnProfile ? (
                  <Link
                    to="/profile/settings"
                    className="px-6 py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors text-center"
                  >
                    {locale === 'az' ? 'Redaktə et' : 'Редактировать'}
                  </Link>
                ) : (
                  <FollowButton userId={user.id} onFollowChange={handleFollowChange} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-3 rounded-lg font-bold transition-colors whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isOwnProfile 
                ? (locale === 'az' ? 'Məqalələrim' : 'Мои статьи')
                : (locale === 'az' ? 'Məqalələr' : 'Статьи')}
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`px-6 py-3 rounded-lg font-bold transition-colors whitespace-nowrap ${
                  activeTab === 'bookmarks'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {locale === 'az' ? 'Yadda saxlanılanlar' : 'Закладки'}
              </button>
            )}
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-3 rounded-lg font-bold transition-colors whitespace-nowrap ${
                activeTab === 'activity'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {locale === 'az' ? 'Fəaliyyət' : 'Активность'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'posts' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isOwnProfile 
                  ? (locale === 'az' ? 'Məqalələrim' : 'Мои статьи')
                  : (locale === 'az' ? 'Məqalələr' : 'Статьи')}
              </h2>
              {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map(post => {
                    const category = { id: post.categoryId, slug: '', name: { az: '', ru: '' }, icon: '', color: '' };
                    return <BlogCard key={post.id} post={post} category={category} />;
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <p className="text-gray-500">
                    {locale === 'az' ? 'Hələ məqalə yoxdur' : 'Статей пока нет'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && isOwnProfile && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'az' ? 'Yadda saxlanılanlar' : 'Закладки'}
              </h2>
              {bookmarksLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : bookmarkedPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {bookmarkedPosts.map(post => {
                    const category = { id: post.categoryId, slug: '', name: { az: '', ru: '' }, icon: '', color: '' };
                    return <BlogCard key={post.id} post={post} category={category} />;
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <p className="text-gray-500 mb-4">
                    {locale === 'az' ? 'Hələ yadda saxlanılan məqalə yoxdur' : 'Сохраненных статей пока нет'}
                  </p>
                  <Link 
                    to="/blog"
                    className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                  >
                    {locale === 'az' ? 'Məqalələrə bax' : 'Посмотреть статьи'}
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'az' ? 'Fəaliyyət' : 'Активность'}
              </h2>
              <UserActivityFeed userId={user.id} limit={50} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

