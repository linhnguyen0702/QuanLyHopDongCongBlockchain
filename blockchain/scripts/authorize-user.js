const hre = require("hardhat");
require("dotenv").config({ path: "../backend/config.env" });

async function main() {
  console.log("🔐 Starting authorization process...");

  try {
    // Lấy ABI từ artifacts
    const ContractManager = await hre.ethers.getContractFactory(
      "ContractManager"
    );

    // Địa chỉ contract đã deploy
    const CONTRACT_ADDRESS = "0xa6315fC859Bc66C7D8269eE4FA2a3e7ada2ae39f";

    // Địa chỉ ví Manager cần authorize
    const MANAGER_WALLET_ADDRESS = "0xf63658249b182b83f0fc1e9917799f9a0e9cef68";

    // Lấy signer (phải là owner - ví đã deploy contract)
    const [owner] = await hre.ethers.getSigners();
    console.log("👤 Owner wallet:", owner.address); // Kết nối với contract đã deploy
    const contract = ContractManager.attach(CONTRACT_ADDRESS);
    console.log("📄 Contract address:", CONTRACT_ADDRESS);

    // Kiểm tra xem đã authorize chưa
    const isAuthorized = await contract.authorizedUsers(MANAGER_WALLET_ADDRESS);
    console.log(
      `🔍 Current authorization status for ${MANAGER_WALLET_ADDRESS}:`,
      isAuthorized
    );

    if (isAuthorized) {
      console.log("✅ User is already authorized!");
      return;
    }

    // Authorize user
    console.log(`\n🚀 Authorizing ${MANAGER_WALLET_ADDRESS}...`);
    const tx = await contract.authorizeUser(MANAGER_WALLET_ADDRESS, true);
    console.log("⏳ Transaction sent:", tx.hash);

    // Đợi transaction được confirm
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();

    console.log("\n✅ Authorization successful!");
    console.log("📝 Transaction hash:", receipt.hash);
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
    console.log(
      "🔗 View on Etherscan:",
      `https://sepolia.etherscan.io/tx/${receipt.hash}`
    );

    // Kiểm tra lại
    const newStatus = await contract.authorizedUsers(MANAGER_WALLET_ADDRESS);
    console.log("\n🔍 New authorization status:", newStatus);
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
