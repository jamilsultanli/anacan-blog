import React, { useState } from 'react';
import { AdSpace, Ad, AdType } from '../../types';
import { adsService } from '../../services/api/ads';
import ImageUploader from '../ImageUploader';

interface AdPlacementProps {
  adSpaces: AdSpace[];
  ads: Ad[];
  onUpdate: () => void;
  locale: 'az' | 'ru';
}

const AdPlacement: React.FC<AdPlacementProps> = ({ adSpaces, ads, onUpdate, locale }) => {
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    adSpaceId: '',
    title: '',
    type: 'banner' as AdType,
    content: '',
    imageUrl: '',
    videoUrl: '',
    linkUrl: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'clickCount' | 'impressionCount'> = {
        adSpaceId: formData.adSpaceId,
        title: formData.title,
        type: formData.type,
        content: formData.content || undefined,
        imageUrl: formData.imageUrl || undefined,
        videoUrl: formData.videoUrl || undefined,
        linkUrl: formData.linkUrl || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        isActive: formData.isActive,
      };

      if (editingAd) {
        const { error } = await adsService.updateAd(editingAd.id, data);
        if (error) throw error;
      } else {
        const { error } = await adsService.createAd(data);
        if (error) throw error;
      }

      onUpdate();
      setEditingAd(null);
      resetForm();
    } catch (error) {
      console.error('Error saving ad:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      adSpaceId: '',
      title: '',
      type: 'banner',
      content: '',
      imageUrl: '',
      videoUrl: '',
      linkUrl: '',
      startDate: '',
      endDate: '',
      isActive: true,
    });
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      adSpaceId: ad.adSpaceId,
      title: ad.title,
      type: ad.type,
      content: ad.content || '',
      imageUrl: ad.imageUrl || '',
      videoUrl: ad.videoUrl || '',
      linkUrl: ad.linkUrl || '',
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
      isActive: ad.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'az' ? 'Reklamı silmək istəyirsiniz?' : 'Удалить рекламу?')) {
      return;
    }

    try {
      const { error } = await adsService.deleteAd(id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-50 to-pink-50 rounded-xl p-6 space-y-4 border-2 border-pink-100">
        <h3 className="text-xl font-bold text-gray-900">
          {editingAd
            ? (locale === 'az' ? '✏️ Reklam Redaktə Et' : '✏️ Редактировать рекламу')
            : (locale === 'az' ? '➕ Yeni Reklam' : '➕ Новая реклама')}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {locale === 'az' ? '📍 Reklam Yeri' : '📍 Рекламное место'}
            </label>
            <select
              required
              value={formData.adSpaceId}
              onChange={(e) => setFormData({ ...formData, adSpaceId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            >
              <option value="">{locale === 'az' ? 'Seçin...' : 'Выберите...'}</option>
              {adSpaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {locale === 'az' ? '🎨 Tip' : '🎨 Тип'}
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as AdType })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            >
              <option value="banner">{locale === 'az' ? 'Banner' : 'Баннер'}</option>
              <option value="text">{locale === 'az' ? 'Mətn' : 'Текст'}</option>
              <option value="native">{locale === 'az' ? 'Native' : 'Нативная'}</option>
              <option value="video">{locale === 'az' ? 'Video' : 'Видео'}</option>
              <option value="sponsored">{locale === 'az' ? 'Sponsorlu' : 'Спонсорская'}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {locale === 'az' ? '📝 Başlıq' : '📝 Заголовок'}
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
          />
        </div>

        {formData.type === 'text' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {locale === 'az' ? '📄 Məzmun' : '📄 Содержимое'}
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            />
          </div>
        )}

        {(formData.type === 'banner' || formData.type === 'native') && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {locale === 'az' ? '🖼️ Şəkil' : '🖼️ Изображение'}
            </label>
            <ImageUploader
              onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
              currentImageUrl={formData.imageUrl}
              folder="ads"
              maxSizeMB={5}
              locale={locale}
            />
          </div>
        )}

        {formData.type === 'video' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {locale === 'az' ? '🎥 Video URL' : '🎥 URL видео'}
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {locale === 'az' ? '🔗 Link URL' : '🔗 URL ссылки'}
          </label>
          <input
            type="url"
            value={formData.linkUrl}
            onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {locale === 'az' ? '📅 Başlama Tarixi' : '📅 Дата начала'}
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {locale === 'az' ? '📅 Bitmə Tarixi' : '📅 Дата окончания'}
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
          {editingAd && (
            <button
              type="button"
              onClick={() => {
                setEditingAd(null);
                resetForm();
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              {locale === 'az' ? '❌ Ləğv Et' : '❌ Отмена'}
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {ads.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500">
              {locale === 'az' ? 'Hələ reklam yoxdur' : 'Рекламы пока нет'}
            </p>
          </div>
        ) : (
          ads.map((ad) => {
            const space = adSpaces.find((s) => s.id === ad.adSpaceId);
            return (
              <div
                key={ad.id}
                className="flex items-center justify-between p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-all shadow-sm hover:shadow-md"
              >
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{ad.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {space?.name} • {ad.type} • 👆 {ad.clickCount || 0} klik • 👁️ {ad.impressionCount || 0} görüntülənmə
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(ad)}
                    className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-semibold hover:bg-pink-200 transition-all"
                  >
                    {locale === 'az' ? '✏️ Redaktə' : '✏️ Редактировать'}
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
                  >
                    {locale === 'az' ? '🗑️ Sil' : '🗑️ Удалить'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdPlacement;
