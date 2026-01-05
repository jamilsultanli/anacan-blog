import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Log to error reporting service (e.g., Sentry, LogRocket)
    if (process.env.NODE_ENV === 'production') {
      // Send error to monitoring service
      try {
        // Example: fetch('/api/errors', { method: 'POST', body: JSON.stringify({ error, errorInfo }) });
      } catch (e) {
        // Silent fail
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error: Error | null }> = ({ error }) => {
  // Safely get locale without depending on context (which might have failed)
  let locale: 'az' | 'ru' = 'az';
  try {
    const { locale: lang } = useLanguage();
    locale = lang;
  } catch (err) {
    // If LanguageContext failed, use default locale
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {locale === 'az' ? 'Xəta baş verdi' : 'Произошла ошибка'}
        </h1>
        <p className="text-gray-600 mb-6">
          {locale === 'az' 
            ? 'Təəssüf ki, bir xəta baş verdi. Zəhmət olmasa səhifəni yeniləyin.' 
            : 'К сожалению, произошла ошибка. Пожалуйста, обновите страницу.'}
        </p>
        {error && process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-gray-50 p-4 rounded-lg mb-4">
            <summary className="cursor-pointer font-bold text-sm text-gray-700 mb-2">
              {locale === 'az' ? 'Xəta detalları' : 'Детали ошибки'}
            </summary>
            <pre className="text-xs text-gray-600 overflow-auto">
              {error.toString()}
            </pre>
          </details>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors"
        >
          {locale === 'az' ? 'Səhifəni yenilə' : 'Обновить страницу'}
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundary;

