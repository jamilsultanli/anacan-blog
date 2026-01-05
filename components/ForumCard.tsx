import React from 'react';
import { Link } from 'react-router-dom';
import { Forum } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ForumCardProps {
  forum: Forum;
}

const ForumCard: React.FC<ForumCardProps> = ({ forum }) => {
  const { locale } = useLanguage();

  return (
    <Link
      to={`/forums/${forum.slug}`}
      className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-pink-300 transition-all group"
    >
      <div className="flex items-start space-x-4">
        {forum.icon && (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${forum.color || 'bg-pink-100'}`}>
            {forum.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
            {forum.name[locale]}
          </h3>
          {forum.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {forum.description[locale]}
            </p>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <span>{forum.postCount || 0} {locale === 'az' ? 'müzakirə' : 'обсуждений'}</span>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
};

export default ForumCard;

