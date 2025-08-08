import { useUI, useUser } from '../lib/state';
import { useEffect } from 'react';

/**
 * Компонент для сброса состояния при разработке
 * Автоматически очищает localStorage и устанавливает правильные значения по умолчанию
 */
export default function StateResetter() {
  const { setShowUserConfig } = useUI();
  const { setName, setInfo } = useUser();
  
  useEffect(() => {
    // Проверяем, нужно ли сбросить состояние
    const shouldReset = localStorage.getItem('state-reset-flag') !== 'completed';
    
    if (shouldReset) {
      console.log('🔄 Resetting state...');
      
      // Очищаем Zustand localStorage
      const keys = Object.keys(localStorage);
      const zustandKeys = keys.filter(key => 
        key.includes('ui-storage') || 
        key.includes('user-storage') || 
        key.includes('agent-storage')
      );
      
      zustandKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed ${key}`);
      });
      
      // Устанавливаем правильные значения
      setShowUserConfig(false);
      setName('Гость');
      setInfo('Пользователь SDH Global AI Assistant');
      
      // Помечаем, что сброс выполнен
      localStorage.setItem('state-reset-flag', 'completed');
      
      console.log('✅ State reset completed');
    }
  }, [setShowUserConfig, setName, setInfo]);
  
  return null; // Компонент ничего не рендерит
}
