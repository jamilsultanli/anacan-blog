import React from 'react';
import { BlogPost } from '../../types';
import { calculateSEOScore } from '../../utils/seoScoreCalculator';

interface SEOMetricsProps {
  posts: BlogPost[];
}

const SEOMetrics: React.FC<SEOMetricsProps> = ({ posts }) => {
  const scores = posts.map(post => {
    const azScore = calculateSEOScore(post, 'az');
    const ruScore = calculateSEOScore(post, 'ru');
    return Math.max(azScore.totalScore, ruScore.totalScore);
  });

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const excellentCount = scores.filter(s => s >= 80).length;
  const goodCount = scores.filter(s => s >= 60 && s < 80).length;
  const needsImprovement = scores.filter(s => s < 60).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-2">Orta SEO Skoru</div>
        <div className="text-3xl font-bold text-pink-600">{avgScore}</div>
        <div className="text-xs text-gray-400 mt-1">/ 100</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-2">Əla (80+)</div>
        <div className="text-3xl font-bold text-green-600">{excellentCount}</div>
        <div className="text-xs text-gray-400 mt-1">məqalə</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-2">Yaxşı (60-79)</div>
        <div className="text-3xl font-bold text-blue-600">{goodCount}</div>
        <div className="text-xs text-gray-400 mt-1">məqalə</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-2">Yaxşılaşdırılmalı (&lt;60)</div>
        <div className="text-3xl font-bold text-orange-600">{needsImprovement}</div>
        <div className="text-xs text-gray-400 mt-1">məqalə</div>
      </div>
    </div>
  );
};

export default SEOMetrics;

