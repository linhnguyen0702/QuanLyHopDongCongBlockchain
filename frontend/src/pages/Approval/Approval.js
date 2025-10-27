import React, { useState } from 'react';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { contractAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'draft': return 'default';
      case 'active': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      case 'draft': return 'Nháp';
      case 'active': return 'Đang hoạt động';
      default: return status;
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
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatusChip status={contract.status} />
            <IconButton onClick={(e) => onMenuClick(e, contract)}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {contract.createdBy?.fullName || contract.createdBy?.username}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Approval = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [comment, setComment] = useState('');

  const queryClient = useQueryClient();
  const { isManager } = useAuth();

  const { data: contractsData, isLoading } = useQuery(
    ['contracts-approval', { search: searchTerm, status: statusFilter }],
    () => {
      const params = {
        search: searchTerm,
        page: 1,
        limit: 50,
      };
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      return contractAPI.getContracts(params);
    },
    {
      keepPreviousData: true,
    }
  );

  const approveContractMutation = useMutation(
    ({ contractId, comment }) => contractAPI.approveContract(contractId, comment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contracts-approval');
        queryClient.invalidateQueries('contracts');
        toast.success('Phê duyệt hợp đồng thành công!');
        setApprovalDialogOpen(false);
        setComment('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Phê duyệt hợp đồng thất bại!');
      },
    }
  );

  const rejectContractMutation = useMutation(
    ({ contractId, comment }) => contractAPI.rejectContract(contractId, comment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contracts-approval');
        queryClient.invalidateQueries('contracts');
        toast.success('Từ chối hợp đồng thành công!');
        setRejectionDialogOpen(false);
        setComment('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Từ chối hợp đồng thất bại!');
      },
    }
  );

  const handleMenuClick = (event, contract) => {
    setAnchorEl(event.currentTarget);
    setSelectedContract(contract);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContract(null);
  };

  const handleView = () => {
    // Implement view functionality
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

  const confirmApprove = () => {
    approveContractMutation.mutate({
      contractId: selectedContract._id,
      comment: comment
    });
  };

  const confirmReject = () => {
    rejectContractMutation.mutate({
      contractId: selectedContract._id,
      comment: comment
    });
  };

  if (!isManager) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Phê duyệt hợp đồng
        </Typography>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ApprovalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
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
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
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
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel 
                  sx={{
                    fontSize: '0.7rem',
                    color: '#6b7280',
                    fontWeight: 400,
                    '&.Mui-focused': {
                      color: '#6b7280'
                    },
                    '&.MuiInputLabel-shrink': {
                      transform: 'translate(14px, -8px) scale(1)',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '-12px',
                        right: '-12px',
                        height: '1px',
                        backgroundColor: '#e5e7eb',
                        zIndex: -1
                      }
                    }
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
                  setSearchTerm('');
                  setStatusFilter('all');
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
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
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
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {contracts.filter(c => c.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chờ duyệt
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {contracts.filter(c => c.status === 'approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã duyệt
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {contracts.filter(c => c.status === 'rejected').length}
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
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ApprovalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
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
        {selectedContract?.status === 'pending' && (
          <>
            <MenuItem onClick={handleApprove}>
              <CheckIcon sx={{ mr: 1 }} />
              Phê duyệt
            </MenuItem>
            <MenuItem onClick={handleReject} sx={{ color: 'error.main' }}>
              <CloseIcon sx={{ mr: 1 }} />
              Từ chối
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Phê duyệt hợp đồng</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn phê duyệt hợp đồng "{selectedContract?.contractName}"?
          </Typography>
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
            {approveContractMutation.isLoading ? 'Đang xử lý...' : 'Phê duyệt'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Từ chối hợp đồng</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn từ chối hợp đồng "{selectedContract?.contractName}"?
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
            {rejectContractMutation.isLoading ? 'Đang xử lý...' : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Approval;
