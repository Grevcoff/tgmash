/**
 * Утилиты для форматирования данных
 */

// Форматирование валюты
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Форматирование веса
export const formatWeight = (kg: number): string => {
  if (kg < 1) {
    return `${Math.round(kg * 1000)} г`;
  }
  return `${kg.toFixed(2)} кг`;
};

// Форматирование даты
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

// Форматирование даты и времени
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

// Форматирование относительного времени
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Сегодня';
  } else if (diffDays === 1) {
    return 'Вчера';
  } else if (diffDays < 7) {
    return `${diffDays} дня назад`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${getPlural(weeks, 'неделю', 'недели', 'недель')} назад`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} ${getPlural(months, 'месяц', 'месяца', 'месяцев')} назад`;
  }
};

// Получение правильного склонения
export const getPlural = (count: number, one: string, few: string, many: string): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return many;
  }

  if (lastDigit === 1) {
    return one;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return few;
  }

  return many;
};

// Форматирование процентов
export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Форматирование ROI
export const formatROI = (roi: number): string => {
  const sign = roi >= 0 ? '+' : '';
  return `${sign}${formatPercent(roi)}`;
};

// Форматирование больших чисел
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU').format(num);
};

// Обрезание текста
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};

// Форматирование длительности
export const formatDuration = (days: number): string => {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;

  const parts = [];
  
  if (years > 0) {
    parts.push(`${years} ${getPlural(years, 'год', 'года', 'лет')}`);
  }
  
  if (months > 0) {
    parts.push(`${months} ${getPlural(months, 'месяц', 'месяца', 'месяцев')}`);
  }
  
  if (remainingDays > 0 || parts.length === 0) {
    parts.push(`${remainingDays} ${getPlural(remainingDays, 'день', 'дня', 'дней')}`);
  }

  return parts.join(' ');
};

// Получение цвета для статуса
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'text-green-600';
    case 'completed':
      return 'text-gray-600';
    case 'expense':
      return 'text-red-600';
    case 'income':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

// Получение фона для статуса
export const getStatusBgColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100';
    case 'completed':
      return 'bg-gray-100';
    case 'expense':
      return 'bg-red-100';
    case 'income':
      return 'bg-green-100';
    default:
      return 'bg-gray-100';
  }
};
