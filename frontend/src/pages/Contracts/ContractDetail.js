import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useQuery } from "react-query";
import { contractAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import BlockchainInfo from "../../components/Blockchain/BlockchainInfo";
import BlockchainNotification from "../../components/Blockchain/BlockchainNotification";
import { useSettings } from "../../contexts/SettingsContext"; // Import the hook

const StatusChip = ({ status }) => {
  // ... (rest of the component is unchanged)
  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "default";
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "active":
        return "info";
      case "completed":
        return "primary";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "draft":
        return "Nháp";
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "active":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Hủy bỏ";
      default:
        return status;
    }
  };

  return (
    <Chip
      label={getStatusText(status)}
      color={getStatusColor(status)}
      size="medium"
      sx={{
        minWidth: "fit-content",
        whiteSpace: "nowrap",
        fontSize: "0.875rem",
        fontWeight: 500,
        height: "28px",
        "& .MuiChip-label": {
          padding: "0 12px",
          lineHeight: 1.2,
        },
      }}
    />
  );
};

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatDate, formatCurrency } = useSettings(); // Use the global formatters
  const [showBlockchainNotif, setShowBlockchainNotif] = useState(true);

  const {
    data: contractData,
    isLoading,
    error,
  } = useQuery(["contract", id], () => contractAPI.getContract(id), {
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading contract</div>;

  const contract = contractData?.data?.data?.contract;

  if (!contract) {
    return <div>Contract not found</div>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/contracts")}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
            Chi tiết hợp đồng
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <StatusChip status={contract.status} />
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/contracts/${id}/edit`)}
          >
            Chỉnh sửa
          </Button>
        </Box>
      </Box>

      {/* Blockchain Notification - Show if transaction exists (Alert only, no toast) */}
      {contract.blockchain?.enabled &&
        contract.blockchain?.transactionHash &&
        showBlockchainNotif && (
          <BlockchainNotification
            transaction={{
              transactionHash: contract.blockchain.transactionHash,
              blockNumber: contract.blockchain.blockNumber,
              network: contract.blockchain.network,
            }}
            onClose={() => setShowBlockchainNotif(false)}
            showToast={false}
          />
        )}

      <Grid container spacing={3}>
        {/* Contract Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Thông tin hợp đồng
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Số hợp đồng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {contract.contractNumber}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tên hợp đồng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {contract.contractName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Nhà thầu
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {contract.contractor}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Loại hợp đồng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {contract.contractType}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Giá trị hợp đồng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {formatCurrency(contract.contractValue)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phòng ban
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {contract.department}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Người phụ trách
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {contract.responsiblePerson}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày bắt đầu
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {formatDate(contract.startDate)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày kết thúc
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {formatDate(contract.endDate)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Thời gian thực hiện
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {contract.duration} ngày
                  </Typography>
                </Grid>
              </Grid>

              {contract.description && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Mô tả
                  </Typography>
                  <Typography variant="body1">
                    {contract.description}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Contract History - Moved up to be on same row */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Lịch sử thay đổi
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List>
                {contract.history && contract.history.length > 0 ? (
                  contract.history.map((historyItem, index) => (
                    <ListItem
                      key={index}
                      divider={index < contract.history.length - 1}
                    >
                      <ListItemIcon>
                        {historyItem.action === "created" && (
                          <CheckCircleIcon color="success" />
                        )}
                        {historyItem.action === "approved" && (
                          <CheckCircleIcon color="success" />
                        )}
                        {historyItem.action === "updated" && (
                          <EditIcon color="info" />
                        )}
                        {historyItem.action === "activated" && (
                          <ScheduleIcon color="info" />
                        )}
                        {![
                          "created",
                          "approved",
                          "updated",
                          "activated",
                        ].includes(historyItem.action) && (
                          <CheckCircleIcon color="action" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={historyItem.comment || historyItem.action}
                        secondary={formatDate(historyItem.performedAt)}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có lịch sử thay đổi
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Approval Progress - Moved down after history */}
        {contract.status === "pending" && (
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: "#fff8e1" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "#f57c00" }}
                >
                  Tiến trình phê duyệt
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    Trạng thái: {contract.approvals?.length || 0}/2 phê duyệt
                  </Typography>
                  <Chip
                    label={
                      contract.approvals?.length >= 2 ? "Hoàn tất" : "Đang chờ"
                    }
                    color={
                      contract.approvals?.length >= 2 ? "success" : "warning"
                    }
                    size="small"
                  />
                </Box>

                {contract.approvals && contract.approvals.length > 0 ? (
                  <List dense>
                    {contract.approvals.map((approval, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Phê duyệt lần ${index + 1}: ${
                            approval.approvedBy?.fullName ||
                            approval.approvedBy?.username ||
                            "N/A"
                          }`}
                          secondary={`${formatDate(approval.approvedAt)}${
                            approval.comment ? ` - ${approval.comment}` : ""
                          }`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có phê duyệt nào
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Blockchain Information */}
        <Grid item xs={12}>
          <BlockchainInfo contract={contract} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContractDetail;
