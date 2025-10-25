@echo off
echo Stopping Hyperledger Fabric Network

REM Stop and remove containers
echo Stopping Docker containers...
docker-compose down

REM Remove volumes
echo Removing volumes...
docker volume prune -f

REM Clean up chaincode containers
echo Cleaning up chaincode containers...
for /f "tokens=1" %%i in ('docker ps -a ^| findstr dev-peer') do docker rm -f %%i

echo Network stopped successfully!

pause
