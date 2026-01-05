import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const MobileBottomNav: React.FC = () => {
  const { locale } = useLanguage();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show on mobile and for public routes
  const isPublicRoute = !location.pathname.startsWith('/admin') && 
                        !location.pathname.startsWith('/login') && 
                        !location.pathname.startsWith('/register');

  if (!isMobile || !isPublicRoute) {
    return null;
  }

  const navItems = [
    {
      path: '/',
      icon: '🏠',
      label: locale === 'az' ? 'Ana səhifə' : 'Главная',
    },
    {
      path: '/blog',
      icon: '📝',
      label: locale === 'az' ? 'Blog' : 'Блог',
    },
    {
      path: '/forums',
      icon: '💬',
      label: locale === 'az' ? 'Forumlar' : 'Форумы',
    },
    {
      path: '/reading-lists',
      icon: '📚',
      label: locale === 'az' ? 'Siyahılar' : 'Списки',
    },
    {
      path: '/preferences',
      icon: '⚙️',
      label: locale === 'az' ? 'Parametrlər' : 'Настройки',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-[60px] ${
                isActive
                  ? 'text-pink-600 bg-pink-50'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

