import React, { memo } from 'react';
import { BlogPost } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import LazyImage from './LazyImage';
import { formatDate } from '../utils/dateFormatter';

interface FeaturedPostProps {
  post: BlogPost;
  onClick: () => void;
}

const FeaturedPost: React.FC<FeaturedPostProps> = memo(({ post, onClick }) => {
  const { locale } = useLanguage();

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
      onClick={onClick}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Image Side */}
        <div className="relative h-64 lg:h-80 bg-gray-100 overflow-hidden">
          {post.imageUrl ? (
            <LazyImage 
              src={post.imageUrl} 
              alt={post.title[locale]} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <span className="text-7xl opacity-20">📝</span>
            </div>
          )}
        </div>

        {/* Content Side */}
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          {/* Meta */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <span>{formatDate(post.published_at || post.createdAt || Date.now(), locale, { day: 'numeric', month: 'long' })}</span>
            <span>•</span>
            <span>{post.readTime || 5} {locale === 'az' ? 'dəq oxuma' : 'мин чтения'}</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 group-hover:text-pink-600 transition-colors leading-tight">
            {post.title[locale] || post.title.az || post.title.ru}
          </h2>

          {/* Excerpt */}
          {post.excerpt[locale] && (
            <p className="text-gray-600 mb-6 text-base leading-relaxed line-clamp-3">
              {post.excerpt[locale]}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-semibold text-sm">
                {post.author?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {post.author || 'Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

FeaturedPost.displayName = 'FeaturedPost';

export default FeaturedPost;
