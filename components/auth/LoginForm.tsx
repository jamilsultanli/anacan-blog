import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const LoginForm: React.FC = () => {
  const { signIn } = useAuth();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      setError(signInError.message || 'Giriş zamanı xəta baş verdi');
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
            {locale === 'az' ? 'Giriş et' : 'Войти'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {locale === 'az' 
              ? 'Hesabınıza daxil olun' 
              : 'Войдите в свой аккаунт'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {locale === 'az' ? 'Email' : 'Email'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-t-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder={locale === 'az' ? 'Email ünvanı' : 'Адрес электронной почты'}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {locale === 'az' ? 'Şifrə' : 'Пароль'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-b-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder={locale === 'az' ? 'Şifrə' : 'Пароль'}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-pink-600 hover:text-pink-500"
              >
                {locale === 'az' ? 'Şifrəni unutmusunuz?' : 'Забыли пароль?'}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? (locale === 'az' ? 'Giriş edilir...' : 'Вход...')
                : (locale === 'az' ? 'Giriş et' : 'Войти')}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">
              {locale === 'az' ? 'Hesabınız yoxdur? ' : 'Нет аккаунта? '}
            </span>
            <Link
              to="/signup"
              className="font-medium text-pink-600 hover:text-pink-500"
            >
              {locale === 'az' ? 'Qeydiyyatdan keçin' : 'Зарегистрироваться'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

