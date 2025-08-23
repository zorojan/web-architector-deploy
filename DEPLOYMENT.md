# Deployment Guide

Краткое руководство по деплою проекта "web-architector-deploy" на хостинг — два основных варианта: Vercel (платформа) и собственный VPS за Nginx (same-domain reverse proxy). Здесь шаги, переменные окружения и проверки.

## Короткий план
- Подготовить переменные окружения для трёх сервисов (backend, admin, frontend).
- Собрать билды (frontend: Vite, admin: Next, backend: tsc) — в CI/CD или локально.
- Развернуть сервисы и настроить same-domain маршрутизацию (/ -> frontend, /admin -> Next, /api -> backend).
- Проверить и устранить возможные ошибки (CORS, env, host, widget URL).

## Переменные окружения (список)
Установите эти переменные в окружении платформы (Vercel/PM2/systemd/Docker) или через UI провайдера.

- Backend
  - API_URL (опционально) — публичный URL бэкенда (напр., https://api.example.com). Используется для генерации widget loader, внутренних ссылок.
  - PORT — порт сервера (по умолчанию 3001).
  - DATABASE_URL — (опционально) PostgreSQL connection string, если используете Postgres.
  - NODE_ENV — production

- Admin (Next)
  - NEXT_PUBLIC_API_URL — публичный URL бэкенда (напр., https://example.com/api)
  - NEXT_PUBLIC_WIDGET_URL — публичный URL виджета (напр., https://example.com/widget.html)
  - NEXT_PUBLIC_ADMIN_URL — публичный URL админки (напр., https://example.com/admin)

- Frontend (Vite)
  - VITE_API_URL — API base (напр., https://example.com/api)
  - VITE_WIDGET_URL — публичный URL виджета (например https://example.com/widget.html)
  - VITE_ADMIN_URL — публичный URL админки (например https://example.com/admin)

Примечание: переменные `NEXT_PUBLIC_*` и `VITE_*` должны быть установлены до сборки соответствующего фронтенда (build-time).

## Вариант A — Deploy на Vercel (рекомендуется для простоты)
1. Создайте проект в Vercel и подключите репозиторий.
2. На странице проекта -> Settings -> Environment Variables добавьте переменные для каждой части:
   - Для `admin` (Next) укажите `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WIDGET_URL`, `NEXT_PUBLIC_ADMIN_URL`.
   - Для `frontend` укажите `VITE_API_URL`, `VITE_WIDGET_URL`, `VITE_ADMIN_URL`.
   - Для `backend` (API) укажите `API_URL` и `PORT` (если используете Serverless/Edge, настройте отдельно).
3. Добавьте `vercel.json` (в репозитории уже есть шаблон). Пример фрагмента перевода/переписываний (rewrites):

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://<BACKEND_DOMAIN>/api/$1" },
    { "source": "/admin/(.*)", "destination": "https://<ADMIN_DOMAIN>/$1" },
    { "source": "/", "destination": "https://<FRONTEND_DOMAIN>/" }
  ]
}
```

4. Настройте доменное имя: укажите корневой домен в Vercel и обновите DNS-запись (A / CNAME) согласно инструкциям Vercel.
5. Деплой: Vercel автоматически соберёт проекты (root scripts in package.json must be configured). Убедитесь, что для `frontend` и `admin` сборка выполняется с теми же env vars.

### Частые проблемы на Vercel
- Белая страница (blank): проверьте, что `NEXT_PUBLIC_API_URL`/`VITE_API_URL` корректны и что все ссылки в админке/виджете ссылаются на правльный базовый URL; проверьте console/network в браузере.
- 404 на /widget.html: убедитесь, что `frontend` build включает `widget.html` и что rewrites не перехватывают прямые файлы.

## Вариант B — VPS / серверный хостинг (Nginx reverse proxy)
Подойдёт если вы хотите держать backend, admin и frontend на одном домене (same-domain) за Nginx.

1. Сборка на сервере
   - Клонируйте репозиторий.
   - На сервере выполните сборку (root):

```powershell
# на сервере (пример, PowerShell на Windows Server) или bash на Linux
npm ci
npm run build
```

   - Это создаст production-артефакты для `frontend` (dist) и `admin` (.next). Backend скомпилируется через `tsc`.

2. Запуск сервисов
   - Backend (Node): используйте PM2 или systemd. Пример (PM2):

```bash
# из корня проекта
cd backend
# установите зависимости если нужно
npm ci
# запустить с PM2
pm i -g pm2
pm2 start npm --name "wa-backend" -- start
```

   - Admin (Next) — можно запускать как Node server (recommended) или через `next start`:

```bash
cd admin-panel
npm ci
npm run start # должен запускать `next start -p 3000` (production)
```

   - Frontend (Vite) — раздача статики через Nginx (рекомендуется). Скопируйте `frontend/dist` в директорию, которую обслуживает Nginx.

```bash
cd frontend
npm ci
npm run build
# затем copy dist -> /var/www/wa-frontend
```

3. Nginx конфигурация (пример)
- Файл `deploy/nginx-reverse-proxy.conf` в репозитории — подставьте пути и домен.
- Основная идея:
  - location /api -> proxy_pass http://127.0.0.1:3001;
  - location /admin -> proxy_pass http://127.0.0.1:3000; (rewrite /admin/ -> / )
  - location / -> root /var/www/wa-frontend;

Пример (с SSL через certbot):

```nginx
server {
  listen 80;
  server_name example.com www.example.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name example.com www.example.com;

  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

  location /api/ {
    proxy_pass http://127.0.0.1:3001/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /admin/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    root /var/www/wa-frontend;
    try_files $uri $uri/ /index.html;
  }
}
```

4. SSL
- Установите certbot и получите сертификат:

```bash
sudo apt update; sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

5. Service files (systemd) — пример для backend (Node)

```ini
[Unit]
Description=WA Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/web-architector-deploy/backend
ExecStart=/usr/bin/npm run start
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

6. Проверка
- Откройте:
  - https://example.com/ — frontend
  - https://example.com/admin — admin
  - https://example.com/api/health — backend health
- Если видите белую страницу, откройте DevTools -> Console/Network и проверьте 404/500/fetch адреса.

## CI/CD рекомендации
- Разделите шаги на сборку и деплой. В CI собирайте frontend/admin с нужными env vars.
- Backend можно деплоить как Docker container или node process через PM2.
- Примерная последовательность в CI (GitHub Actions):
  - Checkout
  - Install root deps
  - Build frontend (cd frontend && npm ci && npm run build)
  - Build admin (cd admin-panel && npm ci && npm run build)
  - Build backend (cd backend && npm ci && npm run build)
  - Upload artifacts / deploy to server or push images to container registry

## Локальная отладка same-domain (dev)
- Для локального smoke-test я использовал `tools/local-proxy.js`. Запустите сервисы dev и proxy:

```powershell
# из корня репозитория
npm run dev           # запустит backend (3001), admin (3000), frontend (5173/5174)
# в отдельной сессии
node tools/local-proxy.js    # по умолчанию proxy :8080, FRONTEND_PORT можно задать
# или
$env:FRONTEND_PORT='5174'; $env:PROXY_PORT='8082'; node tools/local-proxy.js
```

- Затем проверяйте
  - http://localhost:8080/ -> frontend
  - http://localhost:8080/admin -> admin
  - http://localhost:8080/api/health -> backend

## Быстрые советы по отладке
- Проверьте, что клиентский код использует переменные окружения вместо захардкоженных `localhost`. (В проекте это `VITE_*` и `NEXT_PUBLIC_*`.)
- Убедитесь, что env vars доступны на этапе сборки (Next/Vite требуют build-time vars).
- CORS: обычно не требуется если используется same-domain proxy. Для cross-domain убедитесь, что backend позволяет нужные origin в заголовке.
- Widget: /widget.html — статический файл, убедитесь что он попадает в production build и что Nginx/rewrites не перехватывают путь.

## Контрольный список перед деплоем
- [ ] Все env vars заданы в окружении финального хоста.
- [ ] Выполнены локальные smoke-tests: backend/admin/frontend respond directly.
- [ ] Для same-domain: настроены rewrites/nginx proxy и SSL.
- [ ] Проверены пути к статике (/widget.html).
- [ ] Мониторинг / логирование (pm2, systemd journal, logrotate).

Если хотите, я могу:
- Сгенерировать конкретный `systemd` unit для всех трёх сервисов.
- Подготовить `docker-compose.yml` для контейнерного деплоя.
- Автоматически настроить `vercel.json`/Nginx конфиг под ваши домены — дайте домен(ы) и я подгоню файлы.

---
Файл создан: `DEPLOYMENT.md` — скажите, какое направление хотите детализировать дальше (Vercel, Nginx/VPS, Docker-compose, systemd units).
