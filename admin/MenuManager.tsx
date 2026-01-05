import React, { useEffect, useState } from 'react';
import { menusService, Menu, MenuItem } from '../services/api/menus';
import { useLanguage } from '../contexts/LanguageContext';

const MenuManager: React.FC = () => {
  const { locale, t } = useLanguage();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuName, setMenuName] = useState('');
  const [menuLocation, setMenuLocation] = useState<'header' | 'footer'>('header');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemTarget, setNewItemTarget] = useState<'_blank' | '_self'>('_self');

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const { data } = await menusService.getMenus();
      setMenus(data || []);
    } catch (error) {
      console.error('Error loading menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = async () => {
    if (!menuName.trim()) {
      alert(locale === 'az' ? 'Menu adı daxil edin' : 'Введите название меню');
      return;
    }

    try {
      const { error } = await menusService.createMenu({
        name: menuName,
        location: menuLocation,
        items: menuItems,
        order: 0,
      });

      if (error) throw error;
      await loadMenus();
      setMenuName('');
      setMenuItems([]);
      setMenuLocation('header');
    } catch (error) {
      console.error('Error creating menu:', error);
      alert(locale === 'az' ? 'Menu yaradıla bilmədi' : 'Не удалось создать меню');
    }
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setMenuName(menu.name);
    setMenuLocation(menu.location);
    setMenuItems([...menu.items]);
  };

  const handleUpdateMenu = async () => {
    if (!editingMenu) return;

    try {
      const { error } = await menusService.updateMenu(editingMenu.id, {
        name: menuName,
        location: menuLocation,
        items: menuItems,
      });

      if (error) throw error;
      await loadMenus();
      setEditingMenu(null);
      setMenuName('');
      setMenuItems([]);
      setMenuLocation('header');
    } catch (error) {
      console.error('Error updating menu:', error);
      alert(locale === 'az' ? 'Menu yenilənə bilmədi' : 'Не удалось обновить меню');
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm(locale === 'az' ? 'Menu silinsin?' : 'Удалить меню?')) return;

    try {
      const { error } = await menusService.deleteMenu(id);
      if (error) throw error;
      await loadMenus();
    } catch (error) {
      console.error('Error deleting menu:', error);
      alert(locale === 'az' ? 'Menu silinə bilmədi' : 'Не удалось удалить меню');
    }
  };

  const handleAddMenuItem = () => {
    if (!newItemLabel.trim() || !newItemUrl.trim()) {
      alert(locale === 'az' ? 'Label və URL daxil edin' : 'Введите метку и URL');
      return;
    }

    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: newItemLabel,
      url: newItemUrl,
      target: newItemTarget,
    };

    setMenuItems([...menuItems, newItem]);
    setNewItemLabel('');
    setNewItemUrl('');
    setNewItemTarget('_self');
  };

  const handleRemoveMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...menuItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newItems.length) return;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setMenuItems(newItems);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {locale === 'az' ? '📋 Menu İdarəçisi' : '📋 Менеджер меню'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'az' 
                ? 'Header və Footer menyularını idarə edin' 
                : 'Управляйте меню header и footer'}
            </p>
          </div>
        </div>

        {/* Create/Edit Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingMenu 
              ? (locale === 'az' ? 'Menu Redaktə Et' : 'Редактировать меню')
              : (locale === 'az' ? 'Yeni Menu Yarad' : 'Создать новое меню')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {locale === 'az' ? 'Menu Adı' : 'Название меню'}
              </label>
              <input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                placeholder={locale === 'az' ? 'Məsələn: Ana Menu' : 'Например: Главное меню'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {locale === 'az' ? 'Yer' : 'Расположение'}
              </label>
              <select
                value={menuLocation}
                onChange={(e) => setMenuLocation(e.target.value as 'header' | 'footer')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              >
                <option value="header">{locale === 'az' ? 'Header' : 'Шапка'}</option>
                <option value="footer">{locale === 'az' ? 'Footer' : 'Подвал'}</option>
              </select>
            </div>
          </div>

          {/* Add Menu Item */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {locale === 'az' ? 'Menu Elementi Əlavə Et' : 'Добавить элемент меню'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                placeholder={locale === 'az' ? 'Label' : 'Метка'}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <input
                type="text"
                value={newItemUrl}
                onChange={(e) => setNewItemUrl(e.target.value)}
                placeholder={locale === 'az' ? 'URL' : 'URL'}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <select
                value={newItemTarget}
                onChange={(e) => setNewItemTarget(e.target.value as '_blank' | '_self')}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="_self">{locale === 'az' ? 'Eyni pəncərə' : 'То же окно'}</option>
                <option value="_blank">{locale === 'az' ? 'Yeni pəncərə' : 'Новое окно'}</option>
              </select>
              <button
                onClick={handleAddMenuItem}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-all"
              >
                {locale === 'az' ? '+ Əlavə Et' : '+ Добавить'}
              </button>
            </div>
          </div>

          {/* Menu Items List */}
          {menuItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {locale === 'az' ? 'Menu Elementləri' : 'Элементы меню'}
              </h3>
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <span className="font-semibold text-gray-900">{item.label}</span>
                      <span className="text-gray-600 text-sm">{item.url}</span>
                      <span className="text-gray-500 text-xs">{item.target}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMoveItem(index, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-500 hover:text-pink-600 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveItem(index, 'down')}
                        disabled={index === menuItems.length - 1}
                        className="p-2 text-gray-500 hover:text-pink-600 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => handleRemoveMenuItem(item.id)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex space-x-4">
            {editingMenu && (
              <button
                onClick={() => {
                  setEditingMenu(null);
                  setMenuName('');
                  setMenuItems([]);
                  setMenuLocation('header');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                {locale === 'az' ? 'Ləğv Et' : 'Отмена'}
              </button>
            )}
            <button
              onClick={editingMenu ? handleUpdateMenu : handleCreateMenu}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all"
            >
              {editingMenu 
                ? (locale === 'az' ? 'Yenilə' : 'Обновить')
                : (locale === 'az' ? 'Yarad' : 'Создать')}
            </button>
          </div>
        </div>

        {/* Menus List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === 'az' ? 'Mövcud Menyalar' : 'Существующие меню'}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600"></div>
            </div>
          ) : menus.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {locale === 'az' ? 'Heç bir menu yoxdur' : 'Нет меню'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {menus.map(menu => (
                <div key={menu.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{menu.name}</h3>
                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                          {menu.location}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {menu.items.length} {locale === 'az' ? 'element' : 'элементов'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {menu.items.map(item => (
                          <span
                            key={item.id}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {item.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditMenu(menu)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all"
                      >
                        {locale === 'az' ? 'Redaktə' : 'Редактировать'}
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(menu.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
                      >
                        {locale === 'az' ? 'Sil' : 'Удалить'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuManager;

