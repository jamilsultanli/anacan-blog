import React, { useMemo } from 'react';
import { BlogPost } from '../../types';

interface KeywordRankingsProps {
  posts: BlogPost[];
}

const KeywordRankings: React.FC<KeywordRankingsProps> = ({ posts }) => {
  const keywordCounts = useMemo(() => {
    const counts = new Map<string, number>();
    
    posts.forEach(post => {
      post.tags.forEach(tagId => {
        counts.set(tagId, (counts.get(tagId) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([tagId, count]) => ({ tagId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [posts]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Ən Populyar Açar Sözlər</h2>
      <div className="space-y-2">
        {keywordCounts.length > 0 ? (
          keywordCounts.map((item, idx) => (
            <div key={item.tagId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">
                  {idx + 1}
                </div>
                <span className="font-medium text-gray-900">{item.tagId}</span>
              </div>
              <span className="text-gray-600 font-medium">{item.count} məqalə</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">Hələ açar söz yoxdur</p>
        )}
      </div>
    </div>
  );
};

export default KeywordRankings;

