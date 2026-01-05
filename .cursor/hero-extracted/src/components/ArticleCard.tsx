import { Calendar, Clock } from 'lucide-react@0.487.0';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ArticleCardProps {
  image: string;
  category: string;
  title: string;
  excerpt?: string;
  date?: string;
  readTime?: string;
  author?: string;
  variant?: 'default' | 'horizontal';
}

export function ArticleCard({ 
  image, 
  category, 
  title, 
  excerpt, 
  date, 
  readTime,
  author,
  variant = 'default'
}: ArticleCardProps) {
  if (variant === 'horizontal') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
        <div className="flex gap-4 p-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <ImageWithFallback 
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-2 py-1 bg-pink-50 text-pink-600 text-xs rounded">
                {category}
              </span>
            </div>
            
            <h3 className="text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-500 transition-colors">
              {title}
            </h3>
            
            {excerpt && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {author && <span className="text-pink-500">{author}</span>}
              {date && (
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {date}
                </span>
              )}
              {readTime && (
                <>
                  <span>•</span>
                  <span>{readTime}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <ImageWithFallback 
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block px-2 py-1 bg-pink-50 text-pink-600 text-xs rounded">
            {category}
          </span>
        </div>
        
        <h3 className="text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-500 transition-colors">
          {title}
        </h3>
        
        {excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {excerpt}
          </p>
        )}
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {author && <span className="text-pink-500">{author}</span>}
          {date && (
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {date}
            </span>
          )}
          {readTime && (
            <>
              <span>•</span>
              <span>{readTime}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
