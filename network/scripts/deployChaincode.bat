@echo off
REM Deploy Chaincode Script for Windows
echo 🚀 Starting chaincode deployment...

REM Set environment variables
set FABRIC_CFG_PATH=%CD%
set CC_RUNTIME_LANGUAGE=golang
set CC_SRC_PATH=%CD%\..\chaincode
set CC_NAME=contract-chaincode
set CC_VERSION=1.0
set CC_SEQUENCE=1
set CHANNEL_NAME=mychannel

REM Create chaincode package
echo 📦 Creating chaincode package...
peer lifecycle chaincode package %CC_NAME%.tar.gz --path %CC_SRC_PATH% --lang %CC_RUNTIME_LANGUAGE% --label %CC_NAME%_%CC_VERSION%

REM Install chaincode
echo 📥 Installing chaincode on peer...
peer lifecycle chaincode install %CC_NAME%.tar.gz

REM Query installed chaincode
echo 📋 Querying installed chaincode...
peer lifecycle chaincode queryinstalled

echo ✅ Chaincode deployment initiated!

