/**
 * Форма добавления/редактирования транзакции
 */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, DollarSign, X, Save } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiEndpoints } from '@/api/endpoints';
import { CategoryAutocomplete } from './CategoryAutocomplete';
import type { 
  TransactionWithRelations, 
  TransactionCreate, 
  Category,
} from '@/types';
import { toast } from 'react-hot-toast';

// Валидация формы
const transactionSchema = z.object({
  plan_id: z.number().min(1, 'Выберите план'),
  category_id: z.number().min(1, 'Выберите категорию'),
  amount: z.number().min(0, 'Сумма должна быть положительной'),
  date: z.string().min(1, 'Выберите дату'),
  comment: z.string().max(200, 'Комментарий не более 200 символов').optional(),
  type: z.enum(['expense', 'income']),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: TransactionWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const plans = useAppStore((state) => state.plans);
  const { addTransaction, updateTransaction } = useAppStore.getState();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      plan_id: transaction?.plan_id || undefined,
      category_id: transaction?.category_id || undefined,
      amount: transaction?.amount || 0,
      date: transaction?.date 
        ? new Date(transaction.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      comment: transaction?.comment || '',
      type: transaction?.type || 'expense',
    },
  });

  
  // Эффект для установки категории при редактировании
  useEffect(() => {
    if (transaction && isOpen) {
      setSelectedCategory({
        id: transaction.category_id,
        name: transaction.category_name,
        type: transaction.type,
        user_id: 0, // Не важно для формы
        created_at: transaction.created_at,
      });
    }
  }, [transaction, isOpen]);

  // Эффект для сброса формы при закрытии
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedCategory(null);
    }
  }, [isOpen, reset]);

  // Обработка отправки формы
  const onSubmit = async (data: TransactionFormData) => {
    if (!selectedCategory) {
      toast.error('Выберите категорию');
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionData: TransactionCreate = {
        ...data,
        category_id: selectedCategory.id,
        date: new Date(data.date).toISOString(),
      };

      if (transaction) {
        // Редактирование
        const updated = await apiEndpoints.transactions.updateTransaction(
          transaction.id,
          transactionData
        );
        updateTransaction(updated);
        toast.success('Транзакция обновлена');
      } else {
        // Создание
        const created = await apiEndpoints.transactions.createTransaction(transactionData);
        addTransaction(created);
        toast.success('Транзакция добавлена');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      toast.error(error.userMessage || 'Ошибка при сохранении транзакции');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Фильтрация планов по статусу
  const activePlans = plans.filter(plan => plan.status === 'active');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction ? 'Редактировать транзакцию' : 'Новая транзакция'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Тип транзакции */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="relative">
                <input
                  {...register('type')}
                  type="radio"
                  value="expense"
                  className="sr-only peer"
                />
                <div className="px-4 py-2 border rounded-lg cursor-pointer text-center peer-checked:bg-red-50 peer-checked:border-red-300 peer-checked:text-red-700 hover:bg-gray-50">
                  Расход
                </div>
              </label>
              <label className="relative">
                <input
                  {...register('type')}
                  type="radio"
                  value="income"
                  className="sr-only peer"
                />
                <div className="px-4 py-2 border rounded-lg cursor-pointer text-center peer-checked:bg-green-50 peer-checked:border-green-300 peer-checked:text-green-700 hover:bg-gray-50">
                  Доход
                </div>
              </label>
            </div>
            {errors.type && (
              <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* План */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              План
            </label>
            <select
              {...register('plan_id', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Выберите план...</option>
              {activePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
            {errors.plan_id && (
              <p className="text-red-600 text-sm mt-1">{errors.plan_id.message}</p>
            )}
          </div>

          {/* Категория */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>
            <CategoryAutocomplete
              value={selectedCategory?.name}
              onChange={setSelectedCategory}
              type={transaction?.type || 'expense'}
              placeholder="Введите или выберите категорию..."
            />
            {errors.category_id && (
              <p className="text-red-600 text-sm mt-1">{errors.category_id.message}</p>
            )}
          </div>

          {/* Сумма */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сумма
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {errors.amount && (
              <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Дата */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register('date')}
                type="date"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {errors.date && (
              <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Комментарий */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Комментарий (опционально)
            </label>
            <textarea
              {...register('comment')}
              rows={3}
              placeholder="Добавьте комментарий..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errors.comment && (
              <p className="text-red-600 text-sm mt-1">{errors.comment.message}</p>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {transaction ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
