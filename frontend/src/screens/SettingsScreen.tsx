/**
 * Экран настроек приложения
 */
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Trash2, Info, Github, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiEndpoints } from '@/api/endpoints';
import { TelegramButton } from '@/components/TelegramButton';
import { toast } from 'react-hot-toast';

export const SettingsScreen: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isDeleting, setIsDeleting] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  
  const { user, reset } = useAppStore();

  // Загрузка версии приложения
  useEffect(() => {
    setAppVersion('1.0.0'); // Можно получить из package.json
  }, []);

  // Загрузка темы из Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgTheme = window.Telegram.WebApp.colorScheme;
      if (tgTheme) {
        setTheme(tgTheme);
      }
    }
  }, []);

  // Обработка смены темы
  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme);
    
    // Применяем тему к Telegram WebApp
    if (window.Telegram?.WebApp) {
      // Telegram WebApp сам управляет темой
      if (newTheme !== 'system') {
        // Можно добавить CSS переменные для кастомной темы
        document.documentElement.setAttribute('data-theme', newTheme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  };

  // Обработка удаления всех данных
  const handleDeleteAllData = async () => {
    if (!confirm('⚠️ ВНИМАНИЕ!\n\nЭто действие удалит ВСЕ данные:\n• Все планы\n• Все транзакции\n• Все категории\n• Вашу учетную запись\n\nЭто действие НЕВОЗМОЖНО отменить!\n\nВы уверены, что хотите продолжить?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiEndpoints.users.deleteCurrentUser();
      reset();
      toast.success('Все данные успешно удалены');
      
      // Перезагружаем страницу
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error deleting all data:', error);
      toast.error('Ошибка при удалении данных');
    } finally {
      setIsDeleting(false);
    }
  };

  // Обработка открытия репозитория
  const handleOpenRepo = () => {
    window.open('https://github.com/your-username/mushroom-bot', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">⚙️ Настройки</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Информация о пользователе */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">О пользователе</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">ID пользователя:</span>
              <span className="font-mono text-gray-900">{user?.tg_user_id || 'Загрузка...'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Дата регистрации:</span>
              <span className="text-gray-900">
                {user ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'Загрузка...'}
              </span>
            </div>
          </div>
        </div>

        {/* Настройки темы */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Внешний вид</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тема оформления
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'light', label: 'Светлая', icon: Sun },
                  { value: 'dark', label: 'Тёмная', icon: Moon },
                  { value: 'system', label: 'Системная', icon: Info },
                ].map(({ value, label, icon: Icon }) => (
                  <label key={value} className="relative">
                    <input
                      type="radio"
                      name="theme"
                      value={value}
                      checked={theme === value}
                      onChange={() => handleThemeChange(value)}
                      className="sr-only peer"
                    />
                    <div className="flex flex-col items-center p-3 border rounded-lg cursor-pointer peer-checked:bg-blue-50 peer-checked:border-blue-300 hover:bg-gray-50">
                      <Icon className="h-5 w-5 mb-2 mx-auto text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Опасные действия */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-red-500">
          <h2 className="text-lg font-semibold text-red-900 mb-4">⚠️ Опасные действия</h2>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 mb-1">
                    Удалить все данные
                  </h3>
                  <p className="text-sm text-red-700">
                    Это действие безвозвратно удалит все ваши данные: планы, транзакции, категории и учетную запись.
                  </p>
                </div>
              </div>
            </div>
            
            <TelegramButton
              onClick={handleDeleteAllData}
              disabled={isDeleting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Удаление...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить все данные
                </>
              )}
            </TelegramButton>
          </div>
        </div>

        {/* Информация о приложении */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">О приложении</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Версия:</span>
              <span className="font-mono text-gray-900">{appVersion}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Статус API:</span>
              <span className="text-green-600">Подключено</span>
            </div>

            <div className="pt-4 border-t">
              <TelegramButton
                variant="secondary"
                onClick={handleOpenRepo}
                className="w-full"
              >
                <Github className="h-4 w-4 mr-2" />
                Исходный код
              </TelegramButton>
            </div>
          </div>
        </div>

        {/* Ссылки и ресурсы */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ресурсы</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Telegram Bot
                </span>
              </div>
              <span className="text-xs text-blue-600">
                @mushroom_bot
              </span>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Приложение для учета затрат и аналитики при выращивании вешенок
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
