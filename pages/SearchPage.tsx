import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { postsService } from '../services/api/posts';
import { categoriesService } from '../services/api/categories';
import { BlogPost, Category } from '../types';
import LazyImage from '../components/LazyImage';
import SEO from '../components/SEO';
import { formatDate } from '../utils/dateFormatter';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { locale } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      searchPosts(query);
    }
  }, [query, locale]);

  const searchPosts = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await postsService.getPosts({
        status: 'published',
        locale: locale,
        search: searchQuery,
        limit: 100,
      });
      setPosts(response.data || []);
      
      const catsResponse = await categoriesService.getCategories();
      setCategories(catsResponse.data || []);
    } catch (error) {
      console.error('Error searching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO locale={locale} />
      <div className="min-h-screen bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {locale === 'az' ? 'Axtarış Nəticələri' : 'Результаты поиска'}
            {query && (
              <span className="text-pink-600">: "{query}"</span>
            )}
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
            </div>
          ) : posts.length > 0 ? (
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
                      <div className="md:w-64 flex-shrink-0">
                        <div className="relative h-48 md:h-40 rounded-xl bg-gray-100 overflow-hidden">
                          {post.imageUrl ? (
                            <LazyImage
                              src={post.imageUrl}
                              alt={post.title[locale]}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
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
          ) : query ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">
                {locale === 'az' ? 'Axtarış nəticəsi tapılmadı' : 'Результаты поиска не найдены'}
              </p>
              <p className="text-gray-400 text-sm">
                {locale === 'az' ? 'Başqa açar sözlərlə cəhd edin' : 'Попробуйте другие ключевые слова'}
              </p>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {locale === 'az' ? 'Axtarış sorğusu daxil edin' : 'Введите поисковый запрос'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;

