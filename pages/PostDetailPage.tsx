import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { postsService } from '../services/api/posts';
import { categoriesService } from '../services/api/categories';
import { BlogPost, Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translateBlogPost } from '../services/geminiService';
import CommentSection from '../components/Comments/CommentSection';
import PostActions from '../components/PostActions';
import ShareButtons from '../components/ShareButtons';
import SEO from '../components/SEO';
import LazyImage from '../components/LazyImage';
import TableOfContents from '../components/TableOfContents';
import AdBanner from '../components/AdBanner';
import { formatDate } from '../utils/dateFormatter';

const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale, t, setLocale } = useLanguage();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [translating, setTranslating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadPost = async () => {
      setLoading(true);
      if (slug) {
        const foundPost = await db.getPostBySlug(slug);
        setPost(foundPost || null);
        if (foundPost) {
          const cats = await db.getCategories();
          const foundCategory = cats.find(c => c.id === foundPost.categoryId);
          setCategory(foundCategory);
          
          // Load related posts from same category
          if (foundPost.categoryId) {
            try {
              const related = await postsService.getPosts({
                categoryId: foundPost.categoryId,
                status: 'published',
                locale: locale,
                limit: 4,
              });
              // Filter out current post and get 3 related
              const filtered = (related.data || [])
                .filter(p => p.id !== foundPost.id)
                .slice(0, 3);
              setRelatedPosts(filtered);
            } catch (error) {
              console.error('Error loading related posts:', error);
            }
          }
        }
      }
      setLoading(false);
    };
    loadPost();
  }, [slug, locale]);

  const handleTranslate = async () => {
    if (!post) return;
    
    setTranslating(true);
    try {
      const fromLocale = locale;
      const toLocale = locale === 'az' ? 'ru' : 'az';
      
      const translated = await translateBlogPost(
        post.title[fromLocale],
        post.content[fromLocale],
        fromLocale,
        toLocale
      );

      // Update post with translated content
      const updatedPost: Partial<BlogPost> = {
        title: {
          ...post.title,
          [toLocale]: translated.title,
        },
        content: {
          ...post.content,
          [toLocale]: translated.content,
        },
        excerpt: {
          ...post.excerpt,
          [toLocale]: translated.excerpt,
        },
      };

      // Save translated content to database
      await postsService.updatePost(post.id, updatedPost);
      
      // Reload post
      const reloadedPost = await db.getPostBySlug(slug || '');
      if (reloadedPost) {
        setPost(reloadedPost);
      }
      
      // Switch locale
      setLocale(toLocale);
    } catch (error) {
      console.error('Translation error:', error);
      alert(locale === 'az' ? 'Tərcümə zamanı xəta baş verdi' : 'Произошла ошибка при переводе');
    } finally {
      setTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50/30">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/4"></div>
            <div className="h-16 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50/30">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {locale === 'az' ? 'Məqalə tapılmadı' : 'Статья не найдена'}
          </h1>
          <Link to="/" className="text-pink-600 hover:text-pink-700 font-medium">
            {locale === 'az' ? '← Ana səhifəyə qayıt' : '← Вернуться на главную'}
          </Link>
        </div>
      </div>
    );
  }

  const hasTranslation = locale === 'az' ? post.content.ru : post.content.az;

  return (
    <>
      <SEO post={post} locale={locale} />
      
      {/* Hero Section with Image */}
      {post.imageUrl && (
        <div className="relative h-[60vh] min-h-[500px] max-h-[700px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>
          <LazyImage 
            src={post.imageUrl} 
            alt={post.title[locale]} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 z-20 flex items-end">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
              <div className="max-w-4xl">
                {category && (
                  <Link 
                    to={`/category/${category.slug}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 font-semibold text-sm hover:bg-white transition-all mb-6 shadow-lg"
                  >
                    {category.icon && <span className="text-lg">{category.icon}</span>}
                    <span>{category.name[locale]}</span>
                  </Link>
                )}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-2xl">
                  {post.title[locale] || post.title.az || post.title.ru}
                </h1>
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white font-bold">
                      {post.author?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <span className="font-semibold">{post.author || 'Admin'}</span>
                  </div>
                  <span>•</span>
                  <span className="text-sm">
                    {formatDate(
                      post.published_at || post.createdAt || Date.now(),
                      locale,
                      { day: 'numeric', month: 'long', year: 'numeric' }
                    )}
                  </span>
                  <span>•</span>
                  <span className="text-sm">{post.readTime || 5} {locale === 'az' ? 'dəq' : 'мин'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-30">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {/* Main Content */}
            <article className="lg:col-span-3 w-full max-w-full overflow-x-hidden">
              {/* Back Button */}
              <Link 
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-pink-600 font-medium mb-8 transition-colors group"
              >
                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {locale === 'az' ? 'Ana səhifəyə qayıt' : 'Вернуться на главную'}
              </Link>

              {/* Content Card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header - if no image */}
                {!post.imageUrl && (
                  <header className="px-8 pt-8 pb-6 border-b border-gray-100">
                    {category && (
                      <Link 
                        to={`/category/${category.slug}`}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-pink-50 rounded-full text-pink-700 font-semibold text-sm hover:bg-pink-100 transition-all mb-6"
                      >
                        {category.icon && <span className="text-lg">{category.icon}</span>}
                        <span>{category.name[locale]}</span>
                      </Link>
                    )}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                      {post.title[locale] || post.title.az || post.title.ru}
                    </h1>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {post.author?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{post.author || 'Admin'}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>
                              {formatDate(
                                post.published_at || post.createdAt || Date.now(),
                                locale,
                                { day: 'numeric', month: 'long', year: 'numeric' }
                              )}
                            </span>
                            <span>•</span>
                            <span>{post.readTime || 5} {locale === 'az' ? 'dəq oxuma' : 'мин чтения'}</span>
                            {post.viewCount && post.viewCount > 0 && (
                              <>
                                <span>•</span>
                                <span>{post.viewCount} {locale === 'az' ? 'baxış' : 'просмотров'}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleTranslate}
                        disabled={translating}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      >
                        {translating ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>{locale === 'az' ? 'Tərcümə olunur...' : 'Переводится...'}</span>
                          </>
                        ) : (
                          <>
                            <span>🌐</span>
                            <span>
                              {locale === 'az' 
                                ? (hasTranslation ? 'Rus dilinə keç' : 'Rus dilinə tərcümə et')
                                : (hasTranslation ? 'Az dilinə keç' : 'Az dilinə tərcümə et')}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </header>
                )}

                {/* Featured Image - if no hero image */}
                {!post.imageUrl && post.imageUrl && (
                  <div className="relative h-96 overflow-hidden">
                    <LazyImage 
                      src={post.imageUrl} 
                      alt={post.title[locale]} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}

                {/* Content */}
                <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-12 overflow-x-hidden">
                  {/* Native Ad Top */}
                  <div className="mb-8">
                    <AdBanner slug="native-article-top" native className="w-full" />
                  </div>

                  {/* Table of Contents - Above Content */}
                  <div className="mb-6 sm:mb-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-200">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">
                        {locale === 'az' ? 'Məzmun' : 'Содержание'}
                      </h3>
                    </div>
                    <TableOfContents 
                      content={post.content[locale] || post.content.az || post.content.ru || ''} 
                      locale={locale}
                    />
                  </div>

                  {/* Article Content */}
                  <div 
                    className="prose prose-sm sm:prose-base md:prose-lg prose-pink max-w-none text-gray-700 leading-relaxed mb-8 sm:mb-12 overflow-x-hidden
                      prose-headings:font-extrabold prose-headings:text-gray-900 
                      prose-h1:text-2xl sm:prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:mt-8 sm:prose-h1:mt-12 md:prose-h1:mt-16 prose-h1:mb-4 sm:prose-h1:mb-6 md:prose-h1:mb-8 prose-h1:leading-tight prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-3 sm:prose-h1:pb-4
                      prose-h2:text-xl sm:prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-8 sm:prose-h2:mt-10 md:prose-h2:mt-12 prose-h2:mb-4 sm:prose-h2:mb-5 md:prose-h2:mb-6 prose-h2:leading-tight prose-h2:font-bold
                      prose-h3:text-lg sm:prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-6 sm:prose-h3:mt-8 md:prose-h3:mt-10 prose-h3:mb-3 sm:prose-h3:mb-4 md:prose-h3:mb-5 prose-h3:leading-snug prose-h3:font-semibold
                      prose-h4:text-base sm:prose-h4:text-lg md:prose-h4:text-xl prose-h4:mt-5 sm:prose-h4:mt-6 md:prose-h4:mt-8 prose-h4:mb-3 sm:prose-h4:mb-4 prose-h4:font-semibold
                      prose-h5:text-sm sm:prose-h5:text-base md:prose-h5:text-lg prose-h5:mt-4 sm:prose-h5:mt-5 md:prose-h5:mt-6 prose-h5:mb-2 sm:prose-h5:mb-3 prose-h5:font-semibold
                      prose-h6:text-sm sm:prose-h6:text-base prose-h6:mt-3 sm:prose-h6:mt-4 prose-h6:mb-2 prose-h6:font-semibold
                      prose-p:text-sm sm:prose-p:text-base md:prose-p:text-lg prose-p:mb-4 sm:prose-p:mb-5 md:prose-p:mb-6 prose-p:leading-relaxed prose-p:text-gray-700 prose-p:break-words
                      prose-a:text-pink-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:transition-all prose-a:break-all
                      prose-strong:text-gray-900 prose-strong:font-bold
                      prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-6 sm:prose-img:my-8 md:prose-img:my-12 prose-img:w-full prose-img:max-w-full prose-img:h-auto prose-img:mx-auto
                      prose-ul:list-disc prose-ul:pl-4 sm:prose-ul:pl-6 md:prose-ul:pl-8 prose-ul:my-4 sm:prose-ul:my-5 md:prose-ul:my-6 prose-ul:space-y-2
                      prose-ol:list-decimal prose-ol:pl-4 sm:prose-ol:pl-6 md:prose-ol:pl-8 prose-ol:my-4 sm:prose-ol:my-5 md:prose-ol:my-6
                      prose-li:my-1 sm:prose-li:my-2 prose-li:text-sm sm:prose-li:text-base md:prose-li:text-lg prose-li:leading-relaxed prose-li:break-words
                      prose-blockquote:border-l-4 prose-blockquote:border-pink-500 prose-blockquote:pl-3 sm:prose-blockquote:pl-4 md:prose-blockquote:pl-6 prose-blockquote:pr-2 sm:prose-blockquote:pr-3 md:prose-blockquote:pr-4 prose-blockquote:py-3 sm:prose-blockquote:py-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:bg-pink-50 prose-blockquote:rounded-r-lg prose-blockquote:my-5 sm:prose-blockquote:my-6 md:prose-blockquote:my-8 prose-blockquote:text-sm sm:prose-blockquote:text-base
                      prose-code:bg-gray-100 prose-code:px-1.5 sm:prose-code:px-2 prose-code:py-0.5 sm:prose-code:py-1 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm prose-code:font-mono prose-code:text-pink-700 prose-code:break-all
                      prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-3 sm:prose-pre:p-4 md:prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:my-5 sm:prose-pre:my-6 md:prose-pre:my-8 prose-pre:text-xs sm:prose-pre:text-sm
                      prose-hr:my-6 sm:prose-hr:my-8 md:prose-hr:my-12 prose-hr:border-gray-200
                      prose-table:w-full prose-table:max-w-full prose-table:overflow-x-auto prose-table:my-5 sm:prose-table:my-6 md:prose-table:my-8 prose-table:border-collapse prose-table:text-sm sm:prose-table:text-base
                      prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-2 sm:prose-th:px-3 md:prose-th:px-4 prose-th:py-1.5 sm:prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-xs sm:prose-th:text-sm md:prose-th:text-base
                      prose-td:border prose-td:border-gray-300 prose-td:px-2 sm:prose-td:px-3 md:prose-td:px-4 prose-td:py-1.5 sm:prose-td:py-2 prose-td:text-xs sm:prose-td:text-sm md:prose-td:text-base prose-td:break-words"
                    dangerouslySetInnerHTML={{ __html: post.content[locale] || post.content.az || post.content.ru || '' }}
                  />

                  {/* Native Ad Middle */}
                  <div className="my-6 sm:my-8 md:my-12">
                    <AdBanner slug="native-article-middle" native className="w-full" />
                  </div>

                  {/* Actions */}
                  <div className="my-6 sm:my-8 md:my-12 pt-6 sm:pt-8 border-t border-gray-200">
                    <PostActions post={post} />
                  </div>

                  {/* Share Buttons */}
                  <div className="mb-6 sm:mb-8 md:mb-12 pb-6 sm:pb-8 border-b border-gray-200">
                    <ShareButtons post={post} />
                  </div>
                </div>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-8 sm:mt-10 md:mt-12">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                    {locale === 'az' ? 'Oxşar Məqalələr' : 'Похожие статьи'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {relatedPosts.map((relatedPost) => {
                      const relatedCategory = category;
                      return (
                        <Link
                          key={relatedPost.id}
                          to={`/blog/${relatedPost.slug}`}
                          className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-pink-300 hover:shadow-xl transition-all duration-300"
                        >
                          <div className="relative h-48 bg-gray-100 overflow-hidden">
                            {relatedPost.imageUrl ? (
                              <LazyImage
                                src={relatedPost.imageUrl}
                                alt={relatedPost.title[locale]}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
                                <span className="text-5xl opacity-30">{relatedCategory?.icon || '📝'}</span>
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            {relatedCategory && (
                              <span className="inline-block text-xs font-semibold text-pink-600 uppercase tracking-wide mb-2">
                                {relatedCategory.name[locale]}
                              </span>
                            )}
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                              {relatedPost.title[locale] || relatedPost.title.az || relatedPost.title.ru}
                            </h3>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>
                                {formatDate(
                                  relatedPost.published_at || relatedPost.createdAt || Date.now(),
                                  locale,
                                  { day: 'numeric', month: 'short' }
                                )}
                              </span>
                              <span>•</span>
                              <span>{relatedPost.readTime || 5} {locale === 'az' ? 'dəq' : 'мин'}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="mt-8 sm:mt-10 md:mt-12 bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-12">
                <CommentSection postId={post.id} />
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-8">
              {/* Sticky Sidebar */}
              <div className="lg:sticky lg:top-8 space-y-8">
                {/* Native Sidebar Ad */}
                <div>
                  <AdBanner slug="native-sidebar" native className="w-full" />
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {locale === 'az' ? 'Statistika' : 'Статистика'}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{locale === 'az' ? 'Oxuma müddəti' : 'Время чтения'}</span>
                      <span className="font-bold text-gray-900">{post.readTime || 5} {locale === 'az' ? 'dəq' : 'мин'}</span>
                    </div>
                    {post.viewCount && post.viewCount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{locale === 'az' ? 'Baxış sayı' : 'Просмотры'}</span>
                        <span className="font-bold text-gray-900">{post.viewCount}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{locale === 'az' ? 'Yayım tarixi' : 'Дата публикации'}</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {formatDate(
                          post.published_at || post.createdAt || Date.now(),
                          locale,
                          { day: 'numeric', month: 'short', year: 'numeric' }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostDetailPage;
