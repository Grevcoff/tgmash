/**
 * API эндпоинты с типизацией
 */
import { api } from './client';
import type {
  User,
  Category,
  CategoryCreate,
  CategoryUpdate,
  CategoryListParams,
  Plan,
  PlanWithStats,
  PlanCreate,
  PlanUpdate,
  PlanListParams,
  Transaction,
  TransactionWithRelations,
  TransactionCreate,
  TransactionUpdate,
  TransactionListParams,
  StatsResponse,
  StatsParams,
  SuccessResponse,
  ErrorResponse,
  CSVExportResponse,
} from '@/types';

// Users
export const usersApi = {
  // Получить текущего пользователя
  getCurrentUser: () => api.get<User>('/users/me'),
  
  // Убедиться что пользователь существует
  ensureUser: () => api.post<User>('/users/ensure'),
  
  // Удалить пользователя и все данные
  deleteCurrentUser: () => api.delete<SuccessResponse>('/users/me'),
};

// Categories
export const categoriesApi = {
  // Получить список категорий
  getCategories: (params?: CategoryListParams) => 
    api.get<Category[]>('/categories', { params }),
  
  // Создать категорию
  createCategory: (data: CategoryCreate) => 
    api.post<Category>('/categories', data),
  
  // Получить категорию по ID
  getCategory: (id: number) => 
    api.get<Category>(`/categories/${id}`),
  
  // Обновить категорию
  updateCategory: (id: number, data: CategoryUpdate) => 
    api.put<Category>(`/categories/${id}`, data),
  
  // Удалить категорию
  deleteCategory: (id: number) => 
    api.delete<SuccessResponse>(`/categories/${id}`),
};

// Plans
export const plansApi = {
  // Получить список планов
  getPlans: (params?: PlanListParams) => 
    api.get<PlanWithStats[]>('/plans', { params }),
  
  // Создать план
  createPlan: (data: PlanCreate) => 
    api.post<PlanWithStats>('/plans', data),
  
  // Получить план по ID
  getPlan: (id: number) => 
    api.get<PlanWithStats>(`/plans/${id}`),
  
  // Обновить план
  updatePlan: (id: number, data: PlanUpdate) => 
    api.put<PlanWithStats>(`/plans/${id}`, data),
  
  // Удалить план
  deletePlan: (id: number) => 
    api.delete<SuccessResponse>(`/plans/${id}`),
  
  // Завершить план
  completePlan: (id: number) => 
    api.post<PlanWithStats>(`/plans/${id}/complete`),
};

// Transactions
export const transactionsApi = {
  // Получить список транзакций
  getTransactions: (params?: TransactionListParams) => 
    api.get<TransactionWithRelations[]>('/transactions', { params }),
  
  // Создать транзакцию
  createTransaction: (data: TransactionCreate) => 
    api.post<TransactionWithRelations>('/transactions', data),
  
  // Получить транзакцию по ID
  getTransaction: (id: number) => 
    api.get<TransactionWithRelations>(`/transactions/${id}`),
  
  // Обновить транзакцию
  updateTransaction: (id: number, data: TransactionUpdate) => 
    api.put<TransactionWithRelations>(`/transactions/${id}`, data),
  
  // Удалить транзакцию
  deleteTransaction: (id: number) => 
    api.delete<SuccessResponse>(`/transactions/${id}`),
};

// Stats
export const statsApi = {
  // Получить общую статистику
  getOverallStats: () => 
    api.get<StatsResponse['overall']>('/stats/overall'),
  
  // Получить статистику по категориям
  getCategoryStats: () => 
    api.get<StatsResponse['by_category']>('/stats/by-category'),
  
  // Получить дневную статистику
  getDailyStats: (days?: number) => 
    api.get<StatsResponse['daily']>('/stats/daily', { 
      params: days ? { days } : undefined 
    }),
  
  // Получить полную статистику
  getFullStats: (params?: StatsParams) => 
    api.get<StatsResponse>('/stats/full', { params }),
  
  // Экспортировать в CSV
  exportCSV: (params?: { plan_id?: number }) => 
    api.get<CSVExportResponse>('/stats/export/csv', { params }),
  
  // Скачать CSV
  downloadCSV: (params?: { plan_id?: number }) => {
    const queryString = params ? 
      `?${new URLSearchParams(params as any).toString()}` : 
      '';
    return api.download(`/stats/export/csv${queryString}`, 'transactions.csv');
  },
};

// Health
export const healthApi = {
  // Проверить здоровье API
  checkHealth: () => api.get<{ status: string; timestamp: string }>('/health'),
};

// Объединенный API
export const apiEndpoints = {
  users: usersApi,
  categories: categoriesApi,
  plans: plansApi,
  transactions: transactionsApi,
  stats: statsApi,
  health: healthApi,
};

export default apiEndpoints;
