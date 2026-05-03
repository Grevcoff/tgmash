/**
 * Axios клиент с interceptors для Telegram WebApp аутентификации
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Получаем базовый URL API
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://tgmash.onrender.com/api' : 'http://localhost:8000/api');

// Класс для управления API клиентом
class ApiClient {
  private client: AxiosInstance;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - добавляем Telegram initData
    this.client.interceptors.request.use(
      (config) => {
        // Проверяем, что мы в Telegram WebApp
        if ((window as any).Telegram?.WebApp?.initData) {
          const initData = (window as any).Telegram.WebApp.initData;
          config.headers.Authorization = `tma ${initData}`;
        }
        
        // Для разработки можно использовать заглушку
        if (import.meta.env.DEV && !(window as any).Telegram?.WebApp?.initData) {
          console.warn('⚠️ Telegram WebApp не найден. Используется режим разработки.');
          // Можно добавить тестовые данные для разработки
          // config.headers.Authorization = `tma test_data`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - обработка ошибок
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Обработка ошибок аутентификации
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Если это проблема с initData, пытаемся обновить
          if ((window as any).Telegram?.WebApp?.initData) {
            try {
              // Проверяем актуальность initData
              const authDate = parseInt((window as any).Telegram.WebApp.initDataUnsafe.auth_date || '0');
              const now = Math.floor(Date.now() / 1000);
              const maxAge = 24 * 60 * 60; // 24 часа

              if (now - authDate > maxAge) {
                // initData устарел, нужно перезагрузить WebApp
                (window as any).Telegram.WebApp.close();
                return Promise.reject(error);
              }

              // Повторяем запрос с тем же initData
              return this.client(originalRequest);
            } catch (refreshError) {
              // Не удалось обновить токен
              this.processFailedQueue(null, refreshError);
              return Promise.reject(refreshError);
            }
          }
        }

        // Обработка других ошибок
        const errorMessage = this.getErrorMessage(error);
        console.error('API Error:', errorMessage, error);

        return Promise.reject({
          ...error,
          userMessage: errorMessage,
        });
      }
    );
  }

  private processFailedQueue(token: string | null, error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (token) {
        resolve(token);
      } else {
        reject(error);
      }
    });

    this.failedQueue = [];
  }

  private getErrorMessage(error: AxiosError): string {
    if (!error.response) {
      return 'Ошибка сети. Проверьте подключение к интернету.';
    }

    const status = error.response.status;
    const data = error.response.data as any;

    switch (status) {
      case 400:
        return data?.detail || 'Неверные данные запроса.';
      case 401:
        return 'Ошибка аутентификации. Перезагрузите приложение.';
      case 403:
        return 'Доступ запрещен.';
      case 404:
        return 'Запрошенный ресурс не найден.';
      case 409:
        return data?.detail || 'Конфликт данных.';
      case 422:
        return data?.detail || 'Ошибка валидации данных.';
      case 429:
        return 'Слишком много запросов. Попробуйте позже.';
      case 500:
        return 'Внутренняя ошибка сервера.';
      default:
        return data?.detail || `Ошибка ${status}.`;
    }
  }

  // HTTP методы
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Метод для скачивания файлов
  async download(url: string, filename: string): Promise<void> {
    try {
      const response = await this.client.get(url, {
        responseType: 'blob',
      });

      // Создаем ссылку для скачивания
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  // Получить текущий клиент для кастомных запросов
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Создаем экземпляр клиента
export const apiClient = new ApiClient();

// Утилиты для работы с API
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.put<T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config),
  download: (url: string, filename: string) => apiClient.download(url, filename),
  client: () => apiClient.getClient(),
};

export default api;
