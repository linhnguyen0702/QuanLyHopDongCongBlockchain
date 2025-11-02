@echo off
echo ================================================
echo Ethereum Blockchain Setup Script
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Install blockchain dependencies
echo ================================================
echo Step 1: Installing blockchain dependencies...
echo ================================================
cd blockchain
if not exist "node_modules" (
    echo Installing packages...
    call npm install
) else (
    echo Dependencies already installed
)
echo.

REM Check .env file
echo ================================================
echo Step 2: Checking environment configuration...
echo ================================================
if not exist ".env" (
    echo [WARN] .env file not found
    echo Creating from template...
    copy .env.example .env
    echo.
    echo Please edit blockchain\.env and fill in your:
    echo   - SEPOLIA_RPC_URL
    echo   - PRIVATE_KEY
    echo   - ETHERSCAN_API_KEY
    echo.
    pause
) else (
    echo [OK] .env file exists
)
echo.

REM Compile contracts
echo ================================================
echo Step 3: Compiling smart contracts...
echo ================================================
call npm run compile
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Compilation failed!
    exit /b 1
)
echo [OK] Contracts compiled successfully
echo.

REM Run tests
echo ================================================
echo Step 4: Running contract tests...
echo ================================================
call npm test
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Tests failed!
    exit /b 1
)
echo [OK] All tests passed
echo.

REM Install backend dependencies
echo ================================================
echo Step 5: Installing backend dependencies...
echo ================================================
cd ..\backend
if not exist "node_modules" (
    echo Installing packages...
    call npm install
) else (
    echo Dependencies already installed
)

REM Check if ethers is installed
npm list ethers >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing ethers.js...
    call npm install ethers@^6.10.0
)
echo [OK] Backend dependencies ready
echo.

REM Create blockchain directory
if not exist "blockchain" (
    echo Creating blockchain directory...
    mkdir blockchain
)

REM Copy ABI file
echo ================================================
echo Step 6: Copying ABI file to backend...
echo ================================================
if exist "..\blockchain\abi\ContractManager.json" (
    copy "..\blockchain\abi\ContractManager.json" "blockchain\"
    echo [OK] ABI file copied
) else (
    echo [WARN] ABI file not found. Deploy contract first.
)
echo.

REM Install frontend dependencies
echo ================================================
echo Step 7: Installing frontend dependencies...
echo ================================================
cd ..\frontend
if not exist "node_modules" (
    echo Installing packages...
    call npm install
) else (
    echo Dependencies already installed
)

REM Check if ethers is installed in frontend
npm list ethers >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing ethers.js...
    call npm install ethers@^6.10.0
)
echo [OK] Frontend dependencies ready
echo.

cd ..

echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo Next steps:
echo.
echo 1. Configure blockchain\.env with your credentials
echo 2. Deploy smart contract:
echo    cd blockchain
echo    npm run deploy:sepolia
echo.
echo 3. Update backend\config.env with:
echo    - BLOCKCHAIN_ENABLED=true
echo    - BLOCKCHAIN_CONTRACT_ADDRESS=^(from deployment^)
echo.
echo 4. Start the application:
echo    Backend:  cd backend  ^& npm run dev
echo    Frontend: cd frontend ^& npm start
echo.
echo For detailed instructions, see BLOCKCHAIN_SETUP.md
echo.
pause
