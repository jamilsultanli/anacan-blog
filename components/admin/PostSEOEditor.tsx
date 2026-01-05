import React, { useState, useEffect } from 'react';
import { BlogPost } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { calculateSEOScore, SEOScoreResult } from '../../utils/seoScoreCalculator';
import { seoContentGenerator } from '../../services/seoContentGenerator';
import SEOScore from './SEOScore';
import MetaTagsEditor from './MetaTagsEditor';

interface PostSEOEditorProps {
  post: BlogPost;
  onUpdate: (updates: Partial<BlogPost>) => void;
}

const PostSEOEditor: React.FC<PostSEOEditorProps> = ({ post, onUpdate }) => {
  const { locale } = useLanguage();
  const [focusKeyword, setFocusKeyword] = useState('');
  const [seoScore, setSeoScore] = useState<SEOScoreResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const score = calculateSEOScore(post, locale, focusKeyword || undefined);
    setSeoScore(score);
  }, [post, locale, focusKeyword]);

  const handleGenerateMeta = async () => {
    setLoading(true);
    try {
      const metaTags = await seoContentGenerator.generateMetaTags(
        post.title[locale],
        post.content[locale],
        locale,
        focusKeyword ? [focusKeyword] : undefined
      );
      
      onUpdate({
        title: locale === 'az' 
          ? { az: metaTags.metaTitle, ru: post.title.ru }
          : { az: post.title.az, ru: metaTags.metaTitle },
        excerpt: locale === 'az'
          ? { az: metaTags.metaDescription, ru: post.excerpt.ru }
          : { az: post.excerpt.az, ru: metaTags.metaDescription },
      });
    } catch (error) {
      console.error('Error generating meta tags:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {locale === 'az' ? 'SEO Parametrləri' : 'SEO Параметры'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'az' ? 'Fokus Açar Söz' : 'Фокусное ключевое слово'}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder={locale === 'az' ? 'Əsas açar söz' : 'Основное ключевое слово'}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <button
                onClick={handleGenerateMeta}
                disabled={loading}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors disabled:opacity-50 text-sm"
              >
                {loading
                  ? (locale === 'az' ? 'Yaradılır...' : 'Создание...')
                  : (locale === 'az' ? 'Meta Yarad' : 'Создать мета')}
              </button>
            </div>
          </div>

          {seoScore && <SEOScore score={seoScore} locale={locale} />}
        </div>
      </div>

      <MetaTagsEditor post={post} onUpdate={onUpdate} />
    </div>
  );
};

export default PostSEOEditor;

