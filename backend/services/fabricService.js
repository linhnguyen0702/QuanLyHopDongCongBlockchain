const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

class FabricService {
  constructor() {
    this.gateway = new Gateway();
    this.wallet = null;
    this.network = null;
    this.contract = null;
  }

  async initialize() {
    try {
      // Create wallet
      const walletPath = path.join(process.cwd(), 'wallet');
      this.wallet = await Wallets.newFileSystemWallet(walletPath);

      // Check if user exists in wallet
      const userExists = await this.wallet.get('appUser');
      if (!userExists) {
        console.log('User appUser does not exist in wallet');
        return false;
      }

      // Create gateway connection
      const connectionProfile = path.resolve(__dirname, '../network/connection-org1.json');
      const connectionProfileJSON = JSON.parse(fs.readFileSync(connectionProfile, 'utf8'));

      const connectionOptions = {
        wallet: this.wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
      };

      await this.gateway.connect(connectionProfileJSON, connectionOptions);

      // Get network and contract
      this.network = await this.gateway.getNetwork(process.env.CHANNEL_NAME || 'mychannel');
      this.contract = this.network.getContract(process.env.CHAINCODE_NAME || 'contract-chaincode');

      console.log('Hyperledger Fabric service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Fabric service:', error);
      return false;
    }
  }

  async createContract(contractData) {
    try {
      if (!this.contract) {
        throw new Error('Fabric service not initialized');
      }

      const contractId = `CONTRACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const contractRecord = {
        id: contractId,
        contractNumber: contractData.contractNumber,
        contractName: contractData.contractName,
        contractor: contractData.contractor,
        contractValue: contractData.contractValue,
        currency: contractData.currency,
        startDate: contractData.startDate.toISOString(),
        endDate: contractData.endDate.toISOString(),
        contractType: contractData.contractType,
        status: contractData.status,
        department: contractData.department,
        responsiblePerson: contractData.responsiblePerson,
        createdBy: contractData.createdBy.toString(),
        createdAt: new Date().toISOString(),
        version: 1
      };

      await this.contract.submitTransaction(
        'CreateContract',
        JSON.stringify(contractRecord)
      );

      console.log(`Contract ${contractId} created on blockchain`);
      return contractId;
    } catch (error) {
      console.error('Error creating contract on blockchain:', error);
      throw error;
    }
  }

  async updateContract(contractData) {
    try {
      if (!this.contract) {
        throw new Error('Fabric service not initialized');
      }

      const contractRecord = {
        id: contractData.blockchainId,
        contractNumber: contractData.contractNumber,
        contractName: contractData.contractName,
        contractor: contractData.contractor,
        contractValue: contractData.contractValue,
        currency: contractData.currency,
        startDate: contractData.startDate.toISOString(),
        endDate: contractData.endDate.toISOString(),
        contractType: contractData.contractType,
        status: contractData.status,
        department: contractData.department,
        responsiblePerson: contractData.responsiblePerson,
        updatedAt: new Date().toISOString(),
        version: contractData.version + 1
      };

      await this.contract.submitTransaction(
        'UpdateContract',
        JSON.stringify(contractRecord)
      );

      console.log(`Contract ${contractData.blockchainId} updated on blockchain`);
    } catch (error) {
      console.error('Error updating contract on blockchain:', error);
      throw error;
    }
  }

  async approveContract(contractData) {
    try {
      if (!this.contract) {
        throw new Error('Fabric service not initialized');
      }

      await this.contract.submitTransaction(
        'ApproveContract',
        contractData.blockchainId,
        contractData.approvedBy.toString(),
        new Date().toISOString()
      );

      console.log(`Contract ${contractData.blockchainId} approved on blockchain`);
    } catch (error) {
      console.error('Error approving contract on blockchain:', error);
      throw error;
    }
  }

  async activateContract(contractData) {
    try {
      if (!this.contract) {
        throw new Error('Fabric service not initialized');
      }

      await this.contract.submitTransaction(
        'ActivateContract',
        contractData.blockchainId,
        new Date().toISOString()
      );

      console.log(`Contract ${contractData.blockchainId} activated on blockchain`);
    } catch (error) {
      console.error('Error activating contract on blockchain:', error);
      throw error;
    }
  }

  async rejectContract(contractData) {
    try {
      if (!this.contract) {
        throw new Error('Fabric service not initialized');
      }

      await this.contract.submitTransaction(
        'RejectContract',
        contractData.blockchainId,
        contractData.rejectedBy?.toString() || contractData.createdBy.toString(),
        new Date().toISOString()
      );

      console.log(`Contract ${contractData.blockchainId} rejected on blockchain`);
    } catch (error) {
      console.error('Error rejecting contract on blockchain:', error);
      throw error;
    }
  }

  async getContract(contractId) {
    try {
      if (!this.contract) {
        throw new Error('Fabric service not initialized');
      }

      const result = await this.contract.evaluateTransaction(
        'GetContract',
        contractId
      );

      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Error getting contract from blockchain:', error);
      throw error;
    }
  }

  async getAllContracts() {
    try {
      if (!this.contract) {
        throw new Error('Fabric service not initialized');
      }

      const result = await this.contract.evaluateTransaction('GetAllContracts');
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Error getting all contracts from blockchain:', error);
      throw error;
    }
  }

  async getContractHistory(contractId) {
    try {
      if (!this.contract) {
        throw new Error('Fabric service not initialized');
      }

      const result = await this.contract.evaluateTransaction(
        'GetContractHistory',
        contractId
      );

      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Error getting contract history from blockchain:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.gateway) {
      await this.gateway.disconnect();
      console.log('Disconnected from Hyperledger Fabric network');
    }
  }
}

// Create singleton instance
const fabricService = new FabricService();

// Initialize on startup
fabricService.initialize().catch(error => {
  console.error('Failed to initialize Fabric service on startup:', error);
});

module.exports = fabricService;
