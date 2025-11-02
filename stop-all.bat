@echo off
echo ========================================
echo   Dung He thong Quan ly Hop dong
echo ========================================
echo.

echo Dang tim va dong cac process...
echo.

REM Kill Node processes on port 5000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Dung Backend process (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill Node processes on port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Dung Frontend process (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ========================================
echo   Da dong tat ca cac dich vu!
echo ========================================
echo.
pause
