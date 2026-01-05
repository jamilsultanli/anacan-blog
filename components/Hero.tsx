import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translationService } from '../services/translations';
import { categoriesService } from '../services/api/categories';
import { postsService } from '../services/api/posts';
import { Category, BlogPost } from '../types';
import Stories from './Stories';
import LazyImage from './LazyImage';
import AdBanner from './AdBanner';

const Hero: React.FC = () => {
  const { locale, t } = useLanguage();
  const [heroContent, setHeroContent] = useState({
    title: '',
    subtitle: '',
    cta: '',
    aboutTitle: '',
    aboutText: '',
    popularTopics: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        // Load translations
        const translations = await translationService.getTranslations(locale, 'hero');
        
        // Load categories and posts
        const [catsResponse, postsResponse] = await Promise.all([
          categoriesService.getCategories(),
          postsService.getPosts({ 
            status: 'published',
            locale: locale,
            limit: 20
          })
        ]);
        
        const cats = catsResponse.data || [];
        const allPosts = postsResponse.data || [];
        
        setCategories(cats);
        
        // Top 4 categories
        setTopCategories(cats.slice(0, 4));

        setHeroContent({
          title: translations.hero_title || (locale === 'az' 
            ? 'Hər gün ən maraqlı ana və körpə mövzularını müzakirə edirik'
            : 'Каждый день обсуждаем самые интересные темы для мам и малышей'),
          subtitle: translations.hero_subtitle || (locale === 'az'
            ? 'Hamiləlikdən körpə baxımına, tərbiyədən sağlamlığa qədər - peşəkar məsləhətlər və faydalı məlumatlar'
            : 'От беременности до ухода за малышом, от воспитания до здоровья - профессиональные советы и полезная информация'),
          cta: translations.hero_cta || (locale === 'az' ? 'Məqalələrə bax' : 'Посмотреть статьи'),
          aboutTitle: translations.hero_about_title || (locale === 'az' ? 'Bizimlə Tanış Olun' : 'Познакомьтесь с нами'),
          aboutText: translations.hero_about_text || (locale === 'az'
            ? 'Azərbaycanda analıq və uşaq baxımı mövzusunda ən böyük online platformadır.'
            : 'Самая большая онлайн-платформа по материнству и уходу за детьми в Азербайджане.'),
          popularTopics: translations.hero_popular_topics || (locale === 'az' ? 'Populyar Mövzular' : 'Популярные темы')
        });
      } catch (error) {
        console.error('Error loading hero content:', error);
        // Use fallback content
        setHeroContent({
          title: locale === 'az' 
            ? 'Hər gün ən maraqlı ana və körpə mövzularını müzakirə edirik'
            : 'Каждый день обсуждаем самые интересные темы для мам и малышей',
          subtitle: locale === 'az'
            ? 'Hamiləlikdən körpə baxımına, tərbiyədən sağlamlığa qədər - peşəkar məsləhətlər və faydalı məlumatlar'
            : 'От беременности до ухода за малышом, от воспитания до здоровья - профессиональные советы и полезная информация',
          cta: locale === 'az' ? 'Məqalələrə bax' : 'Посмотреть статьи',
          aboutTitle: locale === 'az' ? 'Bizimlə Tanış Olun' : 'Познакомьтесь с нами',
          aboutText: locale === 'az'
            ? 'Azərbaycanda analıq və uşaq baxımı mövzusunda ən böyük online platformadır.'
            : 'Самая большая онлайн-платформа по материнству и уходу за детьми в Азербайджане.',
          popularTopics: locale === 'az' ? 'Populyar Mövzular' : 'Популярные темы'
        });
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [locale]);

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-b from-white to-[#F9F5FF]/30 min-h-[600px] flex items-center">
        <div className="max-w-[1200px] mx-auto px-6 w-full">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: Category) => {
    // Map category icons or use emoji
    return category.icon || '📝';
  };

  return (
    <div className="w-full bg-gradient-to-b from-white to-[#F9F5FF]/30">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Main Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">
          {/* Left Content Area */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#E8DEFF] via-[#D4C5E8] to-[#C9B3E0] rounded-2xl p-8 flex flex-col justify-between shadow-lg">
            <div className="space-y-5">
              <h1 className="text-3xl lg:text-4xl leading-tight text-gray-900">
                {heroContent.title.split(' ').map((word, i, arr) => {
                  const isHighlight = word.toLowerCase().includes('ana') || word.toLowerCase().includes('мамы');
                  return (
                    <React.Fragment key={i}>
                      {isHighlight ? (
                        <span className="text-pink-500">{word} </span>
                      ) : (
                        <>{word} </>
                      )}
                    </React.Fragment>
                  );
                })}
              </h1>
              
              <p className="text-base text-gray-700 leading-relaxed">
                {heroContent.subtitle}
              </p>
              
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                  <span className="text-[#7F56D9] text-lg">❤️</span>
                </div>
                <div className="w-10 h-10 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                  <span className="text-[#7F56D9] text-lg">👶</span>
                </div>
                <div className="w-10 h-10 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                  <span className="text-[#7F56D9] text-lg">👥</span>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <div className="text-xl text-gray-900">5+</div>
                  <div className="text-xs text-gray-600">{locale === 'az' ? 'İl təcrübə' : 'Лет опыта'}</div>
                </div>
                <div className="h-10 w-px bg-white/30"></div>
                <div>
                  <div className="text-xl text-gray-900">{categories.length}+</div>
                  <div className="text-xs text-gray-600">{locale === 'az' ? 'Mütəxəssis' : 'Специалистов'}</div>
                </div>
                <div className="h-10 w-px bg-white/30"></div>
                <div>
                  <div className="text-xl text-gray-900">24/7</div>
                  <div className="text-xs text-gray-600">{locale === 'az' ? 'Dəstək' : 'Поддержка'}</div>
                </div>
              </div>
            </div>

            <Link 
              to="/category/pregnancy"
              className="mt-6 bg-white text-gray-900 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105 w-fit group"
            >
              <span>{heroContent.cta}</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Center Ad Banner */}
          <div className="lg:col-span-4 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-pink-200 shadow-lg relative group p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[200px] md:min-h-[250px] lg:min-h-[300px]">
            <AdBanner slug="hero-center" className="w-full h-full" />
            {/* Fallback emoji if no ad - only show when AdBanner returns null */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="text-center opacity-30">
                <div className="text-6xl md:text-8xl lg:text-9xl mb-4">🤰</div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-pink-400 rounded-full flex items-center justify-center shadow-lg pointer-events-none z-10">
              <span className="text-white text-lg md:text-xl lg:text-2xl">❤️</span>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* About Card */}
            <div className="bg-gradient-to-br from-[#E8DEFF] to-[#D4C5E8] rounded-2xl p-5 shadow-lg">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-white ring-4 ring-white/50 flex items-center justify-center">
                <span className="text-5xl">👶</span>
              </div>
              
              <h3 className="text-base text-gray-900 mb-2 text-center">{heroContent.aboutTitle}</h3>
              <p className="text-xs text-gray-700 leading-relaxed text-center">
                {heroContent.aboutText}
              </p>
            </div>

            {/* Topics Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg">
              <h3 className="text-base text-gray-900 mb-3">{heroContent.popularTopics}</h3>
              
              <div className="space-y-2">
                {categories.slice(0, 4).map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F9F5FF] transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#E8DEFF] to-[#D4C5E8] rounded-lg flex items-center justify-center">
                      <span className="text-[#7F56D9] text-sm">{getCategoryIcon(category)}</span>
                    </div>
                    <span className="text-xs text-gray-700 group-hover:text-[#7F56D9] transition-colors">
                      {category.name[locale]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stories Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl text-gray-900">
              {locale === 'az' ? 'Hekayələr' : 'Истории'}
            </h2>
          </div>
          
          {/* Stories - Responsive: Desktop 12, Tablet 6, Mobile 4 */}
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

      </div>
    </div>
  );
};

export default Hero;
