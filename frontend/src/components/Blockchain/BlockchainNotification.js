import React, { useEffect } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Link,
} from "@mui/material";
import {
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const BlockchainNotification = ({
  transaction,
  onClose,
  showToast = false,
}) => {
  const [open, setOpen] = React.useState(true);

  useEffect(() => {
    // Chỉ hiển thị toast nếu showToast = true (tránh duplicate)
    if (showToast && transaction && transaction.transactionHash) {
      // Gửi notification đến MetaMask wallet
      if (
        typeof window.ethereum !== "undefined" &&
        window.ethereum.isMetaMask
      ) {
        try {
          window.ethereum
            .request({
              method: "wallet_requestPermissions",
              params: [{ eth_accounts: {} }],
            })
            .catch(() => {
              // Ignore if user rejects
            });
        } catch (error) {
          console.log("MetaMask notification error:", error);
        }
      }

      // Hiển thị toast notification trong web app
      toast.custom(
        (t) => (
          <Box
            sx={{
              bgcolor: "background.paper",
              boxShadow: 3,
              borderRadius: 2,
              p: 2,
              maxWidth: 400,
              border: "2px solid",
              borderColor: "success.main",
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CheckCircleIcon color="success" />
              <Box flex={1}>
                <strong>Giao dịch Blockchain thành công!</strong>
              </Box>
              <IconButton size="small" onClick={() => toast.dismiss(t.id)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ fontSize: "0.875rem", color: "text.secondary", mb: 1 }}>
              Hợp đồng đã được lưu lên blockchain
            </Box>
            <Button
              size="small"
              startIcon={<OpenInNewIcon />}
              onClick={() => {
                window.open(
                  `https://sepolia.etherscan.io/tx/${transaction.transactionHash}`,
                  "_blank"
                );
                toast.dismiss(t.id);
              }}
              sx={{ fontSize: "0.75rem" }}
            >
              Xem trên Etherscan
            </Button>
          </Box>
        ),
        {
          duration: 8000,
          position: "top-right",
          id: `blockchain-${transaction.transactionHash}`, // Prevent duplicates
        }
      );
    }
  }, [showToast, transaction]);

  if (!transaction || !transaction.transactionHash) {
    return null;
  }

  const etherscanUrl = `https://sepolia.etherscan.io/tx/${transaction.transactionHash}`;

  return (
    <Collapse in={open}>
      <Alert
        severity="success"
        icon={<WalletIcon />}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setOpen(false);
              if (onClose) onClose();
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        <AlertTitle>
          <strong>🎉 Giao dịch Blockchain đã hoàn tất!</strong>
        </AlertTitle>
        <Box sx={{ fontSize: "0.875rem", mb: 1 }}>
          Hợp đồng của bạn đã được lưu trữ an toàn trên blockchain Sepolia.
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Link
            href={etherscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.875rem",
            }}
          >
            <OpenInNewIcon fontSize="small" />
            Xem trên Etherscan
          </Link>
          <Link
            onClick={() => {
              navigator.clipboard.writeText(transaction.transactionHash);
              toast.success("Đã copy Transaction Hash!");
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Copy TX Hash
          </Link>
        </Box>
        <Box
          sx={{
            mt: 1,
            p: 1,
            bgcolor: "rgba(0,0,0,0.05)",
            borderRadius: 1,
            fontSize: "0.75rem",
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          {transaction.transactionHash}
        </Box>
      </Alert>
    </Collapse>
  );
};

export default BlockchainNotification;
