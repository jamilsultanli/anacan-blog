import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const AdminLayout: React.FC = () => {
  const { t, locale } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: locale === 'az' ? 'Dashboard' : 'Панель управления', path: '/admin', icon: '📊' },
    { label: locale === 'az' ? 'Məqalələr' : 'Статьи', path: '/admin/posts', icon: '📝' },
    { label: locale === 'az' ? 'Kateqoriyalar' : 'Категории', path: '/admin/categories', icon: '📁' },
    { label: locale === 'az' ? 'Menyalar' : 'Меню', path: '/admin/menus', icon: '📋' },
    { label: locale === 'az' ? 'Səhifələr' : 'Страницы', path: '/admin/pages', icon: '📄' },
    { label: locale === 'az' ? 'Hekayələr' : 'Истории', path: '/admin/stories', icon: '📸' },
    { label: locale === 'az' ? 'Forum Kateqoriyaları' : 'Категории форумов', path: '/admin/forums', icon: '📁' },
    { label: locale === 'az' ? 'Forum Müzakirələri' : 'Обсуждения форумов', path: '/admin/forum-posts', icon: '💬' },
    { label: 'SEO', path: '/admin/seo', icon: '🔍' },
    { label: locale === 'az' ? 'İstifadəçilər' : 'Пользователи', path: '/admin/users', icon: '👥' },
    { label: locale === 'az' ? 'Reklamlar' : 'Реклама', path: '/admin/ads', icon: '📢' },
    { label: locale === 'az' ? 'Newsletter' : 'Рассылка', path: '/admin/newsletter', icon: '📧' },
    { label: locale === 'az' ? 'Analitika' : 'Аналитика', path: '/admin/analytics', icon: '📊' },
    { label: locale === 'az' ? 'Tərcümələr' : 'Переводы', path: '/admin/translations', icon: '🌐' },
    { label: locale === 'az' ? 'Parametrlər' : 'Настройки', path: '/admin/settings', icon: '⚙️' },
    { label: locale === 'az' ? 'Sayt' : 'Сайт', path: '/', icon: '🌐' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-inter">
      {/* Mobile Menu Button */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <span className="text-xl font-extrabold text-pink-600 font-montserrat">Admin</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white border-r border-gray-200 fixed md:relative h-full z-40 md:z-auto`}>
        <div className="h-20 hidden md:flex items-center px-8 border-b border-gray-100">
          <span className="text-2xl font-extrabold text-pink-600 font-montserrat">Admin</span>
        </div>
        <nav className="p-4 space-y-2 overflow-y-auto max-h-screen md:max-h-[calc(100vh-5rem)]">
          {menuItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                  ? 'bg-pink-50 text-pink-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-0 p-4 md:p-8 w-full">
         <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
