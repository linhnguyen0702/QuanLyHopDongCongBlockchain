# 🚀 Hướng Dẫn Chạy Hệ Thống Với Hyperledger Fabric

## 📋 Yêu Cầu Hệ Thống

- ✅ Docker & Docker Compose
- ✅ Node.js 16+ 
- ✅ Go 1.17+ (cho chaincode)
- ✅ Git

## 🔥 BƯỚC 1: Khởi Động Hyperledger Fabric Network

### 1.1. Đi tới thư mục network
```bash
cd network
```

### 1.2. Khởi động Fabric network
```bash
# Windows
docker-compose up -d

# Linux/Mac
docker-compose up -d
```

### 1.3. Kiểm tra containers đang chạy
```bash
docker ps
```

**Kết quả mong đợi:** Bạn sẽ thấy 4 containers:
- ✅ `orderer.example.com`
- ✅ `peer0.org1.example.com`
- ✅ `ca_peerOrg1`
- ✅ `cli`

## 💼 BƯỚC 2: Khởi Tạo Wallet & Đăng Ký User

### 2.1. Di chuyển tới thư mục backend
```bash
cd ..  # Quay về root
cd backend
```

### 2.2. Chạy script đăng ký admin
```bash
node scripts/enrollAdmin.js
```

**Kết quả mong đợi:**
```
🔐 Starting admin enrollment...
📁 Wallet path: D:\...\backend\wallet
📋 Creating CA client...
🔐 Enrolling admin user...
✅ Successfully enrolled admin user
✅ Successfully enrolled admin user and imported into wallet
👤 Registering appUser...
✅ Successfully registered appUser
🔐 Enrolling appUser...
✅ Successfully enrolled appUser and imported into wallet
🎉 Enrollment complete!
```

### 2.3. Kiểm tra wallet đã tạo
```bash
# Windows
dir wallet

# Linux/Mac  
ls -la wallet
```

Bạn sẽ thấy 2 files trong thư mục `wallet/`:
- ✅ `admin` 
- ✅ `appUser`

## 📦 BƯỚC 3: Deploy Chaincode Lên Blockchain

### 3.1. Chạy script deploy chaincode
```bash
cd network
docker-compose exec cli bash ./scripts/deployChaincode.sh
```

**Kết quả mong đợi:** Script sẽ tự động:
- ✅ Package chaincode
- ✅ Install chaincode trên peer
- ✅ Approve chaincode definition
- ✅ Commit chaincode lên channel

### 3.2. Kiểm tra chaincode đã deploy
```bash
# Vào CLI container để query
docker-compose exec cli bash -c "peer chaincode query -C mychannel -n contract-chaincode -c '{\"function\":\"GetAllContracts\",\"Args\":[]}'"
```

**Kết quả:** `[]` (chưa có contract nào - đây là bình thường)

### 3.3. (Tùy chọn) Deploy thủ công từng bước
Nếu script gặp lỗi, bạn có thể deploy thủ công:

```bash
# Vào CLI container
docker-compose exec cli bash

# Set environment variables
export FABRIC_CFG_PATH=/opt/gopath/src/github.com/hyperledger/fabric/peer
export CC_NAME=contract-chaincode
export CC_VERSION=1.0
export CHANNEL_NAME=mychannel

# Package và Install
cp /opt/gopath/src/github.com/chaincode/contract-chaincode.go /opt/gopath/src/
peer lifecycle chaincode package ${CC_NAME}.tar.gz \
  --path /opt/gopath/src \
  --lang golang \
  --label ${CC_NAME}_${CC_VERSION}
peer lifecycle chaincode install ${CC_NAME}.tar.gz

# Lấy Package ID và Approve
peer lifecycle chaincode queryinstalled
export PACKAGE_ID=<your-package-id>  # Copy từ kết quả trên

peer lifecycle chaincode approveformyorg \
  -o orderer.example.com:7050 \
  --channelID ${CHANNEL_NAME} \
  --name ${CC_NAME} \
  --version ${CC_VERSION} \
  --package-id ${PACKAGE_ID} \
  --sequence 1 \
  --tls \
  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Commit
peer lifecycle chaincode commit \
  -o orderer.example.com:7050 \
  --channelID ${CHANNEL_NAME} \
  --name ${CC_NAME} \
  --version ${CC_VERSION} \
  --sequence 1 \
  --tls \
  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --peerAddresses peer0.org1.example.com:7051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
```
### khi chạy network xong chạy lệnh này 
docker-compose exec cli bash
peer chaincode query -C mychannel -n contract-chaincode -c '{"function":"GetAllContracts","Args":[]}'



## 🔧 BƯỚC 4: Khởi Động Backend Server

### 4.1. Cài đặt dependencies (nếu chưa có)
```bash
cd backend
npm install
```

### 4.2. Kiểm tra MongoDB connection
Đảm bảo MongoDB URI trong `config.env` đúng:
```env
MONGODB_URI=mongodb+srv://...
```

