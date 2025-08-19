@echo off
echo Testing Backend API...
echo.
echo Testing health endpoint:
curl http://localhost:3001/api/health
echo.
echo.
echo Testing agents endpoint:
curl http://localhost:3001/api/public/agents
echo.
echo.
echo Press any key to continue...
pause > nul
