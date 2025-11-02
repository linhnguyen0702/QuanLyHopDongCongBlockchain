@echo off
echo ========================================
echo   Khoi dong He thong Quan ly Hop dong
echo ========================================
echo.

echo [1/2] Starting Backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend...
cd ..\frontend
start "Frontend App" cmd /k "npm start"

echo.
echo ========================================
echo   Dang khoi dong cac dich vu...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Login:
echo   Email: admin@gov.vn
echo   Password: admin123
echo.
echo Nhan Enter de dong cua so nay...
pause >nul
