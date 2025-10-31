#!/bin/bash

set -e
export GO111MODULE=off

# Deploy Chaincode Script (Classic for Fabric 1.4.x)
echo "🚀 Starting classic chaincode deployment..."

# Set environment variables
export FABRIC_CFG_PATH=${PWD}
export CC_RUNTIME_LANGUAGE=golang
# Chaincode source is mounted at /opt/gopath/src/github.com/chaincode via docker-compose
export CC_SRC_PATH="github.com/chaincode"
export CC_TEMP_PKG="cc_temp"
export CC_NAME=contract-chaincode
export CC_VERSION=1.1
export CHANNEL_NAME=mychannel

# Verify channel exists and peer has joined
echo "🔎 Verifying channel '$CHANNEL_NAME' exists and peer is joined..."
if ! peer channel list | grep -q "${CHANNEL_NAME}"; then
  echo "❌ Channel '${CHANNEL_NAME}' not found on this peer. Please create the channel and join the peer before deploying chaincode."
  exit 1
fi

# Ensure dependencies are vendored (classic flow requires vendor/) without touching bind mounts
echo "🧰 Preparing Go dependencies (vendor)..."
ORIG_WS="/opt/gopath/src/${CC_SRC_PATH}"
TEMP_WS="/opt/gopath/src/${CC_TEMP_PKG}"
echo "- Copying chaincode from ${ORIG_WS} to ${TEMP_WS}"
rm -rf "${TEMP_WS}" && mkdir -p "${TEMP_WS}"
cp -a "${ORIG_WS}/." "${TEMP_WS}/"

if [ ! -f "${TEMP_WS}/go.mod" ]; then
  echo "- Initializing Go module at ${TEMP_WS}"
  (cd "${TEMP_WS}" && \
    GO111MODULE=on go mod init ${CC_TEMP_PKG} >/dev/null 2>&1 || true)
fi

echo "- Fetching required modules and creating vendor directory in temp workspace"
(cd "${TEMP_WS}" && \
  export GO111MODULE=on GOPROXY=https://proxy.golang.org,direct && \
  go mod tidy && \
  go mod vendor)

# Install chaincode on peer
echo "📦 Checking if chaincode '${CC_NAME}' v${CC_VERSION} is already installed..."
if peer chaincode list --installed | grep -q "Name: ${CC_NAME}, Version: ${CC_VERSION}"; then
  echo "✔ Chaincode ${CC_NAME} v${CC_VERSION} already installed. Skipping install."
else
  echo "📦 Installing chaincode '${CC_NAME}' from temp path '${CC_TEMP_PKG}'..."
  peer chaincode install -n "$CC_NAME" -v "$CC_VERSION" -l "$CC_RUNTIME_LANGUAGE" -p "$CC_TEMP_PKG"
fi

# Instantiate chaincode (if not already instantiated)
echo "🧩 Checking if chaincode is already instantiated on '${CHANNEL_NAME}'..."
if peer chaincode list --instantiated -C "$CHANNEL_NAME" | grep -q "Name: ${CC_NAME}, Version: ${CC_VERSION}"; then
  echo "✔ Chaincode ${CC_NAME} v${CC_VERSION} already instantiated on ${CHANNEL_NAME}."
else
  echo "🧩 Instantiating chaincode on channel '${CHANNEL_NAME}'..."
  peer chaincode instantiate \
    -o orderer.example.com:7050 \
    --tls \
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    -C "$CHANNEL_NAME" \
    -n "$CC_NAME" \
    -v "$CC_VERSION" \
    -l "$CC_RUNTIME_LANGUAGE" \
    -c '{"Args":[]}'
fi

echo "✅ Chaincode installed and instantiated (classic flow)."

