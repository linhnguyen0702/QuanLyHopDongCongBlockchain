@echo off
echo Starting Hyperledger Fabric Network for Contract Management

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker first.
    exit /b 1
)

REM Create necessary directories
echo Creating directories...
if not exist "crypto-config" mkdir crypto-config
if not exist "channel-artifacts" mkdir channel-artifacts
if not exist "scripts" mkdir scripts

REM Generate crypto materials
echo Generating crypto materials...
if not exist "crypto-config\ordererOrganizations" (
    cryptogen generate --config=./crypto-config.yaml
    if %errorlevel% neq 0 (
        echo Error: Failed to generate crypto materials
        exit /b 1
    )
) else (
    echo Crypto materials already exist
)

REM Generate genesis block
echo Generating genesis block...
if not exist "channel-artifacts\genesis.block" (
    configtxgen -profile OneOrgOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block
    if %errorlevel% neq 0 (
        echo Error: Failed to generate genesis block
        exit /b 1
    )
) else (
    echo Genesis block already exists
)

REM Generate channel configuration
echo Generating channel configuration...
if not exist "channel-artifacts\mychannel.tx" (
    configtxgen -profile OneOrgChannel -outputCreateChannelTx ./channel-artifacts/mychannel.tx -channelID mychannel
    if %errorlevel% neq 0 (
        echo Error: Failed to generate channel configuration
        exit /b 1
    )
) else (
    echo Channel configuration already exists
)

REM Start the network
echo Starting Docker containers...
docker-compose up -d

REM Wait for containers to be ready
echo Waiting for containers to be ready...
timeout /t 10 /nobreak >nul

REM Create and join channel
echo Creating and joining channel...
docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/mychannel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

docker exec cli peer channel join -b mychannel.block

REM Install chaincode
echo Installing chaincode...
docker exec cli peer chaincode install -n contract-chaincode -v 1.0 -p github.com/chaincode/contract-chaincode

REM Instantiate chaincode
echo Instantiating chaincode...
docker exec cli peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n contract-chaincode -v 1.0 -c "{\"Args\":[]}"

echo Network started successfully!
echo You can now start the backend server.

REM Show network status
echo Network Status:
docker-compose ps

pause
