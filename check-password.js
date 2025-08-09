const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Проверка учетных данных в базе данных...');

db.get('SELECT username, password_hash FROM admin_users WHERE username = ?', ['admin'], async (err, row) => {
  if (err) {
    console.error('❌ Ошибка:', err);
    db.close();
    return;
  }
  
  if (row) {
    console.log('✅ Пользователь найден:', row.username);
    
    // Тестируем разные пароли
    const testPasswords = ['admin123', 'admin', 'password', '123456'];
    
    for (const pwd of testPasswords) {
      try {
        const isValid = await bcrypt.compare(pwd, row.password_hash);
        console.log(`🔑 Пароль '${pwd}': ${isValid ? '✅ ПОДХОДИТ' : '❌ не подходит'}`);
      } catch (error) {
        console.log(`🔑 Пароль '${pwd}': ❌ ошибка проверки`);
      }
    }
  } else {
    console.log('❌ Пользователь admin не найден!');
  }
  
  db.close();
});
