import React, { useState } from 'react';

interface ReportsProps {
  locale: 'az' | 'ru';
}

const Reports: React.FC<ReportsProps> = ({ locale }) => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: 'pdf' | 'csv') => {
    setLoading(true);
    // This would typically call a report generation service
    setTimeout(() => {
      alert(
        locale === 'az'
          ? `${format.toUpperCase()} formatında hesabat yaradılacaq`
          : `Отчет будет создан в формате ${format.toUpperCase()}`
      );
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {locale === 'az' ? 'Hesabatlar' : 'Отчеты'}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'az' ? 'Hesabat Tipi' : 'Тип отчета'}
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          >
            <option value="daily">{locale === 'az' ? 'Günlük' : 'Ежедневный'}</option>
            <option value="weekly">{locale === 'az' ? 'Həftəlik' : 'Еженедельный'}</option>
            <option value="monthly">{locale === 'az' ? 'Aylıq' : 'Ежемесячный'}</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => handleExport('pdf')}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading
              ? (locale === 'az' ? 'Yaradılır...' : 'Создание...')
              : (locale === 'az' ? 'PDF Export' : 'Экспорт PDF')}
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading
              ? (locale === 'az' ? 'Yaradılır...' : 'Создание...')
              : (locale === 'az' ? 'CSV Export' : 'Экспорт CSV')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;

