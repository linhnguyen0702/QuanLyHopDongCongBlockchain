#!/bin/bash

# Deploy Chaincode Script
echo "🚀 Starting chaincode deployment..."

# Set environment variables
export FABRIC_CFG_PATH=${PWD}
export CC_RUNTIME_LANGUAGE=golang
export CC_SRC_PATH="${PWD}/../chaincode"
export CC_NAME=contract-chaincode
export CC_VERSION=1.0
export CC_SEQUENCE=1
export CHANNEL_NAME=mychannel

# Create chaincode package
echo "📦 Creating chaincode package..."
peer lifecycle chaincode package ${CC_NAME}.tar.gz \
  --path ${CC_SRC_PATH} \
  --lang ${CC_RUNTIME_LANGUAGE} \
  --label ${CC_NAME}_${CC_VERSION}

# Install chaincode
echo "📥 Installing chaincode on peer..."
peer lifecycle chaincode install ${CC_NAME}.tar.gz

# Query installed chaincode
echo "📋 Querying installed chaincode..."
peer lifecycle chaincode queryinstalled

# Get package ID
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep -oP 'Package ID: \K[^,]+')
echo "📦 Package ID: ${PACKAGE_ID}"

# Approve chaincode definition
echo "✅ Approving chaincode definition..."
peer lifecycle chaincode approveformyorg \
  --channelID ${CHANNEL_NAME} \
  --name ${CC_NAME} \
  --version ${CC_VERSION} \
  --package-id ${PACKAGE_ID} \
  --sequence ${CC_SEQUENCE} \
  --tls \
  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --waitForEvent

# Commit chaincode definition
echo "🔗 Committing chaincode definition..."
peer lifecycle chaincode commit \
  --channelID ${CHANNEL_NAME} \
  --name ${CC_NAME} \
  --version ${CC_VERSION} \
  --sequence ${CC_SEQUENCE} \
  --tls \
  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --peerAddresses peer0.org1.example.com:7051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

echo "✅ Chaincode deployed successfully!"

