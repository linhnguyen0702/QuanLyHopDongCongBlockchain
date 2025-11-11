import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from "@mui/material";
import {
  Approval as ApprovalIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { contractAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import BlockchainProgressNotification from "../../components/Common/BlockchainProgressNotification";
import userBlockchainService from "../../services/userBlockchainService";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "draft":
        return "default";
      case "active":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "draft":
        return "Nháp";
      case "active":
        return "Đang hoạt động";
      default:
        return status;
    }
  };

  return (
    <Chip
      label={getStatusText(status)}
      color={getStatusColor(status)}
      size="small"
    />
  );
};

const ContractCard = ({ contract, onMenuClick }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const approvalCount = contract.approvals?.length || 0;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              {contract.contractName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Số hợp đồng: {contract.contractNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Nhà thầu: {contract.contractor}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Giá trị: {formatCurrency(contract.contractValue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phòng ban: {contract.department}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 1,
            }}
          >
            <StatusChip status={contract.status} />
            {contract.status === "pending" && approvalCount > 0 && (
              <Chip
                label={`${approvalCount}/2 phê duyệt`}
                size="small"
                color={approvalCount >= 2 ? "success" : "warning"}
                sx={{ fontSize: "0.75rem" }}
              />
            )}
            <IconButton onClick={(e) => onMenuClick(e, contract)} size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {contract.createdBy?.fullName || contract.createdBy?.username}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {new Date(contract.createdAt).toLocaleDateString("vi-VN")}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Approval = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [showBlockchainProgress, setShowBlockchainProgress] = useState(false);
  const [blockchainMessage, setBlockchainMessage] = useState("");
  const [userAddress, setUserAddress] = useState(null);

  const queryClient = useQueryClient();
  const { isManager } = useAuth();

  const { data: contractsData, isLoading } = useQuery(
    ["contracts-approval", { search: searchTerm, status: statusFilter }],
    () => {
      const params = {
        search: searchTerm,
        page: 1,
        limit: 50,
      };
      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }
      return contractAPI.getContracts(params);
    },
    {
      keepPreviousData: true,
    }
  );

  const approveContractMutation = useMutation(
    ({ contractId, comment, blockchain }) =>
      contractAPI.approveContract(contractId, comment, blockchain),
    {
      onMutate: () => {
        // Progress đã được hiển thị ở confirmApprove
      },
      onSuccess: (response) => {
        setShowBlockchainProgress(false);

        queryClient.invalidateQueries("contracts-approval");
        queryClient.invalidateQueries("contracts");

        const contract = response?.data?.data?.contract;

        if (
          contract?.blockchainTxHash ||
          contract?.blockchain?.transactionHash
        ) {
          const txHash =
            contract.blockchainTxHash || contract.blockchain.transactionHash;
          console.log("✅ Contract approved with blockchain:", txHash);

          toast.success(
            "Phê duyệt hợp đồng và lưu lên blockchain thành công!",
            {
              duration: 3000,
              id: `approve-contract-${contract._id}`,
            }
          );
        } else {
          toast.success(
            response?.data?.message || "Phê duyệt hợp đồng thành công!"
          );
        }

        setApprovalDialogOpen(false);
        setComment("");
      },
      onError: (error) => {
        setShowBlockchainProgress(false);
        toast.error(
          error.response?.data?.message || "Phê duyệt hợp đồng thất bại!"
        );
      },
    }
  );

  const rejectContractMutation = useMutation(
    ({ contractId, comment }) =>
      contractAPI.rejectContract(contractId, comment),
    {
      onMutate: () => {
        // Hiển thị notification blockchain đang xử lý
        setShowBlockchainProgress(true);
        setBlockchainMessage("Đang từ chối hợp đồng và lưu lên blockchain...");
      },
      onSuccess: () => {
        // Ẩn notification ngay lập tức
        setShowBlockchainProgress(false);

        queryClient.invalidateQueries("contracts-approval");
        queryClient.invalidateQueries("contracts");
        toast.success(
          "Từ chối hợp đồng thành công!\n✅ Đã lưu lên blockchain!"
        );
        setRejectionDialogOpen(false);
        setComment("");
      },
      onError: (error) => {
        setShowBlockchainProgress(false);
        toast.error(
          error.response?.data?.message || "Từ chối hợp đồng thất bại!"
        );
      },
    }
  );

  const handleMenuClick = (event, contract) => {
    setAnchorEl(event.currentTarget);
    setSelectedContract(contract);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    setDetailDialogOpen(true);
    handleMenuClose();
  };

  const handleApprove = () => {
    setApprovalDialogOpen(true);
    handleMenuClose();
  };

  const handleReject = () => {
    setRejectionDialogOpen(true);
    handleMenuClose();
  };

  const confirmApprove = async () => {
    // USER WALLET SIGNING - User ký transaction phê duyệt qua MetaMask
    try {
      // Kiểm tra xem contract đã có phê duyệt trước đó chưa
      const currentApprovals = selectedContract.approvals || [];
      const isSecondApproval = currentApprovals.length >= 1;

      // CHỈ người phê duyệt cuối cùng mới cần ký blockchain
      // Người đầu tiên chỉ lưu vào MongoDB
      let blockchainData = null;

      if (isSecondApproval) {
        // Đây là approval thứ 2 → CẦN ký blockchain để chuyển status "pending" → "approved"
        setShowBlockchainProgress(true);
        setBlockchainMessage("Đang kết nối MetaMask...");

        // 1. Kết nối ví nếu chưa kết nối
        if (!userAddress) {
          const loadingToast = toast.loading("Vui lòng kết nối MetaMask...");
          const address = await userBlockchainService.connectWallet();
          setUserAddress(address);
          toast.success("Đã kết nối ví!", { id: loadingToast });
        }

        // 2. Kiểm tra contract có tồn tại trên blockchain chưa
        setBlockchainMessage("Kiểm tra contract trên blockchain...");
        const contractExists = await userBlockchainService.doesContractExist(
          selectedContract.contractNumber
        );

        if (!contractExists) {
          // Nếu chưa có trên blockchain, tạo mới trước
          const createToast = toast.loading(
            "Contract chưa có trên blockchain, đang tạo..."
          );
          await userBlockchainService.createContract({
            contractNumber: selectedContract.contractNumber,
            contractName: selectedContract.contractName,
            contractor: selectedContract.contractor,
            contractValue: selectedContract.contractValue,
            currency: selectedContract.currency || "VND",
            startDate: selectedContract.startDate,
            endDate: selectedContract.endDate,
            contractType: selectedContract.contractType,
            status: "pending", // Tạo với status pending
            department: selectedContract.department,
            responsiblePerson: selectedContract.responsiblePerson,
          });
          toast.success("Đã tạo contract trên blockchain!", {
            id: createToast,
          });
        }

        // 3. User ký transaction phê duyệt trên blockchain
        setBlockchainMessage("Vui lòng xác nhận giao dịch trong MetaMask...");
        const signToast = toast.loading("Chờ xác nhận từ MetaMask...");

        const txResult = await userBlockchainService.approveContract(
          selectedContract.contractNumber,
          comment || "Đã phê duyệt"
        );

        toast.success("Đã ký giao dịch thành công!", { id: signToast });
        setBlockchainMessage("Đang lưu thông tin phê duyệt...");

        blockchainData = {
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber,
          contractAddress: txResult.contractAddress,
        };
      }

      // 4. Gửi thông tin phê duyệt về backend (có hoặc không có blockchain data)
      approveContractMutation.mutate({
        contractId: selectedContract._id,
        comment: comment,
        ...(blockchainData && { blockchain: blockchainData }),
      });
    } catch (error) {
      setShowBlockchainProgress(false);
      console.error("User wallet signing error:", error);

      if (error.code === 4001) {
        toast.error("Bạn đã từ chối giao dịch trong MetaMask");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Không đủ ETH để trả phí gas");
      } else if (error.message?.includes("Contract must be in pending")) {
        toast.error(
          "Hợp đồng đã được phê duyệt lần 1 rồi. Cần người thứ 2 phê duyệt tiếp!"
        );
      } else {
        toast.error(
          error.message || "Không thể thực hiện giao dịch blockchain"
        );
      }
    }
  };

  const confirmReject = async () => {
    // USER WALLET SIGNING - User ký transaction từ chối qua MetaMask
    try {
      setShowBlockchainProgress(true);
      setBlockchainMessage("Đang kết nối MetaMask...");

      // 1. Kết nối ví nếu chưa kết nối
      if (!userAddress) {
        const loadingToast = toast.loading("Vui lòng kết nối MetaMask...");
        const address = await userBlockchainService.connectWallet();
        setUserAddress(address);
        toast.success("Đã kết nối ví!", { id: loadingToast });
      }

      // 2. Kiểm tra contract có tồn tại trên blockchain chưa
      setBlockchainMessage("Kiểm tra contract trên blockchain...");
      const contractExists = await userBlockchainService.doesContractExist(
        selectedContract.contractNumber
      );

      if (!contractExists) {
        // Nếu chưa có trên blockchain, tạo mới trước với status pending
        const createToast = toast.loading("Contract chưa có trên blockchain, đang tạo...");
        await userBlockchainService.createContract({
          contractNumber: selectedContract.contractNumber,
          contractName: selectedContract.contractName,
          contractor: selectedContract.contractor,
          contractValue: selectedContract.contractValue,
          currency: selectedContract.currency || "VND",
          startDate: selectedContract.startDate,
          endDate: selectedContract.endDate,
          contractType: selectedContract.contractType,
          status: "pending", // Tạo với status pending
          department: selectedContract.department,
          responsiblePerson: selectedContract.responsiblePerson,
        });
        toast.success("Đã tạo contract trên blockchain!", { id: createToast });
      }

      // 3. User ký transaction từ chối trên blockchain
      setBlockchainMessage("Vui lòng xác nhận giao dịch từ chối trong MetaMask...");
      const signToast = toast.loading("Chờ xác nhận từ MetaMask...");

      const txResult = await userBlockchainService.rejectContract(
        selectedContract.contractNumber,
        comment || "Từ chối"
      );

      toast.success("Đã ký giao dịch từ chối thành công!", { id: signToast });
      setBlockchainMessage("Đang lưu thông tin từ chối...");

      // 4. Gửi thông tin từ chối + transaction hash về backend
      rejectContractMutation.mutate({
        contractId: selectedContract._id,
        comment: comment,
        blockchain: {
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber,
          contractAddress: txResult.contractAddress,
        },
      });
    } catch (error) {
      setShowBlockchainProgress(false);
      console.error("User wallet signing error:", error);

      if (error.code === 4001) {
        toast.error("Bạn đã từ chối giao dịch trong MetaMask");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Không đủ ETH để trả phí gas");
      } else if (error.message?.includes("Contract must be in pending")) {
        toast.error("Hợp đồng không ở trạng thái pending. Không thể từ chối!");
      } else {
        toast.error(
          error.message || "Không thể thực hiện giao dịch blockchain"
        );
      }
    }
  };

  const handleDialogClose = () => {
    setDetailDialogOpen(false);
    setApprovalDialogOpen(false);
    setRejectionDialogOpen(false);
    setSelectedContract(null);
  };

  if (!isManager) {
    return (
      <Box>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          Phê duyệt hợp đồng
        </Typography>
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <ApprovalIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              Bạn không có quyền truy cập trang này
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Chỉ quản lý và quản trị viên mới có thể phê duyệt hợp đồng
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (isLoading) return <LoadingSpinner />;

  const contracts = contractsData?.data?.data?.contracts || [];

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold", mb: 3 }}
      >
        Phê duyệt hợp đồng
      </Typography>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm hợp đồng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    fontSize: "0.7rem",
                    color: "#6b7280",
                    fontWeight: 400,
                    "&.Mui-focused": {
                      color: "#6b7280",
                    },
                    "&.MuiInputLabel-shrink": {
                      transform: "translate(14px, -8px) scale(1)",
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "50%",
                        left: "-12px",
                        right: "-12px",
                        height: "1px",
                        backgroundColor: "#e5e7eb",
                        zIndex: -1,
                      },
                    },
                  }}
                >
                  Trạng thái
                </InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="pending">Chờ duyệt</MenuItem>
                  <MenuItem value="approved">Đã duyệt</MenuItem>
                  <MenuItem value="rejected">Từ chối</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {contracts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tất cả
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "warning.main" }}
              >
                {contracts.filter((c) => c.status === "pending").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chờ duyệt
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "success.main" }}
              >
                {contracts.filter((c) => c.status === "approved").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã duyệt
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "error.main" }}
              >
                {contracts.filter((c) => c.status === "rejected").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Từ chối
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contracts List */}
      {contracts.length > 0 ? (
        <Box>
          {contracts.map((contract) => (
            <ContractCard
              key={contract._id}
              contract={contract}
              onMenuClick={handleMenuClick}
            />
          ))}
        </Box>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <ApprovalIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              Không có hợp đồng nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Hãy thử thay đổi bộ lọc để xem kết quả khác
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon sx={{ mr: 1 }} />
          Xem chi tiết
        </MenuItem>
        {selectedContract?.status === "pending" && (
          <>
            <MenuItem onClick={handleApprove}>
              <CheckIcon sx={{ mr: 1 }} />
              Phê duyệt
            </MenuItem>
            <MenuItem onClick={handleReject} sx={{ color: "error.main" }}>
              <CloseIcon sx={{ mr: 1 }} />
              Từ chối
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Phê duyệt hợp đồng</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn phê duyệt hợp đồng "
            {selectedContract?.contractName}"?
          </Typography>

          {selectedContract?.approvals &&
            selectedContract.approvals.length > 0 && (
              <Box sx={{ mb: 2, p: 2, bgcolor: "#f0f9ff", borderRadius: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "bold", color: "#1976d2" }}
                >
                  Trạng thái phê duyệt: {selectedContract.approvals.length}/2
                </Typography>
                <List dense>
                  {selectedContract.approvals.map((approval, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${
                          approval.approvedBy?.fullName ||
                          approval.approvedBy?.username ||
                          "N/A"
                        }`}
                        secondary={new Date(approval.approvedAt).toLocaleString(
                          "vi-VN"
                        )}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: "medium",
                        }}
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Typography variant="caption" color="text.secondary">
                  {selectedContract.approvals.length >= 2
                    ? '✅ Hợp đồng sẽ chuyển sang trạng thái "Đã duyệt"'
                    : `⏳ Cần thêm ${
                        2 - selectedContract.approvals.length
                      } phê duyệt nữa`}
                </Typography>
              </Box>
            )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Ghi chú (tùy chọn)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhập ghi chú cho việc phê duyệt..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={confirmApprove}
            variant="contained"
            color="success"
            disabled={approveContractMutation.isLoading}
            startIcon={<CheckIcon />}
          >
            {approveContractMutation.isLoading ? "Đang xử lý..." : "Phê duyệt"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={rejectionDialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Từ chối hợp đồng</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn từ chối hợp đồng "
            {selectedContract?.contractName}"?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Lý do từ chối *"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhập lý do từ chối hợp đồng..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={confirmReject}
            variant="contained"
            color="error"
            disabled={rejectContractMutation.isLoading || !comment.trim()}
            startIcon={<CloseIcon />}
          >
            {rejectContractMutation.isLoading ? "Đang xử lý..." : "Từ chối"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contract Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết hợp đồng</DialogTitle>
        <DialogContent dividers>
          {selectedContract && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Số hợp đồng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {selectedContract.contractNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tên hợp đồng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {selectedContract.contractName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Nhà thầu
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {selectedContract.contractor}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Loại hợp đồng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {selectedContract.contractType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Giá trị hợp đồng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(selectedContract.contractValue)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phòng ban
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {selectedContract.department}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Người phụ trách
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {selectedContract.responsiblePerson}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày bắt đầu
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {new Date(selectedContract.startDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày kết thúc
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {new Date(selectedContract.endDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Thời gian thực hiện
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {selectedContract.duration} ngày
                  </Typography>
                </Grid>
              </Grid>
              {selectedContract.description && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Mô tả
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                  >
                    {selectedContract.description}
                  </Typography>
                </Box>
              )}

              {/* Approval Progress */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tiến trình phê duyệt
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {(() => {
                  // Find the latest version of the selected contract from the query data
                  const currentContract =
                    contracts.find((c) => c._id === selectedContract._id) ||
                    selectedContract;
                  const requiredApprovals = 2;
                  const approvals = currentContract.approvals || [];
                  const progress = (approvals.length / requiredApprovals) * 100;

                  return (
                    <>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Box sx={{ width: "100%", mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >{`${approvals.length}/${requiredApprovals}`}</Typography>
                        </Box>
                      </Box>
                      <List dense>
                        {approvals.length > 0 ? (
                          approvals.map((approval, index) => (
                            <ListItem key={index} sx={{ pl: 0 }}>
                              <ListItemIcon>
                                <CheckCircleIcon color="success" />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      component="span"
                                      sx={{ fontWeight: "medium" }}
                                    >
                                      {approval.approvedBy?.fullName ||
                                        approval.approvedBy?.username ||
                                        "N/A"}
                                    </Typography>
                                    <Chip
                                      label={
                                        approval.approvedBy?.role?.toUpperCase() ||
                                        "N/A"
                                      }
                                      size="small"
                                      sx={{
                                        ml: 1,
                                        height: "20px",
                                        fontSize: "0.7rem",
                                      }}
                                      color={
                                        approval.approvedBy?.role === "admin"
                                          ? "error"
                                          : "primary"
                                      }
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      component="div"
                                    >
                                      Đã duyệt vào{" "}
                                      {new Date(
                                        approval.approvedAt
                                      ).toLocaleString("vi-VN")}
                                    </Typography>
                                    {approval.comment && (
                                      <Typography
                                        variant="caption"
                                        component="div"
                                        sx={{
                                          fontStyle: "italic",
                                          color: "text.secondary",
                                        }}
                                      >
                                        Ghi chú: {approval.comment}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Chưa có phê duyệt nào.
                          </Typography>
                        )}
                      </List>
                    </>
                  );
                })()}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Blockchain Progress Notification */}
      <BlockchainProgressNotification
        show={showBlockchainProgress}
        message={blockchainMessage}
        onClose={() => setShowBlockchainProgress(false)}
      />
    </Box>
  );
};

export default Approval;
