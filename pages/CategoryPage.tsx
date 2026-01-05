import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { categoriesService } from '../services/api/categories';
import { BlogPost, Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import BlogCard from '../components/BlogCard';
import { BlogCardSkeleton } from '../components/SkeletonLoader';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale, t } = useLanguage();
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [slug, locale]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: categoryData } = await categoriesService.getCategoryBySlug(slug || '');
      setCategory(categoryData || null);

      const allPosts = await db.getPosts();
      const categoryPosts = categoryData
        ? allPosts.filter(p => p.categoryId === categoryData.id && p.status === 'published')
        : [];
      setPosts(categoryPosts);
    } catch (error) {
      console.error('Error loading category page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12 animate-pulse">
            <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {locale === 'az' ? 'Kateqoriya tapılmadı' : 'Категория не найдена'}
          </h1>
          <Link
            to="/"
            className="text-pink-600 hover:text-pink-700 font-semibold"
          >
            {locale === 'az' ? '← Ana səhifəyə qayıt' : '← Вернуться на главную'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl mb-4 ${category.color}`}>
            {category.icon || '📁'}
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {category.name[locale]}
          </h1>
          <p className="text-xl text-gray-600">
            {locale === 'az' 
              ? `${posts.length} məqalə` 
              : `${posts.length} статей`}
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {locale === 'az' 
                ? 'Bu kateqoriyada hələ məqalə yoxdur' 
                : 'В этой категории пока нет статей'}
            </p>
            <Link
              to="/"
              className="mt-4 inline-block text-pink-600 hover:text-pink-700 font-semibold"
            >
              {locale === 'az' ? '← Bütün məqalələr' : '← Все статьи'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
