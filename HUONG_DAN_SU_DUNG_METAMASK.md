# Hướng dẫn sử dụng MetaMask với Hệ thống Quản lý Hợp đồng

## 📱 Bước 1: Cài đặt MetaMask

### 1.1. Tải MetaMask Extension

- **Chrome/Edge**: https://metamask.io/download/
- Nhấn "Install MetaMask for Chrome"
- Thêm extension vào trình duyệt

### 1.2. Tạo ví mới

1. Mở MetaMask
2. Nhấn "Create a new wallet"
3. Đồng ý với điều khoản
4. Tạo mật khẩu mạnh
5. **QUAN TRỌNG**: Lưu Secret Recovery Phrase (12 từ) vào nơi an toàn
   - ⚠️ KHÔNG BAO GIỜ chia sẻ với ai
   - Mất Recovery Phrase = Mất toàn bộ tiền

---

## 🌐 Bước 2: Chuyển sang Sepolia Test Network

### 2.1. Bật Test Networks

1. Mở MetaMask
2. Nhấn vào biểu tượng Account (góc trên bên phải)
3. Settings → Advanced
4. Bật "Show test networks"

### 2.2. Chuyển Network

1. Nhấn dropdown network (ở đầu MetaMask)
2. Chọn "Sepolia test network"

---

## 💰 Bước 3: Nhận Sepolia ETH miễn phí (Test ETH)

### 3.1. Copy địa chỉ ví

1. Mở MetaMask
2. Nhấn vào địa chỉ ví (0x123...) để copy
3. Địa chỉ sẽ có dạng: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

### 3.2. Lấy ETH từ Faucet

Truy cập một trong các faucet sau:

**Alchemy Sepolia Faucet** (Khuyến nghị)

- Link: https://sepoliafaucet.com/
- Đăng ký tài khoản Alchemy (miễn phí)
- Paste địa chỉ ví → Nhấn "Send Me ETH"
- Nhận: 0.5 Sepolia ETH

**Infura Sepolia Faucet**

- Link: https://www.infura.io/faucet/sepolia
- Đăng ký tài khoản Infura
- Paste địa chỉ ví → Request

**QuickNode Faucet**

- Link: https://faucet.quicknode.com/ethereum/sepolia
- Kết nối Twitter hoặc Discord
- Nhận 0.1 ETH

### 3.3. Kiểm tra số dư

- Mở MetaMask
- Kiểm tra số dư ETH (có thể mất 10-30 giây)
- Cần ít nhất **0.01 ETH** để trả gas fee

---

## 🔗 Bước 4: Kết nối ví với hệ thống

### 4.1. Cập nhật địa chỉ ví trong Profile

1. **Đăng nhập** vào hệ thống
2. Vào **Profile** (Thông tin cá nhân)
3. Nhấn **"Chỉnh sửa"**
4. Paste địa chỉ ví vào trường **"Địa chỉ ví Blockchain"**
   ```
   Ví dụ: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
   ```
5. Nhấn **"Lưu"**

✅ **Bây giờ hệ thống đã biết địa chỉ ví của bạn!**

### 4.2. Kết nối MetaMask với hệ thống

1. Ở góc trên bên phải màn hình, tìm nút **"Kết nối ví"**
2. Nhấn vào nút
3. **MetaMask popup** sẽ xuất hiện
4. Chọn account muốn kết nối
5. Nhấn **"Next"** → **"Connect"**

✅ **Bạn sẽ thấy Chip màu xanh hiển thị: 0x742d...0bEb**

---

## 📝 Bước 5: Tạo hợp đồng với MetaMask

### 5.1. Workflow tạo hợp đồng

```
Bước 1: Điền form tạo hợp đồng
   ↓
Bước 2: Nhấn "Tạo hợp đồng"
   ↓
Bước 3: MetaMask popup xuất hiện
   ↓
Bước 4: Xem lại thông tin transaction
   ↓
Bước 5: Nhập password MetaMask
   ↓
Bước 6: Nhấn "Confirm"
   ↓
Bước 7: Đợi transaction được xác nhận (~15-30 giây)
   ↓
Bước 8: ✅ Thành công!
```

