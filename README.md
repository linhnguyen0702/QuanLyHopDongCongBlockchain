# 🚀 Hệ thống Quản lý Hợp đồng Công với Blockchain

Hệ thống quản lý hợp đồng công tích hợp Ethereum Blockchain (Sepolia Testnet) để đảm bảo tính minh bạch, bất biến và có thể kiểm chứng.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt và Chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Tính năng](#tính-năng)
- [API Documentation](#api-documentation)
- [Blockchain Integration](#blockchain-integration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng quan

Dự án bao gồm 3 phần chính:

1. **Frontend** - React application với Material-UI
2. **Backend** - Node.js/Express API server với MongoDB
3. **Blockchain** - Ethereum smart contracts trên Sepolia Testnet

### Tính năng chính:

- ✅ Quản lý hợp đồng công (CRUD)
- ✅ Quản lý nhà thầu
- ✅ Phê duyệt hợp đồng
- ✅ Báo cáo và thống kê
- ✅ Audit trail (lịch sử thay đổi)
- ✅ **Blockchain integration** - Ghi hợp đồng lên Ethereum
- ✅ **MetaMask integration** - Kết nối ví
- ✅ **Transaction tracking** - Xem trên Etherscan

---

## 🛠️ Công nghệ sử dụng

### Frontend:

- React 18.2
- Material-UI 5.14
- React Router 6.20
- Axios
- Ethers.js 6.10
- React Query
- React Hot Toast

### Backend:

- Node.js
- Express 4.18
- MongoDB with Mongoose 8.0
- JWT Authentication
- Ethers.js 6.10
- Winston (logging)
- Multer (file upload)

### Blockchain:

- Solidity
- Hardhat 2.19
- Ethereum Sepolia Testnet
- Alchemy RPC
- Etherscan API

---

## 📁 Cấu trúc dự án

```
QuanLyHopDongCong/
├── backend/                      # Node.js Backend
│   ├── models/                   # MongoDB models
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic
│   │   └── blockchainService.js  # Blockchain integration
│   ├── middleware/               # Auth & validation
│   ├── blockchain/               # Contract ABI
│   ├── uploads/                  # File uploads
│   ├── config.env                # Environment variables
│   ├── server.js                 # Entry point
│   └── package.json
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── components/           # UI components
│   │   │   └── Blockchain/       # Blockchain components
│   │   ├── contexts/             # React contexts
│   │   │   └── BlockchainContext.js
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services
│   │   └── App.js
│   ├── public/
│   └── package.json
│
├── blockchain/                   # Ethereum Module
│   ├── contracts/
│   │   └── ContractManager.sol   # Smart contract
│   ├── scripts/
│   │   ├── deploy.js             # Deploy script
│   │   └── check-balance.js
│   ├── test/
│   │   └── ContractManager.test.js
│   ├── abi/                      # Compiled ABIs
│   ├── hardhat.config.js
│   └── package.json
│
├── README.md                     # This file
├── README_BLOCKCHAIN.md          # Blockchain docs
└── BLOCKCHAIN_SETUP.md          # Setup guide
```

---

## 💻 Yêu cầu hệ thống

### Phần mềm:

- **Node.js**: >= 16.x
- **npm**: >= 8.x (hoặc yarn)
- **MongoDB**: Local hoặc MongoDB Atlas
- **Git**: Để clone repository
- **MetaMask**: Browser extension

### Tài khoản cần có:

- MongoDB Atlas account (miễn phí)
- Alchemy account (để RPC URL)
- MetaMask wallet với Sepolia ETH

---

## 🚀 Cài đặt và Chạy dự án

### Lần đầu tiên (First Time Setup):

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/linhnguyen0702/QuanLyHopDongCongBlockchain.git
cd QuanLyHopDongCong
```

#### 2️⃣ Cài đặt Backend

```bash
cd backend
npm install
```

**Tạo file `config.env`:**

```bash
copy config.env.example config.env
```

**Cập nhật `config.env`:**

```env
PORT=5000
NODE_ENV=development

JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# MongoDB (sử dụng MongoDB Atlas hoặc local)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Blockchain
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
BLOCKCHAIN_CONTRACT_ADDRESS=0x73fdfbb38c4a6a652306c898a99613df79624353
BLOCKCHAIN_PRIVATE_KEY=your_private_key_without_0x
```

**Seed dữ liệu mẫu:**

```bash
npm run seed
```

#### 3️⃣ Cài đặt Frontend

```bash
cd ../frontend
npm install
```

#### 4️⃣ Blockchain Module (KHÔNG CẦN CHẠY)

⚠️ **LƯU Ý**: Smart contract đã được deploy lên Sepolia rồi!

- ✅ Contract address: `0x73fdfbb38c4a6a652306c898a99613df79624353`
- ✅ Bạn KHÔNG CẦN chạy `blockchain/` module
- ✅ Chỉ cần cấu hình `BLOCKCHAIN_CONTRACT_ADDRESS` trong `config.env`

**Chỉ cài đặt nếu muốn deploy contract mới:**

```bash
cd ../blockchain
npm install
# Xem BLOCKCHAIN_SETUP.md để biết chi tiết
```

---

### 🔄 Chạy dự án (Mỗi lần sau):

**Chỉ cần mở 2 terminals:**

#### ⚡ Cách nhanh nhất:

```bash
# Double-click vào file:
start-all.bat
```

#### 🔧 Hoặc chạy thủ công:

**Terminal 1️⃣: Backend**

```bash
cd backend
npm run dev
```

**✅ Chờ đến khi thấy:**

```
🚀 Server running on port 5000
✅ MongoDB connected successfully
✅ Blockchain service initialized successfully
```

**Terminal 2️⃣: Frontend**

```bash
cd frontend
npm start
```

**✅ Chờ đến khi thấy:**

```
Compiled successfully!
Local: http://localhost:3000
```

⚠️ **LƯU Ý**: KHÔNG CẦN chạy `blockchain/` module vì smart contract đã được deploy lên Sepolia rồi!

---

## 📱 Truy cập ứng dụng

### Frontend:

```
http://localhost:3000
```

**Tài khoản mặc định:**

- **Admin**: `admin@gov.vn` / `admin123`
- **Manager**: `manager@gov.vn` / `manager123`
- **Employee**: `user@gov.vn` / `user123`

### Backend API:

```
http://localhost:5000/api
```

### Blockchain Explorer:

```
https://sepolia.etherscan.io/address/0x73fdfbb38c4a6a652306c898a99613df79624353
```

---

## 🎨 Tính năng

### 1. Quản lý Hợp đồng

- Tạo, sửa, xóa hợp đồng
- Tìm kiếm và lọc
- Phân loại theo trạng thái
- Upload tài liệu đính kèm
- **Ghi lên blockchain tự động**

### 2. Blockchain Integration

- ✅ Mỗi hợp đồng được ghi lên Ethereum Sepolia
- ✅ Transaction hash có thể xem trên Etherscan
- ✅ Không thể sửa đổi sau khi ghi
- ✅ Lịch sử thay đổi bất biến

### 3. MetaMask Integration

- Kết nối ví MetaMask
- Hiển thị địa chỉ và balance
- Tự động phát hiện network sai
- Switch sang Sepolia tự động

### 4. Phê duyệt Hợp đồng

- Workflow phê duyệt
- Lịch sử phê duyệt
- Ghi lên blockchain khi approve

### 5. Báo cáo & Thống kê

- Dashboard tổng quan
- Biểu đồ thống kê
- Export báo cáo

### 6. Audit Trail

- Lưu lại mọi thay đổi
- Xem lịch sử chi tiết
- Không thể xóa logs

---

## 🔗 Blockchain Integration

### Smart Contract Address (Sepolia):

```
0x73fdfbb38c4a6a652306c898a99613df79624353
```

### Cách hoạt động:

1. **Tạo hợp đồng mới:**

   - Lưu vào MongoDB
   - Trả response cho frontend ngay (< 1s)
   - Ghi lên blockchain ở background (15-30s)
   - Update transaction hash sau khi confirm

2. **Xem trên Etherscan:**

   - Click vào transaction hash trong chi tiết hợp đồng
   - Hoặc truy cập: `https://sepolia.etherscan.io/tx/{transaction_hash}`

3. **Lấy Sepolia ETH (cho testing):**
   - https://www.alchemy.com/faucets/ethereum-sepolia
   - https://sepoliafaucet.com/
   - https://sepolia-faucet.pk910.de/

### MetaMask Setup:

1. **Cài đặt MetaMask:** https://metamask.io/download/
2. **Thêm Sepolia Network:**
   - Network Name: `Sepolia Test Network`
   - RPC URL: `https://sepolia.infura.io/v3/`
   - Chain ID: `11155111`
   - Currency: `ETH`
   - Explorer: `https://sepolia.etherscan.io`
3. **Lấy test ETH** từ faucet (link ở trên)
4. **Kết nối wallet** trên trang web

---

## 📚 API Documentation

### Base URL:

```
http://localhost:5000/api
```

### Authentication:

Thêm header:

```
Authorization: Bearer {jwt_token}
```

### Main Endpoints:

#### Auth:

- `POST /auth/login` - Login
- `GET /auth/profile` - Get profile

#### Contracts:

- `GET /contracts` - List contracts
- `GET /contracts/:id` - Get contract detail
- `POST /contracts` - Create contract (→ ghi blockchain)
- `PUT /contracts/:id` - Update contract (→ ghi blockchain)
- `DELETE /contracts/:id` - Delete contract

#### Contractors:

- `GET /contractors` - List contractors
- `POST /contractors` - Create contractor

#### Users:

- `GET /users` - List users
- `POST /users` - Create user

#### Reports:

- `GET /reports/overview` - Dashboard stats
- `GET /reports/contracts-by-status` - Statistics

---

## 🔧 Troubleshooting

### Backend không chạy được:

**Lỗi: MongoDB connection failed**

```bash
# Kiểm tra MongoDB URI trong config.env
# Đảm bảo MongoDB đang chạy (nếu dùng local)
# Hoặc kiểm tra connection string của MongoDB Atlas
```

**Lỗi: Port 5000 already in use**

```bash
# Tìm và kill process đang dùng port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Hoặc đổi PORT trong config.env
PORT=5001
```

### Frontend không chạy được:

**Lỗi: Port 3000 already in use**

```bash
# Kill process hoặc chọn port khác khi được hỏi
Would you like to run the app on another port instead? (Y/n)
# Chọn Y
```

### Blockchain không hoạt động:

**Lỗi: Blockchain service initialization failed**

```bash
# Kiểm tra config.env:
# 1. BLOCKCHAIN_RPC_URL đúng chưa?
# 2. BLOCKCHAIN_CONTRACT_ADDRESS đúng chưa?
# 3. BLOCKCHAIN_PRIVATE_KEY đúng chưa?

# Restart backend sau khi sửa
```

**Lỗi: Transaction timeout**

```bash
# Bình thường! Transaction blockchain mất 15-30 giây
# Hệ thống đã được config để:
# - Trả response ngay
# - Ghi blockchain ở background
# - Refresh trang sau 30s để thấy transaction hash
```

**Không có ETH trong Sepolia:**

```bash
# Lấy test ETH từ faucet:
# 1. Copy địa chỉ ví từ MetaMask
# 2. Vào: https://www.alchemy.com/faucets/ethereum-sepolia
# 3. Paste địa chỉ và request ETH
# 4. Đợi 1-2 phút
```

---

## 🔐 Bảo mật

### ⚠️ QUAN TRỌNG:

1. **KHÔNG commit `config.env`** lên Git
2. **KHÔNG share private key** của ví
3. **KHÔNG dùng private key có tiền thật** cho testing
4. **JWT_SECRET** phải là chuỗi random mạnh

### Best Practices:

- Đổi password mặc định sau khi deploy
- Sử dụng HTTPS trong production
- Rate limiting đã được enable
- Input validation đã được implement

---

## 📝 Scripts hữu ích

### Backend:

```bash
npm run dev         # Chạy development mode
npm start          # Chạy production mode
npm run seed       # Seed dữ liệu mẫu
npm run clear      # Xóa toàn bộ database
```

### Frontend:

```bash
npm start          # Chạy development
npm run build      # Build production
npm test           # Chạy tests
```

### Blockchain:

```bash
npx hardhat compile              # Compile contracts
npx hardhat test                 # Run tests
npx hardhat node                 # Start local node
npx hardhat run scripts/deploy.js --network sepolia  # Deploy
```

---

## 📞 Liên hệ & Hỗ trợ

- **GitHub**: https://github.com/linhnguyen0702/QuanLyHopDongCongBlockchain
- **Issues**: https://github.com/linhnguyen0702/QuanLyHopDongCongBlockchain/issues

---

## 📄 License

MIT License - Xem file `LICENSE` để biết thêm chi tiết.

---

## 🎉 Bắt đầu nhanh (Quick Start)

```bash
# Clone repository
git clone https://github.com/linhnguyen0702/QuanLyHopDongCongBlockchain.git
cd QuanLyHopDongCong

# Setup Backend
cd backend
npm install
copy config.env.example config.env
# Cập nhật config.env với thông tin của bạn
npm run seed
npm run dev

# Setup Frontend (terminal mới)
cd frontend
npm install
npm start

# Truy cập: http://localhost:3000
# Login: admin@gov.vn / admin123
```

---

## 🌟 Tính năng nổi bật

### ⛓️ Blockchain Integration:

- Mỗi hợp đồng được ghi lên Ethereum Sepolia
- Transaction không thể thay đổi sau khi confirm
- Có thể verify trên Etherscan
- Tự động sync ở background (không làm chậm UX)

### 🔒 Bảo mật:

- JWT authentication
- Role-based access control (Admin, Manager, Employee)
- Password hashing with bcrypt
- Input validation
- Rate limiting

### 📊 Dashboard & Reports:

- Tổng quan hợp đồng
- Biểu đồ thống kê
- Filter và search nâng cao
- Export data

---

**✨ Chúc bạn phát triển thành công! ✨**
