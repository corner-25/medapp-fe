// src/config/api.js - Phiên bản Expo sửa lỗi
import { API_BASE_URL, DEBUG_CONFIG, APP_CONSTANTS } from './settings';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Xuất debugging cho các request API
const DEBUG_API = DEBUG_CONFIG.NETWORK_LOGS;

// Helper để debug API calls khi cần
const logApiCall = (method, url, data, headers) => {
  if (DEBUG_API) {
    console.log(`🌐 API ${method} Request to: ${url}`);
    if (data) console.log('📦 Request Data:', JSON.stringify(data));
    if (headers) console.log('📋 Headers:', JSON.stringify(headers));
  }
};

// Helper để debug API responses
const logApiResponse = (url, response, data) => {
  if (DEBUG_API) {
    console.log(`✅ Response from ${url}:`, response.status);
    if (data) console.log('📦 Response Data:', JSON.stringify(data));
  }
};

// Helper để debug API errors
const logApiError = (url, error) => {
  console.error(`❌ Error from ${url}:`, error);
};

// Định nghĩa các endpoint API - sử dụng API_BASE_URL từ settings
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  
  // Relatives endpoints
  RELATIVES: `${API_BASE_URL}/api/relatives`,
  RELATIVE_BY_ID: (id) => `${API_BASE_URL}/api/relatives/${id}`,
  
  // Appointments endpoints
  APPOINTMENTS: `${API_BASE_URL}/api/appointments`,
  APPOINTMENT_BY_ID: (id) => `${API_BASE_URL}/api/appointments/${id}`,
  
  // Emergency endpoints
  EMERGENCY: `${API_BASE_URL}/api/emergency`,
  EMERGENCY_BY_ID: (id) => `${API_BASE_URL}/api/emergency/${id}`,
  
  // Medical Records endpoints
  MEDICAL_RECORDS: (relativeId) => `${API_BASE_URL}/api/medical-records/${relativeId}`,
  MEDICAL_RECORD_BY_ID: (id) => `${API_BASE_URL}/api/medical-records/detail/${id}`,
  
  // Vaccines endpoints
  VACCINES: (relativeId) => `${API_BASE_URL}/api/vaccines/${relativeId}`,
  VACCINE_BY_ID: (id) => `${API_BASE_URL}/api/vaccines/${id}`,
  
  // Allergies endpoints
  ALLERGIES: (relativeId) => `${API_BASE_URL}/api/allergies/${relativeId}`,
  ALLERGY_BY_ID: (id) => `${API_BASE_URL}/api/allergies/${id}`,
  
  // Analyses endpoints
  ANALYSES: (relativeId) => `${API_BASE_URL}/api/analyses/${relativeId}`,
  ANALYSIS_BY_ID: (id) => `${API_BASE_URL}/api/analyses/detail/${id}`,

  // Cart endpoints
  CART: `${API_BASE_URL}/api/cart`,
  CART_ADD: `${API_BASE_URL}/api/cart/add`,
  CART_UPDATE: `${API_BASE_URL}/api/cart/update`,
  CART_REMOVE: `${API_BASE_URL}/api/cart/remove`,
  CART_CLEAR: `${API_BASE_URL}/api/cart/clear`,
  
  // Order endpoints
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDER_BY_ID: (id) => `${API_BASE_URL}/api/orders/${id}`,
  ORDER_PAY: (id) => `${API_BASE_URL}/api/orders/${id}/pay`,
  ORDER_CANCEL: (id) => `${API_BASE_URL}/api/orders/${id}/cancel`,

  // Health check endpoint
  HEALTH: `${API_BASE_URL}/api/health`,
};

// Hàm helper để lấy headers với token
export const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem(APP_CONSTANTS.TOKEN_STORAGE_KEY);
    
    if (DEBUG_API) {
      console.log('🔑 Token được lấy từ AsyncStorage:', token);
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
    
    return headers;
  } catch (error) {
    console.error('❌ Lỗi khi lấy token:', error);
    return {
      'Content-Type': 'application/json'
    };
  }
};

// Fetch with timeout
export const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  // Timeout handling
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Log API call
    logApiCall(options.method || 'GET', url, options.body, options.headers);
    
    // Thực hiện request
    const response = await fetch(url, { ...options, signal });
    
    // Xử lý response
    return response;
  } catch (error) {
    // Xử lý lỗi
    logApiError(url, error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Hàm kiểm tra kết nối API - đơn giản và trực tiếp
export const testApiConnection = async () => {
  const healthUrl = `${API_BASE_URL}/api/health`;
  console.log('🧪 Testing API connection to:', healthUrl);
  
  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection successful!', data);
      return true;
    } else {
      console.log('❌ API Connection failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API Connection test failed:', error);
    
    // Hiển thị thêm thông tin cho lỗi network request failed
    if (error.message && error.message.includes('Network request failed')) {
      console.error('Network connection error. Please make sure:');
      console.error('1. Your device is connected to the same network as your server');
      console.error('2. Your server is running correctly');
      console.error('3. The server has CORS enabled');
      console.error('4. There is no firewall blocking the connection');
    }
    
    return false;
  }
};

// Helper function để xử lý response
export const handleResponse = async (response, requestUrl) => {
  const contentType = response.headers.get('content-type');
  
  try {
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        logApiError(requestUrl, data.message || 'Error with status: ' + response.status);
        throw new Error(data.message || 'Something went wrong');
      }
      
      logApiResponse(requestUrl, response, data);
      return data;
    } else {
      const text = await response.text();
      if (!response.ok) {
        logApiError(requestUrl, text || 'Non-JSON error');
        throw new Error(text || 'Server error');
      }
      logApiResponse(requestUrl, response, { text });
      return { text };
    }
  } catch (error) {
    logApiError(requestUrl, error);
    throw error;
  }
};

// Update API URL
export const updateApiBaseUrl = async (newUrl) => {
  try {
    if (!newUrl.startsWith('http')) {
      throw new Error('URL không hợp lệ. Phải bắt đầu với http:// hoặc https://');
    }
    
    if (newUrl.endsWith('/')) {
      newUrl = newUrl.slice(0, -1);
    }
    
    await AsyncStorage.setItem('custom_api_url', newUrl);
    
    console.log('✅ Đã cập nhật URL API thành:', newUrl);
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật URL API:', error);
    throw error;
  }
};

// Reset API config
export const resetApiConfig = async () => {
  try {
    await AsyncStorage.removeItem('custom_api_url');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi đặt lại cấu hình API:', error);
    return false;
  }
};

// Export các hàm helper
export {
  logApiCall,
  logApiResponse,
  logApiError
};

// Export API_BASE_URL mặc định
export default API_BASE_URL;