# 🎓 Hướng dẫn cho người mới bắt đầu

Nếu bạn chưa biết gì về blockchain, đây là hướng dẫn từng bước đơn giản nhất!

---

## 📚 Blockchain là gì?

**Blockchain** giống như một cuốn sổ cái kỹ thuật số:

- ✅ Ghi lại mọi thông tin hợp đồng
- ✅ **Không thể sửa đổi** sau khi ghi
- ✅ **Minh bạch** - ai cũng có thể xem
- ✅ **Bất biến** - không ai có thể xóa

### Ví dụ thực tế:

Khi bạn tạo hợp đồng trị giá 1 tỷ đồng:

1. Hợp đồng được lưu vào database (như bình thường)
2. Đồng thời ghi lên blockchain Ethereum
3. Sau này ai cũng có thể kiểm tra trên Etherscan
4. Không ai có thể giả mạo thông tin

---

## 🎯 Bạn cần biết gì?

### 1. **MetaMask** là gì?

- Là "ví điện tử" để lưu tiền ảo (cryptocurrency)
- Giống như ví thật, nhưng ở trên máy tính
- Cài đặt như một extension trên trình duyệt

### 2. **Sepolia** là gì?

- Là mạng blockchain **TEST** (giả lập)
- Tiền ở đây không có giá trị thật
- Dùng để học và thử nghiệm

### 3. **ETH** (Ether) là gì?

- Là "tiền" của mạng Ethereum
- Cần để trả phí giao dịch (gas fee)
- Sepolia ETH là **MIỄN PHÍ** (lấy từ faucet)

### 4. **Transaction Hash** là gì?

- Như "số biên nhận" của giao dịch
- Dùng để tra cứu trên Etherscan
- Ví dụ: `0x0ad3f950f79d340fb475fcecc8348ceb0982afd71be2281c4...`

---

## 🚀 Bắt đầu từ con số 0

### Bước 1: Cài đặt MetaMask

#### 1.1. Download & Install

1. Vào: https://metamask.io/download/
2. Click **"Install MetaMask for Chrome"** (hoặc browser bạn dùng)
3. Click **"Add to Chrome"**
4. Sau khi cài xong, click vào icon 🦊 trên thanh toolbar

#### 1.2. Tạo ví mới

1. Click **"Create a new wallet"**
2. Đồng ý với Terms
3. **TẠO PASSWORD MẠNH** (nhớ kỹ!)
4. **QUAN TRỌNG**: Lưu lại **Secret Recovery Phrase** (12 từ)
   - ⚠️ Viết ra giấy, giữ kỹ
   - ⚠️ Đừng share cho ai
   - ⚠️ Mất là mất ví vĩnh viễn!

### Bước 2: Thêm Sepolia Test Network

#### 2.1. Mở MetaMask

- Click vào icon 🦊 trên toolbar
- Click vào dropdown network (ở góc trên bên trái)

#### 2.2. Add Sepolia

- Click **"Add network"**
- Click **"Add a network manually"**
- Điền thông tin:

```
Network Name: Sepolia Test Network
New RPC URL: https://sepolia.infura.io/v3/
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

- Click **"Save"**
- Chọn **"Sepolia Test Network"** từ dropdown

### Bước 3: Lấy Sepolia ETH miễn phí

#### 3.1. Copy địa chỉ ví

- Mở MetaMask
- Click vào **"Account 1"** (hoặc tên account)
- Click vào icon 📋 (copy) bên cạnh địa chỉ
- Địa chỉ sẽ giống: `0xf06086Bc3215B60866A60698F10A955DBa969621`

#### 3.2. Lấy ETH từ Faucet

1. **Option 1: Alchemy Faucet** (Nhanh nhất)

   - Vào: https://www.alchemy.com/faucets/ethereum-sepolia
   - Paste địa chỉ ví
   - Click **"Send Me ETH"**
   - Đợi 1-2 phút

2. **Option 2: Sepolia PoW Faucet** (Mining)
   - Vào: https://sepolia-faucet.pk910.de/
   - Paste địa chỉ ví
   - Mining trong 30-60 phút
   - Nhận ~0.05-0.1 ETH

#### 3.3. Kiểm tra balance

- Mở MetaMask
- Xem số dư (Balance)
- Nếu thành công, sẽ thấy: `0.5 ETH` (hoặc tương tự)

---

## 🎮 Sử dụng hệ thống

### 1. Chạy ứng dụng

#### Cách 1: Double-click vào file (Siêu nhanh) ⚡

```
start-all.bat
```

✅ Tự động mở 2 terminals và chạy cả backend + frontend!

#### Cách 2: Chạy thủ công

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

⚠️ **LƯU Ý**:

- Chỉ cần chạy 2 phần: **Backend + Frontend**
- **KHÔNG cần** chạy `blockchain/` module
- Smart contract đã được deploy sẵn trên Sepolia rồi!

### 2. Login

1. Mở trình duyệt: `http://localhost:3000`
2. Login:
   - Email: `admin@gov.vn`
   - Password: `admin123`

### 3. Kết nối MetaMask

1. Nhìn lên **góc trên bên phải**
2. Thấy nút **"Kết nối ví"** (màu xanh)
3. Click vào nút đó
4. MetaMask sẽ popup → Click **"Connect"**
5. Chọn account → Click **"Connect"**

✅ **Thành công khi:**

- Thấy địa chỉ ví: `0xf060...9621`
- Chip màu xanh: `Sepolia`

❌ **Nếu thấy chip màu đỏ:**

- Network sai!
- Click vào nút **"→ Sepolia"** để chuyển

### 4. Tạo hợp đồng và ghi lên Blockchain

#### 4.1. Tạo hợp đồng

