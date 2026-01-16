import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translationService } from '../services/translations';
import AdBanner from './AdBanner';

const Footer: React.FC = () => {
  const { locale, t } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load translations
        const footerTranslations = await translationService.getTranslations(locale, 'footer');
        setTranslations(footerTranslations);
      } catch (error) {
        console.error('Error loading footer data:', error);
      }
    };
    loadData();
  }, [locale]);

  const brandText = translations.footer_brand || (locale === 'az' 
    ? 'Azərbaycanda analıq və uşaq baxımı mövzusunda ən etibarlı platformadır'
    : 'Самая надежная платформа по материнству и уходу за детьми в Азербайджане');
  const resourcesTitle = translations.footer_resources || (locale === 'az' ? 'Resurslar' : 'Ресурсы');
  const legalTitle = translations.footer_legal || (locale === 'az' ? 'Hüquqi' : 'Правовая информация');
  const copyrightText = translations.footer_copyright || (locale === 'az' 
    ? 'Bütün hüquqlar qorunur'
    : 'Все права защищены');

  return (
    <footer className="w-full bg-white border-t border-gray-100 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <h3 className="text-2xl font-display font-bold text-gray-900">
                Anacan<span className="text-coral-500">.az</span>
              </h3>
            </Link>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {brandText}
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="https://instagram.com/anacan.az" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://facebook.com/anacan.az" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com/@anacan.az" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Youtube"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Resources - Important Pages */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">{resourcesTitle}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/haqqimizda" className="text-sm text-gray-600 hover:text-coral-500 transition-colors">
                  {locale === 'az' ? 'Haqqımızda' : 'О нас'}
                </Link>
              </li>
              <li>
                <Link to="/forums" className="text-sm text-gray-600 hover:text-coral-500 transition-colors">
                  {locale === 'az' ? 'Forumlar' : 'Форумы'}
                </Link>
              </li>
              <li>
                <Link to="/elaqe" className="text-sm text-gray-600 hover:text-coral-500 transition-colors">
                  {locale === 'az' ? 'Əlaqə' : 'Контакты'}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-600 hover:text-coral-500 transition-colors">
                  {locale === 'az' ? 'Blog' : 'Блог'}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal - Legal Pages */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">{legalTitle}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/mexfilik" className="text-sm text-gray-600 hover:text-coral-500 transition-colors">
                  {locale === 'az' ? 'Məxfilik Siyasəti' : 'Политика Конфиденциальности'}
                </Link>
              </li>
              <li>
                <Link to="/istifade-qaydalari" className="text-sm text-gray-600 hover:text-coral-500 transition-colors">
                  {locale === 'az' ? 'İstifadə Qaydaları' : 'Условия Использования'}
                </Link>
              </li>
              <li>
                <Link to="/gizlilik" className="text-sm text-gray-600 hover:text-coral-500 transition-colors">
                  {locale === 'az' ? 'Gizlilik Siyasəti' : 'Политика Безопасности'}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-2">
            © {new Date().getFullYear()} Anacan.az. {copyrightText}
          </p>
          <p className="text-xs text-gray-400">
            {locale === 'az' ? 'Hazırlanıb' : 'Разработано'} <a 
              href="https://atlasoon.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-coral-500 hover:text-coral-600 font-semibold transition-colors"
            >
              Atlasoon
            </a>
          </p>
        </div>
      </div>
      
      {/* Footer Bottom Ad - Desktop Only */}
      <AdBanner slug="footer-bottom" desktopOnly className="w-full py-4 bg-gray-50" />
      
      {/* Mobile Banner Bottom */}
      <AdBanner slug="mobile-banner-bottom" mobileOnly className="w-full py-2 bg-gray-50" />
    </footer>
  );
};

export default Footer;
