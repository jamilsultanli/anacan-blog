import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { categoriesService } from '../services/api/categories';
import { Category } from '../types';

const CategoryManager: React.FC = () => {
  const { locale, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    nameAz: '',
    nameRu: '',
    icon: '',
    color: 'bg-pink-100 text-pink-600',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await categoriesService.getCategories();
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const categoryData: Omit<Category, 'id'> = {
        slug: formData.slug,
        name: {
          az: formData.nameAz,
          ru: formData.nameRu,
        },
        icon: formData.icon,
        color: formData.color,
      };

      if (editingCategory) {
        const { error } = await categoriesService.updateCategory(editingCategory.id, categoryData);
        if (error) throw error;
      } else {
        const { error } = await categoriesService.createCategory(categoryData);
        if (error) throw error;
      }

      await loadCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      slug: category.slug,
      nameAz: category.name.az,
      nameRu: category.name.ru,
      icon: category.icon,
      color: category.color,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'az' ? 'Kateqoriyanı silmək istəyirsiniz?' : 'Удалить категорию?')) {
      return;
    }

    try {
      const { error } = await categoriesService.deleteCategory(id);
      if (error) throw error;
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      slug: '',
      nameAz: '',
      nameRu: '',
      icon: '',
      color: 'bg-pink-100 text-pink-600',
    });
  };

  const colorOptions = [
    { value: 'bg-pink-100 text-pink-600', label: 'Pink', preview: '🩷' },
    { value: 'bg-blue-100 text-blue-600', label: 'Blue', preview: '💙' },
    { value: 'bg-green-100 text-green-600', label: 'Green', preview: '💚' },
    { value: 'bg-purple-100 text-purple-600', label: 'Purple', preview: '💜' },
    { value: 'bg-red-100 text-red-600', label: 'Red', preview: '❤️' },
    { value: 'bg-yellow-100 text-yellow-600', label: 'Yellow', preview: '💛' },
    { value: 'bg-indigo-100 text-indigo-600', label: 'Indigo', preview: '💙' },
    { value: 'bg-teal-100 text-teal-600', label: 'Teal', preview: '💚' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {locale === 'az' ? '📁 Kateqoriya İdarəetməsi' : '📁 Управление категориями'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'az' 
                ? 'Bloq kateqoriyalarını idarə edin' 
                : 'Управляйте категориями блога'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingCategory
                  ? (locale === 'az' ? '✏️ Redaktə Et' : '✏️ Редактировать')
                  : (locale === 'az' ? '➕ Yeni Kateqoriya' : '➕ Новая категория')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '🔗 Slug' : '🔗 Slug'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="category-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '📝 Ad (AZ)' : '📝 Название (AZ)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameAz}
                    onChange={(e) => setFormData({ ...formData, nameAz: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '📝 Ad (RU)' : '📝 Название (RU)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameRu}
                    onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '🎨 İkon' : '🎨 Иконка'}
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-2xl"
                    placeholder="🤰"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {locale === 'az' ? '🌈 Rəng' : '🌈 Цвет'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.color === color.value
                            ? 'border-pink-500 ring-2 ring-pink-200'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${color.value}`}
                      >
                        <span className="text-2xl">{color.preview}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50"
                  >
                    {saving
                      ? (locale === 'az' ? '💾 Yadda saxlanılır...' : '💾 Сохранение...')
                      : (locale === 'az' ? '💾 Yadda Saxla' : '💾 Сохранить')}
                  </button>
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                      {locale === 'az' ? '❌ Ləğv' : '❌ Отмена'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Categories List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {locale === 'az' ? 'Hələ kateqoriya yoxdur' : 'Категорий пока нет'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="p-5 border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl ${category.color}`}>
                            {category.icon || '📁'}
                          </span>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {category.name[locale]}
                            </h3>
                            <p className="text-sm text-gray-500">/{category.slug}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          AZ: {category.name.az}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-600">
                          RU: {category.name.ru}
                        </span>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="flex-1 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-semibold hover:bg-pink-200 transition-all"
                        >
                          {locale === 'az' ? '✏️ Redaktə' : '✏️ Редактировать'}
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
                        >
                          {locale === 'az' ? '🗑️ Sil' : '🗑️ Удалить'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;

