import { ethers } from "ethers";
import ContractManagerABI from "./ContractManager.json";

// Import ABI từ backend/blockchain
const CONTRACT_ADDRESS = "0xa6315fC859Bc66C7D8269eE4FA2a3e7ada2ae39f";
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex

/**
 * Service để user ký transaction trực tiếp bằng MetaMask
 * Transaction sẽ hiển thị trong MetaMask popup và Activity tab
 */
class UserBlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  /**
   * Kiểm tra MetaMask có được cài đặt không
   */
  checkMetaMask() {
    if (typeof window.ethereum === "undefined") {
      throw new Error(
        "Vui lòng cài đặt MetaMask để sử dụng tính năng blockchain!"
      );
    }

    if (!window.ethereum.isMetaMask) {
      throw new Error(
        "Không phát hiện MetaMask. Vui lòng sử dụng MetaMask extension!"
      );
    }

    return true;
  }

  /**
   * Connect MetaMask và chuyển sang Sepolia network
   */
  async connectWallet() {
    this.checkMetaMask();

    try {
      // 1. Request user connect wallet
      console.log("🔌 Đang kết nối MetaMask...");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("Không có tài khoản nào được chọn trong MetaMask");
      }

      console.log("✅ Đã kết nối ví:", accounts[0]);

      // 2. Kiểm tra network hiện tại
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      console.log("Current chainId:", chainId);

      // 3. Nếu không phải Sepolia, yêu cầu chuyển network
      if (chainId !== SEPOLIA_CHAIN_ID) {
        console.log("⚠️ Đang ở network khác, chuyển sang Sepolia...");

        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
          console.log("✅ Đã chuyển sang Sepolia network");
        } catch (switchError) {
          // Nếu network chưa được add, thêm vào
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: "Sepolia Test Network",
                  nativeCurrency: {
                    name: "Sepolia ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://sepolia.infura.io/v3/"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      // 4. Tạo provider và signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // 5. Load smart contract
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ContractManagerABI.abi,
        this.signer
      );

      const address = await this.signer.getAddress();
      console.log("✅ Đã sẵn sàng ký transaction với địa chỉ:", address);

      return address;
    } catch (error) {
      console.error("Lỗi khi kết nối MetaMask:", error);

      if (error.code === 4001) {
        throw new Error("Bạn đã từ chối kết nối MetaMask");
      }

      throw error;
    }
  }

  /**
   * Tạo hợp đồng mới trên blockchain (USER KÝ TRANSACTION)
   * MetaMask sẽ popup yêu cầu user confirm và trả gas fee
   */
  async createContract(contractData) {
    if (!this.contract) {
      await this.connectWallet();
    }

    try {
      console.log("📝 Đang chuẩn bị transaction...");

      // Convert data
      const valueInWei = ethers.parseEther(
        contractData.contractValue.toString()
      );
      const startTimestamp = Math.floor(
        new Date(contractData.startDate).getTime() / 1000
      );
      const endTimestamp = Math.floor(
        new Date(contractData.endDate).getTime() / 1000
      );

      console.log("💰 Estimated gas...");

      // Estimate gas trước khi gửi
      const gasEstimate = await this.contract.createContract.estimateGas(
        contractData.contractNumber,
        contractData.contractName,
        contractData.contractor,
        valueInWei,
        contractData.currency || "VND",
        startTimestamp,
        endTimestamp,
        contractData.contractType,
        contractData.department,
        contractData.responsiblePerson
      );

      console.log("⛽ Estimated gas:", gasEstimate.toString());

      // Gửi transaction (METAMASK SẼ BẬT POPUP!)
      console.log("🚀 Gửi transaction... MetaMask sẽ popup!");

      const tx = await this.contract.createContract(
        contractData.contractNumber,
        contractData.contractName,
        contractData.contractor,
        valueInWei,
        contractData.currency || "VND",
        startTimestamp,
        endTimestamp,
        contractData.contractType,
        contractData.department,
        contractData.responsiblePerson,
        {
          gasLimit: (gasEstimate * 120n) / 100n, // Add 20% buffer
        }
      );

      console.log("⏳ Transaction đã gửi! Hash:", tx.hash);
      console.log("⏳ Đang đợi confirmation...");

      // Đợi transaction được confirm
      const receipt = await tx.wait();

      console.log("✅ Transaction confirmed!");
      console.log("   Block number:", receipt.blockNumber);
      console.log("   Gas used:", receipt.gasUsed.toString());
      console.log(
        "   Transaction fee:",
        ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
        "ETH"
      );

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from: receipt.from,
      };
    } catch (error) {
      console.error("❌ Lỗi khi tạo contract:", error);

      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        throw new Error("Bạn đã từ chối transaction trong MetaMask");
      }

      if (error.code === "INSUFFICIENT_FUNDS") {
        throw new Error(
          "Không đủ ETH để trả gas fee. Vui lòng nạp thêm ETH vào ví của bạn."
        );
      }

      throw error;
    }
  }

  /**
   * Cập nhật hợp đồng trên blockchain (USER KÝ TRANSACTION)
   * Nếu contract chưa tồn tại, sẽ tự động tạo mới
   */
  async updateContract(contractNumber, contractData) {
    if (!this.contract) {
      await this.connectWallet();
    }

    try {
      // Kiểm tra contract có tồn tại trên blockchain không
      const exists = await this.doesContractExist(contractNumber);

      if (!exists) {
        console.log(
          "⚠️ Contract chưa tồn tại trên blockchain, tạo mới thay vì update..."
        );
        // Gọi createContract thay vì updateContract
        return await this.createContract({
          contractNumber,
          ...contractData,
        });
      }

      const valueInWei = ethers.parseEther(
        contractData.contractValue.toString()
      );
      const startTimestamp = Math.floor(
        new Date(contractData.startDate).getTime() / 1000
      );
      const endTimestamp = Math.floor(
        new Date(contractData.endDate).getTime() / 1000
      );

      console.log("🚀 Gửi transaction update...");

      const tx = await this.contract.updateContract(
        contractNumber,
        contractData.contractName,
        contractData.contractor,
        valueInWei,
        contractData.currency || "VND",
        startTimestamp,
        endTimestamp,
        contractData.contractType,
        contractData.department,
        contractData.responsiblePerson
      );

      console.log("⏳ Transaction hash:", tx.hash);
      const receipt = await tx.wait();

      console.log("✅ Update confirmed!");

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ Lỗi khi update contract:", error);

      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        throw new Error("Bạn đã từ chối transaction");
      }

      throw error;
    }
  }

  /**
   * Phê duyệt hợp đồng trên blockchain (USER KÝ TRANSACTION)
   */
  async approveContract(contractNumber, approverName, comment = "") {
    if (!this.contract) {
      await this.connectWallet();
    }

    try {
      console.log("🚀 Gửi transaction phê duyệt...");

      const tx = await this.contract.approveContract(
        contractNumber,
        approverName,
        comment
      );

      console.log("⏳ Transaction hash:", tx.hash);
      const receipt = await tx.wait();

      console.log("✅ Approval confirmed!");

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error("❌ Lỗi khi approve contract:", error);

      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        throw new Error("Bạn đã từ chối transaction");
      }

      throw error;
    }
  }

  /**
   * Từ chối hợp đồng - User ký transaction
   */
  async rejectContract(contractNumber, reason = "Từ chối") {
    if (!this.contract) {
      await this.connectWallet();
    }

    try {
      const userAddress = await this.signer.getAddress();
      console.log("❌ Đang từ chối contract:", contractNumber);
      console.log("👤 User address:", userAddress);

      // Gọi rejectContract từ smart contract
      const tx = await this.contract.rejectContract(
        contractNumber,
        userAddress, // Rejector name (dùng địa chỉ ví)
        reason
      );

      console.log("⏳ Transaction sent:", tx.hash);
      console.log("⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("✅ Contract rejected on blockchain!");
      console.log("📝 Transaction hash:", receipt.hash);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        contractAddress: await this.contract.getAddress(),
        from: userAddress,
      };
    } catch (error) {
      console.error("❌ Reject contract error:", error);

      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        throw new Error("Bạn đã từ chối transaction");
      }

      throw error;
    }
  }

  /**
   * Kiểm tra số dư ETH của user
   */
  async getBalance() {
    if (!this.signer) {
      await this.connectWallet();
    }

    const balance = await this.provider.getBalance(
      await this.signer.getAddress()
    );
    return ethers.formatEther(balance);
  }

  /**
   * Kiểm tra contract có tồn tại trên blockchain không
   */
  async doesContractExist(contractNumber) {
    if (!this.contract) {
      await this.connectWallet();
    }

    try {
      // Gọi hàm getContract từ smart contract
      const contractData = await this.contract.getContract(contractNumber);

      // Nếu contractNumber trả về khác empty string thì contract tồn tại
      return contractData[0] !== ""; // contractData[0] là contractNumber
    } catch (error) {
      // Nếu revert "Contract does not exist" thì return false
      if (error.message.includes("Contract does not exist")) {
        return false;
      }
      // Nếu lỗi khác thì throw
      throw error;
    }
  }
}

// Export singleton instance
const userBlockchainService = new UserBlockchainService();
export default userBlockchainService;
