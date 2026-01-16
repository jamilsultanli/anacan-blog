import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import LazyImage from './LazyImage';
import { formatDate } from '../utils/dateFormatter';

interface BlogCardProps {
  post: BlogPost;
  category?: Category;
  featured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = memo(({ post, category, featured = false }) => {
  const { locale } = useLanguage();

  return (
    <Link 
      to={`/blog/${post.slug}`}
      className="group block bg-white rounded-airbnb-xl overflow-hidden hover:shadow-airbnb-lg transition-all duration-300 h-full flex flex-col border border-gray-100"
    >
      {/* Image Section */}
      <div className="relative bg-gray-100 overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {post.imageUrl ? (
          <LazyImage 
            src={post.imageUrl} 
            alt={post.title[locale]} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            aspectRatio="16/9"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100" style={{ aspectRatio: '16/9' }}>
            <span className="text-6xl opacity-20">{category?.icon || '📝'}</span>
          </div>
        )}
        
        {/* Category Badge - Top Left */}
        {category && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
              {category.icon && <span className="text-sm">{category.icon}</span>}
              <span>{category.name[locale]}</span>
            </span>
          </div>
        )}

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 bg-coral-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              <span>⭐</span>
              <span>{locale === 'az' ? 'Seçilmiş' : 'Избранное'}</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Meta Info */}
        <div className="flex items-center text-gray-500 text-xs mb-3 space-x-2">
          <span className="font-medium">
            {formatDate(post.published_at || post.createdAt || Date.now(), locale, { 
              day: 'numeric', 
              month: 'short' 
            })}
          </span>
          <span>•</span>
          <span>{post.readTime || 5} {locale === 'az' ? 'dəq oxuma' : 'мин чтения'}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-coral-500 transition-colors leading-snug line-clamp-2">
          {post.title[locale] || post.title.az || post.title.ru}
        </h3>

        {/* Excerpt */}
        {post.excerpt[locale] && (
          <p className="text-gray-600 mb-6 flex-grow line-clamp-3 leading-relaxed text-sm">
            {post.excerpt[locale]}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-pink-500 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              {post.author?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900">
                {post.author || 'Admin'}
              </span>
              <span className="text-xs text-gray-500">
                {locale === 'az' ? 'Müəllif' : 'Автор'}
              </span>
            </div>
          </div>
          
          {/* Read More Arrow */}
          <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-coral-500 group-hover:text-white flex items-center justify-center transition-all duration-200">
            <svg className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
});

BlogCard.displayName = 'BlogCard';

export default BlogCard;