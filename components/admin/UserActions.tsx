import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { databases, DATABASE_ID, COLLECTIONS } from '../../services/appwrite';

interface UserActionsProps {
  user: UserProfile;
  onUpdate: () => void;
  locale: 'az' | 'ru';
}

const UserActions: React.FC<UserActionsProps> = ({ user, onUpdate, locale }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleBan = async () => {
    if (!confirm(locale === 'az' ? 'İstifadəçini banlamaq istəyirsiniz?' : 'Забанить пользователя?')) {
      return;
    }

    setLoading('ban');
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        user.id,
        { status: 'banned' }
      );

      onUpdate();
      alert(locale === 'az' ? 'İstifadəçi banlandı' : 'Пользователь забанен');
    } catch (error) {
      console.error('Error banning user:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    } finally {
      setLoading(null);
    }
  };

  const handleUnban = async () => {
    setLoading('unban');
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        user.id,
        { status: 'active' }
      );

      onUpdate();
      alert(locale === 'az' ? 'İstifadəçi aktivləşdirildi' : 'Пользователь активирован');
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(locale === 'az' ? 'İstifadəçini silmək istəyirsiniz? Bu əməliyyat geri alına bilməz.' : 'Удалить пользователя? Это действие нельзя отменить.')) {
      return;
    }

    setLoading('delete');
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        user.id
      );

      onUpdate();
      alert(locale === 'az' ? 'İstifadəçi silindi' : 'Пользователь удален');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-bold text-gray-900 mb-4">
        {locale === 'az' ? 'Əməliyyatlar' : 'Действия'}
      </h4>
      <div className="flex flex-wrap gap-3">
        {user.status === 'banned' ? (
          <button
            onClick={handleUnban}
            disabled={loading !== null}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading === 'unban'
              ? (locale === 'az' ? 'Aktivləşdirilir...' : 'Активация...')
              : (locale === 'az' ? 'Aktivləşdir' : 'Активировать')}
          </button>
        ) : (
          <button
            onClick={handleBan}
            disabled={loading !== null}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading === 'ban'
              ? (locale === 'az' ? 'Banlanır...' : 'Блокировка...')
              : (locale === 'az' ? 'Banla' : 'Забанить')}
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={loading !== null}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading === 'delete'
            ? (locale === 'az' ? 'Silinir...' : 'Удаление...')
            : (locale === 'az' ? 'Sil' : 'Удалить')}
        </button>
      </div>
    </div>
  );
};

export default UserActions;
