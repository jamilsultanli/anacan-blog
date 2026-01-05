import React, { useState, useEffect } from 'react';
import { BlogPost } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface MetaTagsEditorProps {
  post: BlogPost;
  onUpdate: (updates: Partial<BlogPost>) => void;
}

const MetaTagsEditor: React.FC<MetaTagsEditorProps> = ({ post, onUpdate }) => {
  const { locale } = useLanguage();
  const [metaTitle, setMetaTitle] = useState(post.title[locale]);
  const [metaDescription, setMetaDescription] = useState(post.excerpt[locale] || '');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [robotsMeta, setRobotsMeta] = useState('index, follow');

  useEffect(() => {
    setMetaTitle(post.title[locale]);
    setMetaDescription(post.excerpt[locale] || '');
    setCanonicalUrl(`${typeof window !== 'undefined' ? window.location.origin : ''}/blog/${post.slug}`);
  }, [post, locale]);

  const handleSave = () => {
    onUpdate({
      title: locale === 'az'
        ? { az: metaTitle, ru: post.title.ru }
        : { az: post.title.az, ru: metaTitle },
      excerpt: locale === 'az'
        ? { az: metaDescription, ru: post.excerpt.ru }
        : { az: post.excerpt.az, ru: metaDescription },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {locale === 'az' ? 'Meta Tags' : 'Мета теги'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'Meta Title' : 'Мета заголовок'}
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            maxLength={60}
          />
          <p className="text-xs text-gray-500 mt-1">
            {metaTitle.length}/60 {locale === 'az' ? 'simvol (optimal: 50-60)' : 'символов (оптимально: 50-60)'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'Meta Description' : 'Мета описание'}
          </label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">
            {metaDescription.length}/160 {locale === 'az' ? 'simvol (optimal: 150-160)' : 'символов (оптимально: 150-160)'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'Canonical URL' : 'Канонический URL'}
          </label>
          <input
            type="text"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'Robots Meta' : 'Robots мета'}
          </label>
          <select
            value={robotsMeta}
            onChange={(e) => setRobotsMeta(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="index, follow">{locale === 'az' ? 'Index, Follow' : 'Индексировать, Следовать'}</option>
            <option value="index, nofollow">{locale === 'az' ? 'Index, NoFollow' : 'Индексировать, NoFollow'}</option>
            <option value="noindex, follow">{locale === 'az' ? 'NoIndex, Follow' : 'NoIndex, Следовать'}</option>
            <option value="noindex, nofollow">{locale === 'az' ? 'NoIndex, NoFollow' : 'NoIndex, NoFollow'}</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full px-6 py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors"
        >
          {locale === 'az' ? 'Yadda Saxla' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
};

export default MetaTagsEditor;

