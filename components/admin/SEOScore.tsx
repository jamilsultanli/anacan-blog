import React from 'react';
import { SEOScoreResult } from '../../utils/seoScoreCalculator';

interface SEOScoreProps {
  score: SEOScoreResult;
  locale: 'az' | 'ru';
}

const SEOScore: React.FC<SEOScoreProps> = ({ score, locale }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return locale === 'az' ? 'Əla' : 'Отлично';
    if (score >= 60) return locale === 'az' ? 'Yaxşı' : 'Хорошо';
    if (score >= 40) return locale === 'az' ? 'Orta' : 'Средне';
    return locale === 'az' ? 'Zəif' : 'Слабо';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-gray-900">
          {locale === 'az' ? 'SEO Skoru' : 'SEO Оценка'}
        </h4>
        <div className={`px-4 py-2 rounded-lg font-bold ${getScoreColor(score.totalScore)}`}>
          {score.totalScore} / 100 - {getScoreLabel(score.totalScore)}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{locale === 'az' ? 'Başlıq' : 'Заголовок'}</span>
          <span className="font-medium">{score.factors.titleScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-pink-600 h-2 rounded-full transition-all"
            style={{ width: `${score.factors.titleScore}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{locale === 'az' ? 'Meta Description' : 'Мета описание'}</span>
          <span className="font-medium">{score.factors.metaDescriptionScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-pink-600 h-2 rounded-full transition-all"
            style={{ width: `${score.factors.metaDescriptionScore}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{locale === 'az' ? 'Məzmun' : 'Содержимое'}</span>
          <span className="font-medium">{score.factors.contentScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-pink-600 h-2 rounded-full transition-all"
            style={{ width: `${score.factors.contentScore}%` }}
          />
        </div>
      </div>

      {score.recommendations.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-bold text-blue-900 mb-2 text-sm">
            {locale === 'az' ? 'Tövsiyələr' : 'Рекомендации'}
          </h5>
          <ul className="space-y-1">
            {score.recommendations.map((rec, idx) => (
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

export default SEOScore;

