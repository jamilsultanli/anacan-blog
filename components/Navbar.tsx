import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { categoriesService } from '../services/api/categories';
import { pagesService } from '../services/api/pages';
import { Category } from '../types';
import AdBanner from './AdBanner';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [blogMenuOpen, setBlogMenuOpen] = useState(false);
  const { locale, setLocale } = useLanguage();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const blogMenuRef = useRef<HTMLDivElement>(null);

  if (location.pathname.startsWith('/admin')) return null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesResponse, pagesResponse] = await Promise.all([
          categoriesService.getCategories(),
          pagesService.getPages(true),
        ]);
        setCategories(categoriesResponse.data || []);
      } catch (error) {
        console.error('Error loading navbar data:', error);
      }
    };
    loadData();
  }, [locale]);

  // Close blog menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blogMenuRef.current && !blogMenuRef.current.contains(event.target as Node)) {
        setBlogMenuOpen(false);
      }
    };

    if (blogMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [blogMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const homeText = locale === 'az' ? 'Ana Səhifə' : 'Главная';
  const blogText = locale === 'az' ? 'Blog' : 'Блог';
  const forumsText = locale === 'az' ? 'Forumlar' : 'Форумы';
  const contactText = locale === 'az' ? 'Əlaqə' : 'Контакты';
  const aboutText = locale === 'az' ? 'Haqqımızda' : 'О нас';
  const loginText = locale === 'az' ? 'Giriş' : 'Вход';

  // Find contact and about pages
  const contactPage = categories.find(cat => cat.slug === 'elaqe') || null;
  const aboutPage = categories.find(cat => cat.slug === 'haqqimizda') || null;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <AdBanner slug="header-top-desktop" desktopOnly className="w-full py-2 bg-gray-50" />
      <AdBanner slug="mobile-banner-top" mobileOnly className="w-full py-2 bg-gray-50" />
      
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-airbnb' 
          : 'bg-white'
      }`}>
        <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white text-xl font-bold">A</span>
              </div>
              <span className="text-2xl font-display font-bold text-gray-900 hidden sm:block">
                Anacan<span className="text-coral-500">.az</span>
              </span>
            </Link>

            {/* Center Menu - Desktop Mega Menu */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Ana Səhifə */}
              <Link 
                to="/"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {homeText}
              </Link>

              {/* Blog with Mega Menu */}
              <div 
                ref={blogMenuRef}
                className="relative"
                onMouseEnter={() => setBlogMenuOpen(true)}
                onMouseLeave={() => setBlogMenuOpen(false)}
              >
                <Link 
                  to="/blog"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    isActive('/blog') && !location.pathname.startsWith('/category')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {blogText}
                  <svg className={`w-4 h-4 transition-transform ${blogMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {/* Mega Menu Dropdown */}
                {blogMenuOpen && categories.length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-white rounded-2xl shadow-airbnb-lg border border-gray-100 p-6">
                    <div className="mb-4">
                      <Link 
                        to="/blog" 
                        className="text-lg font-bold text-gray-900 hover:text-coral-500 transition-colors"
                        onClick={() => setBlogMenuOpen(false)}
                      >
                        {blogText}
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {categories.slice(0, 12).map((category) => (
                        <Link
                          key={category.id}
                          to={`/category/${category.slug}`}
                          className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-all group"
                          onClick={() => setBlogMenuOpen(false)}
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral-100 to-pink-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">{category.icon || '📝'}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 text-center group-hover:text-coral-500 transition-colors">
                            {category.name[locale]}
                          </span>
                        </Link>
                      ))}
                    </div>
                    {categories.length > 12 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link 
                          to="/blog" 
                          className="text-center block text-sm font-semibold text-coral-500 hover:text-coral-600 transition-colors"
                          onClick={() => setBlogMenuOpen(false)}
                        >
                          {locale === 'az' ? 'Hamısını gör' : 'Посмотреть все'} →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Forumlar */}
              <Link 
                to="/forums"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive('/forums')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {forumsText}
              </Link>

              {/* Əlaqə */}
              <Link 
                to="/elaqe"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive('/elaqe')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {contactText}
              </Link>

              {/* Haqqımızda */}
              <Link 
                to="/haqqimizda"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive('/haqqimizda')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {aboutText}
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
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
                      className="px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent w-full max-w-[200px] sm:w-48 md:w-64 bg-white shadow-sm"
                      autoFocus
                      onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Search"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Language Toggle */}
              <div className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                <button 
                  onClick={() => setLocale('az')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    locale === 'az' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  AZ
                </button>
                <button 
                  onClick={() => setLocale('ru')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    locale === 'ru' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  RU
                </button>
              </div>
              
              {/* User Menu */}
              {user ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 rounded-full border border-gray-200 hover:shadow-airbnb transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-pink-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm group-hover:shadow-md transition-all">
                    {(user.full_name || user.username || user.email)?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.full_name || user.username || 'Profil'}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:border-gray-400 hover:shadow-sm transition-all duration-200"
                >
                  {loginText}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="max-w-[1760px] mx-auto px-4 py-4 space-y-1">
              <Link 
                to="/"
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {homeText}
              </Link>
              
              {/* Blog Categories in Mobile */}
              <div className="px-4 py-2">
                <Link 
                  to="/blog"
                  className="block text-sm font-bold text-gray-900 mb-2"
                  onClick={() => setIsOpen(false)}
                >
                  {blogText}
                </Link>
                <div className="pl-2 space-y-1">
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{category.icon || '📝'}</span>
                      <span>{category.name[locale]}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link 
                to="/forums"
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {forumsText}
              </Link>
              
              <Link 
                to="/elaqe"
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {contactText}
              </Link>
              
              <Link 
                to="/haqqimizda"
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {aboutText}
              </Link>

              {user && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link 
                    to="/profile"
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {user.full_name || user.username || user.email}
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    {locale === 'az' ? 'Çıxış' : 'Выход'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Spacer for fixed navbar */}
      <div className="h-20" />
      
      <AdBanner slug="header-bottom-desktop" desktopOnly className="w-full py-2 bg-gray-50" />
    </>
  );
};

export default Navbar;
