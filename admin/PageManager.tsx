import React, { useEffect, useState } from 'react';
import { pagesService, Page } from '../services/api/pages';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../components/editor/RichTextEditor';

const PageManager: React.FC = () => {
  const { locale, t } = useLanguage();
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [slug, setSlug] = useState('');
  const [titleAz, setTitleAz] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [contentAz, setContentAz] = useState('');
  const [contentRu, setContentRu] = useState('');
  const [metaTitleAz, setMetaTitleAz] = useState('');
  const [metaTitleRu, setMetaTitleRu] = useState('');
  const [metaDescriptionAz, setMetaDescriptionAz] = useState('');
  const [metaDescriptionRu, setMetaDescriptionRu] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const { data } = await pagesService.getPages();
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!slug.trim() || !titleAz.trim() || !contentAz.trim()) {
      alert(locale === 'az' ? 'Slug, başlıq və məzmun daxil edin' : 'Введите slug, заголовок и содержимое');
      return;
    }

    try {
      const { error } = await pagesService.createPage({
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        title: {
          az: titleAz,
          ru: titleRu || titleAz,
        },
        content: {
          az: contentAz,
          ru: contentRu || contentAz,
        },
        metaTitle: metaTitleAz || metaTitleRu ? {
          az: metaTitleAz,
          ru: metaTitleRu,
        } : undefined,
        metaDescription: metaDescriptionAz || metaDescriptionRu ? {
          az: metaDescriptionAz,
          ru: metaDescriptionRu,
        } : undefined,
        isPublished,
        order: 0,
      });

      if (error) throw error;
      await loadPages();
      resetForm();
    } catch (error) {
      console.error('Error creating page:', error);
      alert(locale === 'az' ? 'Səhifə yaradıla bilmədi' : 'Не удалось создать страницу');
    }
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setSlug(page.slug);
    setTitleAz(page.title.az);
    setTitleRu(page.title.ru);
    setContentAz(page.content.az);
    setContentRu(page.content.ru);
    setMetaTitleAz(page.metaTitle?.az || '');
    setMetaTitleRu(page.metaTitle?.ru || '');
    setMetaDescriptionAz(page.metaDescription?.az || '');
    setMetaDescriptionRu(page.metaDescription?.ru || '');
    setIsPublished(page.isPublished);
  };

  const handleUpdatePage = async () => {
    if (!editingPage) return;

    try {
      const { error } = await pagesService.updatePage(editingPage.id, {
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        title: {
          az: titleAz,
          ru: titleRu || titleAz,
        },
        content: {
          az: contentAz,
          ru: contentRu || contentAz,
        },
        metaTitle: metaTitleAz || metaTitleRu ? {
          az: metaTitleAz,
          ru: metaTitleRu,
        } : undefined,
        metaDescription: metaDescriptionAz || metaDescriptionRu ? {
          az: metaDescriptionAz,
          ru: metaDescriptionRu,
        } : undefined,
        isPublished,
      });

      if (error) throw error;
      await loadPages();
      resetForm();
    } catch (error) {
      console.error('Error updating page:', error);
      alert(locale === 'az' ? 'Səhifə yenilənə bilmədi' : 'Не удалось обновить страницу');
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm(locale === 'az' ? 'Səhifə silinsin?' : 'Удалить страницу?')) return;

    try {
      const { error } = await pagesService.deletePage(id);
      if (error) throw error;
      await loadPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      alert(locale === 'az' ? 'Səhifə silinə bilmədi' : 'Не удалось удалить страницу');
    }
  };

  const resetForm = () => {
    setEditingPage(null);
    setSlug('');
    setTitleAz('');
    setTitleRu('');
    setContentAz('');
    setContentRu('');
    setMetaTitleAz('');
    setMetaTitleRu('');
    setMetaDescriptionAz('');
    setMetaDescriptionRu('');
    setIsPublished(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {locale === 'az' ? '📄 Səhifə İdarəçisi' : '📄 Менеджер страниц'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'az' 
                ? 'Statik səhifələri idarə edin (Haqqımızda, Əlaqə, Məxfilik və s.)' 
                : 'Управляйте статическими страницами (О нас, Контакты, Политика конфиденциальности и т.д.)'}
            </p>
          </div>
        </div>

        {/* Create/Edit Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingPage 
              ? (locale === 'az' ? 'Səhifə Redaktə Et' : 'Редактировать страницу')
              : (locale === 'az' ? 'Yeni Səhifə Yarad' : 'Создать новую страницу')}
          </h2>

          <div className="space-y-6">
            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                placeholder={locale === 'az' ? 'Məsələn: haqqimizda' : 'Например: about'}
              />
            </div>

            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Başlıq (AZ) *
                </label>
                <input
                  type="text"
                  value={titleAz}
                  onChange={(e) => setTitleAz(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Başlıq (RU)
                </label>
                <input
                  type="text"
                  value={titleRu}
                  onChange={(e) => setTitleRu(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                />
              </div>
            </div>

            {/* Meta Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Title (AZ)
                </label>
                <input
                  type="text"
                  value={metaTitleAz}
                  onChange={(e) => setMetaTitleAz(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Title (RU)
                </label>
                <input
                  type="text"
                  value={metaTitleRu}
                  onChange={(e) => setMetaTitleRu(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                />
              </div>
            </div>

            {/* Meta Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Description (AZ)
                </label>
                <textarea
                  value={metaDescriptionAz}
                  onChange={(e) => setMetaDescriptionAz(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Description (RU)
                </label>
                <textarea
                  value={metaDescriptionRu}
                  onChange={(e) => setMetaDescriptionRu(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Məzmun (AZ) *
              </label>
              <RichTextEditor
                content={contentAz}
                onChange={setContentAz}
                locale="az"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Məzmun (RU)
              </label>
              <RichTextEditor
                content={contentRu}
                onChange={setContentRu}
                locale="ru"
              />
            </div>

            {/* Published */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
              <label htmlFor="isPublished" className="text-sm font-semibold text-gray-700">
                {locale === 'az' ? 'Yayımlanmış' : 'Опубликовано'}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 mt-8">
            {editingPage && (
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                {locale === 'az' ? 'Ləğv Et' : 'Отмена'}
              </button>
            )}
            <button
              onClick={editingPage ? handleUpdatePage : handleCreatePage}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all"
            >
              {editingPage 
                ? (locale === 'az' ? 'Yenilə' : 'Обновить')
                : (locale === 'az' ? 'Yarad' : 'Создать')}
            </button>
            {editingPage && (
              <button
                onClick={() => navigate(`/${editingPage.slug}`)}
                className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-all"
              >
                {locale === 'az' ? '👁️ Bax' : '👁️ Просмотр'}
              </button>
            )}
          </div>
        </div>

        {/* Pages List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === 'az' ? 'Mövcud Səhifələr' : 'Существующие страницы'}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600"></div>
            </div>
          ) : pages.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {locale === 'az' ? 'Heç bir səhifə yoxdur' : 'Нет страниц'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pages.map(page => (
                <div key={page.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{page.title[locale] || page.title.az}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          page.isPublished 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {page.isPublished 
                            ? (locale === 'az' ? 'Yayımlanmış' : 'Опубликовано')
                            : (locale === 'az' ? 'Qaralama' : 'Черновик')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">/{page.slug}</p>
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {page.content[locale]?.replace(/<[^>]*>/g, '').substring(0, 150) || ''}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/${page.slug}`)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all text-sm"
                      >
                        {locale === 'az' ? '👁️ Bax' : '👁️ Просмотр'}
                      </button>
                      <button
                        onClick={() => handleEditPage(page)}
                        className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-semibold hover:bg-pink-200 transition-all text-sm"
                      >
                        {locale === 'az' ? 'Redaktə' : 'Редактировать'}
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all text-sm"
                      >
                        {locale === 'az' ? 'Sil' : 'Удалить'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageManager;

