#!/bin/bash

export GO111MODULE=off

# Deploy Chaincode Script (Classic for Fabric 1.4.x)
echo "🚀 Starting classic chaincode deployment..."

# Set environment variables
export FABRIC_CFG_PATH=${PWD}
export CC_RUNTIME_LANGUAGE=golang
export CC_SRC_PATH="github.com/hyperledger/fabric/chaincode"
export CC_NAME=contract-chaincode
export CC_VERSION=1.0
export CHANNEL_NAME=mychannel

# Install chaincode on peer
peer chaincode install -n $CC_NAME -v $CC_VERSION -l $CC_RUNTIME_LANGUAGE -p $CC_SRC_PATH

# Instantiate chaincode (if not already instantiated)
peer chaincode instantiate \
  -o orderer.example.com:7050 \
  --tls \
  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  -C $CHANNEL_NAME \
  -n $CC_NAME \
  -v $CC_VERSION \
  -l $CC_RUNTIME_LANGUAGE \
  -c '{"Args":[]}'

echo "✅ Chaincode installed and instantiated (classic flow)!"

