import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { storageService } from '../services/storage';
import ProtectedRoute from '../components/ProtectedRoute';

const UserSettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setFullName(user.fullName || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      let finalAvatarUrl = avatarUrl;

      // Upload avatar if new file selected
      if (avatarFile) {
        const { url, error: uploadError } = await storageService.uploadImage(avatarFile, {
          folder: 'avatars',
          maxSizeMB: 2,
        });
        if (uploadError) {
          setError(uploadError.message);
          setLoading(false);
          return;
        }
        if (url) {
          finalAvatarUrl = url;
        }
      }

      const { error: updateError } = await updateProfile({
        username: username || undefined,
        fullName: fullName || undefined,
        bio: bio || undefined,
        avatarUrl: finalAvatarUrl || undefined,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (err) {
      setError((err as Error).message);
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <div></div>
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {locale === 'az' ? 'Profil Parametrləri' : 'Настройки профиля'}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {locale === 'az' ? 'Profil uğurla yeniləndi!' : 'Профиль успешно обновлен!'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Profil şəkli' : 'Фото профиля'}
              </label>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(fullName || username || user.email || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {locale === 'az' ? 'JPG, PNG və ya GIF. Maksimum 2MB.' : 'JPG, PNG или GIF. Максимум 2MB.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'İstifadəçi adı' : 'Имя пользователя'}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder={locale === 'az' ? 'İstifadəçi adı' : 'Имя пользователя'}
              />
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Ad Soyad' : 'Имя Фамилия'}
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder={locale === 'az' ? 'Ad və soyadınız' : 'Ваше имя и фамилия'}
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Haqqımda' : 'О себе'}
              </label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder={locale === 'az' ? 'Özünüz haqqında qısa məlumat' : 'Краткая информация о себе'}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                {locale === 'az' ? 'Email ünvanı dəyişdirilə bilməz' : 'Email адрес нельзя изменить'}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {locale === 'az' ? 'Ləğv et' : 'Отмена'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? (locale === 'az' ? 'Yadda saxlanılır...' : 'Сохранение...')
                  : (locale === 'az' ? 'Yadda saxla' : 'Сохранить')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;

