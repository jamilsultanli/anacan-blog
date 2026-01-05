import React from 'react';
import { BlogPost } from '../../types';

interface TrafficSourcesProps {
  posts: BlogPost[];
  locale: 'az' | 'ru';
}

const TrafficSources: React.FC<TrafficSourcesProps> = ({ posts, locale }) => {
  // This would typically come from analytics service
  // For now, we'll show placeholder data
  const sources = [
    { name: locale === 'az' ? 'Axtarış Motorları' : 'Поисковые системы', percentage: 45, count: 1234 },
    { name: locale === 'az' ? 'Sosial Media' : 'Социальные сети', percentage: 30, count: 823 },
    { name: locale === 'az' ? 'Birbaşa' : 'Прямой', percentage: 15, count: 412 },
    { name: locale === 'az' ? 'Referallar' : 'Рефералы', percentage: 10, count: 274 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {locale === 'az' ? 'Trafik Mənbələri' : 'Источники трафика'}
      </h2>
      <div className="space-y-4">
        {sources.map((source, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{source.name}</span>
              <span className="text-sm text-gray-600">
                {source.percentage}% • {source.count.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pink-600 h-2 rounded-full transition-all"
                style={{ width: `${source.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrafficSources;

