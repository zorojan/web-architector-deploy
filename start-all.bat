@echo off
echo 🚀 Запуск SDH Global AI Assistant - Полная система
echo =================================================

REM Проверка Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не найден. Установите Node.js и повторите попытку.
    pause
    exit /b 1
)
echo ✅ Node.js найден

REM Создаем папку для логов
if not exist logs mkdir logs

echo.
echo 1️⃣  BACKEND SETUP
echo ==================
cd backend
if not exist node_modules (
    echo 📦 Установка зависимостей для Backend...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Ошибка установки зависимостей для Backend
        pause
        exit /b 1
    )
    echo ✅ Зависимости для Backend установлены
) else (
    echo ✅ Зависимости для Backend уже установлены
)
cd ..

echo.
echo 2️⃣  ADMIN PANEL SETUP
echo =====================
cd admin-panel
if not exist node_modules (
    echo 📦 Установка зависимостей для Admin Panel...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Ошибка установки зависимостей для Admin Panel
        pause
        exit /b 1
    )
    echo ✅ Зависимости для Admin Panel установлены
) else (
    echo ✅ Зависимости для Admin Panel уже установлены
)
cd ..

echo.
echo 3️⃣  FRONTEND SETUP
echo ==================
cd frontend
if not exist node_modules (
    echo 📦 Установка зависимостей для Frontend...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Ошибка установки зависимостей для Frontend
        pause
        exit /b 1
    )
    echo ✅ Зависимости для Frontend установлены
) else (
    echo ✅ Зависимости для Frontend уже установлены
)
cd ..

echo.
echo 🚀 ЗАПУСК СЕРВИСОВ
echo ==================

REM Запуск Backend
echo 🚀 Запуск Backend на порту 3001...
cd backend
start "Backend" cmd /c "npm run dev > ../logs/backend.log 2>&1"
cd ..
timeout /t 3 /nobreak >nul

REM Запуск Admin Panel
echo 🚀 Запуск Admin Panel на порту 3000...
cd admin-panel  
start "Admin Panel" cmd /c "npm run dev > ../logs/admin-panel.log 2>&1"
cd ..
timeout /t 3 /nobreak >nul

REM Запуск Frontend
echo 🚀 Запуск Frontend на порту 5173...
cd frontend
start "Frontend" cmd /c "npm run dev > ../logs/frontend.log 2>&1"
cd ..
timeout /t 3 /nobreak >nul

echo.
echo 🎉 ВСЕ СЕРВИСЫ ЗАПУЩЕНЫ!
echo ========================
echo.
echo 🔗 Ссылки:
echo    Backend API:     http://localhost:3001/api/health
echo    Admin Panel:     http://localhost:3000
echo    Frontend:        http://localhost:5173
echo.
echo 🔐 Вход в Admin Panel:
echo    Логин: admin
echo    Пароль: admin123
echo.
echo ⚠️  ВАЖНО: Настройте Gemini API ключ в Admin Panel -^> Settings
echo.
echo 📋 Логи сохраняются в папке logs/
echo.

REM Автоматически открываем Admin Panel в браузере
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo Нажмите любую клавишу для выхода...
pause >nul
