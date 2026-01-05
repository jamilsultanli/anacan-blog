import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../services/appwrite';
import { UserProfile, UserRole } from '../types';
import UserList from '../components/admin/UserList';
import UserDetails from '../components/admin/UserDetails';

const UserManager: React.FC = () => {
  const { locale } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [filter, setFilter] = useState<'all' | 'user' | 'author' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const queries: string[] = [Query.orderDesc('$createdAt')];
      
      if (filter !== 'all') {
        queries.push(Query.equal('role', filter));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        queries
      );

      const usersData: UserProfile[] = (response.documents || []).map((doc: any) => ({
        id: doc.$id,
        username: doc.username,
        full_name: doc.full_name,
        email: doc.email,
        avatar_url: doc.avatar_url,
        bio: doc.bio,
        role: doc.role as UserRole,
        createdAt: doc.$createdAt ? new Date(doc.$createdAt).toISOString() : undefined,
        updatedAt: doc.$updatedAt ? new Date(doc.$updatedAt).toISOString() : undefined,
      }));

      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {locale === 'az' ? 'İstifadəçi İdarəetməsi' : 'Управление пользователями'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'az' 
                ? 'İstifadəçiləri idarə edin və rolları tənzimləyin' 
                : 'Управляйте пользователями и настраивайте роли'}
            </p>
          </div>
        </div>

        {/* Modern Filters Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {locale === 'az' ? '🔍 Axtarış' : '🔍 Поиск'}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === 'az' ? 'Ad, email, username...' : 'Имя, email, username...'}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {locale === 'az' ? '👤 Rol' : '👤 Роль'}
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              >
                <option value="all">{locale === 'az' ? 'Hamısı' : 'Все'}</option>
                <option value="user">{locale === 'az' ? 'İstifadəçi' : 'Пользователь'}</option>
                <option value="author">{locale === 'az' ? 'Müəllif' : 'Автор'}</option>
                <option value="admin">{locale === 'az' ? 'Admin' : 'Админ'}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadUsers}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {locale === 'az' ? '🔄 Yenilə' : '🔄 Обновить'}
              </button>
            </div>
          </div>
        </div>

        {/* Users List Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-pink-600 font-semibold">Loading...</span>
                </div>
              </div>
            </div>
          ) : (
            <UserList
              users={filteredUsers}
              onSelectUser={setSelectedUser}
              locale={locale}
            />
          )}
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <UserDetails
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onUpdate={loadUsers}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
};

export default UserManager;
