import React, { useState } from 'react';
import { seoContentGenerator } from '../../services/seoContentGenerator';
import { BlogPost } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { SEOOptimizationResult } from '../../services/seoContentGenerator';

interface ContentOptimizerProps {
  post: BlogPost;
  onOptimized?: (optimized: Partial<BlogPost>) => void;
}

const ContentOptimizer: React.FC<ContentOptimizerProps> = ({ post, onOptimized }) => {
  const { locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOOptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const optimization = await seoContentGenerator.optimizeExistingPost(post, locale);
      setResult(optimization);
    } catch (err) {
      setError(err instanceof Error ? err.message : (locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result && onOptimized) {
      onOptimized({
        title: result.optimizedTitle,
        excerpt: result.optimizedMetaDescription,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          {locale === 'az' ? 'SEO Optimizasiyası' : 'SEO Оптимизация'}
        </h3>
        <button
          onClick={handleOptimize}
          disabled={loading}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors disabled:opacity-50 text-sm"
        >
          {loading
            ? (locale === 'az' ? 'Analiz edilir...' : 'Анализ...')
            : (locale === 'az' ? 'Optimizasiya Et' : 'Оптимизировать')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900">
                {locale === 'az' ? 'SEO Skoru' : 'SEO Оценка'}
              </h4>
              <div className="flex items-center space-x-2 mt-2">
                <div className="text-3xl font-bold text-pink-600">{result.score}</div>
                <div className="text-gray-500">/ 100</div>
              </div>
            </div>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-sm"
            >
              {locale === 'az' ? 'Tətbiq Et' : 'Применить'}
            </button>
          </div>

          {result.optimizedTitle && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">
                {locale === 'az' ? 'Optimizasiyalı Başlıq' : 'Оптимизированный заголовок'}
              </h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {result.optimizedTitle[locale]}
              </p>
            </div>
          )}

          {result.optimizedMetaDescription && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">
                {locale === 'az' ? 'Optimizasiyalı Meta Description' : 'Оптимизированное мета описание'}
              </h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {result.optimizedMetaDescription[locale]}
              </p>
            </div>
          )}

          {result.issues.length > 0 && (
            <div>
              <h4 className="font-bold text-red-600 mb-2">
                {locale === 'az' ? 'Problemlər' : 'Проблемы'}
              </h4>
              <ul className="space-y-1">
                {result.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-red-700 flex items-start">
                    <span className="mr-2">⚠️</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div>
              <h4 className="font-bold text-blue-600 mb-2">
                {locale === 'az' ? 'Təkliflər' : 'Предложения'}
              </h4>
              <ul className="space-y-1">
                {result.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2">💡</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.suggestedKeywords && result.suggestedKeywords.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">
                {locale === 'az' ? 'Tövsiyə olunan açar sözlər' : 'Рекомендуемые ключевые слова'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.suggestedKeywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentOptimizer;

