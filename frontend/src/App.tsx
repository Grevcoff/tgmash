/**
 * Основной компонент приложения
 */
import React, { useEffect, useState } from 'react';
import { Home, Package, BarChart3, Settings, Menu, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiEndpoints } from '@/api/endpoints';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { PlansScreen } from '@/screens/PlansScreen';
import { AnalyticsScreen } from '@/screens/AnalyticsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { toast } from 'react-hot-toast';

type Screen = 'dashboard' | 'plans' | 'analytics' | 'settings';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const {
    user,
    setUser,
    setLoading,
    setError,
    setTelegramReady,
    setTelegramTheme,
  } = useAppStore();

  // Инициализация приложения
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Проверяем Telegram WebApp
        if (!window.Telegram?.WebApp) {
          setError('Приложение должно быть открыто через Telegram');
          return;
        }

        // Устанавливаем готовность Telegram
        setTelegramReady(true);
        
        // Получаем тему
        const theme = window.Telegram.WebApp.colorScheme || 'light';
        setTelegramTheme(theme as 'light' | 'dark');

        // Получаем или создаем пользователя
        const userData = await apiEndpoints.users.ensureUser();
        setUser(userData);

        // Загружаем базовые данные
        const [categoriesData, plansData, transactionsData, statsData] = await Promise.all([
          apiEndpoints.categories.getCategories(),
          apiEndpoints.plans.getPlans(),
          apiEndpoints.transactions.getTransactions({ limit: 10 }),
          apiEndpoints.stats.getOverallStats(),
        ]);

        // Обновляем store
        useAppStore.getState().setCategories(categoriesData);
        useAppStore.getState().setPlans(plansData);
        useAppStore.getState().setTransactions(transactionsData);
        useAppStore.getState().setOverallStats(statsData);

      } catch (error) {
        console.error('Error initializing app:', error);
        setError('Ошибка инициализации приложения');
        toast.error('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [setUser, setLoading, setError, setTelegramReady, setTelegramTheme]);

  // Обработка изменения экрана
  const handleScreenChange = (screen: Screen) => {
    setCurrentScreen(screen);
    setIsMobileMenuOpen(false);
  };

  // Рендер текущего экрана
  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'plans':
        return <PlansScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  // Навигация
  const navigation = [
    { id: 'dashboard', label: 'Главная', icon: Home },
    { id: 'plans', label: 'Планы', icon: Package },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Боковая панель */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Заголовок */}
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-lg font-bold text-gray-900">🍄 Грибник</h1>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Навигация */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    onClick={() => handleScreenChange(id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${currentScreen === id 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-l-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Информация о пользователе */}
          {user && (
            <div className="p-4 border-t">
              <div className="text-sm text-gray-600">
                <div>Пользователь: {user.first_name}</div>
                <div>ID: {user.tg_user_id}</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Верхняя панель */}
        <header className="bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {navigation.find(nav => nav.id === currentScreen)?.label}
            </h2>
            <div className="w-9" /> {/* Заглушка для центрирования */}
          </div>
        </header>

        {/* Контент экрана */}
        <div className="flex-1 overflow-auto">
          {renderScreen()}
        </div>
      </main>
    </div>
  );
};
