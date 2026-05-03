/**
 * Экран управления планами выращивания
 */
import React, { useEffect, useState } from 'react';
import { Plus, MoreVertical, CheckCircle, Clock, Trash2, Edit, Download, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiEndpoints } from '@/api/endpoints';
import { TelegramButton } from '@/components/TelegramButton';
import type { PlanWithStats } from '@/types';
import { formatCurrency, formatDate, getStatusColor } from '@/utils/format';
import { toast } from 'react-hot-toast';

export const PlansScreen: React.FC = () => {
  const [plans, setPlans] = useState<PlanWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState<number | null>(null);
  
  const {
    setPlanFormOpen,
    setEditingPlan,
    deletePlan,
    updatePlan,
  } = useAppStore();

  // Загрузка планов
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsLoading(true);
        const plansData = await apiEndpoints.plans.getPlans();
        setPlans(plansData);
      } catch (error) {
        console.error('Error loading plans:', error);
        toast.error('Ошибка загрузки планов');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, []);

  // Обработка создания плана
  const handleCreatePlan = () => {
    setEditingPlan(null);
    setPlanFormOpen(true);
  };

  // Обработка редактирования плана
  const handleEditPlan = (plan: PlanWithStats) => {
    setEditingPlan(plan);
    setPlanFormOpen(true);
    setShowMenu(null);
  };

  // Обработка завершения плана
  const handleCompletePlan = async (plan: PlanWithStats) => {
    try {
      const updated = await apiEndpoints.plans.completePlan(plan.id);
      updatePlan(updated);
      toast.success(`План "${plan.name}" завершен`);
    } catch (error) {
      console.error('Error completing plan:', error);
      toast.error('Ошибка завершения плана');
    }
    setShowMenu(null);
  };

  // Обработка удаления плана
  const handleDeletePlan = async (plan: PlanWithStats) => {
    if (!confirm(`Удалить план "${plan.name}" и все связанные транзакции?`)) {
      return;
    }

    try {
      await apiEndpoints.plans.deletePlan(plan.id);
      deletePlan(plan.id);
      toast.success(`План "${plan.name}" удален`);
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Ошибка удаления плана');
    }
    setShowMenu(null);
  };

  // Обработка экспорта
  const handleExport = async (plan: PlanWithStats) => {
    try {
      await apiEndpoints.stats.downloadCSV({ plan_id: plan.id });
      toast.success('Данные экспортированы');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Ошибка экспорта данных');
    }
    setShowMenu(null);
  };

  // Обработка обновления после формы
  const handlePlanSuccess = () => {
    // Перезагружаем планы
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activePlans = plans.filter(plan => plan.status === 'active');
  const completedPlans = plans.filter(plan => plan.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">📦 Планы</h1>
            <TelegramButton onClick={handleCreatePlan}>
              <Plus className="h-4 w-4 mr-2" />
              Новый план
            </TelegramButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Активные планы */}
        {activePlans.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Активные планы</h2>
            <div className="grid gap-4">
              {activePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-green-500 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {plan.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor('active')}`}>
                          Активен
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Начало: {formatDate(plan.start_date)}</p>
                          <p className="text-gray-600">
                            Транзакций: {plan.transaction_count}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            Прибыль: {formatCurrency(plan.profit)}
                          </p>
                          <p className={`text-sm ${plan.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ROI: {plan.roi_percent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Меню действий */}
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === plan.id ? null : plan.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>

                      {showMenu === plan.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[160px]">
                          <button
                            onClick={() => handleEditPlan(plan)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleCompletePlan(plan)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Завершить
                          </button>
                          <button
                            onClick={() => handleExport(plan)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Экспорт
                          </button>
                          <div className="border-t my-1"></div>
                          <button
                            onClick={() => handleDeletePlan(plan)}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Завершенные планы */}
        {completedPlans.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Завершенные планы</h2>
            <div className="grid gap-4">
              {completedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-gray-400 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {plan.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor('completed')}`}>
                          Завершен
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            {formatDate(plan.start_date)} - {formatDate(plan.end_date!)}
                          </p>
                          <p className="text-gray-600">
                            Транзакций: {plan.transaction_count}
                          </p>
                          <p className="text-gray-600">
                            Урожай: {plan.yield_kg} кг
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            Прибыль: {formatCurrency(plan.profit)}
                          </p>
                          <p className={`text-sm ${plan.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ROI: {plan.roi_percent.toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600">
                            Себестоимость: {formatCurrency(plan.cost_per_kg)}/кг
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Меню действий */}
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === plan.id ? null : plan.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>

                      {showMenu === plan.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[160px]">
                          <button
                            onClick={() => handleExport(plan)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Экспорт
                          </button>
                          <div className="border-t my-1"></div>
                          <button
                            onClick={() => handleDeletePlan(plan)}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Пустое состояние */}
        {plans.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Clock className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нет планов
            </h3>
            <p className="text-gray-600 mb-6">
              Создайте планы для отслеживания затрат и урожая
            </p>
            <TelegramButton onClick={handleCreatePlan}>
              <Plus className="h-4 w-4 mr-2" />
              Создать первый план
            </TelegramButton>
          </div>
        )}
      </div>

      {/* Закрытие меню при клике вне */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(null)}
        />
      )}

      {/* TODO: Форма плана */}
      {/* <PlanForm
        isOpen={useAppStore.getState().isPlanFormOpen}
        onClose={() => setPlanFormOpen(false)}
        onSuccess={handlePlanSuccess}
        plan={useAppStore.getState().editingPlan}
      /> */}
    </div>
  );
};
