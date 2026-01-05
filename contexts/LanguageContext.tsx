
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Locale, LanguageContextType } from '../types';
import { translationService } from '../services/translations';

// Fallback translations (used while loading from database)
const fallbackTranslations = {
  az: {
    heroTitle: 'Anacan.az — Səninlə bu yolda birgəyik',
    heroSubtitle: 'Azərbaycanın ən müasir ana platforması.',
    readMore: 'Oxumağa davam et',
    categories: 'Kateqoriyalar',
    latestPosts: 'Son Yazılar',
    featuredPost: 'Günün Seçimi',
    aiAdvisorTitle: 'Süni Zəka "Ana Məsləhəti"',
    aiAdvisorPlaceholder: 'Sualınızı yazın...',
    askAi: 'Məsləhət al',
    footerText: 'Anacan.az — Analıq yolculuğunda ən yaxın köməkçin.',
    searchPlaceholder: 'Axtarış...',
    allCategories: 'Hamısı',
    adminPanel: 'İdarəetmə Paneli',
    dashboard: 'Panel',
    posts: 'Məqalələr',
    newPost: 'Yeni Məqalə',
    save: 'Yadda saxla',
    cancel: 'Ləğv et',
    delete: 'Sil',
    edit: 'Düzəliş et',
    title: 'Başlıq',
    content: 'Məzmun',
    status: 'Status',
    loading: 'Yüklənir...',
    error: 'Xəta baş verdi',
    success: 'Uğurla tamamlandı'
  },
  ru: {
    heroTitle: 'Anacan.az — Мы вместе на этом пути',
    heroSubtitle: 'Самая современная платформа для мам в Азербайджане.',
    readMore: 'Читать далее',
    categories: 'Категории',
    latestPosts: 'Последние статьи',
    featuredPost: 'Выбор дня',
    aiAdvisorTitle: 'ИИ "Совет Мамы"',
    aiAdvisorPlaceholder: 'Напишите ваш вопрос...',
    askAi: 'Получить совет',
    footerText: 'Anacan.az — Ваш лучший помощник в материнстве.',
    searchPlaceholder: 'Поиск...',
    allCategories: 'Все',
    adminPanel: 'Админ Панель',
    dashboard: 'Дашборд',
    posts: 'Статьи',
    newPost: 'Новая статья',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    title: 'Заголовок',
    content: 'Контент',
    status: 'Статус',
    loading: 'Загрузка...',
    error: 'Произошла ошибка',
    success: 'Успешно завершено'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('anacan_locale');
    return (saved === 'az' || saved === 'ru') ? saved : 'az';
  });
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const dbTranslations = await translationService.getTranslations(locale);
        setTranslations(dbTranslations);
      } catch (error) {
        console.error('Error loading translations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('anacan_locale', locale);
  }, [locale]);

  const t = (key: string) => {
    // Try database translations first
    if (translations[key]) {
      return translations[key];
    }
    // Fallback to static translations
    // @ts-ignore
    return fallbackTranslations[locale][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
