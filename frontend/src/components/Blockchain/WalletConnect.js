import React from "react";
import { Box, Button, Chip } from "@mui/material";
import {
  AccountBalanceWallet as WalletIcon,
  PowerSettingsNew as DisconnectIcon,
} from "@mui/icons-material";
import { useBlockchain } from "../../contexts/BlockchainContext";

const WalletConnect = () => {
  const {
    account,
    network,
    isConnecting,
    isConnected,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    formatAddress,
  } = useBlockchain();

  if (!isConnected) {
    return (
      <Button
        variant="contained"
        startIcon={<WalletIcon />}
        onClick={connectWallet}
        disabled={isConnecting}
        size="small"
      >
        {isConnecting ? "Đang kết nối..." : "Kết nối ví"}
      </Button>
    );
  }

  // Compact version for AppBar
  const isWrongNetwork = network?.chainId !== 11155111; // Sepolia chainId

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Chip
        icon={<WalletIcon />}
        label={formatAddress(account)}
        size="small"
        color={isWrongNetwork ? "error" : "success"}
        sx={{ fontWeight: 500 }}
      />
      <Chip
        label={network?.name || "Unknown"}
        size="small"
        color={isWrongNetwork ? "error" : "success"}
        onClick={isWrongNetwork ? switchToSepolia : undefined}
        sx={{ cursor: isWrongNetwork ? "pointer" : "default" }}
      />
      {isWrongNetwork && (
        <Button
          variant="contained"
          color="warning"
          onClick={switchToSepolia}
          size="small"
          sx={{ minWidth: "auto", px: 1 }}
        >
          → Sepolia
        </Button>
      )}
      <Button
        variant="outlined"
        color="error"
        startIcon={<DisconnectIcon />}
        onClick={disconnectWallet}
        size="small"
        sx={{ minWidth: "auto", px: 1 }}
      >
        Ngắt
      </Button>
    </Box>
  );
};

export default WalletConnect;
