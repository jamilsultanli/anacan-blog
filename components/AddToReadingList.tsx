import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { readingListsService, ReadingList } from '../services/api/readingLists';

interface AddToReadingListProps {
  postId: string;
  onAdded?: () => void;
  onClose: () => void;
}

const AddToReadingList: React.FC<AddToReadingListProps> = ({ postId, onAdded, onClose }) => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user]);

  const loadLists = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await readingListsService.getReadingLists(user.id);
      if (!error && data) {
        setLists(data);
      }
    } catch (error) {
      console.error('Error loading reading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (listId: string) => {
    if (!user) return;
    setAdding(listId);
    try {
      const { error } = await readingListsService.addPostToList(listId, postId);
      if (!error) {
        if (onAdded) onAdded();
        onClose();
      } else {
        alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
      }
    } catch (error) {
      console.error('Error adding to list:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    } finally {
      setAdding(null);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newListName.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await readingListsService.createReadingList({
        name: newListName.trim(),
        description: newListDescription.trim() || undefined,
        isPublic: false,
      });

      if (!error && data) {
        setLists([...lists, data]);
        setNewListName('');
        setNewListDescription('');
        setShowCreateForm(false);
        // Automatically add to the new list
        await handleAddToList(data.id);
      } else {
        alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
      }
    } catch (error) {
      console.error('Error creating list:', error);
      alert(locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка');
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {locale === 'az' ? 'Giriş edin' : 'Войдите'}
          </h3>
          <p className="text-gray-600 mb-4">
            {locale === 'az' 
              ? 'Oxuma siyahısına əlavə etmək üçün giriş etməlisiniz.' 
              : 'Для добавления в список чтения необходимо войти.'}
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            {locale === 'az' ? 'Bağla' : 'Закрыть'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {locale === 'az' ? 'Oxuma siyahısına əlavə et' : 'Добавить в список чтения'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-200 border-t-pink-600"></div>
          </div>
        ) : (
          <>
            {!showCreateForm ? (
              <>
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {lists.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {locale === 'az' ? 'Heç bir oxuma siyahısı yoxdur' : 'Нет списков чтения'}
                    </p>
                  ) : (
                    lists.map((list) => (
                      <button
                        key={list.id}
                        onClick={() => handleAddToList(list.id)}
                        disabled={adding === list.id}
                        className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">{list.name}</div>
                          {list.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">{list.description}</div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {list.postCount} {locale === 'az' ? 'məqalə' : 'статей'}
                          </div>
                        </div>
                        {adding === list.id && (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-pink-200 border-t-pink-600"></div>
                        )}
                      </button>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full px-4 py-3 bg-pink-100 text-pink-600 rounded-lg font-semibold hover:bg-pink-200 transition-colors mb-2"
                >
                  + {locale === 'az' ? 'Yeni siyahı yarat' : 'Создать новый список'}
                </button>
              </>
            ) : (
              <form onSubmit={handleCreateList} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'az' ? 'Siyahı adı' : 'Название списка'} *
                  </label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder={locale === 'az' ? 'Məsələn: Oxunacaq məqalələr' : 'Например: Статьи для чтения'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'az' ? 'Təsvir' : 'Описание'} (optional)
                  </label>
                  <textarea
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder={locale === 'az' ? 'Qısa təsvir...' : 'Краткое описание...'}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={creating || !newListName.trim()}
                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50"
                  >
                    {creating 
                      ? (locale === 'az' ? 'Yaradılır...' : 'Создание...')
                      : (locale === 'az' ? 'Yarat və əlavə et' : 'Создать и добавить')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewListName('');
                      setNewListDescription('');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    {locale === 'az' ? 'Ləğv' : 'Отмена'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AddToReadingList;

