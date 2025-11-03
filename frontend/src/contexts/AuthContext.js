import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpUserId, setOtpUserId] = useState(null); // State for 2FA
  const [loginStep, setLoginStep] = useState("login"); // Track login step: 'login' or 'otp'

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authAPI.getProfile();
      setUser(response.data.data.user);
      setLoading(false);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);

      // Check if 2FA is required
      if (response.data.status === "2fa_required") {
        setOtpUserId(response.data.data.userId);
        setLoginStep("otp"); // Set step to OTP
        toast.success(
          response.data.message || "Vui lòng kiểm tra email để lấy mã OTP"
        );
        setLoading(false);
        return { twoFactorRequired: true };
      }

      // Normal successful login
      if (response.data.status === "success" && response.data.data.token) {
        const { user, token } = response.data.data;
        localStorage.setItem("token", token);
        setUser(user);
        setLoginStep("login"); // Reset step after successful login
        toast.success("Đăng nhập thành công!");
        setLoading(false);
        return { success: true };
      }

      // Fallback for unexpected response
      throw new Error("Invalid response from server");
    } catch (error) {
      console.error("Login error:", error);

      let message = "Đăng nhập thất bại";
      if (error.response?.data) {
        if (
          error.response.data.details &&
          Array.isArray(error.response.data.details)
        ) {
          message = error.response.data.details.join(", ");
        } else if (error.response.data.message) {
          message = error.response.data.message;
        } else if (error.response.data.error) {
          message = error.response.data.error;
        }
      }

      toast.error(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  const verifyLoginOtp = async (otpCode) => {
    if (!otpUserId) {
      toast.error("Lỗi: Không tìm thấy mã người dùng để xác thực OTP.");
      return { success: false, error: "User ID for OTP is missing" };
    }

    try {
      setLoading(true);
      const response = await authAPI.verifyOtp(otpUserId, otpCode);

      const { user, token } = response.data.data;
      localStorage.setItem("token", token);
      setUser(user);
      setOtpUserId(null); // Clear OTP user ID
      setLoginStep("login"); // Reset step after successful login

      toast.success("Đăng nhập thành công!");
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error("Verify OTP error:", error);
      const message = error.response?.data?.message || "Xác thực OTP thất bại";
      toast.error(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setLoginStep("login"); // Reset login step
      setOtpUserId(null); // Clear OTP user ID
      toast.success("Đăng xuất thành công!");
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data.data.user);
      toast.success("Cập nhật thông tin thành công!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Cập nhật thất bại";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success("Đổi mật khẩu thành công!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Đổi mật khẩu thất bại";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    verifyLoginOtp,
    logout,
    updateProfile,
    changePassword,
    otpUserId, // Expose otpUserId
    loginStep, // Expose login step
    setLoginStep, // Expose setter
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isManager: ["admin", "manager"].includes(user?.role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
