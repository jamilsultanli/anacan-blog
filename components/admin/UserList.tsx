import React from 'react';
import { UserProfile } from '../../types';

interface UserListProps {
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  locale: 'az' | 'ru';
}

const UserList: React.FC<UserListProps> = ({ users, onSelectUser, locale }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'author':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'banned':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {locale === 'az' ? 'İstifadəçi tapılmadı' : 'Пользователи не найдены'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-bold text-gray-700">
              {locale === 'az' ? 'İstifadəçi' : 'Пользователь'}
            </th>
            <th className="text-left py-3 px-4 font-bold text-gray-700">
              {locale === 'az' ? 'Email' : 'Email'}
            </th>
            <th className="text-left py-3 px-4 font-bold text-gray-700">
              {locale === 'az' ? 'Rol' : 'Роль'}
            </th>
            <th className="text-left py-3 px-4 font-bold text-gray-700">
              {locale === 'az' ? 'Status' : 'Статус'}
            </th>
            <th className="text-left py-3 px-4 font-bold text-gray-700">
              {locale === 'az' ? 'Qeydiyyat' : 'Регистрация'}
            </th>
            <th className="text-left py-3 px-4 font-bold text-gray-700">
              {locale === 'az' ? 'Əməliyyatlar' : 'Действия'}
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectUser(user)}
            >
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                    {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.full_name || user.username || 'Naməlum'}</p>
                    {user.username && (
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-gray-700">{user.email}</td>
              <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role || 'user')}`}>
                  {user.role === 'admin' ? (locale === 'az' ? 'Admin' : 'Админ') :
                   user.role === 'author' ? (locale === 'az' ? 'Müəllif' : 'Автор') :
                   (locale === 'az' ? 'İstifadəçi' : 'Пользователь')}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status || 'active')}`}>
                  {user.status === 'active' ? (locale === 'az' ? 'Aktiv' : 'Активный') :
                   user.status === 'banned' ? (locale === 'az' ? 'Banlanmış' : 'Забанен') :
                   user.status === 'pending' ? (locale === 'az' ? 'Gözləyir' : 'Ожидает') :
                   (locale === 'az' ? 'Aktiv' : 'Активный')}
                </span>
              </td>
              <td className="py-4 px-4 text-sm text-gray-600">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
              </td>
              <td className="py-4 px-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectUser(user);
                  }}
                  className="text-pink-600 hover:text-pink-700 font-medium text-sm"
                >
                  {locale === 'az' ? 'Bax' : 'Просмотр'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;

