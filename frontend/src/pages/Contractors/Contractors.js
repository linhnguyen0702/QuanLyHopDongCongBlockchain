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
  Avatar,
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
  Business as BusinessIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { contractorAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'warning';
      case 'blacklisted': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'suspended': return 'Tạm dừng';
      case 'blacklisted': return 'Cấm';
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

const TypeChip = ({ type }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'construction': return 'primary';
      case 'supply': return 'info';
      case 'service': return 'secondary';
      case 'consulting': return 'warning';
      case 'other': return 'default';
      default: return 'default';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'construction': return 'Xây dựng';
      case 'supply': return 'Cung cấp';
      case 'service': return 'Dịch vụ';
      case 'consulting': return 'Tư vấn';
      case 'other': return 'Khác';
      default: return type;
    }
  };

  return (
    <Chip
      label={getTypeText(type)}
      color={getTypeColor(type)}
      size="small"
      variant="outlined"
    />
  );
};

const ContractorCard = ({ contractor, onMenuClick }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <BusinessIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {contractor.contractorName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Mã nhà thầu: {contractor.contractorCode}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Liên hệ: {contractor.contactPerson}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Email: {contractor.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điện thoại: {contractor.phone}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
              <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography variant="body2" color="text.secondary">
                {contractor.rating}
              </Typography>
            </Box>
            <TypeChip type={contractor.contractorType} />
            <StatusChip status={contractor.status} />
            <IconButton onClick={(e) => onMenuClick(e, contractor)}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
        {contractor.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {contractor.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const Contractors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isManager } = useAuth();

  const { data: contractorsData, isLoading } = useQuery(
    ['contractors', { search: searchTerm, status: statusFilter, contractorType: typeFilter }],
    () => contractorAPI.getContractors({
      search: searchTerm,
      status: statusFilter,
      contractorType: typeFilter,
      page: 1,
      limit: 50,
    }),
    {
      keepPreviousData: true,
    }
  );

  const deleteContractorMutation = useMutation(
    (contractorId) => contractorAPI.deleteContractor(contractorId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contractors');
        toast.success('Xóa nhà thầu thành công!');
        setDeleteDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa nhà thầu thất bại!');
      },
    }
  );

  const activateContractorMutation = useMutation(
    (contractorId) => contractorAPI.activateContractor(contractorId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contractors');
        toast.success('Kích hoạt nhà thầu thành công!');
        handleMenuClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Kích hoạt nhà thầu thất bại!');
      },
    }
  );


  const handleMenuClick = (event, contractor) => {
    setAnchorEl(event.currentTarget);
    setSelectedContractor(contractor);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContractor(null);
  };

  const handleView = () => {
    navigate(`/contractors/${selectedContractor._id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/contractors/${selectedContractor._id}/edit`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    deleteContractorMutation.mutate(selectedContractor._id);
  };

  const handleActivate = () => {
    activateContractorMutation.mutate(selectedContractor._id);
  };

  if (isLoading) return <LoadingSpinner />;

  const contractors = contractorsData?.data?.data?.contractors || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Quản lý nhà thầu
        </Typography>
        {isManager && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/contractors/create')}
          >
            Thêm nhà thầu
          </Button>
        )}
      </Box>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm nhà thầu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
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
                    fontSize: '0.89rem',
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
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="blacklisted">Cấm</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Loại nhà thầu"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
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
                    fontSize: '0.88rem',
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
                <option value="construction">Xây dựng</option>
                <option value="supply">Cung cấp</option>
                <option value="service">Dịch vụ</option>
                <option value="consulting">Tư vấn</option>
                <option value="other">Khác</option>
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
                  setTypeFilter('');
                }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contractors List */}
      {contractors.length > 0 ? (
        <Box>
          {contractors.map((contractor) => (
            <ContractorCard
              key={contractor._id}
              contractor={contractor}
              onMenuClick={handleMenuClick}
            />
          ))}
        </Box>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy nhà thầu nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Hãy thử thay đổi bộ lọc hoặc thêm nhà thầu mới
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
        {isManager && (
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} />
            Chỉnh sửa
          </MenuItem>
        )}
        {isManager && selectedContractor?.status === 'inactive' && (
          <MenuItem onClick={handleActivate}>
            <CheckIcon sx={{ mr: 1 }} />
            Kích hoạt
          </MenuItem>
        )}
        {isManager && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Xóa
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa nhà thầu "{selectedContractor?.contractorName}"?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteContractorMutation.isLoading}
          >
            {deleteContractorMutation.isLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contractors;
