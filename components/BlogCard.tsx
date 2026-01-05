import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import LazyImage from './LazyImage';
import { formatDate } from '../utils/dateFormatter';

interface BlogCardProps {
  post: BlogPost;
  category?: Category;
}

const BlogCard: React.FC<BlogCardProps> = memo(({ post, category }) => {
  const { locale, t } = useLanguage();

  return (
    <Link 
      to={`/blog/${post.slug}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100"
    >
      {/* Image Section */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
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
        
        {/* Category Badge */}
        {category && (
          <div className="absolute top-4 left-4">
            <span className="inline-block bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 shadow-sm">
              {category.name[locale]}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Meta Info */}
        <div className="flex items-center text-gray-500 text-xs mb-4 space-x-2">
          <span>{formatDate(post.published_at || post.createdAt || Date.now(), locale, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>•</span>
          <span>{post.readTime || 5} {locale === 'az' ? 'dəq' : 'мин'}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors leading-snug line-clamp-2">
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
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-semibold text-xs">
              {post.author?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {post.author || 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});

BlogCard.displayName = 'BlogCard';

export default BlogCard;
