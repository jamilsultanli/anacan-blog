import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pagesService, Page } from '../services/api/pages';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';

const StaticPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useLanguage();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const { data } = await pagesService.getPageBySlug(slug);
        setPage(data || null);
      } catch (error) {
        console.error('Error loading page:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50/30">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50/30">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {locale === 'az' ? 'Səhifə tapılmadı' : 'Страница не найдена'}
          </h1>
          <Link to="/" className="text-pink-600 hover:text-pink-700 font-medium">
            {locale === 'az' ? '← Ana səhifəyə qayıt' : '← Вернуться на главную'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={page.metaTitle?.[locale] || page.title[locale]}
        description={page.metaDescription?.[locale]}
        locale={locale}
      />
      <div className="min-h-screen bg-beige-50/30 py-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link 
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-pink-600 font-medium mb-8 transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {locale === 'az' ? 'Ana səhifəyə qayıt' : 'Вернуться на главную'}
          </Link>

          {/* Title */}
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6">
              {page.title[locale] || page.title.az || page.title.ru}
            </h1>
            <div className="h-1 w-24 bg-pink-300 rounded-full"></div>
          </header>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12 prose-headings:font-bold prose-headings:text-gray-800 prose-a:text-pink-600 prose-strong:text-gray-800 prose-img:rounded-2xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: page.content[locale] || page.content.az || page.content.ru || '' }}
          />
        </article>
      </div>
    </>
  );
};

export default StaticPage;

