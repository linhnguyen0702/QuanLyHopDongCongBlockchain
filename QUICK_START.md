# ⚡ Quick Start Guide - Chạy dự án nhanh

## 🚀 Chạy dự án (sau khi đã cài đặt lần đầu)

### ⚡ Cách 1: Siêu nhanh (Recommended)

```bash
# Double-click vào file:
start-all.bat
```

✅ Tự động mở 2 terminals và chạy backend + frontend!

### 🔧 Cách 2: Chạy thủ công

**Mở 2 terminals:**

#### Terminal 1: Backend

```bash
cd backend
npm run dev
```

✅ **Đợi thấy:**

```
✅ Server running on port 5000
✅ MongoDB connected successfully
✅ Blockchain service initialized successfully
```

#### Terminal 2: Frontend

```bash
cd frontend
npm start
```

✅ **Đợi thấy:**

```
Compiled successfully!
Local: http://localhost:3000
```

⚠️ **LƯU Ý:**

- Chỉ cần chạy 2 phần: Backend + Frontend
- KHÔNG cần chạy `blockchain/` module
- Smart contract đã được deploy lên Sepolia rồi!

---

## 🌐 Truy cập

### Frontend:

```
http://localhost:3000
```

**Login mặc định:**

- Email: `admin@gov.vn`
- Password: `admin123`

### Backend API:

```
http://localhost:5000/api
```

---

## � Kết nối MetaMask (Tùy chọn)

### ⚠️ LƯU Ý QUAN TRỌNG:

**MetaMask KHÔNG BẮT BUỘC để sử dụng hệ thống!**

- ✅ **Có thể tạo/sửa hợp đồng** mà không cần MetaMask
- ✅ **Backend tự động ghi lên blockchain** bằng private key của nó
- 🎨 **MetaMask chỉ để:**
  - Xem địa chỉ ví của bạn
  - Xem balance và network status
  - UX/UI tốt hơn

### Cách kết nối:

1. Sau khi login, nhìn lên **góc trên bên phải**
2. Click nút **"Kết nối ví"**
3. MetaMask popup → Chọn account → **"Connect"**
4. Nếu network sai → Click **"→ Sepolia"**

### Không muốn kết nối?

- Không sao! Vẫn dùng được hết tính năng
- Backend vẫn ghi lên blockchain bình thường
- Chỉ không thấy thông tin ví ở góc màn hình

---

## �🔗 Links quan trọng

### Blockchain:

- **Contract Address**: `0x73fdfbb38c4a6a652306c898a99613df79624353`
- **Etherscan**: https://sepolia.etherscan.io/address/0x73fdfbb38c4a6a652306c898a99613df79624353
- **Get Sepolia ETH**: https://www.alchemy.com/faucets/ethereum-sepolia

### MetaMask:

- **Network**: Sepolia Test Network
- **Chain ID**: 11155111
- **RPC**: https://sepolia.infura.io/v3/

---

## 🛠️ Lần đầu tiên cài đặt

### 1. Clone & Install

```bash
git clone https://github.com/linhnguyen0702/QuanLyHopDongCongBlockchain.git
cd QuanLyHopDongCong

# Backend
cd backend
npm install
copy config.env.example config.env
# Cập nhật config.env với thông tin của bạn
npm run seed

# Frontend
cd ../frontend
npm install
```

### 2. Cấu hình `backend/config.env`

```env
PORT=5000
NODE_ENV=development

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Blockchain (đã có sẵn)
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/MQMrvv0RxHbv9JSqq54jQ
BLOCKCHAIN_CONTRACT_ADDRESS=0x73fdfbb38c4a6a652306c898a99613df79624353
BLOCKCHAIN_PRIVATE_KEY=90e5a0625a81237e487f768e3fdff816fba83c779dfcdb21e8f13d040a8b4af5
```

### 3. Chạy lần đầu

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm start
```

---

## 📱 Sử dụng

### 1. Login

- Vào `http://localhost:3000`
- Login với: `admin@gov.vn` / `admin123`

### 2. Kết nối MetaMask

- Click nút **"Kết nối ví"** góc trên phải
- Chọn account trong MetaMask
- Click **"Connect"**
- Nếu network sai → Click nút **"→ Sepolia"** để chuyển

### 3. Tạo hợp đồng

- Click **"+ Tạo hợp đồng mới"**
- Điền thông tin
- Click **"Tạo hợp đồng"**
- ✅ Hợp đồng được lưu vào database ngay
- 🔄 Blockchain ghi ở background (15-30s)

### 4. Xem Blockchain Info

- Vào chi tiết hợp đồng
- Cuộn xuống phần **"Blockchain Information"**
- Click vào **Transaction Hash** để xem trên Etherscan

---

## ❓ Troubleshooting nhanh

### Backend không chạy:

```bash
# Kiểm tra MongoDB URI trong config.env
# Hoặc thử chạy lại:
cd backend
npm install
npm run dev
```

### Frontend không chạy:

```bash
cd frontend
npm install
npm start
```

### Port đã được sử dụng:

```bash
# Windows: Kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Không có ETH trong Sepolia:

1. Mở MetaMask → Copy địa chỉ ví
2. Vào: https://www.alchemy.com/faucets/ethereum-sepolia
3. Paste địa chỉ → Click "Send Me ETH"
4. Đợi 1-2 phút

---

## 📚 Xem thêm

- **README.md** - Hướng dẫn đầy đủ
- **README_BLOCKCHAIN.md** - Chi tiết về blockchain
- **BLOCKCHAIN_SETUP.md** - Setup blockchain từ đầu

---

**🎉 Chúc bạn sử dụng thành công!**