1. Click **"Hợp đồng"** (menu bên trái)
2. Click **"+ Tạo hợp đồng mới"** (góc phải)
3. Điền thông tin:
   - **Số hợp đồng**: `TEST-001`
   - **Tên hợp đồng**: `Hợp đồng test blockchain`
   - **Nhà thầu**: Chọn từ dropdown
   - **Loại hợp đồng**: `supply` (Cung cấp)
   - **Giá trị**: `1000000` (1 triệu)
   - **Phòng ban**: `Phòng Tài chính`
   - **Người phụ trách**: `Nguyễn Văn A`
   - **Ngày bắt đầu**: Chọn ngày
   - **Ngày kết thúc**: Chọn ngày sau ngày bắt đầu
   - **Mô tả**: `Đây là hợp đồng test`
4. Click **"Tạo hợp đồng"**

#### 4.2. Điều gì xảy ra?

- ✅ Hiển thị: **"Tạo hợp đồng thành công"**
- ✅ Chuyển đến trang chi tiết hợp đồng
- 🔄 Backend đang ghi lên blockchain (15-30 giây)

#### 4.3. Xem Blockchain Info

1. Đợi 30 giây
2. Refresh trang (F5)
3. Cuộn xuống dưới cùng
4. Tìm phần **"Blockchain Information"**
5. Sẽ thấy:
   - ✅ **Transaction Hash**: `0x0ad3f950...` (link màu xanh)
   - ✅ **Block Number**: `9544703`
   - ✅ **Network**: `Sepolia`
   - 🔗 Nút **"View on Explorer"**

#### 4.4. Xem trên Etherscan

1. Click vào **Transaction Hash** (link màu xanh)
2. Hoặc click nút **"View on Explorer"**
3. Sẽ mở trang Etherscan
4. Bạn sẽ thấy:
   - ✅ Transaction details
   - ✅ From (địa chỉ gửi)
   - ✅ To (smart contract address)
   - ✅ Gas Used
   - ✅ Timestamp
   - ✅ **Status**: Success ✅

**🎉 CHÚC MỪNG! Bạn vừa ghi hợp đồng đầu tiên lên blockchain!**

---

## 📊 Giải thích thêm

### Tại sao phải đợi 15-30 giây?

- Blockchain cần thời gian để "confirm" (xác nhận)
- Giống như gửi tiền ngân hàng, không tức thì
- Hệ thống đã tối ưu để không làm bạn chờ đợi

### Transaction Hash có ý nghĩa gì?

- Là "chứng từ" chứng minh hợp đồng đã được ghi
- Không ai có thể sửa đổi
- Có thể share cho người khác để verify

### Tại sao cần ETH?

- Để trả "phí xăng" (gas fee) cho miner
- Miner là người xác nhận transaction
- Trên Sepolia thì miễn phí (test)
- Trên Mainnet thì mất tiền thật

### Smart Contract là gì?

- Là "chương trình" chạy trên blockchain
- Tự động thực thi khi có điều kiện
- Không thể can thiệp sau khi deploy

---

## ❓ Câu hỏi thường gặp

### Q: Tôi mất Sepolia ETH, lấy thêm ở đâu?

**A:** Vào faucet và lấy thêm (mỗi 24h 1 lần):

- https://www.alchemy.com/faucets/ethereum-sepolia

### Q: Transaction failed, tại sao?

**A:** Có thể do:

1. Hết ETH (kiểm tra balance)
2. Gas price quá thấp (tự động xử lý)
3. Smart contract lỗi (kiểm tra log)

### Q: Tôi có thể xóa transaction trên blockchain không?

**A:** KHÔNG! Đó là tính năng của blockchain:

- Một khi ghi lên rồi, không thể xóa
- Không thể sửa đổi
- Vĩnh viễn bất biến

### Q: Network sai (Mainnet), làm sao chuyển sang Sepolia?

**A:**

1. Mở MetaMask
2. Click dropdown network (góc trên)
3. Chọn **"Sepolia Test Network"**
4. Refresh trang web

### Q: Tôi muốn dùng tiền thật (Mainnet)?

**A:** ⚠️ **KHÔNG KHUYẾN KHÍCH** cho học tập!

- Mainnet ETH có giá trị thật ($$$)
- Gas fee rất cao (vài đô mỗi transaction)
- Chỉ dùng khi deploy production

---

## 🎯 Tóm tắt

### Để chạy dự án, bạn cần:

1. ✅ Node.js & npm (đã cài)
2. ✅ MongoDB (đã config)
3. ✅ MetaMask (cài extension)
4. ✅ Sepolia ETH (lấy từ faucet)

### Quy trình chuẩn:

1. Double-click `start-all.bat`
2. Đợi backend & frontend khởi động
3. Login vào http://localhost:3000
4. Kết nối MetaMask
5. Tạo hợp đồng
6. Đợi 30s → Xem blockchain info

### Khi tắt máy:

- Double-click `stop-all.bat`
- Hoặc tắt 2 terminal windows

### Lần sau chạy lại:

- Double-click `start-all.bat`
- Đợi khởi động → Login → Sử dụng

---

## 🎓 Học thêm về Blockchain

### Tài liệu tiếng Việt:

- https://ethereum.org/vi/
- https://coin98.net/blockchain-la-gi

### Video tutorials:

- Search YouTube: "Blockchain là gì?"
- Search YouTube: "Ethereum for beginners"

### Practice:

- Thử tạo nhiều hợp đồng
- Xem trên Etherscan
- Test các tính năng khác nhau

---

**🎉 Chúc bạn thành công!**

Nếu gặp vấn đề, xem file `README.md` hoặc `TROUBLESHOOTING.md`
