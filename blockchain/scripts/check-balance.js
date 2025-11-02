const hre = require("hardhat");

async function main() {
  console.log("Checking wallet balance...\n");

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const network = await hre.ethers.provider.getNetwork();

  console.log("📍 Network:", network.name);
  console.log("📍 Chain ID:", network.chainId.toString());
  console.log("👤 Wallet Address:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH");

  const minBalance = hre.ethers.parseEther("0.01");
  if (balance < minBalance) {
    console.log("\n⚠️  WARNING: Balance is low!");
    console.log("   You may not have enough ETH for deployment.");
    console.log("   Get free testnet ETH from:");
    console.log("   - https://sepoliafaucet.com/");
    console.log("   - https://www.alchemy.com/faucets/ethereum-sepolia");
  } else {
    console.log("\n✅ Balance is sufficient for deployment");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
