@echo off
echo ====================================
echo  QUICK START - Hyperledger Fabric
echo ====================================
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [1/5] Starting Fabric network...
cd network
call docker-compose up -d
echo ✅ Fabric network started
echo.

echo [2/5] Waiting for network to be ready...
timeout /t 10 /nobreak >nul
echo.

echo [3/5] Checking fabric status...
cd ..
node backend\scripts\checkFabricStatus.js
echo.

echo [4/5] Enrolling admin user...
cd backend
node scripts\enrollAdmin.js
echo.

echo [5/5] Starting backend server...
echo ✅ Backend will start on http://localhost:5000
echo.
echo ====================================
echo  SETUP COMPLETE!
echo ====================================
echo.
echo Next steps:
echo 1. Start backend: npm start
echo 2. Open another terminal
echo 3. Start frontend: cd frontend ^&^& npm start
echo 4. Open browser: http://localhost:3000
echo.
pause

