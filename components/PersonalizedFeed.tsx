import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { recommendationsService } from '../services/api/recommendations';
import { BlogPost } from '../types';
import BlogCard from './BlogCard';
import { categoriesService } from '../services/api/categories';
import { Category } from '../types';

interface PersonalizedFeedProps {
  limit?: number;
}

const PersonalizedFeed: React.FC<PersonalizedFeedProps> = ({ limit = 5 }) => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [recommendationsRes, categoriesRes] = await Promise.all([
          recommendationsService.getRecommendedPosts(user.id, limit),
          categoriesService.getCategories(),
        ]);

        if (!recommendationsRes.error) {
          setPosts(recommendationsRes.data || []);
        }

        // Create category map
        const catMap: Record<string, Category> = {};
        (categoriesRes.data || []).forEach(cat => {
          catMap[cat.id] = cat;
        });
        setCategories(catMap);
      } catch (error) {
        console.error('Error loading personalized feed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [user, limit]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-48"></div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {locale === 'az' ? 'Sizin üçün tövsiyə olunur' : 'Рекомендуется для вас'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <BlogCard
            key={post.id}
            post={post}
            category={categories[post.categoryId]}
          />
        ))}
      </div>
    </div>
  );
};

export default PersonalizedFeed;

