const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractManager", function () {
  let contractManager;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const ContractManager = await ethers.getContractFactory("ContractManager");
    contractManager = await ContractManager.deploy();
    await contractManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contractManager.owner()).to.equal(owner.address);
    });

    it("Should authorize owner by default", async function () {
      expect(await contractManager.authorizedUsers(owner.address)).to.be.true;
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to authorize users", async function () {
      await contractManager.authorizeUser(user1.address, true);
      expect(await contractManager.authorizedUsers(user1.address)).to.be.true;
    });

    it("Should allow owner to revoke authorization", async function () {
      await contractManager.authorizeUser(user1.address, true);
      await contractManager.authorizeUser(user1.address, false);
      expect(await contractManager.authorizedUsers(user1.address)).to.be.false;
    });

    it("Should not allow non-owner to authorize users", async function () {
      await expect(
        contractManager.connect(user1).authorizeUser(user2.address, true)
      ).to.be.revertedWith("Only owner can perform this action");
    });
  });

  describe("Contract Creation", function () {
    it("Should create a new contract", async function () {
      const contractNumber = "HD2024001";
      const contractName = "Construction Project ABC";
      const contractor = "ABC Construction Company";
      const contractValue = ethers.parseEther("100");
      const currency = "VND";
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 86400 * 365; // 1 year
      const contractType = "construction";
      const department = "Engineering";
      const responsiblePerson = "John Doe";

      await contractManager.createContract(
        contractNumber,
        contractName,
        contractor,
        contractValue,
        currency,
        startDate,
        endDate,
        contractType,
        department,
        responsiblePerson
      );

      expect(await contractManager.doesContractExist(contractNumber)).to.be
        .true;
      expect(await contractManager.getContractCount()).to.equal(1);
    });

    it("Should not allow duplicate contract numbers", async function () {
      const contractNumber = "HD2024001";
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 86400 * 365;

      await contractManager.createContract(
        contractNumber,
        "Contract 1",
        "Contractor A",
        ethers.parseEther("100"),
        "VND",
        startDate,
        endDate,
        "construction",
        "Engineering",
        "John Doe"
      );

      await expect(
        contractManager.createContract(
          contractNumber,
          "Contract 2",
          "Contractor B",
          ethers.parseEther("200"),
          "VND",
          startDate,
          endDate,
          "supply",
          "Procurement",
          "Jane Smith"
        )
      ).to.be.revertedWith("Contract already exists");
    });

    it("Should not allow unauthorized users to create contracts", async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 86400 * 365;

      await expect(
        contractManager
          .connect(user1)
          .createContract(
            "HD2024001",
            "Contract 1",
            "Contractor A",
            ethers.parseEther("100"),
            "VND",
            startDate,
            endDate,
            "construction",
            "Engineering",
            "John Doe"
          )
      ).to.be.revertedWith("Not authorized to perform this action");
    });

    it("Should reject invalid date range", async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate - 86400; // End date before start date

      await expect(
        contractManager.createContract(
          "HD2024001",
          "Contract 1",
          "Contractor A",
          ethers.parseEther("100"),
          "VND",
          startDate,
          endDate,
          "construction",
          "Engineering",
          "John Doe"
        )
      ).to.be.revertedWith("End date must be after start date");
    });
  });

  describe("Contract Updates", function () {
    beforeEach(async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 86400 * 365;

      await contractManager.createContract(
        "HD2024001",
        "Original Contract",
        "Original Contractor",
        ethers.parseEther("100"),
        "VND",
        startDate,
        endDate,
        "construction",
        "Engineering",
        "John Doe"
      );
    });

    it("Should update contract status", async function () {
      await contractManager.updateContractStatus(
        "HD2024001",
        "approved",
        "Approved by manager"
      );

      const contract = await contractManager.getContract("HD2024001");
      expect(contract.status).to.equal("approved");
    });

    it("Should update contract information", async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 86400 * 365;

      await contractManager.updateContract(
        "HD2024001",
        "Updated Contract Name",
        "Updated Contractor",
        ethers.parseEther("200"),
        "USD",
        startDate,
        endDate,
        "supply",
        "Procurement",
        "Jane Smith"
      );

      const contract = await contractManager.getContract("HD2024001");
      expect(contract.contractName).to.equal("Updated Contract Name");
      expect(contract.contractValue).to.equal(ethers.parseEther("200"));
    });

    it("Should deactivate contract", async function () {
      await contractManager.deactivateContract(
        "HD2024001",
        "Contract cancelled"
      );

      const contract = await contractManager.getContract("HD2024001");
      expect(contract.isActive).to.be.false;
    });
  });

  describe("Contract Retrieval", function () {
    beforeEach(async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 86400 * 365;

      // Create multiple contracts
      for (let i = 1; i <= 5; i++) {
        await contractManager.createContract(
          `HD202400${i}`,
          `Contract ${i}`,
          `Contractor ${i}`,
          ethers.parseEther((100 * i).toString()),
          "VND",
          startDate,
          endDate,
          "construction",
          "Engineering",
          "John Doe"
        );
      }
    });

    it("Should get contract details", async function () {
      const contract = await contractManager.getContract("HD2024001");
      expect(contract.contractNumber).to.equal("HD2024001");
      expect(contract.contractName).to.equal("Contract 1");
    });

    it("Should get contract count", async function () {
      expect(await contractManager.getContractCount()).to.equal(5);
    });

    it("Should get contracts in batches", async function () {
      const batch = await contractManager.getContractsBatch(0, 3);
      expect(batch.numbers.length).to.equal(3);
      expect(batch.numbers[0]).to.equal("HD2024001");
    });

    it("Should get contract history", async function () {
      await contractManager.updateContractStatus(
        "HD2024001",
        "approved",
        "Test approval"
      );

      const history = await contractManager.getContractHistory("HD2024001");
      expect(history.length).to.be.greaterThan(0);
      expect(history[0].action).to.equal("created");
    });
  });
});
