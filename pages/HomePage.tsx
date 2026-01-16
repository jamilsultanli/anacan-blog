import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsService } from '../services/api/posts';
import { categoriesService } from '../services/api/categories';
import { BlogPost, Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import { BlogCardSkeleton } from '../components/SkeletonLoader';
import LazyImage from '../components/LazyImage';
import { translationService } from '../services/translations';
import AdBanner from '../components/AdBanner';
import NewsletterForm from '../components/NewsletterForm';
import PersonalizedFeed from '../components/PersonalizedFeed';
import { formatDate } from '../utils/dateFormatter';

const HomePage: React.FC = () => {
  const { locale, t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [trendingIndex, setTrendingIndex] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load translations
        const homeTranslations = await translationService.getTranslations(locale, 'home');
        setTranslations(homeTranslations);

        const [catsResponse, postsResponse] = await Promise.all([
          categoriesService.getCategories(),
          postsService.getPosts({ 
            status: 'published',
            locale: locale,
            limit: 50
          })
        ]);
        
        const cats = catsResponse.data || [];
        const allPosts = postsResponse.data || [];
        
        setCategories(cats);

        // Calculate category counts
        const counts: Record<string, number> = {};
        allPosts.forEach(post => {
          if (post.categoryId) {
            counts[post.categoryId] = (counts[post.categoryId] || 0) + 1;
          }
        });
        setCategoryCounts(counts);

        // Featured posts - random selection from all featured posts
        const allFeatured = allPosts.filter(p => p.isFeatured);
        const shuffledFeatured = [...allFeatured].sort(() => Math.random() - 0.5);
        const featured = shuffledFeatured.slice(0, 3);
        setFeaturedPosts(shuffledFeatured); // Store all for sliding

        // Trending posts - random selection from top viewed posts
        const sortedByViews = [...allPosts]
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 10); // Get top 10, then randomize
        const shuffledTrending = [...sortedByViews].sort(() => Math.random() - 0.5);
        setTrendingPosts(shuffledTrending); // Store all for sliding

        // Regular posts - sorted by creation date (newest first), limit to 5
        const regular = [...allPosts]
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.published_at || 0).getTime();
            const dateB = new Date(b.createdAt || b.published_at || 0).getTime();
            return dateB - dateA; // Newest first
          })
          .slice(0, 5);
        setPosts(regular);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [locale]);

  return (
    <>
      <SEO locale={locale} />
      
      {/* Hero Section */}
      <Hero />

      {/* Featured Posts - Large Cards */}
      {featuredPosts.length > 0 && (() => {
        const displayedFeatured = featuredPosts.slice(featuredIndex, featuredIndex + 3);
        const hasMore = featuredPosts.length > featuredIndex + 3;
        
        return (
        <section className="bg-white py-12 sm:py-16 md:py-20 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 break-words w-full sm:w-auto">
                {translations.featured_posts || (locale === 'az' ? 'Seçilmiş məqalələr' : 'Избранные статьи')}
              </h2>
              <Link 
                to="/featured"
                className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap flex-shrink-0"
              >
                {locale === 'az' ? 'Hamısını gör' : 'Посмотреть все'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {displayedFeatured.map((post) => {
                const category = categories.find(c => c.id === post.categoryId);
                return (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="relative bg-gray-100 overflow-hidden flex-shrink-0" style={{ aspectRatio: '16/9' }}>
                      {post.imageUrl ? (
                        <LazyImage 
                          src={post.imageUrl} 
                          alt={post.title[locale]} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          aspectRatio="16/9"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100" style={{ aspectRatio: '16/9' }}>
                          <span className="text-4xl sm:text-5xl md:text-6xl opacity-20">{category?.icon || '📝'}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
                      {category && (
                        <span className="inline-block text-xs font-semibold text-pink-600 uppercase tracking-wide mb-2 sm:mb-3">
                          {category.name[locale]}
                        </span>
                      )}
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-pink-600 transition-colors line-clamp-3 leading-tight sm:leading-snug min-h-[3.5rem] sm:min-h-[4rem] md:min-h-[4.5rem]">
                        {post.title[locale] || post.title.az || post.title.ru}
                      </h3>
                      {post.excerpt[locale] && (
                        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3 leading-relaxed flex-grow">
                          {post.excerpt[locale]}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 mt-auto">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                            {post.author?.[0]?.toUpperCase() || 'A'}
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                            {post.author || 'Admin'}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0 ml-2">
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
              
              {/* Navigation buttons for featured posts */}
              {featuredPosts.length > 3 && (
                <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <button
                    onClick={() => setFeaturedIndex(Math.max(0, featuredIndex - 3))}
                    disabled={featuredIndex === 0}
                    className="px-3 sm:px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                    style={{ color: '#be185d' }}
                  >
                    {locale === 'az' ? '← Əvvəlki' : '← Предыдущие'}
                  </button>
                  <span className="text-xs sm:text-sm text-gray-600 px-2">
                    {Math.floor(featuredIndex / 3) + 1} / {Math.ceil(featuredPosts.length / 3)}
                  </span>
                  <button
                    onClick={() => setFeaturedIndex(Math.min(featuredPosts.length - 3, featuredIndex + 3))}
                    disabled={!hasMore}
                    className="px-3 sm:px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                    style={{ color: '#be185d' }}
                  >
                    {locale === 'az' ? 'Növbəti →' : 'Следующие →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
        );
      })()}

      {/* Latest Posts - Two Column Layout */}
      {posts.length > 0 && (
        <section className="bg-white py-12 sm:py-16 md:py-20 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {translations.latest_posts || (locale === 'az' ? 'Ən son məqalələr' : 'Последние статьи')}
              </h2>
              <Link 
                to="/blog"
                className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-2 transition-colors"
              >
                {locale === 'az' ? 'Hamısını gör' : 'Посмотреть все'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content - Posts */}
              <div className="lg:col-span-2">
                {loading ? (
                  <div className="space-y-8">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <BlogCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {posts.map((post) => {
                      const category = categories.find(c => c.id === post.categoryId);
                      return (
                        <Link
                          key={post.id}
                          to={`/blog/${post.slug}`}
                          className="group block"
                        >
                          <article className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-100 last:border-b-0">
                            <div className="md:w-48 flex-shrink-0">
                              <div className="relative rounded-xl bg-gray-100 overflow-hidden" style={{ aspectRatio: '16/9' }}>
                                {post.imageUrl ? (
                                  <LazyImage 
                                    src={post.imageUrl} 
                                    alt={post.title[locale]} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    aspectRatio="16/9"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100" style={{ aspectRatio: '16/9' }}>
                                    <span className="text-4xl opacity-20">{category?.icon || '📝'}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              {category && (
                                <span className="inline-block text-xs font-semibold text-pink-600 uppercase tracking-wide mb-2">
                                  {category.name[locale]}
                                </span>
                              )}
                              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors leading-tight">
                                {post.title[locale] || post.title.az || post.title.ru}
                              </h3>
                              {post.excerpt[locale] && (
                                <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                  {post.excerpt[locale]}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-semibold text-xs">
                                    {post.author?.[0]?.toUpperCase() || 'A'}
                                  </div>
                                  <span className="font-medium">{post.author || 'Admin'}</span>
                                </div>
                                <span>•</span>
                                <span>
                                  {formatDate(
                                    post.published_at || post.createdAt || Date.now(),
                                    locale,
                                    { day: 'numeric', month: 'long', year: 'numeric' }
                                  )}
                                </span>
                                <span>•</span>
                                <span>{post.readTime || 5} {locale === 'az' ? 'dəq oxuma' : 'мин чтения'}</span>
                              </div>
                            </div>
                          </article>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar - Categories and Newsletter */}
              <div className="lg:col-span-1">
                {/* Categories */}
                {categories.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      {translations.categories || (locale === 'az' ? 'Kateqoriyalar' : 'Категории')}
                    </h3>
                    <div className="space-y-3">
                      {categories.map((category) => {
                        const postCount = categoryCounts[category.id] || 0;
                        return (
                          <Link
                            key={category.id}
                            to={`/category/${category.slug}`}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors group"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{category.icon || '📝'}</span>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-700 group-hover:text-gray-900">
                                  {category.name[locale]}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {postCount} {locale === 'az' ? 'məqalə' : 'статей'}
                                </span>
                              </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Newsletter Form */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 border border-pink-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {translations.newsletter_title || (locale === 'az' ? 'Yeni məqalələrdən xəbərdar olun' : 'Будьте в курсе новых статей')}
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    {translations.newsletter_description || (locale === 'az' 
                      ? 'Həftəlik bülletenə abunə olun və ən yeni məqalələri ilk siz oxuyun'
                      : 'Подпишитесь на еженедельную рассылку и первыми читайте новые статьи')}
                  </p>
                  <NewsletterForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending Posts - Horizontal Scroll */}
      {trendingPosts.length > 0 && (() => {
        const displayedTrending = trendingPosts.slice(trendingIndex, trendingIndex + 3);
        const hasMoreTrending = trendingPosts.length > trendingIndex + 3;
        
        return (
        <section className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              {translations.trending_posts || (locale === 'az' ? 'Trend məqalələr' : 'Популярные статьи')}
            </h2>
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedTrending.map((post) => {
                const category = categories.find(c => c.id === post.categoryId);
                return (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative bg-gray-100 overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      {post.imageUrl ? (
                        <LazyImage 
                          src={post.imageUrl} 
                          alt={post.title[locale]} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          aspectRatio="16/9"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100" style={{ aspectRatio: '16/9' }}>
                          <span className="text-5xl opacity-20">{category?.icon || '📝'}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      {category && (
                        <span className="inline-block text-xs font-semibold text-pink-600 uppercase tracking-wide mb-2">
                          {category.name[locale]}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2 leading-snug">
                        {post.title[locale] || post.title.az || post.title.ru}
                      </h3>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-semibold text-xs">
                            {post.author?.[0]?.toUpperCase() || 'A'}
                          </div>
                          <span className="text-xs text-gray-600 font-medium">
                            {post.author || 'Admin'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {post.readTime || 5} {locale === 'az' ? 'dəq' : 'мин'}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
                })}
              </div>
              
              {/* Navigation buttons for trending posts */}
              {trendingPosts.length > 3 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setTrendingIndex(Math.max(0, trendingIndex - 3))}
                    disabled={trendingIndex === 0}
                    className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ color: '#be185d' }}
                  >
                    {locale === 'az' ? '← Əvvəlki' : '← Предыдущие'}
                  </button>
                  <span className="text-sm text-gray-600">
                    {Math.floor(trendingIndex / 3) + 1} / {Math.ceil(trendingPosts.length / 3)}
                  </span>
                  <button
                    onClick={() => setTrendingIndex(Math.min(trendingPosts.length - 3, trendingIndex + 3))}
                    disabled={!hasMoreTrending}
                    className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ color: '#be185d' }}
                  >
                    {locale === 'az' ? 'Növbəti →' : 'Следующие →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
        );
      })()}

      {/* Forums Section */}
      <section className="bg-gradient-to-br from-pink-50 to-rose-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locale === 'az' ? 'İcma Forumları' : 'Форумы сообщества'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {locale === 'az' 
                ? 'Digər analarla müzakirə edin, suallarınızı verin və təcrübələrinizi paylaşın'
                : 'Обсуждайте с другими мамами, задавайте вопросы и делитесь опытом'}
            </p>
          </div>
          <div className="flex justify-center">
            <Link
              to="/forums"
              className="inline-flex items-center px-8 py-4 bg-pink-600 text-white rounded-xl font-bold text-lg hover:bg-pink-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">💬</span>
              {locale === 'az' ? 'Forumlara Get' : 'Перейти к форумам'}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* In-Content Top Ad - Desktop Only */}
      <AdBanner slug="in-content-top" desktopOnly className="bg-gray-50" />

      {/* Personalized Feed Section */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PersonalizedFeed limit={5} />
        </div>
      </section>
    </>
  );
};

export default HomePage;
