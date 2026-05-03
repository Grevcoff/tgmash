/**
 * Утилиты для финансовых расчетов
 */

// Расчет ROI (Return on Investment)
export const calculateROI = (income: number, expenses: number): number => {
  if (expenses === 0) return 0;
  return ((income - expenses) / expenses) * 100;
};

// Расчет себестоимости за кг
export const calculateCostPerKg = (expenses: number, yieldKg: number): number => {
  if (yieldKg === 0) return 0;
  return expenses / yieldKg;
};

// Расчет прибыли
export const calculateProfit = (income: number, expenses: number): number => {
  return income - expenses;
};

// Расчет маржи прибыли
export const calculateProfitMargin = (income: number, expenses: number): number => {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
};

// Расчет среднего чека транзакции
export const calculateAverageTransaction = (total: number, count: number): number => {
  if (count === 0) return 0;
  return total / count;
};

// Расчет дней от даты до сегодня
export const calculateDaysFrom = (date: string | Date): number => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Расчет дней между двумя датами
export const calculateDaysBetween = (start: string | Date, end: string | Date): number => {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Расчет периода роста
export const calculateGrowthPeriod = (startDate: string | Date, endDate?: string | Date): number => {
  const end = endDate || new Date();
  return calculateDaysBetween(startDate, end);
};

// Расчет эффективности по категориям
export const calculateCategoryEfficiency = (
  expensesByCategory: Record<string, number>,
  totalExpenses: number
): Record<string, { amount: number; percentage: number }> => {
  const result: Record<string, { amount: number; percentage: number }> = {};

  for (const [category, amount] of Object.entries(expensesByCategory)) {
    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
    result[category] = { amount, percentage };
  }

  return result;
};

// Расчет тренда (рост/падение)
export const calculateTrend = (values: number[]): 'up' | 'down' | 'stable' => {
  if (values.length < 2) return 'stable';

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;
  const threshold = Math.abs(firstAvg) * 0.05; // 5% порог

  if (diff > threshold) return 'up';
  if (diff < -threshold) return 'down';
  return 'stable';
};

// Расчет скользящего среднего
export const calculateMovingAverage = (values: number[], windowSize: number): number[] => {
  if (values.length < windowSize) return [];

  const result: number[] = [];
  for (let i = windowSize - 1; i < values.length; i++) {
    const window = values.slice(i - windowSize + 1, i + 1);
    const avg = window.reduce((sum, val) => sum + val, 0) / windowSize;
    result.push(avg);
  }
  return result;
};

// Расчет прогноза на основе тренда
export const calculateForecast = (
  values: number[],
  periods: number = 7
): number[] => {
  if (values.length < 2) return Array(periods).fill(values[0] || 0);

  // Простая линейная регрессия
  const n = values.length;
  const xValues = Array.from({ length: n }, (_, i) => i);
  
  const sumX = xValues.reduce((sum, x) => sum + x, 0);
  const sumY = values.reduce((sum, y) => sum + y, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const forecast: number[] = [];
  for (let i = 1; i <= periods; i++) {
    const x = n + i - 1;
    const value = slope * x + intercept;
    forecast.push(Math.max(0, value)); // Не отрицательные значения
  }

  return forecast;
};

// Расчет сезонности (упрощенный)
export const calculateSeasonality = (data: Array<{ date: string; value: number }>): Record<string, number> => {
  const monthlyData: Record<string, number[]> = {};

  // Группируем по месяцам
  data.forEach(({ date, value }) => {
    const month = new Date(date).getMonth();
    const monthKey = month.toString();
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = [];
    }
    monthlyData[monthKey].push(value);
  });

  // Считаем средние значения по месяцам
  const seasonality: Record<string, number> = {};
  for (const [month, values] of Object.entries(monthlyData)) {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    seasonality[month] = avg;
  }

  return seasonality;
};

// Расчет эффективности плана
export const calculatePlanEfficiency = (
  plan: {
    revenue: number;
    yield_kg: number;
    total_expenses: number;
    total_income: number;
  }
): {
  roi: number;
  profitMargin: number;
  costPerKg: number;
  profitability: number;
} => {
  const roi = calculateROI(plan.total_income, plan.total_expenses);
  const profitMargin = calculateProfitMargin(plan.total_income, plan.total_expenses);
  const costPerKg = calculateCostPerKg(plan.total_expenses, plan.yield_kg);
  const profitability = plan.revenue > 0 ? (plan.total_income / plan.revenue) * 100 : 0;

  return {
    roi,
    profitMargin,
    costPerKg,
    profitability,
  };
};

// Расчет брейк-евен точки
export const calculateBreakEven = (
  fixedCosts: number,
  variableCostPerKg: number,
  pricePerKg: number
): number => {
  if (pricePerKg <= variableCostPerKg) return Infinity;
  return fixedCosts / (pricePerKg - variableCostPerKg);
};

// Расчет маржи безопасности
export const calculateSafetyMargin = (
  actualYield: number,
  breakEvenYield: number
): number => {
  if (breakEvenYield === 0) return 100;
  return ((actualYield - breakEvenYield) / breakEvenYield) * 100;
};
