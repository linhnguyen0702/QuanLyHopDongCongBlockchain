import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as ContractIcon,
  People as PeopleIcon,
  Assessment as ReportIcon,
  AccountCircle as ProfileIcon,
  Notifications as NotificationIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  ChevronLeft as ChevronLeftIcon,
  Shield as ShieldIcon,
  Approval as ApprovalIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { useAuth } from "../../contexts/AuthContext";
import WalletConnect from "../Blockchain/WalletConnect";

const drawerWidth = 280;

const Layout = ({ children }) => {
  const { t } = useTranslation(); // Initialize translation hook
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isManager } = useAuth();

  // Move menuItems inside the component to access the 't' function
  const menuItems = [
    { key: "sidebar.dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { key: "sidebar.contracts", icon: <ContractIcon />, path: "/contracts" },
    {
      key: "sidebar.approval",
      icon: <ApprovalIcon />,
      path: "/approval",
      managerOnly: true,
    },
    {
      key: "sidebar.contractors",
      icon: <BusinessIcon />,
      path: "/contractors",
    },
    {
      key: "sidebar.reports",
      icon: <ReportIcon />,
      path: "/reports",
      managerOnly: true,
    },
    {
      key: "sidebar.audit",
      icon: <HistoryIcon />,
      path: "/audit",
      managerOnly: true,
    },
    {
      key: "sidebar.users",
      icon: <PeopleIcon />,
      path: "/users",
      adminOnly: true,
    },
    {
      key: "sidebar.security",
      icon: <SecurityIcon />,
      path: "/security",
      adminOnly: true,
    },
    { key: "sidebar.settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleProfileMenuClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.managerOnly && !isManager) return false;
    return true;
  });

  const actualDrawerWidth = collapsed ? 80 : drawerWidth;

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: collapsed ? 2 : 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {!collapsed && (
          <Box
            onClick={() => navigate("/dashboard")}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              transition: "opacity 0.2s",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
              }}
            >
              <ShieldIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "text.primary" }}
              >
                Quản lý HĐ
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Blockchain System
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && (
          <Box
            onClick={() => navigate("/dashboard")}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              cursor: "pointer",
              transition: "opacity 0.2s",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            <ShieldIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
        )}
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          sx={{
            color: "text.secondary",
            display: collapsed ? "none" : "flex",
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        {collapsed && (
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            size="small"
            sx={{
              color: "text.secondary",
              position: "absolute",
              right: 0,
              top: 8,
            }}
          >
            <ChevronLeftIcon sx={{ transform: "rotate(180deg)" }} />
          </IconButton>
        )}
      </Box>

      {!collapsed && <Divider />}

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", mt: 1 }}>
        <List sx={{ px: collapsed ? 0.5 : 1, py: 1 }}>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: collapsed ? 0.5 : 1,
                  justifyContent: collapsed ? "center" : "flex-start",
                  minHeight: 48,
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText primary={t(item.key)} sx={{ ml: 2 }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {!collapsed && <Divider />}

      {/* User Info */}
      <Box sx={{ p: collapsed ? 1 : 2, mt: "auto", cursor: "pointer" }}>
        <Box
          onClick={() => navigate("/profile")}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            p: 1,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <Avatar
            src={
              user?.avatar ? `http://localhost:5000/${user.avatar}` : undefined
            }
            sx={{
              width: collapsed ? 40 : 32,
              height: collapsed ? 40 : 32,
              bgcolor: "primary.main",
              mr: collapsed ? 0 : 2,
            }}
          >
            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
          </Avatar>
          {!collapsed && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                {user?.fullName || "Admin User"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {user?.email || "admin@gov.vn"}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${actualDrawerWidth}px)` },
          left: { sm: `${actualDrawerWidth}px` },
          backgroundColor: "white",
          color: "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Search Bar */}
            <TextField
              placeholder="Tìm kiếm hợp đồng, nhà thầu..."
              variant="outlined"
              size="small"
              sx={{
                minWidth: 300,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "grey.50",
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: "grey.300",
                  },
                  "&:hover fieldset": {
                    borderColor: "grey.400",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Wallet Connect */}
            <Box sx={{ mr: 2 }}>
              <WalletConnect />
            </Box>

            {/* Notifications */}
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={3} color="error">
                <NotificationIcon sx={{ color: "text.secondary" }} />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {user?.fullName || user?.username || "User"}
              </Typography>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="primary-search-account-menu"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar
                  src={
                    user?.avatar
                      ? `http://localhost:5000/${user.avatar}`
                      : undefined
                  }
                  sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                >
                  {user?.fullName?.charAt(0)?.toUpperCase() ||
                    user?.username?.charAt(0)?.toUpperCase() ||
                    "U"}
                </Avatar>
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
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
        <MenuItem
          onClick={() => {
            navigate("/profile");
            handleProfileMenuClose();
          }}
        >
          <ListItemIcon>
            <ProfileIcon fontSize="small" />
          </ListItemIcon>
          Thông tin cá nhân
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/settings");
            handleProfileMenuClose();
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Cài đặt
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{
          width: { sm: actualDrawerWidth },
          flexShrink: { sm: 0 },
          position: "relative",
        }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: actualDrawerWidth,
              transition: "width 0.3s ease",
              border: "none",
              borderRight: "1px solid",
              borderRightColor: "divider",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${actualDrawerWidth}px)` },
          mt: 8,
          backgroundColor: "grey.50",
          minHeight: "calc(100vh - 64px)",
          transition: "width 0.3s ease, margin-left 0.3s ease",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
