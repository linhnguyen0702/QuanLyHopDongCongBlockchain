import React, { createContext, useContext, useEffect } from "react";
import { useQuery } from "react-query";
import i18n from "../i18n"; // Import the i18n instance directly
import { settingsAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

const defaultSettings = {
  language: "vi",
  timezone: "Asia/Ho_Chi_Minh",
  dateFormat: "DD/MM/YYYY",
  currency: "VND",
};

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();

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

  const { data: settings } = useQuery(
    "systemSettings",
    settingsAPI.getSettings,
    {
      enabled: !!user,
      select: (data) => data.data.settings,
      staleTime: Infinity, // Never refetch
      cacheTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      onSuccess: (data) => {
        // Save to localStorage
        try {
          localStorage.setItem("systemSettings", JSON.stringify(data));
          setCachedSettings(data);
        } catch (error) {
          console.error("Error saving settings:", error);
        }
      },
    }
  );

  const activeSettings = settings || cachedSettings || defaultSettings;

  useEffect(() => {
    if (activeSettings.language && i18n.language !== activeSettings.language) {
      i18n.changeLanguage(activeSettings.language);
    }
  }, [activeSettings.language]);

  const formatDate = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    const options = { timeZone: activeSettings.timezone };

    switch (activeSettings.dateFormat) {
      case "MM/DD/YYYY":
        return date.toLocaleDateString("en-US", {
          ...options,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      case "YYYY-MM-DD":
        return date.toLocaleDateString("en-CA", options);
      case "DD/MM/YYYY":
      default:
        return date.toLocaleDateString("vi-VN", options);
    }
  };

  const formatCurrency = (value) => {
    if (typeof value !== "number") return "";
    const locale = activeSettings.language === "vi" ? "vi-VN" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: activeSettings.currency,
    }).format(value);
  };

  const value = {
    settings: activeSettings,
    formatDate,
    formatCurrency,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
