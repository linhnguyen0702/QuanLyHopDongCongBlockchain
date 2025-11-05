import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import { Toaster } from "react-hot-toast";
import { useQuery } from "react-query";
import { settingsAPI } from "./services/api";

import { useAuth } from "./contexts/AuthContext";
import { BlockchainProvider } from "./contexts/BlockchainContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Contracts from "./pages/Contracts/Contracts";
import ContractDetail from "./pages/Contracts/ContractDetail";
import CreateContract from "./pages/Contracts/CreateContract";
import EditContract from "./pages/Contracts/EditContract";
import Users from "./pages/Users/Users";
import CreateUser from "./pages/Users/CreateUser";
import EditUser from "./pages/Users/EditUser";
import Reports from "./pages/Reports/Reports";
import Profile from "./pages/Profile/Profile";
import Contractors from "./pages/Contractors/Contractors";
import CreateContractor from "./pages/Contractors/CreateContractor";
import EditContractor from "./pages/Contractors/EditContractor";
import ContractorDetail from "./pages/Contractors/ContractorDetail";
import Audit from "./pages/Audit/Audit";
import Security from "./pages/Security/Security";
import Settings from "./pages/Settings/Settings";
import Approval from "./pages/Approval/Approval";
import LoadingSpinner from "./components/Common/LoadingSpinner";

// --- 1. Enhanced Theme Generation ---
const generateTheme = (settings) => {
  const compactMode = settings.compactMode || false;
  const getFontSize = () => {
    switch (settings.fontSize) {
      case "small":
        return "0.8rem";
      case "large":
        return "1rem";
      default:
        return "0.875rem"; // medium
    }
  };

  const baseThemeOptions = {
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      body1: { fontSize: getFontSize() },
      body2: { fontSize: `calc(${getFontSize()} * 0.875)` },
      button: { fontWeight: 600, textTransform: "none" },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        defaultProps: { size: compactMode ? "small" : "medium" },
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiTextField: {
        defaultProps: { size: compactMode ? "small" : "medium" },
        styleOverrides: {
          root: { "& .MuiOutlinedInput-root": { borderRadius: 8 } },
        },
      },
      MuiSelect: {
        defaultProps: { size: compactMode ? "small" : "medium" },
      },
      MuiFormControl: {
        defaultProps: { size: compactMode ? "small" : "medium" },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } },
      },
    },
  };

  const paletteOptions = {
    light: {
      mode: "light",
      primary: { main: settings.primaryColor || "#7c3aed" },
      background: { default: "#f8fafc", paper: "#ffffff" },
      text: { primary: "#1f2937", secondary: "#6b7280" },
    },
    dark: {
      mode: "dark",
      primary: { main: settings.primaryColor || "#7c3aed" },
      background: { default: "#111827", paper: "#1f2937" },
      text: { primary: "#f9fafb", secondary: "#9ca3af" },
    },
  };

  const finalPalette = paletteOptions[settings.theme] || paletteOptions.light;
  return createTheme({ ...baseThemeOptions, palette: finalPalette });
};

// --- 2. Dynamic Theme Provider Component ---
const DynamicThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const { data: settings } = useQuery(
    "systemSettings",
    settingsAPI.getSettings,
    {
      enabled: !!user,
      select: (data) => data.data.settings,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const defaultSettings = {
    theme: "light",
    primaryColor: "#7c3aed",
    fontSize: "medium",
    compactMode: false,
  };

  const activeSettings = settings || defaultSettings;

  // Determine the effective theme mode
  const effectiveTheme =
    activeSettings.theme === "auto"
      ? prefersDarkMode
        ? "dark"
        : "light"
      : activeSettings.theme;

  const theme = generateTheme({ ...activeSettings, theme: effectiveTheme });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

// --- Protected Route Components (unchanged) ---
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const ManagerRoute = ({ children }) => {
  const { user, loading, isManager } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/dashboard" replace />;
  if (!isManager) return <Navigate to="/dashboard" replace />;
  return children;
};

// --- Main App Component ---
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <DynamicThemeProvider>
      <SettingsProvider>
        <BlockchainProvider>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Routes>
              <Route
                path="/login"
                element={
                  user ? <Navigate to="/dashboard" replace /> : <Login />
                }
              />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to="/dashboard" replace />}
                        />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/contracts" element={<Contracts />} />
                        <Route
                          path="/contracts/create"
                          element={<CreateContract />}
                        />
                        <Route
                          path="/contracts/:id"
                          element={<ContractDetail />}
                        />
                        <Route
                          path="/contracts/:id/edit"
                          element={<EditContract />}
                        />
                        <Route
                          path="/approval"
                          element={
                            <ManagerRoute>
                              <Approval />
                            </ManagerRoute>
                          }
                        />
                        <Route
                          path="/users"
                          element={
                            <AdminRoute>
                              <Users />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="/users/create"
                          element={
                            <AdminRoute>
                              <CreateUser />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="/users/:id/edit"
                          element={
                            <AdminRoute>
                              <EditUser />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="/reports"
                          element={
                            <ManagerRoute>
                              <Reports />
                            </ManagerRoute>
                          }
                        />
                        <Route path="/contractors" element={<Contractors />} />
                        <Route
                          path="/contractors/create"
                          element={<CreateContractor />}
                        />
                        <Route
                          path="/contractors/:id"
                          element={<ContractorDetail />}
                        />
                        <Route
                          path="/contractors/:id/edit"
                          element={<EditContractor />}
                        />
                        <Route path="/audit" element={<Audit />} />
                        <Route path="/security" element={<Security />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route
                          path="*"
                          element={<Navigate to="/dashboard" replace />}
                        />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster position="top-right" />
          </Box>
        </BlockchainProvider>
      </SettingsProvider>
    </DynamicThemeProvider>
  );
}

export default App;
