@echo off
echo Installing all dependencies...
echo.

echo 1. Installing root dependencies...
npm install
echo.

echo 2. Installing backend dependencies...
cd backend
npm install
echo.

echo 3. Installing frontend dependencies...
cd ../frontend
npm install
echo.

echo 4. All dependencies installed successfully!
echo.
pause