### 5.2. Chi tiết các bước

**Bước 1-2: Điền thông tin hợp đồng**

- Vào **Contracts** → **Tạo hợp đồng mới**
- Điền đầy đủ thông tin:
  - Số hợp đồng: HD001
  - Tên hợp đồng: Xây dựng cầu ABC
  - Nhà thầu: Công ty XYZ
  - Giá trị: 500000000
  - Ngày bắt đầu/kết thúc
  - Loại hợp đồng, phòng ban, người phụ trách
- Nhấn **"Tạo hợp đồng"**

**Bước 3: MetaMask Popup**

```
╔══════════════════════════════════════╗
║        MetaMask Notification         ║
╠══════════════════════════════════════╣
║  Contract Interaction                ║
║                                      ║
║  From: 0x742d...0bEb                 ║
║  To:   0xa631...ae39f (Contract)     ║
║                                      ║
║  Estimated gas fee: 0.002 ETH        ║
║  Max fee: 0.003 ETH                  ║
║                                      ║
║  [Reject]          [Confirm]         ║
╚══════════════════════════════════════╝
```

**Bước 4-6: Xác nhận transaction**

- Xem lại:
  - ✅ Địa chỉ "From" là ví của bạn
  - ✅ Địa chỉ "To" là contract address
  - ✅ Gas fee (thường 0.001-0.003 ETH)
- Nhập **password MetaMask**
- Nhấn **"Confirm"**

**Bước 7: Đợi confirmation**

```
⏳ Đang xử lý...
   Hệ thống đang chờ blockchain xác nhận
   Thời gian: 15-30 giây

   Bạn có thể xem tiến trình trong MetaMask:
   Activity → Pending
```

**Bước 8: Thành công!**

```
✅ Transaction thành công!

   Transaction Hash: 0xabc123...
   Block Number: 12345678
   Gas Used: 0.002 ETH

   [Xem trên Etherscan]
```

---

## 🔍 Xác minh trên Blockchain

### 6.1. Xem transaction trên Etherscan

Sau khi tạo hợp đồng thành công, bạn có thể verify:

1. Click vào **Transaction Hash** trong notification
2. Hoặc vào https://sepolia.etherscan.io/
3. Paste transaction hash vào ô tìm kiếm
4. Bạn sẽ thấy:
   - ✅ **From**: Địa chỉ ví của bạn (0x742d...)
   - ✅ **To**: Contract address (0xa631...)
   - ✅ **Status**: Success ✓
   - ✅ **Block**: #12345678
   - ✅ **Timestamp**: 5 mins ago

### 6.2. Xem chi tiết trong Smart Contract

1. Click vào **To** address (Contract)
2. Tab **"Contract"** → **"Read Contract"**
3. Tìm function `getContract`
4. Nhập số hợp đồng (HD001) → Query
5. Bạn sẽ thấy:
   ```
   contractNumber: "HD001"
   contractName: "Xây dựng cầu ABC"
   createdBy: 0x742d35...0bEb  ← ĐÂY LÀ ĐỊA CHỈ VÍ CỦA BẠN!
   createdAt: 1699876543
   status: "draft"
   ```

✅ **Chứng minh blockchain ghi nhận BẠN là người tạo hợp đồng!**

---

## 🎯 So sánh: Backend Wallet vs User Wallet

### Backend Wallet (Trước đây)

```
Database: Manager A tạo hợp đồng HD001
Blockchain: 0x111... (hệ thống) tạo hợp đồng HD001

❌ Không thể verify trên blockchain
❌ Tất cả transaction từ 1 địa chỉ
```

### User Wallet (Bây giờ) ✅

```
Database: Manager A tạo hợp đồng HD001
Blockchain: 0x222... (Manager A) tạo hợp đồng HD001

✅ Hoàn toàn minh bạch
✅ Có thể verify trên Etherscan
✅ Mỗi người 1 địa chỉ riêng
```

---

## ⚠️ Xử lý lỗi thường gặp

