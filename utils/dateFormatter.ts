// Azerbaycan dilinde ay isimleri
const azMonths = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'İyun',
  'İyul',
  'Avqust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr'
];

const azMonthsShort = [
  'Yan',
  'Fev',
  'Mar',
  'Apr',
  'May',
  'İyn',
  'İyl',
  'Avq',
  'Sen',
  'Okt',
  'Noy',
  'Dek'
];

export const formatDate = (
  date: Date | string | number,
  locale: 'az' | 'ru',
  options?: {
    day?: 'numeric' | '2-digit';
    month?: 'long' | 'short' | 'numeric';
    year?: 'numeric' | '2-digit';
  }
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  if (locale === 'az') {
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();

    const monthOption = options?.month || 'long';
    const yearOption = options?.year || 'numeric';

    let monthName = '';
    if (monthOption === 'long') {
      monthName = azMonths[month];
    } else if (monthOption === 'short') {
      monthName = azMonthsShort[month];
    } else {
      monthName = String(month + 1).padStart(2, '0');
    }

    const parts: string[] = [];
    
    // Day
    if (options?.day === '2-digit') {
      parts.push(String(day).padStart(2, '0'));
    } else {
      parts.push(String(day));
    }

    // Month
    parts.push(monthName);

    // Year - only add if specified in options
    if (options?.year !== undefined) {
      if (yearOption === 'numeric') {
        parts.push(String(year));
      } else if (yearOption === '2-digit') {
        parts.push(String(year).slice(-2));
      }
    }

    return parts.join(' ');
  } else {
    // Russian locale - use standard Intl
    return dateObj.toLocaleDateString('ru-RU', {
      day: options?.day || 'numeric',
      month: options?.month || 'long',
      year: options?.year || 'numeric',
    });
  }
};

