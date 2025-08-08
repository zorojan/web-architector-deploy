@echo off
echo Starting SDH Global AI Assistant - All Services
echo.

echo Starting Backend (API) Server...
start "Backend API" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Admin Panel...
start "Admin Panel" cmd /k "cd admin-panel && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo All services are starting...
echo.
echo Services will be available at:
echo - Frontend: http://localhost:5176 (or next available port)
echo - Admin Panel: http://localhost:3000
echo - API Server: http://localhost:3001
echo.
echo Press any key to exit...
pause > nul
