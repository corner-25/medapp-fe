// src/config/settings.js - Phiên bản Expo đã cập nhật với Railway
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Thông tin về phiên bản ứng dụng
export const APP_VERSION = '1.0.0';
export const API_VERSION = '1.0.0';

// Chế độ ứng dụng
export const APP_MODE = __DEV__ ? 'DEVELOPMENT' : 'PRODUCTION';

// Cấu hình API - SỬA ĐỔI QUAN TRỌNG
// Thay đổi từ localhost sang Railway URL
export const API_BASE_URL = 'https://healthcare-backend-production-124c.up.railway.app';

// Cấu hình debug và logging
export const DEBUG_CONFIG = {
  // Có bật debug không
  ENABLED: __DEV__,
  // Có in thông tin network request không
  NETWORK_LOGS: __DEV__,
};

// Các hằng số khác
export const APP_CONSTANTS = {
  // Maximum number số người thân có thể tạo
  MAX_RELATIVES: 10,
  
  // Số lượng tối đa các mục trong giỏ hàng
  MAX_CART_ITEMS: 20,
  
  // Token storage key
  TOKEN_STORAGE_KEY: 'userToken',
  
  // User Info storage key
  USER_INFO_STORAGE_KEY: 'userInfo',
};

// Cấu hình mặc định của ứng dụng
export const DEFAULT_APP_CONFIG = {
  language: 'vi',
  theme: 'light',
  notificationsEnabled: true,
  locationEnabled: true,
  analyticsEnabled: true,
};

// Lấy cấu hình hiện tại
export const getAppConfig = async () => {
  try {
    const config = await AsyncStorage.getItem('app_config');
    return config ? JSON.parse(config) : DEFAULT_APP_CONFIG;
  } catch (error) {
    console.error('Lỗi khi đọc cấu hình ứng dụng:', error);
    return DEFAULT_APP_CONFIG;
  }
};

// Lưu cấu hình
export const saveAppConfig = async (config) => {
  try {
    await AsyncStorage.setItem('app_config', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu cấu hình ứng dụng:', error);
    return false;
  }
};

// Format tiền tệ
export const formatCurrency = (amount) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default {
  APP_VERSION,
  API_VERSION,
  APP_MODE,
  API_BASE_URL,
  DEBUG_CONFIG,
  APP_CONSTANTS,
  DEFAULT_APP_CONFIG,
  formatCurrency,
  getAppConfig,
  saveAppConfig
};