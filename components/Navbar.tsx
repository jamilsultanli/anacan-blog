import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { menusService, MenuItem } from '../services/api/menus';
import { translationService } from '../services/translations';
import AdBanner from './AdBanner';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Hide public navbar on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load translations
        const navTranslations = await translationService.getTranslations(locale, 'navbar');
        setTranslations(navTranslations);

        // Load menu
        const { data } = await menusService.getMenus('header');
        if (data && data.length > 0) {
          setMenuItems(data[0].items);
        }
      } catch (error) {
        console.error('Error loading navbar data:', error);
      }
    };
    loadData();
  }, [locale]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const renderMenuItem = (item: MenuItem) => {
    const label = item.label_az && item.label_ru 
      ? (locale === 'az' ? item.label_az : item.label_ru)
      : item.label;
    
    return (
      <Link
        key={item.id}
        to={item.url}
        target={item.target}
        className="text-sm text-gray-700 hover:text-pink-500 transition-colors"
      >
        {label}
      </Link>
    );
  };

  const homeText = translations.nav_home || (locale === 'az' ? 'Ana Səhifə' : 'Главная');
  const loginText = translations.nav_login || (locale === 'az' ? 'Giriş' : 'Вход');

  return (
    <>
      {/* Header Top Ad - Desktop Only */}
      <AdBanner slug="header-top-desktop" desktopOnly className="w-full py-2 bg-gray-50" />
      
      {/* Mobile Banner Top */}
      <AdBanner slug="mobile-banner-top" mobileOnly className="w-full py-2 bg-gray-50" />
      
      <nav className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-lg text-gray-900">
              Anacan<span className="text-pink-500">.az</span>
            </span>
          </Link>

          {/* Center Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.length > 0 ? (
              menuItems.map(renderMenuItem)
            ) : (
              <>
                <Link to="/" className="text-sm text-gray-700 hover:text-pink-500 transition-colors">
                  {homeText}
                </Link>
                <Link 
                  to="/blog"
                  className="text-sm text-gray-700 hover:text-pink-500 transition-colors"
                >
                  {translations.nav_blog || (locale === 'az' ? 'Blog' : 'Блог')}
                </Link>
                <Link 
                  to="/forums"
                  className="text-sm text-gray-700 hover:text-pink-500 transition-colors"
                >
                  {locale === 'az' ? 'Forumlar' : 'Форумы'}
                </Link>
                <Link 
                  to="/category/pregnancy"
                  className="text-sm text-gray-700 hover:text-pink-500 transition-colors"
                >
                  {translations.nav_pregnancy || (locale === 'az' ? 'Hamilik' : 'Беременность')}
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={locale === 'az' ? 'Axtar...' : 'Поиск...'}
                    className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent w-48 md:w-64"
                    autoFocus
                    onBlur={() => {
                      setTimeout(() => setIsSearchOpen(false), 200);
                    }}
                  />
                  <button
                    type="submit"
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors"
                    aria-label="Search"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <button 
                onClick={() => setLocale('az')}
                className={`px-2 py-1 hover:text-pink-500 transition-colors ${locale === 'az' ? 'text-pink-500 font-medium' : ''}`}
              >
                AZ
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => setLocale('ru')}
                className={`px-2 py-1 hover:text-pink-500 transition-colors ${locale === 'ru' ? 'text-pink-500 font-medium' : ''}`}
              >
                RU
              </button>
            </div>
            
            {user ? (
              <Link
                to="/profile"
                className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-full hover:border-pink-300 hover:text-pink-500 transition-colors flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-xs font-semibold">
                  {(user.full_name || user.username || user.email)?.[0]?.toUpperCase() || 'U'}
                </div>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-full hover:border-pink-300 hover:text-pink-500 transition-colors"
              >
                {loginText}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-1">
              {menuItems.length > 0 ? (
                menuItems.map(item => (
                  <Link
                    key={item.id}
                    to={item.url}
                    target={item.target}
                    className="text-sm text-gray-700 hover:text-pink-500 py-2 px-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))
              ) : (
                <>
                  <Link 
                    to="/"
                    className="text-sm text-gray-700 hover:text-pink-500 py-2 px-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {homeText}
                  </Link>
                  <Link 
                    to="/blog"
                    className="text-sm text-gray-700 hover:text-pink-500 py-2 px-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {translations.nav_blog || (locale === 'az' ? 'Blog' : 'Блог')}
                  </Link>
                  <Link 
                    to="/forums"
                    className="text-sm text-gray-700 hover:text-pink-500 py-2 px-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {locale === 'az' ? 'Forumlar' : 'Форумы'}
                  </Link>
                  <Link 
                    to="/category/pregnancy"
                    className="text-sm text-gray-700 hover:text-pink-500 py-2 px-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {translations.nav_pregnancy || (locale === 'az' ? 'Hamilik' : 'Беременность')}
                  </Link>
                </>
              )}
              {user && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link 
                    to="/profile"
                    className="text-sm text-gray-700 hover:text-pink-500 py-2 px-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {user.full_name || user.username || user.email}
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="text-left text-sm text-gray-700 hover:text-red-600 py-2 px-2 transition-colors"
                  >
                    {translations.nav_logout || (locale === 'az' ? 'Çıxış' : 'Выход')}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      </nav>
      
      {/* Header Bottom Ad - Desktop Only */}
      <AdBanner slug="header-bottom-desktop" desktopOnly className="w-full py-2 bg-gray-50" />
    </>
  );
};

export default Navbar;
