# 🚀 Hệ thống Quản lý Hợp đồng Công với Ethereum Blockchain

Hệ thống quản lý hợp đồng công tích hợp Ethereum blockchain để đảm bảo tính minh bạch, bất biến và có thể kiểm chứng.

## 📋 Tổng quan

Dự án bao gồm 3 phần chính:

1. **Frontend** - React application với Material-UI
2. **Backend** - Node.js/Express API server với MongoDB
3. **Blockchain** - Ethereum smart contracts với Hardhat

## ✨ Tính năng Blockchain

### Smart Contract Features

- ✅ Lưu trữ thông tin hợp đồng trên blockchain
- ✅ Lịch sử thay đổi bất biến
- ✅ Access control và authorization
- ✅ Event logging cho mọi transaction
- ✅ Batch operations và pagination
- ✅ Contract verification trên Etherscan

### Backend Integration

- ✅ Tự động sync với blockchain khi tạo/cập nhật hợp đồng
- ✅ Fallback mechanism nếu blockchain không khả dụng
- ✅ Transaction tracking và verification
- ✅ Comprehensive logging
- ✅ Gas estimation

### Frontend Features

- ✅ MetaMask integration
- ✅ Wallet connection status
- ✅ Transaction hash display với link đến explorer
- ✅ Blockchain verification badges
- ✅ Network switching support
- ✅ Real-time balance display

## 🏗️ Cấu trúc dự án

```
QuanLyHopDongCong/
├── backend/                      # Node.js Backend
│   ├── models/
│   │   └── Contract.js          # ✅ Updated với blockchain fields
│   ├── routes/
│   │   └── contracts.js         # ✅ Tích hợp blockchain service
│   ├── services/
│   │   └── blockchainService.js # ✅ NEW: Ethereum integration
│   ├── blockchain/              # ✅ NEW: Contract ABI storage
│   ├── server.js                # ✅ Updated với blockchain init
│   └── package.json             # ✅ Added ethers.js
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── contexts/
│   │   │   └── BlockchainContext.js  # ✅ NEW: Web3 context
│   │   ├── components/
│   │   │   └── Blockchain/           # ✅ NEW: Blockchain components
│   │   │       ├── BlockchainInfo.js
│   │   │       └── WalletConnect.js
│   │   ├── pages/
│   │   │   └── Contracts/
│   │   │       └── ContractDetail.js # ✅ Updated với blockchain info
│   │   └── App.js                    # ✅ Wrapped với BlockchainProvider
│   └── package.json                  # ✅ Added ethers.js
│
├── blockchain/                   # ✅ NEW: Ethereum Module
│   ├── contracts/
│   │   └── ContractManager.sol   # Smart contract
│   ├── scripts/
│   │   ├── deploy.js            # Deployment script
│   │   └── check-balance.js     # Helper script
│   ├── test/
│   │   └── ContractManager.test.js
│   ├── hardhat.config.js
│   ├── package.json
│   └── README.md
│
├── BLOCKCHAIN_SETUP.md          # ✅ NEW: Hướng dẫn chi tiết
└── setup-blockchain.bat         # ✅ NEW: Auto setup script
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Chạy script tự động
setup-blockchain.bat
```

Script sẽ:

- ✅ Cài đặt tất cả dependencies
- ✅ Compile smart contracts
- ✅ Chạy tests
- ✅ Copy ABI files
- ✅ Setup môi trường

### Option 2: Manual Setup

#### 1. Setup Blockchain Module

```bash
cd blockchain
npm install
copy .env.example .env
# Sửa .env với thông tin của bạn
npm run compile
npm test
```

#### 2. Deploy Smart Contract

**Local Development:**

```bash
# Terminal 1
npm run node

# Terminal 2
npm run deploy:local
```

**Sepolia Testnet:**

```bash
npm run deploy:sepolia
```

**Lưu contract address!**

#### 3. Setup Backend

```bash
cd backend
npm install ethers@^6.10.0

# Copy ABI file
mkdir blockchain
copy ..\blockchain\abi\ContractManager.json blockchain\

# Cập nhật config.env
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_CONTRACT_ADDRESS=0x... (từ deployment)
BLOCKCHAIN_PRIVATE_KEY=your_private_key

# Start server
npm run dev
```

#### 4. Setup Frontend

```bash
cd frontend
npm install ethers@^6.10.0
npm start
```

#### 5. Install MetaMask

- Download: https://metamask.io/download/
- Create/Import wallet
- Switch to Sepolia testnet
- Get test ETH: https://sepoliafaucet.com/

## 📖 Documentation

- **[BLOCKCHAIN_SETUP.md](BLOCKCHAIN_SETUP.md)** - Hướng dẫn setup chi tiết
- **[blockchain/README.md](blockchain/README.md)** - Smart contract documentation
- **[Backend API](backend/README.md)** - API endpoints (nếu có)
- **[Frontend Guide](frontend/README.md)** - Component guide (nếu có)

