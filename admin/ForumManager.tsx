import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { forumsService } from '../services/api/forums';
import { Forum } from '../types';
import { databases, DATABASE_ID, COLLECTIONS, ID, Permission, Role } from '../services/appwrite';

const ForumManager: React.FC = () => {
  const { locale } = useLanguage();
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingForum, setEditingForum] = useState<Forum | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    nameAz: '',
    nameRu: '',
    descriptionAz: '',
    descriptionRu: '',
    icon: '💬',
    color: '#ec4899',
    isActive: true,
    order: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadForums();
  }, []);

  const loadForums = async () => {
    setLoading(true);
    try {
      // Load all forums (including inactive) for admin
      const { data, error } = await forumsService.getForums(false);
      if (error) throw error;
      setForums(data || []);
    } catch (error) {
      console.error('Error loading forums:', error);
      alert(locale === 'az' ? 'Forumlar yüklənərkən xəta baş verdi' : 'Ошибка при загрузке форумов');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSlugChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      slug: generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingForum) {
        // Update forum
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.FORUMS,
          editingForum.id,
          {
            name_az: formData.nameAz,
            name_ru: formData.nameRu,
            slug: formData.slug,
            description_az: formData.descriptionAz || undefined,
            description_ru: formData.descriptionRu || undefined,
            icon: formData.icon || undefined,
            color: formData.color || undefined,
            is_active: formData.isActive,
            order: formData.order || 0,
          }
        );
      } else {
        // Create forum
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.FORUMS,
          ID.unique(),
          {
            name_az: formData.nameAz,
            name_ru: formData.nameRu,
            slug: formData.slug,
            description_az: formData.descriptionAz || undefined,
            description_ru: formData.descriptionRu || undefined,
            icon: formData.icon || undefined,
            color: formData.color || undefined,
            is_active: formData.isActive,
            order: formData.order || 0,
          },
          [
            Permission.read(Role.any()),
            Permission.write(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
      }

      await loadForums();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      console.error('Error saving forum:', error);
      alert(locale === 'az' 
        ? `Xəta baş verdi: ${error.message || 'Naməlum xəta'}` 
        : `Ошибка: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (forum: Forum) => {
    setEditingForum(forum);
    setFormData({
      slug: forum.slug,
      nameAz: forum.name?.az || '',
      nameRu: forum.name?.ru || '',
      descriptionAz: forum.description?.az || '',
      descriptionRu: forum.description?.ru || '',
      icon: forum.icon || '💬',
      color: forum.color || '#ec4899',
      isActive: forum.isActive !== false,
      order: forum.order || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'az' ? 'Forumu silmək istəyirsiniz?' : 'Удалить форум?')) {
      return;
    }

    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FORUMS,
        id,
        { is_active: false }
      );
      await loadForums();
    } catch (error: any) {
      console.error('Error deleting forum:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  const resetForm = () => {
    setEditingForum(null);
    setFormData({
      slug: '',
      nameAz: '',
      nameRu: '',
      descriptionAz: '',
      descriptionRu: '',
      icon: '💬',
      color: '#ec4899',
      isActive: true,
      order: 0,
    });
  };

  const iconOptions = ['💬', '🤰', '👶', '🍼', '👨‍👩‍👧', '📚', '💡', '❤️', '🌟', '🎯', '💪', '🌈'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'az' ? 'Forum İdarəetməsi' : 'Управление форумами'}
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>{locale === 'az' ? 'Yeni Forum' : 'Новый форум'}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingForum 
              ? (locale === 'az' ? 'Forumu Redaktə Et' : 'Редактировать форум')
              : (locale === 'az' ? 'Yeni Forum Yarat' : 'Создать новый форум')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'Ad (Azərbaycan)' : 'Название (Азербайджанский)'} *
                </label>
                <input
                  type="text"
                  value={formData.nameAz}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, nameAz: e.target.value }));
                    if (!editingForum) {
                      handleSlugChange(e.target.value);
                    }
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder={locale === 'az' ? 'Məsələn: Hamiləlik' : 'Например: Беременность'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'Ad (Rus)' : 'Название (Русский)'} *
                </label>
                <input
                  type="text"
                  value={formData.nameRu}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameRu: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder={locale === 'az' ? 'Məsələn: Беременность' : 'Например: Беременность'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="hamilelik"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'Təsvir (Azərbaycan)' : 'Описание (Азербайджанский)'}
                </label>
                <textarea
                  value={formData.descriptionAz}
                  onChange={(e) => setFormData(prev => ({ ...prev, descriptionAz: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder={locale === 'az' ? 'Forum haqqında qısa məlumat...' : 'Краткая информация о форуме...'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'Təsvir (Rus)' : 'Описание (Русский)'}
                </label>
                <textarea
                  value={formData.descriptionRu}
                  onChange={(e) => setFormData(prev => ({ ...prev, descriptionRu: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder={locale === 'az' ? 'Краткая информация о форуме...' : 'Краткая информация о форуме...'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'İkon' : 'Иконка'}
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                        formData.icon === icon
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="💬"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'Rəng' : 'Цвет'}
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'az' ? 'Sıra' : 'Порядок'}
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                {locale === 'az' ? 'Aktiv' : 'Активен'}
              </label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                {saving
                  ? (locale === 'az' ? 'Saxlanılır...' : 'Сохранение...')
                  : (locale === 'az' ? 'Saxla' : 'Сохранить')}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                {locale === 'az' ? 'Ləğv et' : 'Отмена'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Forums List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : forums.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-gray-500 text-lg mb-4">
            {locale === 'az' ? 'Hələ forum yoxdur' : 'Форумы пока нет'}
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors"
          >
            + {locale === 'az' ? 'İlk Forumu Yarat' : 'Создать первый форум'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'az' ? 'İkon' : 'Иконка'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'az' ? 'Ad' : 'Название'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'az' ? 'Müzakirə' : 'Обсуждений'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'az' ? 'Status' : 'Статус'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'az' ? 'Əməliyyatlar' : 'Действия'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forums.map((forum) => (
                  <tr key={forum.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">{forum.icon || '💬'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {forum.name?.[locale] || forum.name?.az || 'Forum'}
                      </div>
                      {forum.description && (
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {forum.description[locale] || forum.description.az || ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {forum.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {forum.postCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        forum.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {forum.isActive 
                          ? (locale === 'az' ? 'Aktiv' : 'Активен')
                          : (locale === 'az' ? 'Qeyri-aktiv' : 'Неактивен')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(forum)}
                        className="text-pink-600 hover:text-pink-900"
                      >
                        {locale === 'az' ? 'Redaktə' : 'Редактировать'}
                      </button>
                      <button
                        onClick={() => handleDelete(forum.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {locale === 'az' ? 'Sil' : 'Удалить'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumManager;

