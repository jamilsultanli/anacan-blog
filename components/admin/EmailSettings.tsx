import React, { useState } from 'react';

interface EmailSettingsProps {
  locale: 'az' | 'ru';
}

const EmailSettings: React.FC<EmailSettingsProps> = ({ locale }) => {
  const [formData, setFormData] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@anacan.az',
    fromName: 'Anacan.az',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // This would typically save to database
    setTimeout(() => {
      alert(locale === 'az' ? 'Email parametrləri yadda saxlanıldı' : 'Настройки email сохранены');
      setLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'SMTP Host' : 'SMTP хост'}
          </label>
          <input
            type="text"
            value={formData.smtpHost}
            onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
            placeholder="smtp.gmail.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'SMTP Port' : 'SMTP порт'}
          </label>
          <input
            type="number"
            value={formData.smtpPort}
            onChange={(e) => setFormData({ ...formData, smtpPort: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'SMTP İstifadəçi' : 'SMTP пользователь'}
          </label>
          <input
            type="text"
            value={formData.smtpUser}
            onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'SMTP Şifrə' : 'SMTP пароль'}
          </label>
          <input
            type="password"
            value={formData.smtpPassword}
            onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'Göndərən Email' : 'Email отправителя'}
          </label>
          <input
            type="email"
            value={formData.fromEmail}
            onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'Göndərən Ad' : 'Имя отправителя'}
          </label>
          <input
            type="text"
            value={formData.fromName}
            onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors disabled:opacity-50"
      >
        {loading
          ? (locale === 'az' ? 'Yadda saxlanılır...' : 'Сохранение...')
          : (locale === 'az' ? 'Yadda Saxla' : 'Сохранить')}
      </button>
    </form>
  );
};

export default EmailSettings;

