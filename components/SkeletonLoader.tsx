import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'image' | 'card' | 'list';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  count = 1,
  className = '' 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  if (type === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className={`${baseClasses} h-6 w-3/4 mb-4`}></div>
            <div className={`${baseClasses} h-4 w-full mb-2`}></div>
            <div className={`${baseClasses} h-4 w-5/6 mb-4`}></div>
            <div className={`${baseClasses} h-48 w-full rounded-lg`}></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className={`${baseClasses} h-12 w-12 rounded-full`}></div>
            <div className="flex-1 space-y-2">
              <div className={`${baseClasses} h-4 w-3/4`}></div>
              <div className={`${baseClasses} h-3 w-1/2`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div className={`${baseClasses} ${className}`} style={{ aspectRatio: '16/9' }}></div>
    );
  }

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${baseClasses} h-4 w-full mb-2 ${i === count - 1 ? 'w-3/4' : ''}`}></div>
      ))}
    </div>
  );
};

export const BlogCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="animate-pulse bg-gray-200 h-full w-full"></div>
      </div>
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
};

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="animate-pulse space-y-4">
        <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto"></div>
      </div>
    </div>
  );
};

export const PostDetailSkeleton: React.FC = () => {
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
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

