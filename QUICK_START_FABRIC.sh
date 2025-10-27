#!/bin/bash

echo "===================================="
echo " QUICK START - Hyperledger Fabric"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker version > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker first."
    exit 1
fi

echo "[1/5] Starting Fabric network..."
cd network
docker-compose up -d
echo "✅ Fabric network started"
echo ""

echo "[2/5] Waiting for network to be ready..."
sleep 10
echo ""

echo "[3/5] Checking fabric status..."
cd ..
node backend/scripts/checkFabricStatus.js
echo ""

echo "[4/5] Enrolling admin user..."
cd backend
node scripts/enrollAdmin.js
echo ""

echo "[5/5] Setup complete!"
echo ""
echo "===================================="
echo " SETUP COMPLETE!"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. Start backend: cd backend && npm start"
echo "2. Open another terminal"
echo "3. Start frontend: cd frontend && npm start"
echo "4. Open browser: http://localhost:3000"
echo ""

