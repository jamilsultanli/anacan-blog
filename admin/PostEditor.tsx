import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postsService } from '../services/api/posts';
import { categoriesService } from '../services/api/categories';
import { BlogPost, Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import RichTextEditor from '../components/editor/RichTextEditor';
import ImageUploader from '../components/ImageUploader';
import PostSEOEditor from '../components/admin/PostSEOEditor';
import ContentOptimizer from '../components/admin/ContentOptimizer';
import ContentSEOAnalyzer from '../components/admin/ContentSEOAnalyzer';
import SeoContentGenerator from '../components/admin/SeoContentGenerator';

const PostEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [slug, setSlug] = useState('');
  const [titleAz, setTitleAz] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [excerptAz, setExcerptAz] = useState('');
  const [excerptRu, setExcerptRu] = useState('');
  const [contentAz, setContentAz] = useState('');
  const [contentRu, setContentRu] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [readTime, setReadTime] = useState(5);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [tags, setTags] = useState<string[]>([]);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  useEffect(() => {
    loadCategories();
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const { data, error } = await categoriesService.getCategories();
      if (!error && data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadPost = async () => {
    setLoading(true);
    try {
      // Get post by ID - we need to find it from posts list
      const { data: posts, error } = await postsService.getPosts({ status: undefined });
      if (error) throw error;
      
      const post = posts.find(p => p.id === id);
      if (post) {
        setSlug(post.slug);
        setTitleAz(post.title.az);
        setTitleRu(post.title.ru);
        setExcerptAz(post.excerpt?.az || '');
        setExcerptRu(post.excerpt?.ru || '');
        setContentAz(post.content.az);
        setContentRu(post.content.ru);
        setCategoryId(post.categoryId || '');
        setImageUrl(post.imageUrl || '');
        setReadTime(post.readTime || 5);
        setIsFeatured(post.isFeatured || false);
        setStatus(post.status);
        setTags(post.tags || []);
      }
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const postData: Omit<BlogPost, 'id' | 'published_at' | 'createdAt' | 'updatedAt'> = {
        slug,
        title: { az: titleAz, ru: titleRu },
        excerpt: { az: excerptAz || contentAz.substring(0, 150) + '...', ru: excerptRu || contentRu.substring(0, 150) + '...' },
        content: { az: contentAz, ru: contentRu },
        categoryId: categoryId || undefined,
        imageUrl: imageUrl || '',
        author: 'Admin',
        readTime,
        tags,
        isFeatured,
        status,
      };

      if (id) {
        const { error } = await postsService.updatePost(id, postData);
        if (error) throw error;
      } else {
        const { error } = await postsService.createPost(postData);
        if (error) throw error;
      }
      
      navigate('/admin/posts');
    } catch (error) {
      console.error('Error saving post:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    } finally {
      setSaving(false);
    }
  };

  const handleAIGenerated = (result: any) => {
    if (result.title) {
      if (locale === 'az') {
        setTitleAz(result.title);
      } else {
        setTitleRu(result.title);
      }
    }
    if (result.metaDescription) {
      if (locale === 'az') {
        setExcerptAz(result.metaDescription);
      } else {
        setExcerptRu(result.metaDescription);
      }
    }
    if (result.content) {
      if (locale === 'az') {
        setContentAz(result.content);
      } else {
        setContentRu(result.content);
      }
    }
    if (result.keywords && result.keywords.length > 0) {
      setTags(result.keywords);
    }
    setShowAIGenerator(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {id ? (locale === 'az' ? 'Məqalə Redaktə Et' : 'Редактировать статью') : (locale === 'az' ? 'Yeni Məqalə' : 'Новая статья')}
            </h1>
            <button
              onClick={() => setShowAIGenerator(!showAIGenerator)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              {showAIGenerator 
                ? (locale === 'az' ? '✖️ Bağla' : '✖️ Закрыть')
                : (locale === 'az' ? '🤖 AI Generator' : '🤖 AI Генератор')
              }
            </button>
          </div>
        </div>

        {/* AI Generator Panel */}
        {showAIGenerator && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <SeoContentGenerator />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-6">
              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {locale === 'az' ? '🔗 Slug (URL)' : '🔗 Slug (URL)'}
                </label>
                <input
                  required
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  placeholder="my-blog-post"
                />
              </div>

              {/* Titles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '📝 Başlıq (AZ)' : '📝 Заголовок (AZ)'}
                  </label>
                  <input
                    required
                    type="text"
                    value={titleAz}
                    onChange={e => setTitleAz(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '📝 Başlıq (RU)' : '📝 Заголовок (RU)'}
                  </label>
                  <input
                    required
                    type="text"
                    value={titleRu}
                    onChange={e => setTitleRu(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  />
                </div>
              </div>

              {/* Excerpts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '📄 Qısa Təsvir (AZ)' : '📄 Краткое описание (AZ)'}
                  </label>
                  <textarea
                    value={excerptAz}
                    onChange={e => setExcerptAz(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder={locale === 'az' ? 'Qısa təsvir...' : 'Краткое описание...'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '📄 Qısa Təsvir (RU)' : '📄 Краткое описание (RU)'}
                  </label>
                  <textarea
                    value={excerptRu}
                    onChange={e => setExcerptRu(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder={locale === 'az' ? 'Qısa təsvir...' : 'Краткое описание...'}
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {locale === 'az' ? '📝 Məzmun (AZ)' : '📝 Содержимое (AZ)'}
                </label>
                <RichTextEditor
                  content={contentAz}
                  onChange={setContentAz}
                  placeholder={locale === 'az' ? 'Məzmunu buraya yazın...' : 'Напишите содержимое здесь...'}
                  locale="az"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {locale === 'az' ? '📝 Məzmun (RU)' : '📝 Содержимое (RU)'}
                </label>
                <RichTextEditor
                  content={contentRu}
                  onChange={setContentRu}
                  placeholder={locale === 'az' ? 'Məzmunu buraya yazın...' : 'Напишите содержимое здесь...'}
                  locale="ru"
                />
              </div>

              {/* Category and Image */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '📁 Kateqoriya' : '📁 Категория'}
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  >
                    <option value="">{locale === 'az' ? 'Seçin...' : 'Выберите...'}</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name.az} / {c.name.ru}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '🖼️ Şəkil' : '🖼️ Изображение'}
                  </label>
                  <ImageUploader
                    onUploadComplete={setImageUrl}
                    currentImageUrl={imageUrl}
                    folder="posts"
                    maxSizeMB={5}
                    locale={locale}
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '⏱️ Oxuma Vaxtı (dəq)' : '⏱️ Время чтения (мин)'}
                  </label>
                  <input
                    type="number"
                    value={readTime}
                    onChange={e => setReadTime(parseInt(e.target.value) || 5)}
                    min={1}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '⭐ Seçilmiş' : '⭐ Избранное'}
                  </label>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="w-6 h-6 text-pink-600 rounded focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '📊 Status' : '📊 Статус'}
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  >
                    <option value="draft">{locale === 'az' ? 'Qaralama' : 'Черновик'}</option>
                    <option value="published">{locale === 'az' ? 'Yayımlanmış' : 'Опубликовано'}</option>
                    <option value="archived">{locale === 'az' ? 'Arxivlənmiş' : 'Архивировано'}</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/admin/posts')}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {saving 
                    ? (locale === 'az' ? 'Yadda saxlanılır...' : 'Сохранение...')
                    : t('save')
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar - SEO Tools */}
          <div className="space-y-6">
            {id && (
              <>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <PostSEOEditor
                    post={{
                      id,
                      slug,
                      title: { az: titleAz, ru: titleRu },
                      excerpt: { az: excerptAz, ru: excerptRu },
                      content: { az: contentAz, ru: contentRu },
                      categoryId,
                      author: 'Admin',
                      published_at: new Date().toISOString(),
                      imageUrl,
                      readTime,
                      tags,
                      isFeatured,
                      status,
                    }}
                    onUpdate={(updates) => {
                      if (updates.title) {
                        setTitleAz(updates.title.az);
                        setTitleRu(updates.title.ru);
                      }
                      if (updates.excerpt) {
                        setExcerptAz(updates.excerpt.az);
                        setExcerptRu(updates.excerpt.ru);
                      }
                    }}
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <ContentOptimizer
                    post={{
                      id,
                      slug,
                      title: { az: titleAz, ru: titleRu },
                      excerpt: { az: excerptAz, ru: excerptRu },
                      content: { az: contentAz, ru: contentRu },
                      categoryId,
                      author: 'Admin',
                      published_at: new Date().toISOString(),
                      imageUrl,
                      readTime,
                      tags,
                      isFeatured,
                      status,
                    }}
                    onOptimized={(optimized) => {
                      if (optimized.title) {
                        setTitleAz(optimized.title.az);
                        setTitleRu(optimized.title.ru);
                      }
                      if (optimized.excerpt) {
                        setExcerptAz(optimized.excerpt.az);
                        setExcerptRu(optimized.excerpt.ru);
                      }
                      if (optimized.content) {
                        setContentAz(optimized.content.az);
                        setContentRu(optimized.content.ru);
                      }
                    }}
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <ContentSEOAnalyzer
                    post={{
                      id,
                      slug,
                      title: { az: titleAz, ru: titleRu },
                      excerpt: { az: excerptAz, ru: excerptRu },
                      content: { az: contentAz, ru: contentRu },
                      categoryId,
                      author: 'Admin',
                      published_at: new Date().toISOString(),
                      imageUrl,
                      readTime,
                      tags,
                      isFeatured,
                      status,
                    }}
                    locale={locale}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
