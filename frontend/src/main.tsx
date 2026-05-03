/**
 * Точка входа в приложение
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { App } from './App';
import './index.css';

// Инициализация Telegram WebApp
if ((window as any).Telegram?.WebApp) {
  const webApp = (window as any).Telegram.WebApp;
  
  // Настройка WebApp
  webApp.ready();
  webApp.expand();
  
  // Применяем тему Telegram
  document.documentElement.style.setProperty(
    '--tg-theme-bg-color',
    webApp.backgroundColor || '#ffffff'
  );
  document.documentElement.style.setProperty(
    '--tg-theme-text-color',
    webApp.textColor || '#000000'
  );
  document.documentElement.style.setProperty(
    '--tg-theme-hint-color',
    webApp.hintColor || '#999999'
  );
  document.documentElement.style.setProperty(
    '--tg-theme-link-color',
    webApp.linkColor || '#2481cc'
  );
  document.documentElement.style.setProperty(
    '--tg-theme-button-color',
    webApp.buttonColor || '#2481cc'
  );
  document.documentElement.style.setProperty(
    '--tg-theme-button-text-color',
    webApp.buttonTextColor || '#ffffff'
  );
  
  // Устанавливаем цветовую схему
  document.documentElement.setAttribute('data-theme', webApp.colorScheme || 'light');
  
  console.log('Telegram WebApp initialized:', {
    theme: webApp.colorScheme,
    version: webApp.version,
    platform: webApp.platform,
  });
}

// Рендер приложения
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--tg-theme-bg-color)',
          color: 'var(--tg-theme-text-color)',
          border: '1px solid var(--tg-theme-hint-color)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: 'var(--tg-theme-bg-color)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: 'var(--tg-theme-bg-color)',
          },
        },
      }}
    />
  </React.StrictMode>
);
