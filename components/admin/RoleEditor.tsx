import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { databases, DATABASE_ID, COLLECTIONS } from '../../services/appwrite';

interface RoleEditorProps {
  user: UserProfile;
  onUpdate: () => void;
  locale: 'az' | 'ru';
}

const RoleEditor: React.FC<RoleEditorProps> = ({ user, onUpdate, locale }) => {
  const [role, setRole] = useState<UserRole>(user.role || 'user');
  const [loading, setLoading] = useState(false);

  const handleUpdateRole = async () => {
    setLoading(true);
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        user.id,
        { role }
      );

      onUpdate();
      alert(locale === 'az' ? 'Rol yeniləndi' : 'Роль обновлена');
    } catch (error) {
      console.error('Error updating role:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-bold text-gray-900 mb-4">
        {locale === 'az' ? 'Rol İdarəetməsi' : 'Управление ролью'}
      </h4>
      <div className="flex items-center space-x-4">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="user">{locale === 'az' ? 'İstifadəçi' : 'Пользователь'}</option>
          <option value="author">{locale === 'az' ? 'Müəllif' : 'Автор'}</option>
          <option value="admin">{locale === 'az' ? 'Admin' : 'Админ'}</option>
        </select>
        <button
          onClick={handleUpdateRole}
          disabled={loading || role === user.role}
          className="px-6 py-2 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? (locale === 'az' ? 'Yenilənir...' : 'Обновление...')
            : (locale === 'az' ? 'Yenilə' : 'Обновить')}
        </button>
      </div>
    </div>
  );
};

export default RoleEditor;
