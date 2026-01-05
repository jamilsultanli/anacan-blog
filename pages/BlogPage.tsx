import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { postsService } from '../services/api/posts';
import { categoriesService } from '../services/api/categories';
import { BlogPost, Category } from '../types';
import LazyImage from '../components/LazyImage';
import SEO from '../components/SEO';
import { BlogCardSkeleton } from '../components/SkeletonLoader';
import { formatDate } from '../utils/dateFormatter';

const BlogPage: React.FC = () => {
  const { locale } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 12;

  useEffect(() => {
    loadData();
  }, [locale, selectedCategory, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catsResponse, postsResponse] = await Promise.all([
        categoriesService.getCategories(),
        postsService.getPosts({
          status: 'published',
          locale: locale,
          categoryId: selectedCategory || undefined,
          limit: postsPerPage,
          offset: (currentPage - 1) * postsPerPage,
        }),
      ]);

      const cats = catsResponse.data || [];
      const allPosts = postsResponse.data || [];

      setCategories(cats);

      // Sort by creation date (newest first)
      const sortedPosts = [...allPosts].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.published_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.published_at || 0).getTime();
        return dateB - dateA;
      });

      setPosts(sortedPosts);
      
      // Calculate total pages (simplified - you might want to get this from API)
      const totalPosts = sortedPosts.length;
      setTotalPages(Math.ceil(totalPosts / postsPerPage));
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO locale={locale} />
      
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              {locale === 'az' ? 'Bloq' : 'Блог'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              {locale === 'az' 
                ? 'Hamiləlikdən uşaq tərbiyəsinə qədər hər şey haqqında məqalələr'
                : 'Статьи обо всем: от беременности до воспитания детей'}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Category Filter */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === null
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {locale === 'az' ? 'Hamısı' : 'Все'}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name[locale]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posts Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <BlogCardSkeleton key={i} />
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {posts.map((post) => {
                      const category = categories.find(c => c.id === post.categoryId);
                      return (
                        <Link
                          key={post.id}
                          to={`/blog/${post.slug}`}
                          className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="relative h-48 bg-gray-100 overflow-hidden">
                            {post.imageUrl ? (
                              <LazyImage
                                src={post.imageUrl}
                                alt={post.title[locale]}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                <span className="text-5xl opacity-20">{category?.icon || '📝'}</span>
                              </div>
                            )}
                            {post.isFeatured && (
                              <div className="absolute top-3 right-3 bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                {locale === 'az' ? 'Seçilmiş' : 'Избранное'}
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            {category && (
                              <span className="inline-block text-xs font-semibold text-pink-600 uppercase tracking-wide mb-2">
                                {category.name[locale]}
                              </span>
                            )}
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2 leading-snug">
                              {post.title[locale] || post.title.az || post.title.ru}
                            </h3>
                            {post.excerpt[locale] && (
                              <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed text-sm">
                                {post.excerpt[locale]}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-semibold text-xs">
                                  {post.author?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <span className="text-xs text-gray-600 font-medium">
                                  {post.author || 'Admin'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(
                                  post.published_at || post.createdAt || Date.now(),
                                  locale,
                                  { day: 'numeric', month: 'short' }
                                )}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {locale === 'az' ? 'Əvvəlki' : 'Предыдущая'}
                      </button>
                      <span className="px-4 py-2 text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {locale === 'az' ? 'Növbəti' : 'Следующая'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">
                    {locale === 'az' ? 'Məqalə tapılmadı' : 'Статьи не найдены'}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Categories */}
              {categories.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    {locale === 'az' ? 'Kateqoriyalar' : 'Категории'}
                  </h3>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{category.icon || '📝'}</span>
                          <span className="font-medium text-gray-700 group-hover:text-gray-900">
                            {category.name[locale]}
                          </span>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;

