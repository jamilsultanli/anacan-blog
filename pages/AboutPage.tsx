import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';

const AboutPage: React.FC = () => {
  const { locale } = useLanguage();

  const content = {
    az: {
      title: 'Haqqımızda',
      metaTitle: 'Haqqımızda | Anacan.az - Müasir Ana Platforması',
      metaDescription: 'Anacan.az - Azərbaycanın ən müasir ana platforması. Hamiləlikdən uşaq tərbiyəsinə qədər hər şey burada. Məsləhətlər, məqalələr və icma dəstəyi.',
      mission: {
        title: 'Missiyamız',
        text: 'Anacan.az olaraq missiyamız, Azərbaycanın hər yerində yaşayan analara ən müasir, etibarlı və faydalı məlumatlar təqdim etməkdir. Platformamız hamiləlikdən uşaq tərbiyəsinə, sağlamlıqdan psixologiyaya qədər bütün sahələri əhatə edir.',
      },
      vision: {
        title: 'Vizyonumuz',
        text: 'Azərbaycanın ən böyük və etibarlı ana icmasını yaratmaq, anaların bir-birindən öyrənməsi və dəstəkləməsi üçün modern platforma təqdim etmək.',
      },
      values: [
        {
          icon: '❤️',
          title: 'Sevgi və Qayğı',
          description: 'Hər bir ana və uşağın sağlamlığı və xoşbəxtliyi bizim üçün ən önəmli dəyərdir.',
        },
        {
          icon: '🎓',
          title: 'Təhsil və Təcrübə',
          description: 'Peşəkar məsləhətlər və real həyat təcrübələrinin birləşməsi ilə ən yaxşı məlumatları təqdim edirik.',
        },
        {
          icon: '🤝',
          title: 'İcma və Dəstək',
          description: 'Anaların bir-birini dəstəkləməsi və təcrübələrini paylaşması üçün dostluq mühiti yaradırıq.',
        },
        {
          icon: '✨',
          title: 'İnnovasiya və Müasirlik',
          description: 'Ən son texnologiyalar və elmi tədqiqatlar əsasında müasir və etibarlı məlumatlar veririk.',
        },
      ],
      team: {
        title: 'Komandamız',
        text: 'Biz pediatri, psixologiya, pərvərlik və digər sahələrdən olan mütəxəssislərdən ibarət geniş komanda ilə işləyirik. Hər məsləhətimiz elmi tədqiqatlar və peşəkar təcrübə əsasında hazırlanır.',
      },
      stats: [
        { number: '10,000+', label: 'Aktiv İstifadəçi' },
        { number: '500+', label: 'Məqalə' },
        { number: '50+', label: 'Mütəxəssis' },
        { number: '100+', label: 'Forum Müzakirəsi' },
      ],
    },
    ru: {
      title: 'О нас',
      metaTitle: 'О нас | Anacan.az - Современная Платформа для Мам',
      metaDescription: 'Anacan.az - самая современная платформа для мам в Азербайджане. Все от беременности до воспитания детей. Советы, статьи и поддержка сообщества.',
      mission: {
        title: 'Наша миссия',
        text: 'Наша миссия как Anacan.az - предоставить самую современную, надежную и полезную информацию мамам, живущим по всему Азербайджану. Наша платформа охватывает все области - от беременности до воспитания детей, от здоровья до психологии.',
      },
      vision: {
        title: 'Наше видение',
        text: 'Создать самое большое и надежное сообщество мам в Азербайджане, предоставить современную платформу для того, чтобы мамы учились и поддерживали друг друга.',
      },
      values: [
        {
          icon: '❤️',
          title: 'Любовь и Забота',
          description: 'Здоровье и счастье каждой мамы и ребенка - наша самая важная ценность.',
        },
        {
          icon: '🎓',
          title: 'Образование и Опыт',
          description: 'Мы предоставляем лучшую информацию, сочетая профессиональные советы с реальным жизненным опытом.',
        },
        {
          icon: '🤝',
          title: 'Сообщество и Поддержка',
          description: 'Мы создаем дружелюбную среду, где мамы поддерживают друг друга и делятся опытом.',
        },
        {
          icon: '✨',
          title: 'Инновации и Современность',
          description: 'Мы предоставляем современную и надежную информацию на основе новейших технологий и научных исследований.',
        },
      ],
      team: {
        title: 'Наша команда',
        text: 'Мы работаем с широкой командой специалистов в области педиатрии, психологии, воспитания и других областях. Каждый наш совет основан на научных исследованиях и профессиональном опыте.',
      },
      stats: [
        { number: '10,000+', label: 'Активных Пользователей' },
        { number: '500+', label: 'Статей' },
        { number: '50+', label: 'Специалистов' },
        { number: '100+', label: 'Форумных Обсуждений' },
      ],
    },
  };

  const t = content[locale];

  return (
    <>
      <SEO 
        title={t.metaTitle}
        description={t.metaDescription}
        locale={locale}
      />
      <div className="min-h-screen bg-white overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-coral-50 via-pink-50 to-rose-50 py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
              {t.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              {locale === 'az' 
                ? 'Azərbaycanın ən müasir ana platforması - Analar üçün, analar tərəfindən'
                : 'Самая современная платформа для мам в Азербайджане - для мам, от мам'}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-coral-500 to-pink-500 mb-4 sm:mb-6 shadow-lg">
                <span className="text-2xl sm:text-3xl">🎯</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 sm:mb-6 px-2 sm:px-0">
                {t.mission.title}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed px-4 sm:px-0">
                {t.mission.text}
              </p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 mb-4 sm:mb-6 shadow-lg">
                <span className="text-2xl sm:text-3xl">👁️</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 sm:mb-6 px-2 sm:px-0">
                {t.vision.title}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed px-4 sm:px-0">
                {t.vision.text}
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-0">
                {locale === 'az' ? 'Dəyərlərimiz' : 'Наши ценности'}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                {locale === 'az' 
                  ? 'Bizi fərqləndirən və əsas prinsiplərimizi təşkil edən dəyərlər'
                  : 'Ценности, которые отличают нас и составляют наши основные принципы'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {t.values.map((value, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-100 hover:shadow-airbnb-lg transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-coral-500 to-pink-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
              {t.stats.map((stat, index) => (
                <div key={index} className="text-center px-2 sm:px-0">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-1 sm:mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 mb-6 shadow-lg">
                <span className="text-3xl">👥</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                {t.team.title}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-12">
                {t.team.text}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/blog"
                  className="px-8 py-4 bg-coral-500 text-white rounded-full font-semibold text-base hover:bg-coral-600 transition-all duration-200 shadow-airbnb hover:shadow-airbnb-lg transform hover:scale-105"
                >
                  {locale === 'az' ? 'Məqalələrimizi oxuyun' : 'Читайте наши статьи'}
                </Link>
                <Link
                  to="/forums"
                  className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-full font-semibold text-base hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {locale === 'az' ? 'Forumlara qoşulun' : 'Присоединяйтесь к форумам'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              {locale === 'az' 
                ? 'Bizə qoşulun və icmamızın bir hissəsi olun'
                : 'Присоединяйтесь к нам и станьте частью нашего сообщества'}
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {locale === 'az'
                ? 'Anacan.az platforması ilə ən yeni məsləhətlərə, faydalı məlumatlara və dəstəkli icmaya çatın'
                : 'Получите доступ к новейшим советам, полезной информации и поддерживающему сообществу с платформой Anacan.az'}
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center px-8 py-4 bg-coral-500 text-white rounded-full font-semibold text-base hover:bg-coral-600 transition-all duration-200 shadow-airbnb hover:shadow-airbnb-lg transform hover:scale-105"
            >
              <span>{locale === 'az' ? 'Kəşf etməyə başla' : 'Начать исследование'}</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;

