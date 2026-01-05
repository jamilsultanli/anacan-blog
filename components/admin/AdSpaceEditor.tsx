import React, { useState } from 'react';
import { AdSpace, AdPosition } from '../../types';
import { adsService } from '../../services/api/ads';

interface AdSpaceEditorProps {
  adSpaces: AdSpace[];
  onUpdate: () => void;
  locale: 'az' | 'ru';
}

const AdSpaceEditor: React.FC<AdSpaceEditorProps> = ({ adSpaces, onUpdate, locale }) => {
  const [editingSpace, setEditingSpace] = useState<AdSpace | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    position: 'header' as AdPosition,
    width: '',
    height: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: Omit<AdSpace, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        position: formData.position,
        width: formData.width ? parseInt(formData.width) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        isActive: formData.isActive,
      };

      if (editingSpace) {
        const { error } = await adsService.updateAdSpace(editingSpace.id, data);
        if (error) throw error;
      } else {
        const { error } = await adsService.createAdSpace(data);
        if (error) throw error;
      }

      onUpdate();
      setEditingSpace(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        position: 'header',
        width: '',
        height: '',
        isActive: true,
      });
    } catch (error) {
      console.error('Error saving ad space:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (space: AdSpace) => {
    setEditingSpace(space);
    setFormData({
      name: space.name,
      slug: space.slug,
      description: space.description || '',
      position: space.position,
      width: space.width?.toString() || '',
      height: space.height?.toString() || '',
      isActive: space.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'az' ? 'Reklam yerini silmək istəyirsiniz?' : 'Удалить рекламное место?')) {
      return;
    }

    try {
      const { error } = await adsService.deleteAdSpace(id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting ad space:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-50 to-pink-50 rounded-xl p-6 space-y-4 border-2 border-pink-100">
        <h3 className="text-xl font-bold text-gray-900">
          {editingSpace
            ? (locale === 'az' ? '✏️ Reklam Yeri Redaktə Et' : '✏️ Редактировать рекламное место')
            : (locale === 'az' ? '➕ Yeni Reklam Yeri' : '➕ Новое рекламное место')}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {locale === 'az' ? '📝 Ad' : '📝 Название'}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {locale === 'az' ? '🔗 Slug' : '🔗 Slug'}
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {locale === 'az' ? '📍 Yerləşmə' : '📍 Позиция'}
          </label>
          <select
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value as AdPosition })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
          >
            <option value="header">{locale === 'az' ? 'Header' : 'Шапка'}</option>
            <option value="sidebar">{locale === 'az' ? 'Sidebar' : 'Боковая панель'}</option>
            <option value="footer">{locale === 'az' ? 'Footer' : 'Подвал'}</option>
            <option value="in-content">{locale === 'az' ? 'Məzmun İçində' : 'В контенте'}</option>
            <option value="hero-center">{locale === 'az' ? 'Hero Mərkəz' : 'Центр Hero'}</option>
            <option value="mobile-banner">{locale === 'az' ? 'Mobil Banner' : 'Мобильный баннер'}</option>
            <option value="native">{locale === 'az' ? 'Native Reklam' : 'Нативная реклама'}</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {locale === 'az' ? '📏 En' : '📏 Ширина'} (px)
            </label>
            <input
              type="number"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {locale === 'az' ? '📐 Hündürlük' : '📐 Высота'} (px)
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
            />
            <span className="text-sm font-semibold text-gray-700">
              {locale === 'az' ? '✅ Aktiv' : '✅ Активен'}
            </span>
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50"
          >
            {loading
              ? (locale === 'az' ? '💾 Yadda saxlanılır...' : '💾 Сохранение...')
              : (locale === 'az' ? '💾 Yadda Saxla' : '💾 Сохранить')}
          </button>
          {editingSpace && (
            <button
              type="button"
              onClick={() => {
                setEditingSpace(null);
                setFormData({
                  name: '',
                  slug: '',
                  description: '',
                  position: 'header',
                  width: '',
                  height: '',
                  isActive: true,
                });
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              {locale === 'az' ? '❌ Ləğv Et' : '❌ Отмена'}
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {adSpaces.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500">
              {locale === 'az' ? 'Hələ reklam yeri yoxdur' : 'Рекламных мест пока нет'}
            </p>
          </div>
        ) : (
          adSpaces.map((space) => (
            <div
              key={space.id}
              className="flex items-center justify-between p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-all shadow-sm hover:shadow-md"
            >
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{space.name}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {space.slug} • {space.position} • {space.width}x{space.height} • {space.isActive ? '✅ Aktiv' : '❌ Deaktiv'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(space)}
                  className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-semibold hover:bg-pink-200 transition-all"
                >
                  {locale === 'az' ? '✏️ Redaktə' : '✏️ Редактировать'}
                </button>
                <button
                  onClick={() => handleDelete(space.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
                >
                  {locale === 'az' ? '🗑️ Sil' : '🗑️ Удалить'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdSpaceEditor;
