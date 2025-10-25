#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Hyperledger Fabric Network for Contract Management${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p crypto-config
mkdir -p channel-artifacts
mkdir -p scripts

# Generate crypto materials
echo -e "${YELLOW}Generating crypto materials...${NC}"
if [ ! -d "crypto-config/ordererOrganizations" ]; then
    cryptogen generate --config=./crypto-config.yaml
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to generate crypto materials${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Crypto materials already exist${NC}"
fi

# Generate genesis block
echo -e "${YELLOW}Generating genesis block...${NC}"
if [ ! -f "channel-artifacts/genesis.block" ]; then
    configtxgen -profile OneOrgOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to generate genesis block${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Genesis block already exists${NC}"
fi

# Generate channel configuration
echo -e "${YELLOW}Generating channel configuration...${NC}"
if [ ! -f "channel-artifacts/mychannel.tx" ]; then
    configtxgen -profile OneOrgChannel -outputCreateChannelTx ./channel-artifacts/mychannel.tx -channelID mychannel
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to generate channel configuration${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Channel configuration already exists${NC}"
fi

# Start the network
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker-compose up -d

# Wait for containers to be ready
echo -e "${YELLOW}Waiting for containers to be ready...${NC}"
sleep 10

# Create and join channel
echo -e "${YELLOW}Creating and joining channel...${NC}"
docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/mychannel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

docker exec cli peer channel join -b mychannel.block

# Install chaincode
echo -e "${YELLOW}Installing chaincode...${NC}"
docker exec cli peer chaincode install -n contract-chaincode -v 1.0 -p github.com/chaincode/contract-chaincode

# Instantiate chaincode
echo -e "${YELLOW}Instantiating chaincode...${NC}"
docker exec cli peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n contract-chaincode -v 1.0 -c '{"Args":[]}'

echo -e "${GREEN}Network started successfully!${NC}"
echo -e "${GREEN}You can now start the backend server.${NC}"

# Show network status
echo -e "${YELLOW}Network Status:${NC}"
docker-compose ps
