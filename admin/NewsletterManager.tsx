import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { newsletterService } from '../services/api/newsletter';
import { NewsletterSubscription } from '../types';
import { formatDate } from '../utils/dateFormatter';

const NewsletterManager: React.FC = () => {
  const { locale } = useLanguage();
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await newsletterService.getSubscriptions();
      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'az' 
      ? 'Bu abunəni silmək istədiyinizə əminsiniz?'
      : 'Вы уверены, что хотите удалить эту подписку?')) {
      return;
    }

    try {
      const { error } = await newsletterService.deleteSubscription(id);
      if (error) throw error;
      await loadSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert(locale === 'az' 
        ? 'Abunə silinərkən xəta baş verdi'
        : 'Ошибка при удалении подписки');
    }
  };

  const handleToggleActive = async (subscription: NewsletterSubscription) => {
    try {
      const { error } = await newsletterService.updateSubscription(subscription.id, {
        isActive: !subscription.isActive
      });
      if (error) throw error;
      await loadSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert(locale === 'az' 
        ? 'Abunə yenilənərkən xəta baş verdi'
        : 'Ошибка при обновлении подписки');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await newsletterService.exportSubscriptions();
      if (error) throw error;

      // Create and download file
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      alert(locale === 'az' 
        ? 'Export zamanı xəta baş verdi'
        : 'Ошибка при экспорте');
    } finally {
      setExporting(false);
    }
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.name && sub.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.surname && sub.surname.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = 
      filterActive === 'all' ||
      (filterActive === 'active' && sub.isActive) ||
      (filterActive === 'inactive' && !sub.isActive);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.isActive).length,
    inactive: subscriptions.filter(s => !s.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'az' ? 'Newsletter Abunələri' : 'Подписки на рассылку'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'az' 
              ? 'Newsletter abunələrini idarə edin və export edin'
              : 'Управляйте подписками на рассылку и экспортируйте их'}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || subscriptions.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{exporting 
            ? (locale === 'az' ? 'Export edilir...' : 'Экспорт...')
            : (locale === 'az' ? 'CSV Export' : 'Экспорт CSV')}
          </span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-2">
            {locale === 'az' ? 'Ümumi Abunə' : 'Всего подписок'}
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-2">
            {locale === 'az' ? 'Aktiv Abunə' : 'Активные подписки'}
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-2">
            {locale === 'az' ? 'Deaktiv Abunə' : 'Неактивные подписки'}
          </div>
          <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'az' ? 'Email, Ad və ya Soyad ilə axtar...' : 'Поиск по email, имени или фамилии...'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          {/* Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterActive('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterActive === 'all'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {locale === 'az' ? 'Hamısı' : 'Все'}
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterActive === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {locale === 'az' ? 'Aktiv' : 'Активные'}
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterActive === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {locale === 'az' ? 'Deaktiv' : 'Неактивные'}
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600"></div>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {locale === 'az' 
              ? 'Abunə tapılmadı'
              : 'Подписки не найдены'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'az' ? 'Email' : 'Email'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'az' ? 'Ad' : 'Имя'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'az' ? 'Soyad' : 'Фамилия'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'az' ? 'Abunə Tarixi' : 'Дата подписки'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'az' ? 'Status' : 'Статус'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'az' ? 'Əməliyyatlar' : 'Действия'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subscription.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{subscription.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{subscription.surname || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(new Date(subscription.subscribedAt), locale)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscription.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscription.isActive 
                          ? (locale === 'az' ? 'Aktiv' : 'Активна')
                          : (locale === 'az' ? 'Deaktiv' : 'Неактивна')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleActive(subscription)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            subscription.isActive
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {subscription.isActive 
                            ? (locale === 'az' ? 'Deaktiv et' : 'Деактивировать')
                            : (locale === 'az' ? 'Aktiv et' : 'Активировать')}
                        </button>
                        <button
                          onClick={() => handleDelete(subscription.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                        >
                          {locale === 'az' ? 'Sil' : 'Удалить'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterManager;

