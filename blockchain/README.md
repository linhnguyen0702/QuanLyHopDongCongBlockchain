# Blockchain Module - Ethereum Integration

Module này tích hợp công nghệ Ethereum blockchain vào hệ thống quản lý hợp đồng công.

## 📋 Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ](#công-nghệ)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Deployment](#deployment)
- [Testing](#testing)
- [Sử dụng](#sử-dụng)

## ✨ Tính năng

- **Smart Contract quản lý hợp đồng** trên Ethereum blockchain
- **Lưu trữ bất biến** thông tin hợp đồng
- **Lịch sử thay đổi** được ghi nhận đầy đủ trên blockchain
- **Xác thực và ủy quyền** qua blockchain
- **Tích hợp với Backend** thông qua ethers.js
- **Hỗ trợ nhiều networks**: localhost, Sepolia testnet, Ethereum mainnet

## 🛠 Công nghệ

- **Solidity 0.8.20** - Smart contract language
- **Hardhat** - Development framework
- **Ethers.js v6** - Ethereum library
- **OpenZeppelin Contracts** - Secure smart contract library
- **Chai** - Testing framework

## 📦 Cài đặt

### 1. Cài đặt dependencies

```bash
cd blockchain
npm install
```

### 2. Tạo file .env

```bash
copy .env.example .env
```

Sau đó cập nhật các biến môi trường trong file `.env`:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## ⚙️ Cấu hình

### Networks được hỗ trợ

- **localhost**: Development network (Hardhat node)
- **sepolia**: Ethereum testnet
- **mainnet**: Ethereum mainnet (production)

### Contract Address

Sau khi deploy, contract address sẽ được lưu trong:

- `deployments/` directory
- `abi/ContractManager.json`

## 🚀 Deployment

### Deploy lên localhost (Development)

```bash
# Terminal 1: Start local Hardhat node
npm run node

# Terminal 2: Deploy contract
npm run deploy:local
```

### Deploy lên Sepolia Testnet

```bash
npm run deploy:sepolia
```

### Deploy lên Ethereum Mainnet

```bash
npm run deploy:mainnet
```

## 🧪 Testing

Chạy test suite:

```bash
npm test
```

Test coverage:

```bash
npx hardhat coverage
```

## 📘 Smart Contract API

### ContractManager.sol

#### Structs

**Contract**

```solidity
struct Contract {
    string contractNumber;
    string contractName;
    string contractor;
    uint256 contractValue;
    string currency;
    uint256 startDate;
    uint256 endDate;
    string contractType;
    string status;
    string department;
    string responsiblePerson;
    address createdBy;
    uint256 createdAt;
    bool isActive;
}
```

**ContractHistory**

```solidity
struct ContractHistory {
    string contractNumber;
    string action;
    string previousStatus;
    string newStatus;
    address performedBy;
    uint256 timestamp;
    string remarks;
}
```

#### Functions

**createContract**

```solidity
function createContract(
    string memory _contractNumber,
    string memory _contractName,
    string memory _contractor,
    uint256 _contractValue,
    string memory _currency,
    uint256 _startDate,
    uint256 _endDate,
    string memory _contractType,
    string memory _department,
    string memory _responsiblePerson
) external onlyAuthorized
```

**updateContractStatus**

```solidity
function updateContractStatus(
    string memory _contractNumber,
    string memory _newStatus,
    string memory _remarks
) external onlyAuthorized
```

**getContract**

```solidity
function getContract(string memory _contractNumber)
    external view returns (...)
```

**getContractHistory**

```solidity
function getContractHistory(string memory _contractNumber)
    external view returns (ContractHistory[] memory)
```

## 🔗 Tích hợp với Backend

Sau khi deploy, làm theo các bước sau:

### 1. Copy ABI file

```bash
copy abi\ContractManager.json ..\backend\blockchain\
```

### 2. Cập nhật Backend .env

Thêm vào file `backend/.env`:

```env
# Blockchain Configuration
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_CONTRACT_ADDRESS=0x...
BLOCKCHAIN_PRIVATE_KEY=your_private_key
```

### 3. Khởi động lại Backend

```bash
cd ../backend
npm run dev
```

## 📊 Gas Estimates

Ước tính gas cho các operations:

- **Deploy Contract**: ~2,500,000 gas
- **Create Contract**: ~200,000 gas
- **Update Status**: ~50,000 gas
- **Update Contract**: ~150,000 gas
- **Get Contract**: Free (view function)

## 🔒 Security

- **Access Control**: Only authorized users can modify contracts
- **Owner-only functions**: Critical operations restricted to owner
- **Input validation**: All inputs are validated
- **OpenZeppelin**: Uses audited libraries

## 🐛 Troubleshooting

### Contract deployment fails

- Kiểm tra balance của wallet
- Kiểm tra RPC URL đang hoạt động
- Kiểm tra private key đúng format

### Transaction reverted

- Kiểm tra user có được authorize không
- Kiểm tra input parameters hợp lệ
- Kiểm tra gas limit đủ

## 📝 License

MIT License

## 👥 Support

Nếu có vấn đề, vui lòng tạo issue trên GitHub repository.
