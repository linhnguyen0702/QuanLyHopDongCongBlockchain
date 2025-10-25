@echo off
echo Starting Contract Management System...
echo.

echo 1. Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo 2. Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 3. Starting frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo 4. Both servers are starting...
echo    - Backend: http://localhost:5000
echo    - Frontend: http://localhost:3000
echo.
pause
