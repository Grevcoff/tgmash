/**
 * Компонент автодополнения категорий с дебаунсом и созданием новых
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiEndpoints } from '@/api/endpoints';
import type { Category, CategoryType } from '@/types';
import { toast } from 'react-hot-toast';

interface CategoryAutocompleteProps {
  value?: string;
  onChange: (category: Category | null) => void;
  type?: CategoryType;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CategoryAutocomplete: React.FC<CategoryAutocompleteProps> = ({
  value,
  onChange,
  type = 'expense',
  placeholder = 'Введите название категории...',
  disabled = false,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateButton, setShowCreateButton] = useState(false);
  
  const categories = useAppStore((state) => state.categories);

  // Дебаунс для поиска
  const debouncedSearch = useCallback(
    async (searchTerm: string) => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        setShowCreateButton(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await apiEndpoints.categories.getCategories({
          type,
          search: searchTerm,
        });
        setSuggestions(result);
        
        // Показываем кнопку создания если нет точных совпадений
        const exactMatch = result.some(cat => 
          cat.name.toLowerCase() === searchTerm.toLowerCase()
        );
        setShowCreateButton(!exactMatch && searchTerm.length >= 2);
      } catch (error) {
        console.error('Error searching categories:', error);
        toast.error('Ошибка при поиске категорий');
      } finally {
        setIsLoading(false);
      }
    },
    [type]
  );

  // Эффект для дебаунса
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, debouncedSearch]);

  // Обработка ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(true);
    
    // Если поле пустое, сбрасываем выбор
    if (!value.trim()) {
      onChange(null);
    }
  };

  // Выбор категории
  const handleSelectCategory = (category: Category) => {
    setInputValue(category.name);
    onChange(category);
    setIsOpen(false);
    setShowCreateButton(false);
  };

  // Создание новой категории
  const handleCreateCategory = async () => {
    if (!inputValue.trim()) return;

    try {
      const newCategory = await apiEndpoints.categories.createCategory({
        name: inputValue.trim(),
        type,
      });
      
      // Добавляем в store
      useAppStore.getState().addCategory(newCategory);
      
      // Выбираем новую категорию
      handleSelectCategory(newCategory);
      
      toast.success(`Категория "${newCategory.name}" создана`);
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(error.userMessage || 'Ошибка при создании категории');
    }
  };

  // Очистка поля
  const handleClear = () => {
    setInputValue('');
    onChange(null);
    setSuggestions([]);
    setShowCreateButton(false);
  };

  // Фокус на инпут
  const handleFocus = () => {
    setIsOpen(true);
    if (inputValue.length >= 2) {
      debouncedSearch(inputValue);
    }
  };

  // Потеря фокуса
  const handleBlur = () => {
    // Задержка чтобы успеть кликнуть на suggestion
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        {/* Иконка поиска */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
        
        {/* Кнопка очистки */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Выпадающий список */}
      {isOpen && (suggestions.length > 0 || showCreateButton) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Существующие категории */}
          {suggestions.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSelectCategory(category)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900">{category.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  category.type === 'expense' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {category.type === 'expense' ? 'Расход' : 'Доход'}
                </span>
              </div>
            </button>
          ))}

          {/* Кнопка создания новой категории */}
          {showCreateButton && (
            <button
              type="button"
              onClick={handleCreateCategory}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-t border-gray-200 bg-blue-50"
            >
              <div className="flex items-center text-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                <span>Создать категорию "{inputValue}"</span>
              </div>
            </button>
          )}

          {/* Сообщение если ничего не найдено */}
          {!showCreateButton && suggestions.length === 0 && inputValue.length >= 2 && (
            <div className="px-4 py-3 text-gray-500 text-center">
              Категории не найдены
            </div>
          )}
        </div>
      )}
    </div>
  );
};
