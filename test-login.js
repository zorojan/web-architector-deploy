const fetch = require('node-fetch');

async function testLogin() {
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
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Авторизация успешна!');
      console.log('👤 Пользователь:', data.user);
      console.log('🔑 Токен получен:', data.token ? 'Да' : 'Нет');
    } else {
      console.log('❌ Ошибка авторизации:', data.error);
    }
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    console.log('💡 Убедитесь, что backend запущен на порту 3001');
  }
}

testLogin();
