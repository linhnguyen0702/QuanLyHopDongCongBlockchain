import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { contractAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'active': return 'info';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Nháp';
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'active': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Hủy bỏ';
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
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {contract.contractName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Số hợp đồng: {contract.contractNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Nhà thầu: {contract.contractor}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
      </CardContent>
    </Card>
  );
};

const Contracts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isManager } = useAuth();

  const { data: contractsData, isLoading } = useQuery(
    ['contracts', { search: searchTerm, status: statusFilter }],
    () => contractAPI.getContracts({
      search: searchTerm,
      status: statusFilter,
      page: 1,
      limit: 50,
    }),
    {
      keepPreviousData: true,
    }
  );

  const deleteContractMutation = useMutation(
    (contractId) => contractAPI.deleteContract(contractId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contracts');
        toast.success('Xóa hợp đồng thành công!');
        setDeleteDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa hợp đồng thất bại!');
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
    navigate(`/contracts/${selectedContract._id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/contracts/${selectedContract._id}/edit`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    deleteContractMutation.mutate(selectedContract._id);
  };

  const handleApprove = () => {
    // Implement approve functionality
    handleMenuClose();
  };

  if (isLoading) return <LoadingSpinner />;

  const contracts = contractsData?.data?.data?.contracts || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Quản lý hợp đồng
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/contracts/create')}
        >
          Tạo hợp đồng mới
        </Button>
      </Box>

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
              <TextField
                fullWidth
                select
                label="Trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                SelectProps={{ 
                  native: true,
                  MenuProps: {
                    anchorOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                  }
                }}
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    position: 'absolute',
                    
                    backgroundColor: 'white',
                    padding: '0 4px',
                    fontSize: '0.99rem',
                    color: '#6b7280',
                    fontWeight: 400,
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
                <option value="">Tất cả</option>
                <option value="draft">Nháp</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="active">Đang thực hiện</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Hủy bỏ</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy hợp đồng nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Hãy thử thay đổi bộ lọc hoặc tạo hợp đồng mới
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
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        {isManager && selectedContract?.status === 'pending' && (
          <MenuItem onClick={handleApprove}>
            <CheckIcon sx={{ mr: 1 }} />
            Phê duyệt
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa hợp đồng "{selectedContract?.contractName}"?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteContractMutation.isLoading}
          >
            {deleteContractMutation.isLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contracts;
