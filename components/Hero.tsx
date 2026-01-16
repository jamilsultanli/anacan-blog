import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translationService } from '../services/translations';
import { categoriesService } from '../services/api/categories';
import { storiesService } from '../services/api/stories';
import { Category } from '../types';
import Stories from './Stories';

const Hero: React.FC = () => {
  const { locale } = useLanguage();
  const [heroContent, setHeroContent] = useState({
    title: '',
    subtitle: '',
    cta: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasStories, setHasStories] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const translations = await translationService.getTranslations(locale, 'hero');
        const [catsResponse, storiesResponse] = await Promise.all([
          categoriesService.getCategories(),
          storiesService.getStories(true),
        ]);
        
        const cats = catsResponse.data || [];
        setCategories(cats);
        
        // Check if there are any stories
        const stories = storiesResponse.data || [];
        setHasStories(stories.length > 0);

        setHeroContent({
          title: translations.hero_title || (locale === 'az' 
            ? 'Hər gün ən maraqlı ana və körpə mövzularını müzakirə edirik'
            : 'Каждый день обсуждаем самые интересные темы для мам и малышей'),
          subtitle: translations.hero_subtitle || (locale === 'az'
            ? 'Hamiləlikdən körpə baxımına, tərbiyədən sağlamlığa qədər - peşəkar məsləhətlər və faydalı məlumatlar'
            : 'От беременности до ухода за малышом, от воспитания до здоровья - профессиональные советы и полезная информация'),
          cta: translations.hero_cta || (locale === 'az' ? 'Kəşf et' : 'Исследовать'),
        });
      } catch (error) {
        console.error('Error loading hero content:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [locale]);

  if (loading) {
    return (
      <div className="w-full bg-white min-h-[500px] flex items-center">
        <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-xl w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded-xl w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="w-full bg-white overflow-x-hidden">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Main Hero - Airbnb Style */}
        <div className="text-center mb-8 md:mb-16 px-2 sm:px-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-display-1 font-display font-bold text-gray-900 mb-4 md:mb-6 leading-tight px-2 sm:px-0">
            {heroContent.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-6 md:mb-10 leading-relaxed px-4 sm:px-0">
            {heroContent.subtitle}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Link 
              to="/blog"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-coral-500 text-white rounded-full font-semibold text-sm sm:text-base hover:bg-coral-600 transition-all duration-200 shadow-airbnb hover:shadow-airbnb-lg transform hover:scale-105 text-center"
            >
              {heroContent.cta}
            </Link>
            <Link 
              to="/forums"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-full font-semibold text-sm sm:text-base hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md text-center"
            >
              {locale === 'az' ? 'Forumlara bax' : 'Посмотреть форумы'}
            </Link>
          </div>
        </div>

        {/* Category Grid - Airbnb Style */}
        {categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12 lg:mb-16 px-2 sm:px-0">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group flex flex-col items-center p-4 sm:p-6 rounded-airbnb-lg border border-gray-200 hover:border-gray-300 hover:shadow-airbnb transition-all duration-200 bg-white"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-coral-100 to-pink-100 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl sm:text-3xl">{category.icon || '📝'}</span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 text-center group-hover:text-coral-500 transition-colors leading-tight">
                  {category.name[locale]}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Stories Section - Only show if stories exist */}
        {hasStories && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {locale === 'az' ? 'Hekayələr' : 'Истории'}
              </h2>
              <Link 
                to="/stories"
                className="text-sm font-semibold text-coral-500 hover:text-coral-600 transition-colors"
              >
                {locale === 'az' ? 'Hamısını gör' : 'Посмотреть все'} →
              </Link>
            </div>
            
            <div className="hidden md:block lg:hidden">
              <Stories limit={6} />
            </div>
            <div className="hidden lg:block">
              <Stories limit={12} />
            </div>
            <div className="block md:hidden">
              <Stories limit={4} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;