### 4.3. Khởi động backend
```bash
npm start
# hoặc
npm run dev  # Với nodemon (tự động reload)
```

**Kết quả mong đợi:**
```
✅ MongoDB connected successfully
✅ Default admin user created: admin@example.com / password123
🚀 Server running on port 5000
📊 Environment: development
🔗 API URL: http://localhost:5000/api
Hyperledger Fabric service initialized successfully
```

## 🌐 BƯỚC 5: Khởi Động Frontend

### 5.1. Di chuyển tới thư mục frontend
```bash
cd ../frontend
```

### 5.2. Cài đặt dependencies (nếu chưa có)
```bash
npm install
```

### 5.3. Khởi động frontend
```bash
npm start
```

**Kết quả mong đợi:**
```
Compiled successfully!
Local:            http://localhost:3000
On Your Network:  http://192.168.x.x:3000
```

## ✅ BƯỚC 6: Kiểm Tra Blockchain Integration

### 6.1. Đăng nhập vào hệ thống
- Mở browser: `http://localhost:3000`
- Email: `admin@example.com`
- Password: `password123`

### 6.2. Tạo hợp đồng mới
1. Vào menu "Hợp Đồng" → "Tạo Mới"
2. Điền thông tin hợp đồng
3. Click "Lưu"

### 6.3. Xem console Backend
Trong terminal của backend, bạn sẽ thấy:
```
✅ Contract CONTRACT_1234567890_abc123 created on blockchain
```

### 6.4. Phê duyệt hợp đồng
1. Vào chi tiết hợp đồng
2. Click "Phê Duyệt"

**Trong console:**
```
✅ Contract CONTRACT_1234567890_abc123 approved on blockchain
```

### 6.5. Kích hoạt hợp đồng
1. Vào chi tiết hợp đồng đã approved
2. Click "Kích Hoạt"

**Trong console:**
```
✅ Contract CONTRACT_1234567890_abc123 activated on blockchain
```

## 🔍 KIỂM TRA BLOCKCHAIN STATUS

### Xem tất cả hợp đồng trên blockchain
```bash
cd network
docker-compose exec cli bash
peer chaincode query \
  -C mychannel \
  -n contract-chaincode \
  -c '{"function":"GetAllContracts","Args":[]}'
```

### Xem lịch sử hợp đồng
```bash
peer chaincode query \
  -C mychannel \
  -n contract-chaincode \
  -c '{"function":"GetContractHistory","Args":["CONTRACT_1234567890_abc123"]}'
```

### Xem thống kê
```bash
peer chaincode query \
  -C mychannel \
  -n contract-chaincode \
  -c '{"function":"GetContractStats","Args":[]}'
```

## 🛠️ TROUBLESHOOTING

### Vấn đề 1: Wallet không tồn tại
```bash
# Xóa wallet cũ và tạo lại
rm -rf backend/wallet
node backend/scripts/enrollAdmin.js
```

### Vấn đề 2: Fabric network không chạy
```bash
# Kiểm tra Docker
docker ps

# Nếu không có containers, khởi động lại
cd network
docker-compose down
docker-compose up -d
```

### Vấn đề 3: Chaincode chưa deploy
```bash
# Xóa chaincode cũ và deploy lại
docker-compose exec cli bash
# ... làm lại BƯỚC 3
```

### Vấn đề 4: MongoDB connection error
```bash
# Kiểm tra MONGODB_URI trong config.env
# Đảm bảo MongoDB đã accessible
```

### Vấn đề 5: Permission denied (Linux/Mac)
```bash
# Chmod cho scripts
chmod +x network/scripts/*.sh
chmod +x network/start-network.sh
chmod +x network/stop-network.sh
```

## 📊 QUY TRÌNH LÀM VIỆC HÀNG NGÀY

### Startup thứ tự:
```bash
# 1. Start Fabric
cd network && docker-compose up -d

# 2. Check Fabric status
cd ../backend
node scripts/checkFabricStatus.js

# 3. Start Backend
cd backend
npm start  # Terminal 1

# 4. Start Frontend  
cd frontend
npm start  # Terminal 2
```

### Shutdown thứ tự:
```bash
# 1. Stop Frontend (Ctrl+C)
# 2. Stop Backend (Ctrl+C)
# 3. Stop Fabric
cd network
docker-compose down
```

## 🎯 TÓM TẮT LỆNH QUAN TRỌNG

```bash
# Kiểm tra Fabric status
node backend/scripts/checkFabricStatus.js

# Enroll user
node backend/scripts/enrollAdmin.js

# Start tất cả
cd network && docker-compose up -d
cd backend && npm start
cd frontend && npm start

# Stop tất cả
cd network && docker-compose down
```

---

✅ **Hệ thống đã sẵn sàng sử dụng với Hyperledger Fabric!**

