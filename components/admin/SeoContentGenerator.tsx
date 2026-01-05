import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { seoContentGenerator } from '../../services/seoContentGenerator';
import { postsService } from '../../services/api/posts';
import { translateBlogPost } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { BlogTitleOption, FullBlogPostResponse } from '../../services/geminiService';

const SeoContentGenerator: React.FC = () => {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [targetLength, setTargetLength] = useState(1500);
  
  // Step management
  const [step, setStep] = useState<'input' | 'titles' | 'generating' | 'translating' | 'result'>('input');
  
  // Title options
  const [titleOptions, setTitleOptions] = useState<BlogTitleOption[]>([]);
  const [selectedTitleOption, setSelectedTitleOption] = useState<BlogTitleOption | null>(null);
  const [loadingTitles, setLoadingTitles] = useState(false);
  
  // Generated blog post
  const [result, setResult] = useState<FullBlogPostResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  const handleGenerateTitles = async () => {
    if (!topic.trim()) {
      setError(locale === 'az' ? 'Mövzu daxil edin' : 'Введите тему');
      return;
    }

    setLoadingTitles(true);
    setError(null);
    setTitleOptions([]);
    setSelectedTitleOption(null);

    try {
      const titles = await seoContentGenerator.generateTitleOptions(topic.trim(), locale);
      if (titles.length > 0) {
        setTitleOptions(titles);
        setStep('titles');
      } else {
        setError(locale === 'az' ? 'Başlıq variantları yaradıla bilmədi' : 'Не удалось создать варианты заголовков');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка'));
    } finally {
      setLoadingTitles(false);
    }
  };

  const handleGenerateBlogPost = async () => {
    if (!selectedTitleOption) {
      setError(locale === 'az' ? 'Başlıq seçin' : 'Выберите заголовок');
      return;
    }

    setLoadingBlog(true);
    setError(null);
    setResult(null);
    setStep('generating');

    try {
      const blogPost = await seoContentGenerator.generateFullBlogPost(
        topic.trim(),
        selectedTitleOption.title,
        selectedTitleOption.focusKeyword,
        locale,
        targetLength
      );
      
      setResult(blogPost);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : (locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка'));
      setStep('titles');
    } finally {
      setLoadingBlog(false);
    }
  };

  const handleUseContent = async () => {
    if (!result) return;
    if (!user) {
      setError(locale === 'az' ? 'Post yaratmaq üçün giriş etməlisiniz' : 'Вам нужно войти, чтобы создать пост');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Determine which locale has content
      const currentLocale = locale;
      
      // Ensure we have valid data
      if (!result.title || !result.content) {
        throw new Error(locale === 'az' ? 'Məzmun tam deyil' : 'Контент неполный');
      }

      let translatedTitle = result.title;
      let translatedExcerpt = result.excerpt || result.metaDescription || '';
      let translatedContent = `<p>${locale === 'az' ? 'Bu məqalə hələ tərcümə olunmayıb.' : 'Эта статья еще не переведена.'}</p>`;

      // If current locale is Az, automatically translate to Ru
      if (currentLocale === 'az') {
        setStep('translating');
        setTranslating(true);
        try {
          const translation = await translateBlogPost(
            result.title,
            result.content,
            'az',
            'ru'
          );
          translatedTitle = translation.title;
          translatedExcerpt = translation.excerpt;
          translatedContent = translation.content;
        } catch (translationError) {
          console.error('Translation error:', translationError);
          // Continue with placeholder if translation fails
        } finally {
          setTranslating(false);
        }
      }

      // Create post with generated content
      const postData: Omit<any, 'id' | 'published_at' | 'createdAt' | 'updatedAt'> = {
        slug: result.slug || result.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 100),
        title: {
          az: currentLocale === 'az' ? result.title : translatedTitle,
          ru: currentLocale === 'az' ? translatedTitle : result.title,
        },
        excerpt: {
          az: currentLocale === 'az' ? (result.excerpt || result.metaDescription || '') : translatedExcerpt,
          ru: currentLocale === 'az' ? translatedExcerpt : (result.excerpt || result.metaDescription || ''),
        },
        content: {
          az: currentLocale === 'az' ? result.content : translatedContent,
          ru: currentLocale === 'az' ? translatedContent : result.content,
        },
        author: user?.fullName || user?.username || 'Admin',
        readTime: result.readTime || 5,
        tags: result.tags || [],
        isFeatured: false,
        status: 'draft', // Save as draft so user can review
        categoryId: undefined, // User can select category in editor
        imageUrl: '', // User can add image in editor
      };

      console.log('Creating post with data:', {
        slug: postData.slug,
        titleAz: postData.title.az,
        titleRu: postData.title.ru,
        contentAzLength: postData.content.az.length,
        contentRuLength: postData.content.ru.length,
      });

      const { data: createdPost, error } = await postsService.createPost(postData);
      
      if (error) {
        console.error('Post creation error:', error);
        const errorMsg = error.message || error.toString();
        // Check for content length error
        if (errorMsg.includes('255') || errorMsg.includes('content')) {
          throw new Error(locale === 'az' 
            ? 'Məzmun çox uzundur. Zəhmət olmasa Appwrite Console-da content_az və content_ru atributlarının size-ını 16777216 etməlisiniz.' 
            : 'Контент слишком длинный. Пожалуйста, установите размер атрибутов content_az и content_ru в 16777216 в консоли Appwrite.');
        }
        throw error;
      }
      
      if (!createdPost) {
        throw new Error(locale === 'az' ? 'Post yaradıla bilmədi' : 'Не удалось создать пост');
      }

      console.log('Post created successfully:', createdPost.id);
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = locale === 'az' ? '✅ Post uğurla yaradıldı!' : '✅ Пост успешно создан!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      // Small delay to ensure post is saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to edit page
      navigate(`/admin/posts/edit/${createdPost.id}`);
    } catch (err: any) {
      console.error('Error creating post:', err);
      const errorMessage = err?.message || err?.toString() || (locale === 'az' ? 'Post yaradıla bilmədi' : 'Не удалось создать пост');
      setError(errorMessage);
      setSaving(false);
      setStep('result');
      
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
      errorToast.textContent = errorMessage;
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 5000);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = locale === 'az' ? '✓ Kopyalandı!' : '✓ Скопировано!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    } catch (e) {
      alert(locale === 'az' ? 'Kopyalama uğursuz oldu' : 'Копирование не удалось');
    }
  };

  const handleReset = () => {
    setStep('input');
    setTopic('');
    setTitleOptions([]);
    setSelectedTitleOption(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {locale === 'az' ? '🤖 AI Peşəkar Bloq Generator' : '🤖 AI Профессиональный Генератор Блогов'}
        </h2>
        <p className="text-gray-600">
          {locale === 'az' 
            ? 'Gemini AI ilə mükəmməl SEO optimizasiyalı, peşəkar bloq yazıları yaradın. Az məqalələr avtomatik Ru-ya tərcümə olunur.' 
            : 'Создавайте идеальные, профессиональные блоги с SEO оптимизацией с помощью Gemini AI'}
        </p>
      </div>

      {/* Step 1: Input Topic */}
      {step === 'input' && (
        <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-xl border-2 border-pink-100 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {locale === 'az' ? '📝 Mövzu *' : '📝 Тема *'}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={locale === 'az' ? 'Məsələn: Hamiləlikdə sağlam qidalanma' : 'Например: Здоровое питание во время беременности'}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateTitles()}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {locale === 'az' ? '📏 Hədəf uzunluq (söz sayı)' : '📏 Целевая длина (количество слов)'}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  value={targetLength}
                  onChange={(e) => setTargetLength(parseInt(e.target.value))}
                  min={800}
                  max={3000}
                  step={100}
                  className="flex-1"
                />
                <span className="text-lg font-bold text-pink-600 min-w-[100px] text-right">
                  {targetLength} {locale === 'az' ? 'söz' : 'слов'}
                </span>
              </div>
            </div>

            <button
              onClick={handleGenerateTitles}
              disabled={loadingTitles || !topic.trim()}
              className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loadingTitles
                ? (locale === 'az' ? '✨ Başlıq variantları yaradılır...' : '✨ Создание вариантов заголовков...')
                : (locale === 'az' ? '🚀 Başlıq Variantları Yarad' : '🚀 Создать варианты заголовков')}
            </button>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <strong>{locale === 'az' ? 'Xəta:' : 'Ошибка:'}</strong> {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Select Title */}
      {step === 'titles' && titleOptions.length > 0 && (
        <div className="space-y-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-blue-700 font-semibold text-center">
              {locale === 'az' 
                ? `✅ ${titleOptions.length} başlıq variantı yaradıldı. Birini seçin və bloq yazısı avtomatik yaradılacaq.`
                : `✅ Создано ${titleOptions.length} вариантов заголовков. Выберите один, и статья блога будет создана автоматически.`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {titleOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => setSelectedTitleOption(option)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedTitleOption?.title === option.title
                    ? 'border-pink-500 bg-pink-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl font-bold text-pink-600">#{index + 1}</span>
                  {selectedTitleOption?.title === option.title && (
                    <span className="text-green-600 text-xl">✓</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    🔑 {option.focusKeyword}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              {locale === 'az' ? '🔄 Yenidən' : '🔄 Заново'}
            </button>
            <button
              onClick={handleGenerateBlogPost}
              disabled={!selectedTitleOption || loadingBlog}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50"
            >
              {loadingBlog
                ? (locale === 'az' ? '✨ Yaradılır...' : '✨ Создание...')
                : (locale === 'az' ? '🚀 Bloq Yazısı Yarad' : '🚀 Создать статью блога')}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Generating */}
      {step === 'generating' && (
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-100 p-12 text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mt-6 mb-2">
            {locale === 'az' ? 'AI peşəkar bloq yazısı yaradır...' : 'AI создает профессиональную статью блога...'}
          </h3>
          <p className="text-gray-600">
            {locale === 'az' 
              ? 'Bu bir neçə dəqiqə çəkə bilər. Zəhmət olmasa gözləyin.' 
              : 'Это может занять несколько минут. Пожалуйста, подождите.'}
          </p>
        </div>
      )}

      {/* Step 3.5: Translating */}
      {step === 'translating' && (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100 p-12 text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🌐</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mt-6 mb-2">
            {locale === 'az' ? 'Məqalə Rus dilinə tərcümə olunur...' : 'Статья переводится...'}
          </h3>
          <p className="text-gray-600">
            {locale === 'az' 
              ? 'AI məqaləni Rus dilinə tərcümə edir. Zəhmət olmasa gözləyin.' 
              : 'AI переводит статью. Пожалуйста, подождите.'}
          </p>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 'result' && result && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-semibold text-lg">
              {locale === 'az' 
                ? '✅ Peşəkar bloq yazısı uğurla yaradıldı!' 
                : '✅ Профессиональная статья блога успешно создана!'}
            </p>
            {locale === 'az' && (
              <p className="text-green-600 text-sm mt-2">
                Məqalə avtomatik Rus dilinə tərcümə olunacaq və draft status-da yaradılacaq.
              </p>
            )}
          </div>

          {/* Title & Meta Title */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">📌</span>
                {locale === 'az' ? 'Başlıq & Meta Title' : 'Заголовок & Meta Title'}
              </h3>
              <button
                onClick={() => handleCopy(result.title)}
                className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-semibold hover:bg-pink-200 transition-all"
              >
                {locale === 'az' ? '📋 Kopyala' : '📋 Копировать'}
              </button>
            </div>
            <p className="text-gray-800 text-xl font-bold leading-relaxed mb-3">{result.title}</p>
            {result.metaTitle && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1 font-semibold">Meta Title:</p>
                <p className="text-gray-800">{result.metaTitle}</p>
              </div>
            )}
          </div>

          {/* Meta Description */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">📄</span>
                {locale === 'az' ? 'Meta Description' : 'Мета описание'}
              </h3>
              <button
                onClick={() => handleCopy(result.metaDescription)}
                className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-semibold hover:bg-pink-200 transition-all"
              >
                {locale === 'az' ? '📋 Kopyala' : '📋 Копировать'}
              </button>
            </div>
            <p className="text-gray-800 leading-relaxed">{result.metaDescription}</p>
          </div>

          {/* Excerpt */}
          {result.excerpt && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">📝</span>
                  {locale === 'az' ? 'Qısa Xülasə (Excerpt)' : 'Краткое содержание (Excerpt)'}
                </h3>
                <button
                  onClick={() => handleCopy(result.excerpt)}
                  className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-semibold hover:bg-pink-200 transition-all"
                >
                  {locale === 'az' ? '📋 Kopyala' : '📋 Копировать'}
                </button>
              </div>
              <p className="text-gray-800 leading-relaxed">{result.excerpt}</p>
            </div>
          )}

          {/* Content Preview */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">📄</span>
                {locale === 'az' ? 'Məzmun Önizləmə' : 'Предпросмотр содержимого'}
              </h3>
            </div>
            <div 
              className="prose prose-pink max-w-none text-gray-700 leading-relaxed max-h-96 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: result.content.substring(0, 500) + '...' }}
            />
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">
                  {locale === 'az' 
                    ? `Təxmini ${Math.round(result.content.replace(/<[^>]*>/g, '').split(/\s+/).length)} söz`
                    : `Примерно ${Math.round(result.content.replace(/<[^>]*>/g, '').split(/\s+/).length)} слов`}
                </span>
                <span className="text-gray-500">
                  ⏱️ {result.readTime} {locale === 'az' ? 'dəq oxuma' : 'мин чтения'}
                </span>
              </div>
              <span className="text-gray-500">
                🔗 Slug: {result.slug}
              </span>
            </div>
          </div>

          {/* Keywords & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.keywords && result.keywords.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🔑</span>
                  {locale === 'az' ? 'SEO Açar Sözlər' : 'SEO Ключевые слова'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {result.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-sm font-semibold border border-pink-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.tags && result.tags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🏷️</span>
                  {locale === 'az' ? 'Etiketlər' : 'Теги'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {result.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              {locale === 'az' ? '🔄 Yeni Bloq' : '🔄 Новый блог'}
            </button>
            <button
              onClick={handleUseContent}
              disabled={saving || !user}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50"
            >
              {saving
                ? (locale === 'az' ? '💾 Yadda saxlanılır...' : '💾 Сохранение...')
                : (locale === 'az' ? '✅ Post Yarad və Redaktə Et' : '✅ Создать пост и редактировать')}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && step !== 'input' && step !== 'titles' && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <strong>{locale === 'az' ? 'Xəta:' : 'Ошибка:'}</strong> {error}
        </div>
      )}

      {!user && step === 'result' && (
        <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl">
          <strong>{locale === 'az' ? 'Xəbərdarlıq:' : 'Предупреждение:'}</strong> {locale === 'az' ? 'Post yaratmaq üçün giriş etməlisiniz' : 'Вам нужно войти, чтобы создать пост'}
        </div>
      )}
    </div>
  );
};

export default SeoContentGenerator;
