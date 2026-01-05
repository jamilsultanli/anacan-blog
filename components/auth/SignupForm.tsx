import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const SignupForm: React.FC = () => {
  const { signUp } = useAuth();
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(locale === 'az' ? 'Şifrələr uyğun gəlmir' : 'Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError(locale === 'az' ? 'Şifrə ən azı 6 simvol olmalıdır' : 'Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(email, password, fullName, username);
    
    if (signUpError) {
      setError(signUpError.message || 'Qeydiyyat zamanı xəta baş verdi');
    } else {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            {locale === 'az' ? 'Qeydiyyatdan keç' : 'Регистрация'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {locale === 'az' 
              ? 'Yeni hesab yaradın' 
              : 'Создайте новый аккаунт'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'az' ? 'Ad Soyad' : 'Имя Фамилия'}
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder={locale === 'az' ? 'Ad və soyadınız' : 'Ваше имя и фамилия'}
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'az' ? 'İstifadəçi adı' : 'Имя пользователя'}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder={locale === 'az' ? 'İstifadəçi adı' : 'Имя пользователя'}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder={locale === 'az' ? 'Email ünvanı' : 'Адрес электронной почты'}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'az' ? 'Şifrə' : 'Пароль'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder={locale === 'az' ? 'Şifrə (min. 6 simvol)' : 'Пароль (мин. 6 символов)'}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'az' ? 'Şifrəni təsdiqlə' : 'Подтвердите пароль'}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder={locale === 'az' ? 'Şifrəni təkrar daxil edin' : 'Повторите пароль'}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? (locale === 'az' ? 'Qeydiyyatdan keçilir...' : 'Регистрация...')
                : (locale === 'az' ? 'Qeydiyyatdan keç' : 'Зарегистрироваться')}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">
              {locale === 'az' ? 'Artıq hesabınız var? ' : 'Уже есть аккаунт? '}
            </span>
            <Link
              to="/login"
              className="font-medium text-pink-600 hover:text-pink-500"
            >
              {locale === 'az' ? 'Giriş edin' : 'Войти'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;

