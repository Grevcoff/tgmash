/**
 * TypeScript типы для API
 */

// Базовые типы
export type TransactionType = 'expense' | 'income';
export type PlanStatus = 'active' | 'completed';
export type CategoryType = 'expense' | 'income';

// Пользователь
export interface User {
  id: number;
  tg_user_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  created_at: string;
}

// Категория
export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: CategoryType;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  type: CategoryType;
}

export interface CategoryUpdate {
  name?: string;
  type?: CategoryType;
}

// План
export interface Plan {
  id: number;
  user_id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  revenue: number;
  yield_kg: number;
  status: PlanStatus;
  notes: string | null;
  created_at: string;
}

export interface PlanWithStats extends Plan {
  total_expenses: number;
  total_income: number;
  transaction_count: number;
  profit: number;
  roi_percent: number;
  cost_per_kg: number;
}

export interface PlanCreate {
  name: string;
  start_date: string;
  end_date?: string;
  revenue?: number;
  yield_kg?: number;
  status?: PlanStatus;
  notes?: string;
}

export interface PlanUpdate {
  name?: string;
  start_date?: string;
  end_date?: string;
  revenue?: number;
  yield_kg?: number;
  status?: PlanStatus;
  notes?: string;
}

// Транзакция
export interface Transaction {
  id: number;
  plan_id: number;
  category_id: number;
  amount: number;
  date: string;
  comment: string | null;
  type: TransactionType;
  created_at: string;
}

export interface TransactionWithRelations extends Transaction {
  plan_name: string;
  category_name: string;
}

export interface TransactionCreate {
  plan_id: number;
  category_id: number;
  amount: number;
  date: string;
  comment?: string;
  type?: TransactionType;
}

export interface TransactionUpdate {
  plan_id?: number;
  category_id?: number;
  amount?: number;
  date?: string;
  comment?: string;
  type?: TransactionType;
}

// Статистика
export interface CategoryStats {
  category_name: string;
  category_type: TransactionType;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface DailyStats {
  date: string;
  expenses: number;
  income: number;
  net: number;
}

export interface OverallStats {
  total_expenses: number;
  total_income: number;
  profit: number;
  roi_percent: number;
  transaction_count: number;
  active_plans_count: number;
  completed_plans_count: number;
  total_yield_kg: number;
  cost_per_kg: number;
  growth_days: number;
}

export interface StatsResponse {
  overall: OverallStats;
  by_category: CategoryStats[];
  daily: DailyStats[];
  period_start?: string;
  period_end?: string;
}

// API ответы
export interface SuccessResponse {
  success: true;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export interface CSVExportResponse {
  filename: string;
  content_type: string;
  data: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Параметры запросов
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export interface TransactionListParams extends QueryParams {
  plan_id?: number;
  category_id?: number;
  type?: TransactionType;
  limit?: number;
  offset?: number;
}

export interface PlanListParams extends QueryParams {
  status?: PlanStatus;
}

export interface CategoryListParams extends QueryParams {
  type?: CategoryType;
  search?: string;
}

export interface StatsParams extends QueryParams {
  days?: number;
  plan_id?: number;
}

// Telegram WebApp
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: string;
    hash?: string;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setParams: (params: { color?: string; text_color?: string }) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  colorScheme: 'light' | 'dark';
}

// Глобальные типы
declare global {
  interface Window {
    Telegram: TelegramWebApp;
  }
}

// Утилиты
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
