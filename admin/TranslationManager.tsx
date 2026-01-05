import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translationService } from '../services/translations';

interface Translation {
  id: string;
  key: string;
  namespace: string;
  value_az: string;
  value_ru: string;
  description?: string;
}

const TranslationManager: React.FC = () => {
  const { locale } = useLanguage();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    namespace: 'common',
    value_az: '',
    value_ru: '',
    description: '',
  });
  const [filterNamespace, setFilterNamespace] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTranslations();
  }, [filterNamespace]);

  const loadTranslations = async () => {
    setLoading(true);
    try {
      const data = await translationService.getAllTranslations();
      setTranslations(data);
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await translationService.updateTranslation(editingId, formData.value_az, formData.value_ru);
      } else {
        await translationService.createTranslation(
          formData.key,
          formData.namespace,
          formData.value_az,
          formData.value_ru,
          formData.description
        );
      }
      loadTranslations();
      resetForm();
    } catch (error) {
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  const handleEdit = (translation: Translation) => {
    setEditingId(translation.id);
    setFormData({
      key: translation.key,
      namespace: translation.namespace,
      value_az: translation.value_az,
      value_ru: translation.value_ru,
      description: translation.description || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'az' ? 'Tərcüməni silmək istəyirsiniz?' : 'Удалить перевод?')) {
      return;
    }
    try {
      await translationService.deleteTranslation(id);
      loadTranslations();
    } catch (error) {
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      key: '',
      namespace: 'common',
      value_az: '',
      value_ru: '',
      description: '',
    });
  };

  const namespaces = Array.from(new Set(translations.map(t => t.namespace)));
  const filteredTranslations = translations.filter(t => {
    if (filterNamespace !== 'all' && t.namespace !== filterNamespace) return false;
    if (searchQuery && !t.key.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !t.value_az.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !t.value_ru.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'az' ? 'Tərcümə İdarəetməsi' : 'Управление переводами'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Açar' : 'Ключ'}
              </label>
              <input
                type="text"
                required
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                disabled={!!editingId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Namespace' : 'Пространство имен'}
              </label>
              <select
                value={formData.namespace}
                onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="common">{locale === 'az' ? 'Ümumi' : 'Общее'}</option>
                <option value="admin">{locale === 'az' ? 'Admin' : 'Админ'}</option>
                <option value="errors">{locale === 'az' ? 'Xətalar' : 'Ошибки'}</option>
                {namespaces.filter(n => !['common', 'admin', 'errors'].includes(n)).map(ns => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Azərbaycan Dili' : 'Азербайджанский'}
              </label>
              <textarea
                required
                value={formData.value_az}
                onChange={(e) => setFormData({ ...formData, value_az: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Rus Dili' : 'Русский'}
              </label>
              <textarea
                required
                value={formData.value_ru}
                onChange={(e) => setFormData({ ...formData, value_ru: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'az' ? 'Təsvir' : 'Описание'}
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors"
            >
              {editingId
                ? (locale === 'az' ? 'Yenilə' : 'Обновить')
                : (locale === 'az' ? 'Yarat' : 'Создать')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                {locale === 'az' ? 'Ləğv Et' : 'Отмена'}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4">
            <select
              value={filterNamespace}
              onChange={(e) => setFilterNamespace(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">{locale === 'az' ? 'Hamısı' : 'Все'}</option>
              {namespaces.map(ns => (
                <option key={ns} value={ns}>{ns}</option>
              ))}
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'az' ? 'Axtarış...' : 'Поиск...'}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTranslations.map((translation) => (
              <div
                key={translation.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-medium">
                      {translation.namespace}
                    </span>
                    <span className="font-bold text-gray-900">{translation.key}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">AZ:</span> {translation.value_az.substring(0, 50)}...
                    {' | '}
                    <span className="font-medium">RU:</span> {translation.value_ru.substring(0, 50)}...
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(translation)}
                    className="px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg font-medium text-sm"
                  >
                    {locale === 'az' ? 'Redaktə' : 'Редактировать'}
                  </button>
                  <button
                    onClick={() => handleDelete(translation.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm"
                  >
                    {locale === 'az' ? 'Sil' : 'Удалить'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationManager;

