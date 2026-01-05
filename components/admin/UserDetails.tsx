import React, { useState } from 'react';
import { UserProfile } from '../../types';
import UserActions from './UserActions';
import RoleEditor from './RoleEditor';

interface UserDetailsProps {
  user: UserProfile;
  onClose: () => void;
  onUpdate: () => void;
  locale: 'az' | 'ru';
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, onClose, onUpdate, locale }) => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {locale === 'az' ? 'İstifadəçi Detalları' : 'Детали пользователя'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-2xl">
              {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {user.full_name || user.username || 'Naməlum'}
              </h3>
              {user.username && (
                <p className="text-gray-600">@{user.username}</p>
              )}
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Tam Ad' : 'Полное имя'}
              </label>
              <p className="text-gray-900">{user.full_name || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Username' : 'Имя пользователя'}
              </label>
              <p className="text-gray-900">{user.username || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Email' : 'Email'}
              </label>
              <p className="text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Bio' : 'Биография'}
              </label>
              <p className="text-gray-900">{user.bio || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Qeydiyyat Tarixi' : 'Дата регистрации'}
              </label>
              <p className="text-gray-900">
                {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'az' ? 'Son Aktivlik' : 'Последняя активность'}
              </label>
              <p className="text-gray-900">
                {user.updated_at ? new Date(user.updated_at).toLocaleString() : '-'}
              </p>
            </div>
          </div>

          <RoleEditor user={user} onUpdate={onUpdate} locale={locale} />
          <UserActions user={user} onUpdate={onUpdate} locale={locale} />
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
