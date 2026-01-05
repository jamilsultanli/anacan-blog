import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { readingListsService, ReadingList } from '../services/api/readingLists';
import { postsService } from '../services/api/posts';
import { BlogPost } from '../types';
import BlogCard from '../components/BlogCard';
import { categoriesService } from '../services/api/categories';
import { Category } from '../types';
import { databases, DATABASE_ID, COLLECTIONS } from '../services/appwrite';
import SEO from '../components/SEO';

const ReadingListsPage: React.FC = () => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [selectedList, setSelectedList] = useState<ReadingList | null>(null);
  const [listPosts, setListPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [listsRes, categoriesRes] = await Promise.all([
          readingListsService.getReadingLists(),
          categoriesService.getCategories(),
        ]);

        if (!listsRes.error) {
          setLists(listsRes.data || []);
        }

        // Create category map
        const catMap: Record<string, Category> = {};
        (categoriesRes.data || []).forEach(cat => {
          catMap[cat.id] = cat;
        });
        setCategories(catMap);
      } catch (error) {
        console.error('Error loading reading lists:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  useEffect(() => {
    const loadListPosts = async () => {
      if (!selectedList) return;

      try {
        const { data: postIds } = await readingListsService.getListPosts(selectedList.id);
        
        // Fetch posts
        const posts: BlogPost[] = [];
        for (const postId of postIds) {
          try {
            const post = await databases.getDocument(DATABASE_ID, COLLECTIONS.POSTS, postId);
            posts.push({
              id: post.$id,
              slug: post.slug,
              title: { az: post.title_az, ru: post.title_ru },
              excerpt: { az: post.excerpt_az || '', ru: post.excerpt_ru || '' },
              content: { az: post.content_az, ru: post.content_ru },
              categoryId: post.category_id,
              author: post.author_name || '',
              authorId: post.author_id,
              published_at: post.published_at,
              imageUrl: post.image_url || '',
              readTime: post.read_time || 5,
              tags: [],
              isFeatured: post.is_featured || false,
              status: post.status,
              viewCount: post.view_count || 0,
              createdAt: post.$createdAt,
              updatedAt: post.$updatedAt,
            });
          } catch (e) {
            // Post might not exist
          }
        }
        setListPosts(posts);
      } catch (error) {
        console.error('Error loading list posts:', error);
      }
    };

    loadListPosts();
  }, [selectedList]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);
    try {
      const { data, error } = await readingListsService.createReadingList({
        name: newListName,
        description: newListDescription,
        isPublic: false,
      });

      if (!error && data) {
        setLists(prev => [data, ...prev]);
        setNewListName('');
        setNewListDescription('');
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {locale === 'az' ? 'Giriş edin' : 'Войдите'}
          </h2>
          <Link to="/login" className="text-pink-600 hover:text-pink-700">
            {locale === 'az' ? 'Giriş səhifəsinə get' : 'Перейти на страницу входа'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={locale === 'az' ? 'Oxuma siyahıları - Anacan.az' : 'Списки чтения - Anacan.az'}
        description={locale === 'az' 
          ? 'Məqalələrinizi təşkil edin və oxuma siyahıları yaradın'
          : 'Организуйте свои статьи и создавайте списки чтения'}
        locale={locale}
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {locale === 'az' ? 'Oxuma Siyahıları' : 'Списки чтения'}
              </h1>
              <p className="text-gray-600">
                {locale === 'az' 
                  ? 'Məqalələrinizi təşkil edin və öz oxuma siyahılarınızı yaradın'
                  : 'Организуйте свои статьи и создавайте собственные списки чтения'}
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              + {locale === 'az' ? 'Yeni Siyahı' : 'Новый список'}
            </button>
          </div>

          {/* Create List Form */}
          {showCreateForm && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {locale === 'az' ? 'Yeni Oxuma Siyahısı' : 'Новый список чтения'}
              </h2>
              <form onSubmit={handleCreateList} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'az' ? 'Ad' : 'Название'}
                  </label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder={locale === 'az' ? 'Məsələn: Hamiləlik məsləhətləri' : 'Например: Советы по беременности'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'az' ? 'Təsvir' : 'Описание'}
                  </label>
                  <textarea
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder={locale === 'az' ? 'Siyahı haqqında qısa məlumat...' : 'Краткая информация о списке...'}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50"
                  >
                    {creating 
                      ? (locale === 'az' ? 'Yaradılır...' : 'Создание...')
                      : (locale === 'az' ? 'Yarat' : 'Создать')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewListName('');
                      setNewListDescription('');
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    {locale === 'az' ? 'Ləğv et' : 'Отмена'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lists Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : lists.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <p className="text-gray-500 mb-4">
                {locale === 'az' ? 'Hələ oxuma siyahınız yoxdur' : 'У вас пока нет списков чтения'}
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors"
              >
                + {locale === 'az' ? 'İlk siyahını yarat' : 'Создать первый список'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => setSelectedList(list)}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-pink-200"
                >
                  {list.coverImageUrl ? (
                    <div className="h-32 rounded-lg mb-4 overflow-hidden">
                      <img src={list.coverImageUrl} alt={list.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 rounded-lg mb-4 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                      <span className="text-4xl">📚</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{list.name}</h3>
                  {list.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{list.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{list.postCount} {locale === 'az' ? 'məqalə' : 'статей'}</span>
                    {list.isPublic && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {locale === 'az' ? 'Açıq' : 'Публичный'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List Posts View */}
          {selectedList && (
            <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedList.name}</h2>
                  {selectedList.description && (
                    <p className="text-gray-600 mt-2">{selectedList.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedList(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {locale === 'az' ? 'Bağla' : 'Закрыть'}
                </button>
              </div>

              {listPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {locale === 'az' ? 'Bu siyahıda məqalə yoxdur' : 'В этом списке нет статей'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listPosts.map(post => (
                    <BlogCard
                      key={post.id}
                      post={post}
                      category={categories[post.categoryId]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReadingListsPage;