### Lỗi 1: "Insufficient funds for gas"

```
❌ Lỗi: Không đủ ETH để trả phí gas

✅ Giải pháp:
   1. Kiểm tra số dư MetaMask
   2. Cần ít nhất 0.01 ETH
   3. Lấy thêm từ faucet (Bước 3.2)
```

### Lỗi 2: "Địa chỉ ví không khớp"

```
❌ Lỗi: Địa chỉ ví không khớp!
   Ví đang kết nối: 0xabc...
   Ví trong profile: 0x123...

✅ Giải pháp:
   Option 1: Chuyển account trong MetaMask sang đúng ví
   Option 2: Cập nhật địa chỉ ví mới trong Profile
```

### Lỗi 3: "User denied transaction"

```
❌ Lỗi: Bạn đã từ chối giao dịch trong MetaMask

✅ Giải pháp:
   Thử lại và nhấn "Confirm" trong MetaMask popup
```

### Lỗi 4: "Wrong network"

```
❌ Lỗi: Bạn đang ở network khác (Mainnet, Goerli...)

✅ Giải pháp:
   1. Mở MetaMask
   2. Chọn dropdown network
   3. Chuyển sang "Sepolia test network"
   4. Hoặc hệ thống sẽ tự động hỏi chuyển network
```

### Lỗi 5: "Transaction underpriced"

```
❌ Lỗi: Gas price quá thấp

✅ Giải pháp:
   1. Trong MetaMask popup
   2. Nhấn "Edit" ở gas fee
   3. Chọn "Aggressive" hoặc tăng gas price
   4. Confirm lại
```

---

## 🔐 Bảo mật

### DO ✅

- ✅ Lưu Secret Recovery Phrase ở nơi an toàn (giấy, két sắt)
- ✅ Sử dụng mật khẩu mạnh cho MetaMask
- ✅ Lock MetaMask khi không sử dụng
- ✅ Kiểm tra địa chỉ contract trước khi ký
- ✅ Chỉ kết nối với site tin cậy

### DON'T ❌

- ❌ KHÔNG chia sẻ Secret Recovery Phrase
- ❌ KHÔNG chia sẻ Private Key
- ❌ KHÔNG lưu Recovery Phrase dạng file text
- ❌ KHÔNG gửi Recovery Phrase qua email/chat
- ❌ KHÔNG screenshot Recovery Phrase

---

## 📊 Gas Fee Estimate

Trên Sepolia testnet:

- **Tạo hợp đồng**: ~0.002-0.005 ETH
- **Cập nhật hợp đồng**: ~0.001-0.003 ETH
- **Phê duyệt**: ~0.001-0.002 ETH

💡 **Lưu ý**: Đây là test ETH, KHÔNG có giá trị thật!

---

## 🎓 Best Practices

### Cho Manager/Admin:

1. **Luôn cập nhật địa chỉ ví trong Profile**
2. **Verify transaction trên Etherscan** sau mỗi lần tạo
3. **Đảm bảo có đủ ETH** trước khi thao tác (ít nhất 0.05 ETH)
4. **Lock MetaMask** khi rời khỏi máy tính

### Cho User:

1. **Không tự ý chuyển ETH** ra khỏi ví (test ETH free)
2. **Báo với Admin** nếu hết ETH
3. **Không share ví** với người khác

---

## 📞 Hỗ trợ

### Lỗi MetaMask:

- Docs: https://support.metamask.io/
- Community: https://community.metamask.io/

### Lỗi hệ thống:

- Liên hệ Admin
- Email: admin@example.com

---

## ✨ Tóm tắt workflow

```
1. Cài MetaMask → Tạo ví
2. Chuyển sang Sepolia network
3. Lấy test ETH từ faucet
4. Cập nhật địa chỉ ví trong Profile
5. Kết nối ví với hệ thống
6. Tạo hợp đồng → MetaMask popup → Confirm
7. Đợi confirmation → Success!
8. Verify trên Etherscan
```

---

**Chúc bạn sử dụng thành công!** 🎉

_Cập nhật: 12/11/2025_