## 🧪 Testing

### Test Smart Contract

```bash
cd blockchain
npm test
```

### Test Backend Integration

```bash
cd backend
npm run dev
# Check logs cho "Blockchain service initialized"
```

### Test Full E2E

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Login và tạo hợp đồng mới
4. Kiểm tra blockchain info trong contract detail
5. Verify transaction trên Etherscan

## 🔧 Công nghệ sử dụng

### Blockchain Stack

- **Solidity 0.8.20** - Smart contract language
- **Hardhat** - Development environment
- **Ethers.js v6** - Ethereum library
- **OpenZeppelin** - Secure contract libraries

### Backend Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Ethers.js** - Blockchain integration

### Frontend Stack

- **React 18** - UI framework
- **Material-UI** - Component library
- **Ethers.js** - Web3 integration
- **MetaMask** - Wallet connection

## 📊 Smart Contract Details

### ContractManager.sol

**Main Functions:**

- `createContract()` - Tạo hợp đồng mới
- `updateContract()` - Cập nhật thông tin
- `updateContractStatus()` - Thay đổi trạng thái
- `getContract()` - Lấy thông tin hợp đồng
- `getContractHistory()` - Xem lịch sử thay đổi

**Access Control:**

- Owner can authorize/revoke users
- Only authorized users can create/update contracts
- Full event logging

**Gas Optimization:**

- Efficient storage patterns
- Batch operations support
- View functions don't cost gas

## 🌐 Supported Networks

| Network   | Chain ID | RPC URL                          | Explorer                     |
| --------- | -------- | -------------------------------- | ---------------------------- |
| Localhost | 31337    | http://127.0.0.1:8545            | -                            |
| Sepolia   | 11155111 | https://sepolia.infura.io/v3/... | https://sepolia.etherscan.io |
| Mainnet   | 1        | https://mainnet.infura.io/v3/... | https://etherscan.io         |

## 💰 Gas Costs

| Operation       | Estimated Gas | Cost @ 30 gwei |
| --------------- | ------------- | -------------- |
| Deploy          | ~2,500,000    | 0.075 ETH      |
| Create Contract | ~200,000      | 0.006 ETH      |
| Update Status   | ~50,000       | 0.0015 ETH     |
| Update Info     | ~150,000      | 0.0045 ETH     |

## 🔒 Security

- ✅ Smart contract uses OpenZeppelin libraries
- ✅ Access control implemented
- ✅ Input validation
- ✅ Private keys in environment variables
- ✅ Rate limiting on API
- ✅ MetaMask integration for transaction signing

## 🐛 Troubleshooting

### Common Issues

**1. "Blockchain service is disabled"**

- Check `BLOCKCHAIN_ENABLED=true` in config.env
- Verify RPC URL is correct
- Ensure contract is deployed

**2. "Insufficient funds"**

- Get test ETH from faucet
- Check balance: `npm run check-balance`

**3. "Cannot connect to MetaMask"**

- Install MetaMask extension
- Unlock wallet
- Switch to correct network

**4. "Transaction failed"**

- Check gas price
- Verify contract address
- See Etherscan for error details

Xem thêm: [BLOCKCHAIN_SETUP.md - Troubleshooting](BLOCKCHAIN_SETUP.md#troubleshooting)

## 📚 Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [MetaMask Developer Docs](https://docs.metamask.io/)

## 🔄 Development Workflow

1. **Develop Smart Contract**

   ```bash
   cd blockchain
   # Edit contracts/ContractManager.sol
   npm run compile
   npm test
   ```

2. **Deploy to Testnet**

   ```bash
   npm run deploy:sepolia
   # Save contract address
   ```

3. **Update Backend**

   ```bash
   cd backend
   # Update config.env với contract address
   npm run dev
   ```

4. **Test Frontend**

   ```bash
   cd frontend
   npm start
   # Connect MetaMask và test
   ```

5. **Verify Everything**
   - ✅ Contract deployed
   - ✅ Backend logs "Blockchain initialized"
   - ✅ Frontend shows blockchain info
   - ✅ Transactions appear on Etherscan

## 🚀 Deployment to Production

### Prerequisites

- ✅ All tests passing
- ✅ Smart contract audited
- ✅ Sufficient ETH for mainnet gas
- ✅ Backup of private keys

### Steps

1. Deploy contract to mainnet
2. Verify on Etherscan
3. Update production backend config
4. Deploy backend to server
5. Build and deploy frontend
6. Monitor transactions

## 📝 License

MIT License - See LICENSE file

## 👥 Contributors

- Your Name - Initial work

## 🆘 Support

- Create issue trên GitHub
- Email: your.email@example.com
- Documentation: [BLOCKCHAIN_SETUP.md](BLOCKCHAIN_SETUP.md)

---

**Made with ❤️ using Ethereum blockchain technology**
