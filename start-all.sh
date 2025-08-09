#!/bin/bash

echo "🚀 Запуск SDH Global AI Assistant - Полная система"
echo "================================================="

# Функция для проверки наличия Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js не найден. Установите Node.js и повторите попытку."
        exit 1
    fi
    echo "✅ Node.js найден: $(node --version)"
}

# Функция для установки зависимостей
install_deps() {
    local dir=$1
    local name=$2
    
    echo "📦 Установка зависимостей для $name..."
    cd "$dir" || exit 1
    
    if [ ! -d "node_modules" ]; then
        npm install
        if [ $? -eq 0 ]; then
            echo "✅ Зависимости для $name установлены"
        else
            echo "❌ Ошибка установки зависимостей для $name"
            exit 1
        fi
    else
        echo "✅ Зависимости для $name уже установлены"
    fi
    
    cd ..
}

# Функция для запуска сервиса в фоне
start_service() {
    local dir=$1
    local name=$2
    local port=$3
    local script=$4
    
    echo "🚀 Запуск $name на порту $port..."
    cd "$dir" || exit 1
    
    # Проверяем, не занят ли порт
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Порт $port уже занят. Останавливаем существующий процесс..."
        kill $(lsof -t -i:$port) 2>/dev/null || true
        sleep 2
    fi
    
    # Запускаем сервис
    npm run $script > "../logs/$name.log" 2>&1 &
    local pid=$!
    echo "$pid" > "../logs/$name.pid"
    
    echo "✅ $name запущен (PID: $pid)"
    echo "📋 Логи: logs/$name.log"
    
    cd ..
}

# Создаем папку для логов
mkdir -p logs

# Проверяем Node.js
check_node

echo ""
echo "1️⃣  BACKEND SETUP"
echo "=================="
install_deps "backend" "Backend"

echo ""
echo "2️⃣  ADMIN PANEL SETUP" 
echo "====================="
install_deps "admin-panel" "Admin Panel"

echo ""
echo "3️⃣  FRONTEND SETUP"
echo "=================="
install_deps "frontend" "Frontend"

echo ""
echo "🚀 ЗАПУСК СЕРВИСОВ"
echo "=================="

# Запускаем Backend
start_service "backend" "backend" "3001" "dev"
sleep 3

# Запускаем Admin Panel  
start_service "admin-panel" "admin-panel" "3000" "dev"
sleep 3

# Запускаем Frontend
start_service "frontend" "frontend" "5173" "dev"
sleep 3

echo ""
echo "🎉 ВСЕ СЕРВИСЫ ЗАПУЩЕНЫ!"
echo "========================"
echo ""
echo "🔗 Ссылки:"
echo "   Backend API:     http://localhost:3001/api/health"
echo "   Admin Panel:     http://localhost:3000"
echo "   Frontend:        http://localhost:5173"
echo ""
echo "🔐 Вход в Admin Panel:"
echo "   Логин: admin"
echo "   Пароль: admin123"
echo ""
echo "📋 Управление:"
echo "   Остановить все: npm run stop"
echo "   Просмотр логов: tail -f logs/[service-name].log"
echo ""
echo "⚠️  ВАЖНО: Настройте Gemini API ключ в Admin Panel -> Settings"
echo ""

# Ждем нажатия Ctrl+C
echo "Нажмите Ctrl+C для остановки всех сервисов..."

trap 'echo ""; echo "🛑 Остановка сервисов..."; kill $(cat logs/*.pid 2>/dev/null) 2>/dev/null; rm -f logs/*.pid; echo "✅ Все сервисы остановлены"; exit 0' INT

# Бесконечный цикл ожидания
while true; do
    sleep 1
done
