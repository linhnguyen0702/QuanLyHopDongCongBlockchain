#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Stopping Hyperledger Fabric Network${NC}"

# Stop and remove containers
echo -e "${YELLOW}Stopping Docker containers...${NC}"
docker-compose down

# Remove volumes
echo -e "${YELLOW}Removing volumes...${NC}"
docker volume prune -f

# Clean up chaincode containers
echo -e "${YELLOW}Cleaning up chaincode containers...${NC}"
docker ps -a | grep dev-peer | awk '{print $1}' | xargs docker rm -f

echo -e "${GREEN}Network stopped successfully!${NC}"
