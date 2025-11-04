import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider,
} from "@mui/material";
import {
  AccountBalanceWallet as WalletIcon,
  PowerSettingsNew as DisconnectIcon,
  Public as NetworkIcon,
  Warning as WarningIcon,
  AccountBalance as BalanceIcon,
} from "@mui/icons-material";
import { useBlockchain } from "../../contexts/BlockchainContext";

const WalletConnect = () => {
  const {
    account,
    network,
    balance,
    isConnecting,
    isConnected,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    formatAddress,
  } = useBlockchain();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    handleMenuClose();
  };

  const handleSwitchNetwork = () => {
    switchToSepolia();
    handleMenuClose();
  };

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

  const isWrongNetwork = network?.chainId !== 11155111; // Sepolia chainId

  const formattedBalance = balance
    ? parseFloat(balance).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    : "0.0000";

  return (
    <>
      <Chip
        icon={<WalletIcon />}
        label={formatAddress(account)}
        size="small"
        color={isWrongNetwork ? "error" : "success"}
        sx={{ fontWeight: 500, cursor: "pointer" }}
        onClick={handleMenuOpen}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            minWidth: 240,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {formatAddress(account)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>
            {account}
          </Typography>
        </Box>
        <Divider />
        <MenuItem disabled>
          <ListItemIcon>
            <BalanceIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">{formattedBalance} ETH</Typography>
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon>
            <NetworkIcon fontSize="small" />
          </ListItemIcon>
          {network?.name || "Unknown Network"}
        </MenuItem>
        {isWrongNetwork && (
          <MenuItem onClick={handleSwitchNetwork}>
            <ListItemIcon>
              <WarningIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <Typography color="warning.main">Chuyển sang Sepolia</Typography>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleDisconnect}>
          <ListItemIcon>
            <DisconnectIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Ngắt kết nối</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default WalletConnect;
