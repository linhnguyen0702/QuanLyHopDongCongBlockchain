const { ethers } = require("ethers");
const winston = require("winston");

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "blockchain-error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "blockchain.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

/**
 * BlockchainService - Service để tương tác với Ethereum smart contract
 */
class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;
    this.enabled = process.env.BLOCKCHAIN_ENABLED === "true";
    this.network = process.env.BLOCKCHAIN_NETWORK || "sepolia";
  }

  /**
   * Khởi tạo kết nối blockchain
   */
  async initialize() {
    if (!this.enabled) {
      logger.info("Blockchain is disabled");
      return false;
    }

    try {
      // Kết nối provider
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
      if (!rpcUrl) {
        throw new Error("BLOCKCHAIN_RPC_URL not configured");
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Khởi tạo wallet
      const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("BLOCKCHAIN_PRIVATE_KEY not configured");
      }

      this.wallet = new ethers.Wallet(privateKey, this.provider);

      // Load contract ABI
      const contractABI = require("../blockchain/ContractManager.json");

      if (!this.contractAddress) {
        throw new Error("BLOCKCHAIN_CONTRACT_ADDRESS not configured");
      }

      // Normalize address with proper checksum
      try {
        this.contractAddress = ethers.getAddress(
          this.contractAddress.toLowerCase()
        );
      } catch (error) {
        logger.error(`Invalid contract address: ${this.contractAddress}`);
        throw new Error(
          `Invalid BLOCKCHAIN_CONTRACT_ADDRESS: ${error.message}`
        );
      }

      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI.abi,
        this.wallet
      );

      // Test connection
      const network = await this.provider.getNetwork();
      logger.info(
        `Connected to blockchain network: ${network.name} (chainId: ${network.chainId})`
      );

      const balance = await this.provider.getBalance(this.wallet.address);
      logger.info(
        `Wallet address: ${this.wallet.address}, Balance: ${ethers.formatEther(
          balance
        )} ETH`
      );

      return true;
    } catch (error) {
      logger.error("Failed to initialize blockchain service:", error);
      this.enabled = false;
      return false;
    }
  }

  /**
   * Kiểm tra xem blockchain có được bật không
   */
  isEnabled() {
    return this.enabled && this.contract !== null;
  }

  /**
   * Tạo contract trên blockchain
   */
  async createContract(contractData) {
    if (!this.isEnabled()) {
      logger.warn("Blockchain is not enabled, skipping contract creation");
      return null;
    }

    try {
      const {
        contractNumber,
        contractName,
        contractor,
        contractValue,
        currency,
        startDate,
        endDate,
        contractType,
        department,
        responsiblePerson,
      } = contractData;

      // Convert dates to timestamps
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

      // Convert contract value to wei (assuming VND is 1:1 for now)
      const valueInWei = ethers.parseEther(contractValue.toString());

      logger.info(`Creating contract on blockchain: ${contractNumber}`);

      const tx = await this.contract.createContract(
        contractNumber,
        contractName,
        contractor,
        valueInWei,
        currency,
        startTimestamp,
        endTimestamp,
        contractType,
        department,
        responsiblePerson
      );

      logger.info(`Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      logger.info(
        `Contract created on blockchain. Block: ${
          receipt.blockNumber
        }, Gas used: ${receipt.gasUsed.toString()}`
      );

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        contractAddress: this.contractAddress,
        network: this.network,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      logger.error("Failed to create contract on blockchain:", error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái contract trên blockchain
   */
  async updateContractStatus(contractNumber, newStatus, remarks = "") {
    if (!this.isEnabled()) {
      logger.warn("Blockchain is not enabled, skipping status update");
      return null;
    }

    try {
      logger.info(
        `Updating contract status on blockchain: ${contractNumber} -> ${newStatus}`
      );

      const tx = await this.contract.updateContractStatus(
        contractNumber,
        newStatus,
        remarks
      );

      logger.info(`Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();

      logger.info(
        `Status updated on blockchain. Block: ${receipt.blockNumber}`
      );

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      logger.error("Failed to update contract status on blockchain:", error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin contract trên blockchain
   */
  async updateContract(contractNumber, contractData) {
    if (!this.isEnabled()) {
      logger.warn("Blockchain is not enabled, skipping contract update");
      return null;
    }

    try {
      const {
        contractName,
        contractor,
        contractValue,
        currency,
        startDate,
        endDate,
        contractType,
        department,
        responsiblePerson,
      } = contractData;

      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
      const valueInWei = ethers.parseEther(contractValue.toString());

      logger.info(`Updating contract on blockchain: ${contractNumber}`);

      const tx = await this.contract.updateContract(
        contractNumber,
        contractName,
        contractor,
        valueInWei,
        currency,
        startTimestamp,
        endTimestamp,
        contractType,
        department,
        responsiblePerson
      );

      logger.info(`Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();

      logger.info(
        `Contract updated on blockchain. Block: ${receipt.blockNumber}`
      );

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      logger.error("Failed to update contract on blockchain:", error);
      throw error;
    }
  }

  /**
   * Phê duyệt contract trên blockchain
   */
  async approveContract(contractNumber, approverName, comment = "Approved") {
    if (!this.isEnabled()) {
      logger.warn("Blockchain is not enabled, skipping contract approval");
      return null;
    }

    try {
      logger.info(
        `Approving contract on blockchain: ${contractNumber} by ${approverName}`
      );

      const tx = await this.contract.approveContract(
        contractNumber,
        approverName,
        comment
      );

      logger.info(`Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();

      logger.info(
        `Contract approved on blockchain. Block: ${receipt.blockNumber}`
      );

      return receipt.hash;
    } catch (error) {
      logger.error("Failed to approve contract on blockchain:", error);
      throw error;
    }
  }

  /**
   * Từ chối contract trên blockchain
   */
  async rejectContract(contractNumber, rejectorName, reason = "Rejected") {
    if (!this.isEnabled()) {
      logger.warn("Blockchain is not enabled, skipping contract rejection");
      return null;
    }

    try {
      logger.info(
        `Rejecting contract on blockchain: ${contractNumber} by ${rejectorName}`
      );

      const tx = await this.contract.rejectContract(
        contractNumber,
        rejectorName,
        reason
      );

      logger.info(`Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();

      logger.info(
        `Contract rejected on blockchain. Block: ${receipt.blockNumber}`
      );

      return receipt.hash;
    } catch (error) {
      logger.error("Failed to reject contract on blockchain:", error);
      throw error;
    }
  }

  /**
   * Lấy thông tin contract từ blockchain
   */
  async getContract(contractNumber) {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const contractData = await this.contract.getContract(contractNumber);

      return {
        contractNumber: contractData[0],
        contractName: contractData[1],
        contractor: contractData[2],
        contractValue: ethers.formatEther(contractData[3]),
        currency: contractData[4],
        startDate: new Date(Number(contractData[5]) * 1000),
        endDate: new Date(Number(contractData[6]) * 1000),
        contractType: contractData[7],
        status: contractData[8],
        department: contractData[9],
        responsiblePerson: contractData[10],
        createdBy: contractData[11],
        createdAt: new Date(Number(contractData[12]) * 1000),
        isActive: contractData[13],
      };
    } catch (error) {
      logger.error("Failed to get contract from blockchain:", error);
      return null;
    }
  }

  /**
   * Lấy lịch sử thay đổi từ blockchain
   */
  async getContractHistory(contractNumber) {
    if (!this.isEnabled()) {
      return [];
    }

    try {
      const history = await this.contract.getContractHistory(contractNumber);

      return history.map((entry) => ({
        contractNumber: entry.contractNumber,
        action: entry.action,
        previousStatus: entry.previousStatus,
        newStatus: entry.newStatus,
        performedBy: entry.performedBy,
        timestamp: new Date(Number(entry.timestamp) * 1000),
        remarks: entry.remarks,
      }));
    } catch (error) {
      logger.error("Failed to get contract history from blockchain:", error);
      return [];
    }
  }

  /**
   * Kiểm tra xem contract có tồn tại trên blockchain không
   */
  async doesContractExist(contractNumber) {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      return await this.contract.doesContractExist(contractNumber);
    } catch (error) {
      logger.error("Failed to check contract existence:", error);
      return false;
    }
  }

  /**
   * Lấy transaction receipt
   */
  async getTransactionReceipt(txHash) {
    if (!this.provider) {
      return null;
    }

    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      logger.error("Failed to get transaction receipt:", error);
      return null;
    }
  }

  /**
   * Verify transaction
   */
  async verifyTransaction(txHash, expectedContractNumber) {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      const receipt = await this.getTransactionReceipt(txHash);
      if (!receipt || receipt.status !== 1) {
        return false;
      }

      // Check if contract exists with this number
      const exists = await this.doesContractExist(expectedContractNumber);
      return exists;
    } catch (error) {
      logger.error("Failed to verify transaction:", error);
      return false;
    }
  }

  /**
   * Lấy số lượng contracts trên blockchain
   */
  async getContractCount() {
    if (!this.isEnabled()) {
      return 0;
    }

    try {
      const count = await this.contract.getContractCount();
      return Number(count);
    } catch (error) {
      logger.error("Failed to get contract count:", error);
      return 0;
    }
  }

  /**
   * Ước tính gas cho transaction
   */
  async estimateGas(method, ...args) {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const gasEstimate = await this.contract[method].estimateGas(...args);
      const gasPrice = await this.provider.getFeeData();

      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: gasPrice.gasPrice
          ? ethers.formatUnits(gasPrice.gasPrice, "gwei")
          : "0",
        estimatedCost: gasPrice.gasPrice
          ? ethers.formatEther(gasEstimate * gasPrice.gasPrice)
          : "0",
      };
    } catch (error) {
      logger.error("Failed to estimate gas:", error);
      return null;
    }
  }
}

// Singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
