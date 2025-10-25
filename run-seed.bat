@echo off
echo Starting database seeding...
echo.

echo 1. Seeding all data...
cd backend
node seed-all.js
echo.

echo 2. Seeding completed!
echo.
pause