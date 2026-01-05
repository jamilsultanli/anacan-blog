import React, { useState } from 'react';
import { BlogPost } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { calculateSEOScore } from '../../utils/seoScoreCalculator';
import { analyzeContentSEO } from '../../services/geminiService';

interface ContentSEOAnalyzerProps {
  post: BlogPost;
  locale: 'az' | 'ru';
}

const ContentSEOAnalyzer: React.FC<ContentSEOAnalyzerProps> = ({ post, locale }) => {
  const { locale: currentLocale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    score: number;
    issues: string[];
    suggestions: string[];
  } | null>(null);

  const seoScore = calculateSEOScore(post, locale);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeContentSEO(
        post.content[locale],
        post.title[locale],
        post.excerpt[locale] || '',
        locale
      );
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeKeywordDensity = (content: string, keyword: string): number => {
    const words = content.toLowerCase().split(/\s+/);
    const keywordLower = keyword.toLowerCase();
    const keywordCount = words.filter((w) => w.includes(keywordLower)).length;
    return words.length > 0 ? (keywordCount / words.length) * 100 : 0;
  };

  const analyzeHeadingStructure = (content: string) => {
    const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
    const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;
    return { h1Count, h2Count, h3Count };
  };

  const headingStructure = analyzeHeadingStructure(post.content[locale]);
  const wordCount = post.content[locale].split(/\s+/).length;
  const imageCount = (post.content[locale].match(/<img[^>]*>/gi) || []).length;
  const linkCount = (post.content[locale].match(/<a[^>]+href=/gi) || []).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {currentLocale === 'az' ? 'SEO Analizi' : 'SEO Анализ'}
          </h3>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors disabled:opacity-50 text-sm"
          >
            {loading
              ? (currentLocale === 'az' ? 'Analiz edilir...' : 'Анализ...')
              : (currentLocale === 'az' ? 'AI ilə Analiz Et' : 'Анализ с AI')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">
              {currentLocale === 'az' ? 'SEO Skoru' : 'SEO Оценка'}
            </div>
            <div className="text-3xl font-bold text-pink-600">{seoScore.totalScore}</div>
            <div className="text-xs text-gray-400">/ 100</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">
              {currentLocale === 'az' ? 'Söz Sayı' : 'Количество слов'}
            </div>
            <div className="text-3xl font-bold text-blue-600">{wordCount}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">
              {currentLocale === 'az' ? 'Başlıq Strukturu' : 'Структура заголовков'}
            </h4>
            <div className="flex space-x-4 text-sm">
              <span>
                H1: <strong>{headingStructure.h1Count}</strong>
              </span>
              <span>
                H2: <strong>{headingStructure.h2Count}</strong>
              </span>
              <span>
                H3: <strong>{headingStructure.h3Count}</strong>
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">
              {currentLocale === 'az' ? 'Media' : 'Медиа'}
            </h4>
            <div className="flex space-x-4 text-sm">
              <span>
                {currentLocale === 'az' ? 'Şəkil' : 'Изображения'}: <strong>{imageCount}</strong>
              </span>
              <span>
                {currentLocale === 'az' ? 'Link' : 'Ссылки'}: <strong>{linkCount}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {currentLocale === 'az' ? 'AI Analiz Nəticələri' : 'Результаты AI анализа'}
          </h3>

          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">
              {currentLocale === 'az' ? 'AI Skoru' : 'AI Оценка'}
            </div>
            <div className="text-3xl font-bold text-pink-600">{analysis.score}</div>
            <div className="text-xs text-gray-400">/ 100</div>
          </div>

          {analysis.issues.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-red-600 mb-2">
                {currentLocale === 'az' ? 'Problemlər' : 'Проблемы'}
              </h4>
              <ul className="space-y-2">
                {analysis.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-red-700 flex items-start">
                    <span className="mr-2">⚠️</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.suggestions.length > 0 && (
            <div>
              <h4 className="font-bold text-blue-600 mb-2">
                {currentLocale === 'az' ? 'Təkliflər' : 'Предложения'}
              </h4>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2">💡</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {seoScore.recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h4 className="font-bold text-blue-900 mb-4">
            {currentLocale === 'az' ? 'Tövsiyələr' : 'Рекомендации'}
          </h4>
          <ul className="space-y-2">
            {seoScore.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-blue-800 flex items-start">
                <span className="mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ContentSEOAnalyzer;

