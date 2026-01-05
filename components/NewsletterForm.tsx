import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../services/appwrite';

const NewsletterForm: React.FC = () => {
  const { locale } = useLanguage();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const emailTrimmed = email.toLowerCase().trim();
      
      if (!emailTrimmed) {
        setError(locale === 'az' ? 'Email ünvanı daxil edin' : 'Введите email адрес');
        setLoading(false);
        return;
      }

      // Check if email already exists
      try {
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.NEWSLETTER_SUBSCRIPTIONS,
          [
            Query.equal('email', emailTrimmed),
            Query.limit(1)
          ]
        );

        if (existing.documents.length > 0) {
          setError(locale === 'az' ? 'Bu email artıq abunədir' : 'Этот email уже подписан');
          setLoading(false);
          return;
        }
      } catch (checkError: any) {
        // If check fails, continue anyway (might be permission issue)
        console.warn('Could not check existing email:', checkError);
      }

      // Prepare document data - only include fields that exist
      const documentData: any = {
        email: emailTrimmed,
        is_active: true,
        subscribed_at: new Date().toISOString(),
      };

      // Add name and surname if provided
      const nameTrimmed = name.trim();
      const surnameTrimmed = surname.trim();
      
      if (nameTrimmed) {
        documentData.name = nameTrimmed;
      }
      if (surnameTrimmed) {
        documentData.surname = surnameTrimmed;
      }

      // Create subscription
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NEWSLETTER_SUBSCRIPTIONS,
        ID.unique(),
        documentData
      );

      setSuccess(true);
      setEmail('');
      setName('');
      setSurname('');
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      
      // More specific error messages
      let errorMessage = locale === 'az' 
        ? 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.'
        : 'Произошла ошибка. Пожалуйста, попробуйте снова.';
      
      if (error.code === 409) {
        errorMessage = locale === 'az' 
          ? 'Bu email artıq abunədir'
          : 'Этот email уже подписан';
      } else if (error.message?.includes('permission') || error.message?.includes('Permission')) {
        errorMessage = locale === 'az' 
          ? 'İcazə xətası. Zəhmət olmasa admin ilə əlaqə saxlayın.'
          : 'Ошибка разрешений. Пожалуйста, свяжитесь с администратором.';
      } else if (error.message?.includes('attribute') || error.message?.includes('Attribute')) {
        errorMessage = locale === 'az' 
          ? 'Verilənlər bazası konfiqurasiyası xətası. Zəhmət olmasa admin ilə əlaqə saxlayın.'
          : 'Ошибка конфигурации базы данных. Пожалуйста, свяжитесь с администратором.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {locale === 'az' 
            ? '✅ Abunəlik uğurla tamamlandı!'
            : '✅ Подписка успешно завершена!'}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={locale === 'az' ? 'Ad' : 'Имя'}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
          />
        </div>
        <div>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder={locale === 'az' ? 'Soyad' : 'Фамилия'}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
          />
        </div>
      </div>

      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={locale === 'az' ? 'Email ünvanı' : 'Email адрес'}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading 
          ? (locale === 'az' ? 'Göndərilir...' : 'Отправка...')
          : (locale === 'az' ? 'Abunə ol' : 'Подписаться')}
      </button>
    </form>
  );
};

export default NewsletterForm;

