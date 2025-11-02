# Hướng dẫn Setup và Deploy Ethereum Blockchain

Hướng dẫn chi tiết để cài đặt, cấu hình và triển khai Ethereum blockchain cho dự án Quản lý Hợp đồng Công.

## 📋 Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt Blockchain Module](#cài-đặt-blockchain-module)
3. [Cấu hình Backend](#cấu-hình-backend)
4. [Cấu hình Frontend](#cấu-hình-frontend)
5. [Deploy Smart Contract](#deploy-smart-contract)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## 🔧 Yêu cầu hệ thống

### Phần mềm cần thiết

- Node.js >= 16.x
- npm >= 8.x hoặc yarn
- MetaMask browser extension
- Git

### Kiến thức cần có

- Hiểu biết cơ bản về Ethereum và blockchain
- Biết cách sử dụng MetaMask
- Có một ít ETH testnet (Sepolia) để deploy

## 📦 Cài đặt Blockchain Module

### Bước 1: Cài đặt dependencies

```bash
cd blockchain
npm install
```

Packages sẽ được cài đặt:

- hardhat: ^2.19.4
- @nomicfoundation/hardhat-toolbox: ^4.0.0
- @openzeppelin/contracts: ^5.0.1
- ethers: ^6.10.0
- dotenv: ^16.3.1

### Bước 2: Cấu hình môi trường

Tạo file `.env` từ template:

```bash
copy .env.example .env
```

Cập nhật các giá trị trong `.env`:

```env
# Lấy Infura Project ID từ: https://infura.io
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Xuất private key từ MetaMask (KHÔNG BAO GIỜ COMMIT FILE NÀY!)
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Lấy API key từ: https://etherscan.io/myapikey
ETHERSCAN_API_KEY=your_etherscan_api_key
```

⚠️ **QUAN TRỌNG**:

- KHÔNG bao giờ commit file `.env` lên Git
- Đảm bảo `.gitignore` đã có `.env`
- Private key phải được bảo mật tuyệt đối

### Bước 3: Compile Smart Contract

```bash
npm run compile
```

Output mong đợi:

```
Compiled 1 Solidity file successfully
```

Artifacts sẽ được tạo trong thư mục `artifacts/`

### Bước 4: Chạy Tests

```bash
npm test
```

Kết quả mong đợi: Tất cả tests phải pass (✓)

## 🚀 Deploy Smart Contract

### Deploy lên Local Network (Development)

#### Terminal 1: Start Hardhat Node

```bash
npm run node
```

Giữ terminal này chạy. Bạn sẽ thấy 20 accounts test với ETH.

#### Terminal 2: Deploy Contract

```bash
npm run deploy:local
```

Output mong đợi:

```
🚀 Starting deployment of ContractManager...
📝 Deploying contract...
✅ ContractManager deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
🌐 Network: localhost - Chain ID: 31337
👤 Deployed by: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💾 Deployment info saved to: deployments/localhost_xxxxxx.json
📄 Contract ABI saved to: abi/ContractManager.json
```

**Lưu ý**: Copy contract address để dùng cho bước tiếp theo.

### Deploy lên Sepolia Testnet

#### Chuẩn bị

1. **Lấy Sepolia ETH** (miễn phí từ faucet):
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia
2. **Kiểm tra balance**:
   ```bash
   # Thay YOUR_ADDRESS bằng địa chỉ ví của bạn
   npx hardhat run scripts/check-balance.js --network sepolia
   ```

#### Deploy

```bash
npm run deploy:sepolia
```

Output mong đợi:

```
🚀 Starting deployment of ContractManager...
📝 Deploying contract...
✅ ContractManager deployed to: 0x1234567890abcdef...
🌐 Network: sepolia - Chain ID: 11155111
⏳ Waiting for block confirmations...
✅ Confirmed!
🔍 Verifying contract on Etherscan...
✅ Contract verified on Etherscan
```

**Lưu ý quan trọng**:

- Deploy trên testnet mất 15-30 giây
- Verify contract mất thêm 30-60 giây
- Lưu contract address để cấu hình backend

### Deploy lên Mainnet (Production)

⚠️ **CẢNH BÁO**: Mainnet deployment cần ETH thật và tốn phí gas cao!

```bash
npm run deploy:mainnet
```

Chỉ deploy lên mainnet khi:

- ✅ Đã test kỹ trên testnet
- ✅ Smart contract đã được audit
- ✅ Có đủ ETH để trả gas fees
- ✅ Đã backup private key an toàn

## ⚙️ Cấu hình Backend

### Bước 1: Cài đặt dependencies

```bash
cd backend
npm install ethers@^6.10.0
```

### Bước 2: Copy ABI file

```bash
copy ..\blockchain\abi\ContractManager.json blockchain\
```

Tạo thư mục `blockchain/` nếu chưa có:

```bash
mkdir blockchain
```

### Bước 3: Cập nhật .env

Thêm vào `backend/config.env`:

```env
# Ethereum Blockchain Configuration
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
BLOCKCHAIN_CONTRACT_ADDRESS=0x... (địa chỉ contract vừa deploy)
BLOCKCHAIN_PRIVATE_KEY=your_private_key_here
```

### Bước 4: Test Backend Integration

Khởi động server:

```bash
npm run dev
```

Kiểm tra log:

```
✅ MongoDB connected successfully
✅ Blockchain service initialized successfully
🚀 Server is running on port 5000
```

Nếu thấy "⚠️ Blockchain service is disabled", kiểm tra lại cấu hình.

## 🎨 Cấu hình Frontend

### Bước 1: Cài đặt dependencies

```bash
cd frontend
npm install ethers@^6.10.0
```

### Bước 2: Cài đặt MetaMask

1. Tải MetaMask: https://metamask.io/download/
2. Tạo/Import wallet
3. Switch sang Sepolia Testnet:
   - Mở MetaMask
   - Click network dropdown (trên cùng)
   - Chọn "Show test networks" trong Settings
   - Chọn "Sepolia"

### Bước 3: Khởi động Frontend

```bash
npm start
```

Frontend sẽ chạy trên `http://localhost:3000`

### Bước 4: Kết nối MetaMask

1. Vào trang web
2. Login với tài khoản
3. Click nút "Kết nối ví"
4. Approve connection trong MetaMask
5. Ví sẽ hiển thị địa chỉ và balance

## 🧪 Testing

### Test Smart Contract

```bash
cd blockchain
npm test
```

Kết quả mong đợi:

```
  ContractManager
    Deployment
      ✓ Should set the right owner
      ✓ Should authorize owner by default
    Authorization
      ✓ Should allow owner to authorize users
      ✓ Should allow owner to revoke authorization
      ✓ Should not allow non-owner to authorize users
    Contract Creation
      ✓ Should create a new contract
      ✓ Should not allow duplicate contract numbers
      ✓ Should not allow unauthorized users
      ✓ Should reject invalid date range
    ... (more tests)

  25 passing
```

### Test Full Flow (E2E)

1. **Backend**: Khởi động server

   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend**: Khởi động app

   ```bash
   cd frontend
   npm start
   ```

3. **Test Create Contract**:

   - Login vào hệ thống
   - Tạo hợp đồng mới
   - Kiểm tra contract detail page
   - Xem phần "Thông tin Blockchain"
   - Verify có transaction hash và block number

4. **Verify on Etherscan**:
   - Click link "View on Explorer"
   - Kiểm tra transaction details
   - Xác nhận status là Success

## 🔍 Troubleshooting

### Lỗi: "Insufficient funds for gas"

**Nguyên nhân**: Không đủ ETH để trả gas fees

**Giải pháp**:

```bash
# Kiểm tra balance
npx hardhat run scripts/check-balance.js --network sepolia

# Lấy thêm ETH từ faucet
# https://sepoliafaucet.com
```

### Lỗi: "Nonce too high"

**Nguyên nhân**: Transaction nonce bị conflict

**Giải pháp**:

1. Reset account trong MetaMask:
   - Settings > Advanced > Reset Account
2. Hoặc đợi vài phút và thử lại

### Lỗi: "Contract deployment failed"

**Nguyên nhân**: Lỗi trong contract hoặc cấu hình sai

**Giải pháp**:

```bash
# 1. Kiểm tra compilation
npm run compile

# 2. Xem chi tiết lỗi
npx hardhat run scripts/deploy.js --network sepolia --verbose

# 3. Kiểm tra .env
cat .env  # Đảm bảo tất cả biến đều có giá trị
```

### Lỗi: "Cannot connect to MetaMask"

**Nguyên nhân**: MetaMask chưa cài đặt hoặc bị block

**Giải pháp**:

1. Kiểm tra MetaMask đã cài: `window.ethereum !== undefined`
2. Cho phép site truy cập MetaMask
3. Refresh trang web
4. Đảm bảo đang dùng đúng network (Sepolia)

### Backend không kết nối blockchain

**Kiểm tra**:

```bash
# 1. Kiểm tra .env
cat backend/config.env | grep BLOCKCHAIN

# 2. Kiểm tra ABI file
ls -la backend/blockchain/ContractManager.json

# 3. Test RPC connection
curl $BLOCKCHAIN_RPC_URL -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Gas fees quá cao

**Giải pháp**:

- Đợi gas prices thấp hơn: https://etherscan.io/gastracker
- Dùng testnet để develop
- Optimize smart contract code

## 📊 Gas Cost Estimates

Ước tính phí gas cho các operations:

| Operation       | Gas Used   | Cost @ 30 gwei | Cost @ 100 gwei |
| --------------- | ---------- | -------------- | --------------- |
| Deploy Contract | ~2,500,000 | 0.075 ETH      | 0.25 ETH        |
| Create Contract | ~200,000   | 0.006 ETH      | 0.02 ETH        |
| Update Status   | ~50,000    | 0.0015 ETH     | 0.005 ETH       |
| Update Contract | ~150,000   | 0.0045 ETH     | 0.015 ETH       |

## 🔐 Security Best Practices

1. **Never commit private keys**

   - Sử dụng `.env` và `.gitignore`
   - Dùng hardware wallet cho mainnet

2. **Contract Security**

   - Smart contract đã dùng OpenZeppelin
   - Access control được implement
   - Input validation đầy đủ

3. **Backend Security**

   - RPC URL và private key trong environment variables
   - Rate limiting cho API calls
   - Error handling proper

4. **Frontend Security**
   - Verify transactions trước khi execute
   - Show gas estimates
   - User confirmation required

## 📚 Tài liệu tham khảo

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Sepolia Testnet Info](https://sepolia.dev/)

## 🆘 Support

Nếu gặp vấn đề:

1. Kiểm tra logs trong console
2. Xem blockchain logs: `backend/blockchain.log`
3. Verify contract trên Etherscan
4. Tạo issue trên GitHub repository

---

**Chúc bạn deploy thành công! 🎉**
