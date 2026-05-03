/**
 * Главный экран приложения - дашборд
 */
import React, { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Package, Calendar } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiEndpoints } from '@/api/endpoints';
import { TransactionForm } from '@/components/TransactionForm';
import { TelegramButton } from '@/components/TelegramButton';
import type { PlanWithStats, TransactionWithRelations, OverallStats } from '@/types';
import { formatCurrency, formatRelativeTime, getStatusColor } from '@/utils/format';
import { toast } from 'react-hot-toast';

export const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [activePlan, setActivePlan] = useState<PlanWithStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    overallStats: storeStats,
    plans,
    transactions,
    setTransactionFormOpen,
    setEditingTransaction,
  } = useAppStore();

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Загружаем статистику
        const statsData = await apiEndpoints.stats.getOverallStats();
        setStats(statsData);
        
        // Находим активный план
        const active = plans.find(plan => plan.status === 'active');
        setActivePlan(active || null);
        
        // Загружаем последние транзакции
        const transactionsData = await apiEndpoints.transactions.getTransactions({
          limit: 5,
        });
        setRecentTransactions(transactionsData);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Ошибка загрузки данных');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [plans]);

  // Обработка добавления транзакции
  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setTransactionFormOpen(true);
  };

  // Обработка редактирования транзакции
  const handleEditTransaction = (transaction: TransactionWithRelations) => {
    setEditingTransaction(transaction);
    setTransactionFormOpen(true);
  };

  // Обработка обновления после формы
  const handleTransactionSuccess = () => {
    // Перезагружаем данные
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentStats = stats || storeStats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">🍄 Панель управления</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Карточка активного плана */}
        {activePlan && (
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Активный план</h2>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor('active')}`}>
                Активен
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">{activePlan.name}</p>
                <p className="text-xs text-gray-500">
                  С {formatRelativeTime(activePlan.start_date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Прибыль: {formatCurrency(activePlan.profit)}
                </p>
                <p className={`text-xs ${activePlan.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ROI: {activePlan.roi_percent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Кнопки быстрых действий */}
        <div className="grid grid-cols-2 gap-4">
          <TelegramButton
            onClick={handleAddTransaction}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить расход
          </TelegramButton>
          
          <TelegramButton
            variant="secondary"
            onClick={() => {
              // TODO: Открыть экран аналитики
              toast.info('Аналитика в разработке');
            }}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Аналитика
          </TelegramButton>
        </div>

        {/* Общая статистика */}
        {currentStats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-red-600" />
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(currentStats.total_expenses)}
              </p>
              <p className="text-sm text-gray-600">Всего затрат</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(currentStats.total_income)}
              </p>
              <p className="text-sm text-gray-600">Выручка</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="text-blue-600 font-bold">
                  {currentStats.profit >= 0 ? '+' : ''}
                </span>
              </div>
              <p className={`text-2xl font-bold ${
                currentStats.profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(currentStats.profit)}
              </p>
              <p className="text-sm text-gray-600">Прибыль</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-purple-600 font-bold">
                  {currentStats.growth_days}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {currentStats.growth_days}
              </p>
              <p className="text-sm text-gray-600">Дней роста</p>
            </div>
          </div>
        )}

        {/* Последние транзакции */}
        {recentTransactions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Последние транзакции</h2>
            </div>
            <div className="divide-y">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => handleEditTransaction(transaction)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {transaction.category_name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {transaction.plan_name} • {formatRelativeTime(transaction.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${
                        transaction.type === 'expense' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {transaction.type === 'expense' ? 'Расход' : 'Доход'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Форма транзакции */}
      <TransactionForm
        isOpen={useAppStore.getState().isTransactionFormOpen}
        onClose={() => setTransactionFormOpen(false)}
        onSuccess={handleTransactionSuccess}
        transaction={useAppStore.getState().editingTransaction}
      />
    </div>
  );
};
