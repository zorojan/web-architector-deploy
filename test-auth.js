// Тест авторизации
async function testAuth() {
  try {
    console.log('🧪 Тестирование авторизации...');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    console.log('📊 Status:', response.status);
    
    const data = await response.json();
    console.log('📋 Response:', data);
    
    if (response.ok && data.success) {
      console.log('✅ Авторизация работает!');
      console.log('👤 Пользователь:', data.user);
      console.log('🔑 Токен:', data.token ? 'Получен' : 'Отсутствует');
      
      // Тест верификации токена
      const verifyResponse = await fetch('http://localhost:3001/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      const verifyData = await verifyResponse.json();
      console.log('🔍 Верификация токена:', verifyData);
      
    } else {
      console.log('❌ Ошибка авторизации:', data.error || 'Неизвестная ошибка');
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
  }
}

// Для Node.js 18+ fetch встроен, для более старых версий нужно подключить node-fetch
if (typeof fetch === 'undefined') {
  console.error('❌ fetch не поддерживается в этой версии Node.js');
  console.log('💡 Используйте Node.js 18+ или установите node-fetch');
} else {
  testAuth();
}
