import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Link,
  Divider,
  Button,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as ContentCopyIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { useBlockchain } from "../../contexts/BlockchainContext";

const BlockchainInfo = ({ contract }) => {
  const { viewTransactionOnExplorer, formatAddress } = useBlockchain();

  if (!contract?.blockchain?.enabled) {
    return null;
  }

  const { blockchain } = contract;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}!`);
  };

  const getNetworkName = (network) => {
    const networks = {
      mainnet: "Ethereum Mainnet",
      sepolia: "Sepolia Testnet",
      localhost: "Local Network",
    };
    return networks[network] || network;
  };

  const getNetworkColor = (network) => {
    const colors = {
      mainnet: "success",
      sepolia: "warning",
      localhost: "info",
    };
    return colors[network] || "default";
  };

  return (
    <Card sx={{ mt: 2, border: "2px solid", borderColor: "primary.main" }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <VerifiedIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" component="div">
            Thông tin Blockchain
          </Typography>
          <Chip
            label="Verified on Chain"
            color="success"
            size="small"
            icon={<CheckCircleIcon />}
            sx={{ ml: 2 }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          {/* Network */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Network
            </Typography>
            <Chip
              label={getNetworkName(blockchain.network)}
              color={getNetworkColor(blockchain.network)}
              size="small"
            />
          </Box>

          {/* Transaction Hash */}
          {blockchain.transactionHash && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Transaction Hash
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    bgcolor: "grey.100",
                    p: 1,
                    borderRadius: 1,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {blockchain.transactionHash}
                </Typography>
                <Tooltip title="Copy">
                  <IconButton
                    size="small"
                    onClick={() =>
                      copyToClipboard(
                        blockchain.transactionHash,
                        "transaction hash"
                      )
                    }
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View on Explorer">
                  <IconButton
                    size="small"
                    onClick={() =>
                      viewTransactionOnExplorer(blockchain.transactionHash)
                    }
                    color="primary"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}

          {/* Block Number */}
          {blockchain.blockNumber && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Block Number
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                #{blockchain.blockNumber.toLocaleString()}
              </Typography>
            </Box>
          )}

          {/* Contract Address */}
          {blockchain.contractAddress && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Smart Contract Address
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    bgcolor: "grey.100",
                    p: 1,
                    borderRadius: 1,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {blockchain.contractAddress}
                </Typography>
                <Tooltip title="Copy">
                  <IconButton
                    size="small"
                    onClick={() =>
                      copyToClipboard(
                        blockchain.contractAddress,
                        "contract address"
                      )
                    }
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}

          {/* Timestamps */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Created on Chain
            </Typography>
            <Typography variant="body2">
              {blockchain.createdOnChain
                ? new Date(blockchain.createdOnChain).toLocaleString("vi-VN")
                : "N/A"}
            </Typography>
          </Box>

          {blockchain.lastSyncedAt && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last Synced
              </Typography>
              <Typography variant="body2">
                {new Date(blockchain.lastSyncedAt).toLocaleString("vi-VN")}
              </Typography>
            </Box>
          )}
        </Stack>

        <Box mt={3}>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            gutterBottom
          >
            Hợp đồng này đã được ghi nhận trên Ethereum blockchain, đảm bảo tính
            minh bạch và không thể thay đổi.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BlockchainInfo;
