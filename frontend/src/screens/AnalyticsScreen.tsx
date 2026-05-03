/**
 * Экран аналитики и статистики
 */
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Download, TrendingUp, DollarSign, Package, Activity } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiEndpoints } from '@/api/endpoints';
import { TelegramButton } from '@/components/TelegramButton';
import type { StatsResponse, CategoryStats, DailyStats } from '@/types';
import { formatCurrency, formatPercent, formatDate, formatWeight } from '@/utils/format';
import { toast } from 'react-hot-toast';

export const AnalyticsScreen: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustomPeriod, setShowCustomPeriod] = useState(false);

  // Загрузка статистики
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        
        let params: any = {};
        
        if (period === 'week') {
          params = { days: 7 };
        } else if (period === 'month') {
          params = { days: 30 };
        } else if (period === 'all') {
          params = {};
        } else if (showCustomPeriod && customStart && customEnd) {
          params = {
            period_start: new Date(customStart).toISOString(),
            period_end: new Date(customEnd).toISOString(),
          };
        }
        
        const statsData = await apiEndpoints.stats.getFullStats(params);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading stats:', error);
        toast.error('Ошибка загрузки статистики');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [period, showCustomPeriod, customStart, customEnd]);

  // Обработка экспорта
  const handleExport = async () => {
    try {
      await apiEndpoints.stats.downloadCSV();
      toast.success('Данные экспортированы');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Ошибка экспорта данных');
    }
  };

  // Обработка периода
  const handlePeriodChange = (newPeriod: typeof period) => {
    if (newPeriod === 'custom') {
      setShowCustomPeriod(true);
    } else {
      setShowCustomPeriod(false);
      setPeriod(newPeriod);
    }
  };

  const handleCustomPeriodApply = () => {
    if (customStart && customEnd) {
      setPeriod('custom');
    }
  };

  // Цвета для графиков
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет данных</h3>
          <p className="text-gray-600">Начните добавлять транзакции для просмотра аналитики</p>
        </div>
      </div>
    );
  }

  const { overall, by_category, daily } = stats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">📊 Аналитика</h1>
            <TelegramButton onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт CSV
            </TelegramButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Выбор периода */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Период</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { value: 'week', label: 'Неделя' },
              { value: 'month', label: 'Месяц' },
              { value: 'all', label: 'Все время' },
              { value: 'custom', label: 'Кастомный' },
            ].map(({ value, label }) => (
              <TelegramButton
                key={value}
                variant={period === value ? 'primary' : 'secondary'}
                onClick={() => handlePeriodChange(value)}
                size="sm"
              >
                {label}
              </TelegramButton>
            ))}
          </div>

          {/* Кастомный период */}
          {showCustomPeriod && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Начальная дата
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Конечная дата
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {showCustomPeriod && (
            <div className="mt-4">
              <TelegramButton onClick={handleCustomPeriodApply}>
                <Calendar className="h-4 w-4 mr-2" />
                Применить период
              </TelegramButton>
            </div>
          )}
        </div>

        {/* Основные метрики */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <TrendingUp className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(overall.total_expenses)}
            </p>
            <p className="text-sm text-gray-600">Всего затрат</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(overall.total_income)}
            </p>
            <p className="text-sm text-gray-600">Выручка</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span className={`text-blue-600 font-bold`}>
                {overall.profit >= 0 ? '+' : ''}
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              overall.profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(overall.profit)}
            </p>
            <p className="text-sm text-gray-600">Прибыль ({formatPercent(overall.roi_percent)})</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-5 w-5 text-purple-600" />
              <Activity className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatWeight(overall.total_yield_kg)}
            </p>
            <p className="text-sm text-gray-600">Общий урожай</p>
          </div>
        </div>

        {/* Дополнительные метрики */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Дней роста</p>
            <p className="text-xl font-bold text-gray-900">{overall.growth_days}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Себестоимость 1 кг</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(overall.cost_per_kg)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Активных планов</p>
            <p className="text-xl font-bold text-gray-900">{overall.active_plans_count}</p>
          </div>
        </div>

        {/* График расходов по категориям */}
        {by_category.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Расходы по категориям</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={by_category.map(cat => ({
                      name: cat.category_name,
                      value: Number(cat.total_amount),
                      percentage: Number(cat.percentage),
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${name}: ${formatCurrency(value)}`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Легенда */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {by_category.map((cat, index) => (
                <div key={cat.category_name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">
                    {cat.category_name}: {formatPercent(cat.percentage)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* График динамики */}
        {daily.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Динамика затрат и доходов</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily.map(d => ({
                  date: formatDate(d.date),
                  расходы: Number(d.expenses),
                  доходы: Number(d.income),
                  чистая: Number(d.net),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value)]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="расходы" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="доходы" 
                    stroke="#10b981" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="чистая" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
