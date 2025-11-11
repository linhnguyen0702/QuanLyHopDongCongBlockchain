import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  AlertTitle,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoIcon from "@mui/icons-material/Info";
import { toast } from "react-hot-toast";

/**
 * Dialog hiển thị thông tin chi tiết sau khi transaction blockchain thành công
 */
const TransactionSuccessDialog = ({
  open,
  onClose,
  transactionHash,
  title = "Giao dịch Blockchain thành công",
  message = "Dữ liệu đã được lưu lên blockchain",
  network = "sepolia",
}) => {
  const backendWalletAddress = "0xf06086Bc3215B60866A60698F10A955DBa969621";
  const etherscanTxUrl = `https://${network}.etherscan.io/tx/${transactionHash}`;
  const etherscanAddressUrl = `https://${network}.etherscan.io/address/${backendWalletAddress}`;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}!`, { duration: 2000 });
  };

  if (!transactionHash) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {/* Success Message */}
          <Alert severity="success" icon={false}>
            <AlertTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              ✅ {message}
            </AlertTitle>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Dữ liệu đã được ghi nhận vĩnh viễn trên blockchain Ethereum
              Sepolia Testnet
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.85rem",
                color: "success.dark",
                fontWeight: "medium",
              }}
            >
              {/* 🎉 Bạn không cần trả phí gas - hệ thống đã xử lý giúp bạn! */}
            </Typography>
          </Alert>

          {/* Transaction Hash */}
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Transaction Hash
            </Typography>
            <Box
              sx={{
                p: 1.5,
                bgcolor: "grey.100",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  wordBreak: "break-all",
                  flex: 1,
                }}
              >
                {transactionHash}
              </Typography>
              <Button
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() =>
                  copyToClipboard(transactionHash, "transaction hash")
                }
                sx={{ minWidth: "auto", flexShrink: 0 }}
              >
                Copy
              </Button>
            </Box>
          </Box>

          {/* View on Etherscan */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(etherscanTxUrl, "_blank")}
            sx={{ py: 1.5 }}
          >
            Xem chi tiết trên Etherscan
          </Button>

          <Divider />

          {/* Info about transactions */}
          <Alert severity="info" icon={<InfoIcon />}>
            <AlertTitle>💡 Cách xem lịch sử giao dịch</AlertTitle>

            <Typography variant="body2" sx={{ mb: 1.5 }}>
              Hệ thống sử dụng <strong>công nghệ gasless transaction</strong> -
              bạn không cần trả phí gas!
            </Typography>

            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Giao dịch được ký bởi ví backend:</strong>
            </Typography>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.7)",
                p: 1,
                borderRadius: 1,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  wordBreak: "break-all",
                  flex: 1,
                }}
              >
                {backendWalletAddress}
              </Typography>
              <Button
                size="small"
                onClick={() =>
                  copyToClipboard(backendWalletAddress, "địa chỉ ví")
                }
                sx={{ fontSize: "0.7rem", minWidth: "auto" }}
              >
                Copy
              </Button>
            </Box>

            <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
              📊 Xem tất cả giao dịch của hệ thống trên Etherscan:
            </Typography>

            <Button
              variant="contained"
              fullWidth
              startIcon={<OpenInNewIcon />}
              onClick={() => window.open(etherscanAddressUrl, "_blank")}
              sx={{ mb: 1 }}
            >
              Xem lịch sử đầy đủ trên Etherscan
            </Button>

            <Typography
              variant="body2"
              sx={{
                fontSize: "0.75rem",
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              {/* * Bạn không thấy giao dịch này trong MetaMask Activity tab của
              mình vì nó được ký bởi ví backend, không phải ví của bạn. */}
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionSuccessDialog;
