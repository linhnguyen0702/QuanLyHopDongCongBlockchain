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
      h1: { fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.2 },
      h2: { fontWeight: 700, fontSize: "2rem", lineHeight: 1.3 },
      h3: { fontWeight: 700, fontSize: "1.75rem", lineHeight: 1.3 },
      h4: { fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.4 },
      h5: { fontWeight: 700, fontSize: "1.25rem", lineHeight: 1.4 },
      h6: { fontWeight: 600, fontSize: "1rem", lineHeight: 1.5 },
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
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none", // Remove default gradient in dark mode
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
          },
        },
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
      primary: {
        main: settings.primaryColor || "#a855f7",
        light: "#c084fc",
        dark: "#7c3aed",
      },
      secondary: {
        main: "#818cf8",
        light: "#a5b4fc",
        dark: "#6366f1",
      },
      background: {
        default: "#111827",
        paper: "#1f2937",
      },
      text: {
        primary: "#f9fafb",
        secondary: "#9ca3af",
      },
      divider: "rgba(255, 255, 255, 0.12)",
      action: {
        active: "#fff",
        hover: "rgba(255, 255, 255, 0.08)",
        selected: "rgba(255, 255, 255, 0.16)",
        disabled: "rgba(255, 255, 255, 0.3)",
        disabledBackground: "rgba(255, 255, 255, 0.12)",
      },
    },
  };

  const finalPalette = paletteOptions[settings.theme] || paletteOptions.light;
  return createTheme({ ...baseThemeOptions, palette: finalPalette });
};

// --- 2. Dynamic Theme Provider Component ---
const DynamicThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // Load settings from localStorage first
  const [cachedSettings, setCachedSettings] = React.useState(() => {
    try {
      const saved = localStorage.getItem("systemSettings");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error loading cached settings:", error);
      return null;
    }
  });

  // Check for preview settings (when editing)
  const [previewSettings, setPreviewSettings] = React.useState(null);

  React.useEffect(() => {
    const checkPreview = () => {
      try {
        const preview = localStorage.getItem("systemSettings_preview");
        if (preview) {
          setPreviewSettings(JSON.parse(preview));
        } else {
          setPreviewSettings(null);
        }
      } catch (error) {
        console.error("Error loading preview settings:", error);
      }
    };

    const handleSettingsUpdate = () => {
      // When settings are saved, reload from localStorage
      try {
        const saved = localStorage.getItem("systemSettings");
        if (saved) {
          setCachedSettings(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error reloading settings:", error);
      }
      checkPreview();
    };

    // Check immediately
    checkPreview();

    // Listen for settings updates
    window.addEventListener("settingsUpdated", handleSettingsUpdate);

    // Check periodically for preview changes
    const interval = setInterval(checkPreview, 500);

    return () => {
      clearInterval(interval);
      window.removeEventListener("settingsUpdated", handleSettingsUpdate);
    };
  }, []);

  const { data: settings } = useQuery(
    "systemSettings",
    settingsAPI.getSettings,
    {
      enabled: !!user,
      select: (data) => data.data.settings,
      staleTime: Infinity, // Never consider data stale
      cacheTime: Infinity, // Keep in cache forever
      refetchOnMount: false, // Don't refetch on component mount
      refetchOnWindowFocus: false, // Don't refetch on window focus to prevent reset
      refetchOnReconnect: false, // Don't refetch on reconnect
      refetchInterval: false, // Disable auto refetch to prevent reset
      retry: 1,
      onSuccess: (data) => {
        // Only save to localStorage if there's no preview active
        const hasPreview = localStorage.getItem("systemSettings_preview");
        if (!hasPreview) {
          try {
            localStorage.setItem("systemSettings", JSON.stringify(data));
            setCachedSettings(data);
          } catch (error) {
            console.error("Error saving settings to localStorage:", error);
          }
        }
      },
    }
  );

  const defaultSettings = {
    theme: "light",
    primaryColor: "#7c3aed",
    fontSize: "medium",
    compactMode: false,
  };

  // Use preview if editing, otherwise use cached or fetched settings
  const activeSettings =
    previewSettings || settings || cachedSettings || defaultSettings;

  // Debug log
  React.useEffect(() => {
    console.log("📊 Settings state:", {
      hasPreview: !!previewSettings,
      hasSettings: !!settings,
      hasCached: !!cachedSettings,
      active: activeSettings,
    });
  }, [previewSettings, settings, cachedSettings, activeSettings]);

  // Determine the effective theme mode
  const effectiveTheme =
    activeSettings.theme === "auto"
      ? prefersDarkMode
        ? "dark"
        : "light"
      : activeSettings.theme;

  // Debug: Log theme changes
  React.useEffect(() => {
    console.log("🎨 Theme settings:", {
      activeTheme: activeSettings.theme,
      effectiveTheme,
      primaryColor: activeSettings.primaryColor,
    });
  }, [activeSettings.theme, effectiveTheme, activeSettings.primaryColor]);

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
