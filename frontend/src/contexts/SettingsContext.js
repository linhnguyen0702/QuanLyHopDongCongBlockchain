import React, { createContext, useContext, useEffect } from 'react';
import { useQuery } from 'react-query';
import i18n from '../i18n'; // Import the i18n instance directly
import { settingsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const defaultSettings = {
  language: 'vi',
  timezone: 'Asia/Ho_Chi_Minh',
  dateFormat: 'DD/MM/YYYY',
  currency: 'VND',
};

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();

  const { data: settings } = useQuery(
    'systemSettings',
    settingsAPI.getSettings,
    {
      enabled: !!user,
      select: (data) => data.data.settings,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const activeSettings = settings || defaultSettings;

  useEffect(() => {
    if (activeSettings.language && i18n.language !== activeSettings.language) {
      i18n.changeLanguage(activeSettings.language);
    }
  }, [activeSettings.language]);

  const formatDate = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const options = { timeZone: activeSettings.timezone };

    switch (activeSettings.dateFormat) {
      case 'MM/DD/YYYY':
        return date.toLocaleDateString('en-US', { ...options, year: 'numeric', month: '2-digit', day: '2-digit' });
      case 'YYYY-MM-DD':
        return date.toLocaleDateString('en-CA', options);
      case 'DD/MM/YYYY':
      default:
        return date.toLocaleDateString('vi-VN', options);
    }
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '';
    const locale = activeSettings.language === 'vi' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
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