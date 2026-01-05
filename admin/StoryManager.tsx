import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { storiesService } from '../services/api/stories';
import { Story } from '../types';
import { storage } from '../services/appwrite';
import { ID } from '../services/appwrite';

const StoryManager: React.FC = () => {
  const { locale } = useLanguage();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title_az: '',
    title_ru: '',
    imageUrl: '',
    linkUrl: '',
    link_text_az: '',
    link_text_ru: '',
    isActive: true,
    order: 0,
    expiresAt: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const { data } = await storiesService.getStories(false);
      setStories(data || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      // Upload to Appwrite Storage
      const response = await storage.createFile(
        'default', // bucket ID - you may need to create a bucket for stories
        ID.unique(),
        file
      );
      
      // Get file URL
      const fileUrl = `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/default/files/${response.$id}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`;
      
      setFormData(prev => ({ ...prev, imageUrl: fileUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(locale === 'az' ? 'Şəkil yüklənərkən xəta baş verdi' : 'Ошибка при загрузке изображения');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await storiesService.updateStory(editingId, {
          title: {
            az: formData.title_az,
            ru: formData.title_ru,
          },
          imageUrl: formData.imageUrl,
          linkUrl: formData.linkUrl || undefined,
          linkText: formData.link_text_az || formData.link_text_ru ? {
            az: formData.link_text_az,
            ru: formData.link_text_ru,
          } : undefined,
          isActive: formData.isActive,
          order: formData.order,
          expiresAt: formData.expiresAt || undefined,
        });
      } else {
        await storiesService.createStory({
          title: {
            az: formData.title_az,
            ru: formData.title_ru,
          },
          imageUrl: formData.imageUrl,
          linkUrl: formData.linkUrl || undefined,
          linkText: formData.link_text_az || formData.link_text_ru ? {
            az: formData.link_text_az,
            ru: formData.link_text_ru,
          } : undefined,
          isActive: formData.isActive,
          order: formData.order,
          expiresAt: formData.expiresAt || undefined,
        });
      }
      loadStories();
      resetForm();
    } catch (error) {
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  const handleEdit = (story: Story) => {
    setEditingId(story.id);
    setFormData({
      title_az: story.title?.az || '',
      title_ru: story.title?.ru || '',
      imageUrl: story.imageUrl,
      linkUrl: story.linkUrl || '',
      link_text_az: story.linkText?.az || '',
      link_text_ru: story.linkText?.ru || '',
      isActive: story.isActive,
      order: story.order || 0,
      expiresAt: story.expiresAt || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'az' ? 'Hekayəni silmək istəyirsiniz?' : 'Удалить историю?')) {
      return;
    }
    try {
      await storiesService.deleteStory(id);
      loadStories();
    } catch (error) {
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title_az: '',
      title_ru: '',
      imageUrl: '',
      linkUrl: '',
      link_text_az: '',
      link_text_ru: '',
      isActive: true,
      order: 0,
      expiresAt: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'az' ? 'Hekayələr' : 'Истории'}
        </h1>
        <button
          onClick={resetForm}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          {locale === 'az' ? '+ Yeni Hekayə' : '+ Новая история'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? (locale === 'az' ? 'Hekayəni redaktə et' : 'Редактировать историю') : (locale === 'az' ? 'Yeni Hekayə' : 'Новая история')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'az' ? 'Başlıq (AZ)' : 'Заголовок (AZ)'}
                </label>
                <input
                  type="text"
                  value={formData.title_az}
                  onChange={(e) => setFormData({ ...formData, title_az: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'az' ? 'Başlıq (RU)' : 'Заголовок (RU)'}
                </label>
                <input
                  type="text"
                  value={formData.title_ru}
                  onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'az' ? 'Şəkil (1080x1920)' : 'Изображение (1080x1920)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-gray-500 mt-1">{locale === 'az' ? 'Yüklənir...' : 'Загрузка...'}</p>
                )}
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'az' ? 'Link URL' : 'URL ссылки'}
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="/category/pregnancy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'az' ? 'Link Mətni (AZ)' : 'Текст ссылки (AZ)'}
                </label>
                <input
                  type="text"
                  value={formData.link_text_az}
                  onChange={(e) => setFormData({ ...formData, link_text_az: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'az' ? 'Link Mətni (RU)' : 'Текст ссылки (RU)'}
                </label>
                <input
                  type="text"
                  value={formData.link_text_ru}
                  onChange={(e) => setFormData({ ...formData, link_text_ru: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'az' ? 'Sıra' : 'Порядок'}
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  {locale === 'az' ? 'Aktiv' : 'Активна'}
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'az' ? 'Bitmə Tarixi (İsteğe bağlı)' : 'Дата окончания (Опционально)'}
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  {editingId ? (locale === 'az' ? 'Yadda saxla' : 'Сохранить') : (locale === 'az' ? 'Yarat' : 'Создать')}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {locale === 'az' ? 'Ləğv et' : 'Отмена'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Stories List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {locale === 'az' ? 'Bütün Hekayələr' : 'Все истории'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stories.map((story) => (
                  <div key={story.id} className="relative group">
                    <div className="aspect-[9/16] rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={story.imageUrl}
                        alt={story.title?.[locale] || 'Story'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {story.title?.[locale] || 'No title'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {locale === 'az' ? 'Sıra' : 'Порядок'}: {story.order || 0}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => handleEdit(story)}
                        className="p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    {!story.isActive && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                        {locale === 'az' ? 'Qeyri-aktiv' : 'Неактивна'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryManager;

