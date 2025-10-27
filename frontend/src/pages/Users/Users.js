import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Chip,
  Avatar,
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
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const RoleChip = ({ role }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'user': return 'info';
      default: return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Quản lý';
      case 'user': return 'Người dùng';
      default: return role;
    }
  };

  return (
    <Chip
      label={getRoleText(role)}
      color={getRoleColor(role)}
      size="small"
    />
  );
};

const UserCard = ({ user, onMenuClick }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {user.fullName || user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phòng ban: {user.department || 'Chưa xác định'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RoleChip role={user.role} />
            <IconButton onClick={(e) => onMenuClick(e, user)}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Users = () => {
  console.log('🚀 Users component is rendering...');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();
  
  // Debug logs (có thể xóa sau khi ổn định)
  console.log('🔐 Auth info:', { currentUser: currentUser?.email, isAdmin });

  const { data: usersResponseRaw, isLoading, error, refetch } = useQuery(
    'users',
    () => userAPI.getUsers({
      search: searchTerm,
      role: roleFilter,
      _t: Date.now(), // Thêm timestamp để bypass cache
    }),
    {
      refetchOnWindowFocus: true,
      // enabled: isAdmin, // Tạm thời bỏ để debug
      staleTime: 0, // Luôn coi data là stale để force refetch
      cacheTime: 0, // Không cache data
    }
  );
  
  const usersData = usersResponseRaw?.data;
  const users = usersData?.data?.users || []; // Sửa lỗi parsing - users nằm ở data.data.users

  // Debug logs (có thể xóa sau khi ổn định)
  console.log('📊 Users loaded:', { usersLength: users.length, isAdmin });

  const deleteUserMutation = useMutation(
    (userId) => userAPI.deleteUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Xóa người dùng thành công!');
        setDeleteDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa người dùng thất bại!');
      },
    }
  );

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEdit = () => {
    navigate(`/users/${selectedUser._id}/edit`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    deleteUserMutation.mutate(selectedUser._id);
  };

  if (isLoading) {
    console.log('⏳ Loading users...');
    return <LoadingSpinner />;
  }

  // Kiểm tra quyền admin
  if (!isAdmin) {
    return (
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
          Quản lý người dùng
        </Typography>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>
              Không có quyền truy cập
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Chỉ quản trị viên mới có thể truy cập trang này.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Liên hệ quản trị viên để được cấp quyền truy cập.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  console.log('📊 Users data:', { usersData, usersLength: users.length });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Quản lý người dùng ({users.length} người dùng)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Làm mới
          </Button>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/users/create')}
            >
              Thêm người dùng
            </Button>
          )}
        </Box>
      </Box>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm người dùng..."
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
                label="Vai trò"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
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
                <option value="admin">Quản trị viên</option>
                <option value="manager">Quản lý</option>
                <option value="user">Người dùng</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>


      {/* Error Display */}
      {error && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography color="error" variant="h6" sx={{ mb: 1 }}>
              Lỗi tải dữ liệu
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {error.response?.status === 403 
                ? 'Bạn không có quyền truy cập trang này. Chỉ quản trị viên mới có thể xem danh sách người dùng.'
                : error.response?.status === 401
                ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
                : error.message || 'Có lỗi xảy ra khi tải dữ liệu'}
            </Typography>
            {error.response?.status === 403 && (
              <Typography variant="body2" color="text.secondary">
                Liên hệ quản trị viên để được cấp quyền truy cập.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      {(() => {
        console.log('🎨 Render Debug:', {
          'users.length': users.length,
          'users.length > 0': users.length > 0,
          'users array': users,
          'will render users list': users.length > 0,
          'will render no users message': users.length === 0
        });
        
        return users.length > 0 ? (
          <Box>
            {users.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                onMenuClick={handleMenuClick}
              />
            ))}
          </Box>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Không tìm thấy người dùng nào
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Hãy thử thay đổi bộ lọc hoặc thêm người dùng mới
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                Debug: users.length = {users.length}
              </Typography>
            </CardContent>
          </Card>
        );
      })()}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        {isAdmin && selectedUser?._id !== currentUser?._id && (
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
            Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.fullName || selectedUser?.username}"?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteUserMutation.isLoading}
          >
            {deleteUserMutation.isLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

console.log('📁 Users.js file loaded successfully');

export default Users;
