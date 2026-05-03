/**
 * Zustand store для управления состоянием приложения
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  User,
  Category,
  PlanWithStats,
  TransactionWithRelations,
  OverallStats,
  CategoryStats,
  DailyStats,
  PlanStatus,
  TransactionType,
} from '@/types';

// Интерфейс состояния
interface AppState {
  // Пользователь
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Данные
  categories: Category[];
  plans: PlanWithStats[];
  transactions: TransactionWithRelations[];
  overallStats: OverallStats | null;
  categoryStats: CategoryStats[];
  dailyStats: DailyStats[];

  // Фильтры и сортировка
  selectedPlan: number | null;
  selectedCategory: number | null;
  transactionType: TransactionType | 'all';
  planStatus: PlanStatus | 'all';

  // UI состояние
  isTransactionFormOpen: boolean;
  isPlanFormOpen: boolean;
  isCategoryFormOpen: boolean;
  editingTransaction: TransactionWithRelations | null;
  editingPlan: PlanWithStats | null;
  editingCategory: Category | null;

  // Telegram WebApp
  isTelegramReady: boolean;
  telegramTheme: 'light' | 'dark';
}

// Интерфейс действий
interface AppActions {
  // User actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Data actions
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  removeCategory: (categoryId: number) => void;

  setPlans: (plans: PlanWithStats[]) => void;
  addPlan: (plan: PlanWithStats) => void;
  updatePlan: (plan: PlanWithStats) => void;
  removePlan: (planId: number) => void;

  setTransactions: (transactions: TransactionWithRelations[]) => void;
  addTransaction: (transaction: TransactionWithRelations) => void;
  updateTransaction: (transaction: TransactionWithRelations) => void;
  removeTransaction: (transactionId: number) => void;

  setOverallStats: (stats: OverallStats) => void;
  setCategoryStats: (stats: CategoryStats[]) => void;
  setDailyStats: (stats: DailyStats[]) => void;

  // Filter actions
  setSelectedPlan: (planId: number | null) => void;
  setSelectedCategory: (categoryId: number | null) => void;
  setTransactionType: (type: TransactionType | 'all') => void;
  setPlanStatus: (status: PlanStatus | 'all') => void;

  // UI actions
  setTransactionFormOpen: (open: boolean) => void;
  setPlanFormOpen: (open: boolean) => void;
  setCategoryFormOpen: (open: boolean) => void;
  setEditingTransaction: (transaction: TransactionWithRelations | null) => void;
  setEditingPlan: (plan: PlanWithStats | null) => void;
  setEditingCategory: (category: Category | null) => void;

  // Telegram actions
  setTelegramReady: (ready: boolean) => void;
  setTelegramTheme: (theme: 'light' | 'dark') => void;

  // Reset actions
  resetFilters: () => void;
  resetUI: () => void;
  reset: () => void;
}

// Создание store
export const useAppStore = create<AppState & AppActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      error: null,

      categories: [],
      plans: [],
      transactions: [],
      overallStats: null,
      categoryStats: [],
      dailyStats: [],

      selectedPlan: null,
      selectedCategory: null,
      transactionType: 'all',
      planStatus: 'all',

      isTransactionFormOpen: false,
      isPlanFormOpen: false,
      isCategoryFormOpen: false,
      editingTransaction: null,
      editingPlan: null,
      editingCategory: null,

      isTelegramReady: false,
      telegramTheme: 'light',

      // User actions
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Data actions
      setCategories: (categories) => set({ categories }),
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, category],
      })),
      updateCategory: (category) => set((state) => ({
        categories: state.categories.map((c) =>
          c.id === category.id ? category : c
        ),
      })),
      removeCategory: (categoryId) => set((state) => ({
        categories: state.categories.filter((c) => c.id !== categoryId),
      })),

      setPlans: (plans) => set({ plans }),
      addPlan: (plan) => set((state) => ({
        plans: [...state.plans, plan],
      })),
      updatePlan: (plan) => set((state) => ({
        plans: state.plans.map((p) => (p.id === plan.id ? plan : p)),
      })),
      removePlan: (planId) => set((state) => ({
        plans: state.plans.filter((p) => p.id !== planId),
      })),

      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions],
      })),
      updateTransaction: (transaction) => set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === transaction.id ? transaction : t
        ),
      })),
      removeTransaction: (transactionId) => set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== transactionId),
      })),

      setOverallStats: (overallStats) => set({ overallStats }),
      setCategoryStats: (categoryStats) => set({ categoryStats }),
      setDailyStats: (dailyStats) => set({ dailyStats }),

      // Filter actions
      setSelectedPlan: (selectedPlan) => set({ selectedPlan }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setTransactionType: (transactionType) => set({ transactionType }),
      setPlanStatus: (planStatus) => set({ planStatus }),

      // UI actions
      setTransactionFormOpen: (isTransactionFormOpen) => set({ isTransactionFormOpen }),
      setPlanFormOpen: (isPlanFormOpen) => set({ isPlanFormOpen }),
      setCategoryFormOpen: (isCategoryFormOpen) => set({ isCategoryFormOpen }),
      setEditingTransaction: (editingTransaction) => set({ editingTransaction }),
      setEditingPlan: (editingPlan) => set({ editingPlan }),
      setEditingCategory: (editingCategory) => set({ editingCategory }),

      // Telegram actions
      setTelegramReady: (isTelegramReady) => set({ isTelegramReady }),
      setTelegramTheme: (telegramTheme) => set({ telegramTheme }),

      // Reset actions
      resetFilters: () => set({
        selectedPlan: null,
        selectedCategory: null,
        transactionType: 'all',
        planStatus: 'all',
      }),

      resetUI: () => set({
        isTransactionFormOpen: false,
        isPlanFormOpen: false,
        isCategoryFormOpen: false,
        editingTransaction: null,
        editingPlan: null,
        editingCategory: null,
      }),

      reset: () => set({
        user: null,
        isLoading: false,
        error: null,
        categories: [],
        plans: [],
        transactions: [],
        overallStats: null,
        categoryStats: [],
        dailyStats: [],
        selectedPlan: null,
        selectedCategory: null,
        transactionType: 'all',
        planStatus: 'all',
        isTransactionFormOpen: false,
        isPlanFormOpen: false,
        isCategoryFormOpen: false,
        editingTransaction: null,
        editingPlan: null,
        editingCategory: null,
      }),
    }),
    {
      name: 'mushroom-bot-store',
    }
  )
);

// Селекторы для удобного доступа к данным
export const useUser = () => useAppStore((state) => state.user);
export const useLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);

export const useCategories = () => useAppStore((state) => state.categories);
export const usePlans = () => useAppStore((state) => state.plans);
export const useTransactions = () => useAppStore((state) => state.transactions);

export const useFilters = () => useAppStore((state) => ({
  selectedPlan: state.selectedPlan,
  selectedCategory: state.selectedCategory,
  transactionType: state.transactionType,
  planStatus: state.planStatus,
}));

export const useUI = () => useAppStore((state) => ({
  isTransactionFormOpen: state.isTransactionFormOpen,
  isPlanFormOpen: state.isPlanFormOpen,
  isCategoryFormOpen: state.isCategoryFormOpen,
  editingTransaction: state.editingTransaction,
  editingPlan: state.editingPlan,
  editingCategory: state.editingCategory,
}));

export const useTelegram = () => useAppStore((state) => ({
  isTelegramReady: state.isTelegramReady,
  telegramTheme: state.telegramTheme,
}));
