const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of ContractManager...");

  // Get the contract factory
  const ContractManager = await hre.ethers.getContractFactory(
    "ContractManager"
  );

  // Deploy the contract
  console.log("📝 Deploying contract...");
  const contractManager = await ContractManager.deploy();

  await contractManager.waitForDeployment();

  const contractAddress = await contractManager.getAddress();
  console.log("✅ ContractManager deployed to:", contractAddress);

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "- Chain ID:", network.chainId);

  // Get deployer information
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployed by:", deployer.address);

  // Save deployment information
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  // Save to file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${network.name}_${Date.now()}.json`
  );

  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("💾 Deployment info saved to:", deploymentFile);

  // Save contract ABI for backend integration
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "ContractManager.sol",
    "ContractManager.json"
  );

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiDir = path.join(__dirname, "..", "abi");

    if (!fs.existsSync(abiDir)) {
      fs.mkdirSync(abiDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(abiDir, "ContractManager.json"),
      JSON.stringify(
        {
          contractName: "ContractManager",
          abi: artifact.abi,
          address: contractAddress,
          network: network.name,
          chainId: network.chainId.toString(),
        },
        null,
        2
      )
    );

    console.log("📄 Contract ABI saved to: abi/ContractManager.json");
  }

  // Wait for block confirmations on non-local networks
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("⏳ Waiting for block confirmations...");
    await contractManager.deploymentTransaction().wait(5);
    console.log("✅ Confirmed!");

    // Verify contract on Etherscan if API key is available
    if (process.env.ETHERSCAN_API_KEY) {
      console.log("🔍 Verifying contract on Etherscan...");
      try {
        await hre.run("verify:verify", {
          address: contractAddress,
          constructorArguments: [],
        });
        console.log("✅ Contract verified on Etherscan");
      } catch (error) {
        console.log("⚠️  Verification failed:", error.message);
      }
    }
  }

  console.log("\n📋 Summary:");
  console.log("=====================================");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId);
  console.log("Deployer:", deployer.address);
  console.log("=====================================");
  console.log("\n💡 Next steps:");
  console.log("1. Copy the contract address to backend/.env");
  console.log("2. Update BLOCKCHAIN_CONTRACT_ADDRESS in backend config");
  console.log("3. Copy abi/ContractManager.json to backend/blockchain/");
  console.log("4. Restart your backend server");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
