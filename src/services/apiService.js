// src/services/apiService.js - Kiểm tra và cập nhật
import { API_ENDPOINTS, handleResponse, getAuthHeaders } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth services - kiểm tra import API_ENDPOINTS
export const authService = {
  login: async (email, password) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response, API_ENDPOINTS.LOGIN);
  },

  register: async (userData) => {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response, API_ENDPOINTS.REGISTER);
  },

  getProfile: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.PROFILE, {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.PROFILE);
  },
};

// Các service khác cần phải được kiểm tra tương tự...

// Relatives services
export const relativesService = {
  getAll: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.RELATIVES, {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.RELATIVES);
  },

  getById: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.RELATIVE_BY_ID(id), {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.RELATIVE_BY_ID(id));
  },

  create: async (relativeData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.RELATIVES, {
      method: 'POST',
      headers,
      body: JSON.stringify(relativeData),
    });
    return handleResponse(response, API_ENDPOINTS.RELATIVES);
  },

  update: async (id, relativeData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.RELATIVE_BY_ID(id), {
      method: 'PUT',
      headers,
      body: JSON.stringify(relativeData),
    });
    return handleResponse(response, API_ENDPOINTS.RELATIVE_BY_ID(id));
  },

  delete: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.RELATIVE_BY_ID(id), {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.RELATIVE_BY_ID(id));
  },
};

// Appointments services
export const appointmentsService = {
  getAll: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.APPOINTMENTS, {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.APPOINTMENTS);
  },

  getById: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.APPOINTMENT_BY_ID(id), {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.APPOINTMENT_BY_ID(id));
  },

  create: async (appointmentData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.APPOINTMENTS, {
      method: 'POST',
      headers,
      body: JSON.stringify(appointmentData),
    });
    return handleResponse(response, API_ENDPOINTS.APPOINTMENTS);
  },

  update: async (id, appointmentData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.APPOINTMENT_BY_ID(id), {
      method: 'PUT',
      headers,
      body: JSON.stringify(appointmentData),
    });
    return handleResponse(response, API_ENDPOINTS.APPOINTMENT_BY_ID(id));
  },

  cancel: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.APPOINTMENT_BY_ID(id), {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.APPOINTMENT_BY_ID(id));
  },
};

// Emergency services
export const emergencyService = {
  getAll: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.EMERGENCY, {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.EMERGENCY);
  },

  getById: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.EMERGENCY_BY_ID(id), {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.EMERGENCY_BY_ID(id));
  },

  create: async (emergencyData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.EMERGENCY, {
      method: 'POST',
      headers,
      body: JSON.stringify(emergencyData),
    });
    return handleResponse(response, API_ENDPOINTS.EMERGENCY);
  },

  update: async (id, emergencyData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.EMERGENCY_BY_ID(id), {
      method: 'PUT',
      headers,
      body: JSON.stringify(emergencyData),
    });
    return handleResponse(response, API_ENDPOINTS.EMERGENCY_BY_ID(id));
  },

  cancel: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.EMERGENCY_BY_ID(id), {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.EMERGENCY_BY_ID(id));
  },
};

// Medical Records services
export const medicalRecordsService = {
  getByRelativeId: async (relativeId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.MEDICAL_RECORDS(relativeId), {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.MEDICAL_RECORDS(relativeId));
  },

  getById: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.MEDICAL_RECORD_BY_ID(id), {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.MEDICAL_RECORD_BY_ID(id));
  },

  create: async (recordData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.MEDICAL_RECORDS_CREATE, {
      method: 'POST',
      headers,
      body: JSON.stringify(recordData),
    });
    return handleResponse(response, API_ENDPOINTS.MEDICAL_RECORDS_CREATE);
  },

  update: async (id, recordData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.MEDICAL_RECORD_BY_ID(id), {
      method: 'PUT',
      headers,
      body: JSON.stringify(recordData),
    });
    return handleResponse(response, API_ENDPOINTS.MEDICAL_RECORD_BY_ID(id));
  },

  delete: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.MEDICAL_RECORD_BY_ID(id), {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.MEDICAL_RECORD_BY_ID(id));
  },
};

// Vaccines services
export const vaccinesService = {
  getByRelativeId: async (relativeId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.VACCINES(relativeId), {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.VACCINES(relativeId));
  },

  getById: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.VACCINE_BY_ID(id), {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.VACCINE_BY_ID(id));
  },

  create: async (vaccineData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.VACCINES_CREATE, {
      method: 'POST',
      headers,
      body: JSON.stringify(vaccineData),
    });
    return handleResponse(response, API_ENDPOINTS.VACCINES_CREATE);
  },

  update: async (id, vaccineData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.VACCINE_UPDATE(id), {
      method: 'PUT',
      headers,
      body: JSON.stringify(vaccineData),
    });
    return handleResponse(response, API_ENDPOINTS.VACCINE_UPDATE(id));
  },

  addDose: async (id, doseData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.VACCINE_ADD_DOSE(id), {
      method: 'POST',
      headers,
      body: JSON.stringify(doseData),
    });
    return handleResponse(response, API_ENDPOINTS.VACCINE_ADD_DOSE(id));
  },

  delete: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.VACCINE_DELETE(id), {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.VACCINE_DELETE(id));
  },
};

// Allergies services
export const allergiesService = {
  getByRelativeId: async (relativeId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ALLERGIES(relativeId), {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.ALLERGIES(relativeId));
  },

  getById: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ALLERGY_BY_ID(id), {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.ALLERGY_BY_ID(id));
  },

  create: async (allergyData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ALLERGIES(allergyData.patient), {
      method: 'POST',
      headers,
      body: JSON.stringify(allergyData),
    });
    return handleResponse(response, API_ENDPOINTS.ALLERGIES(allergyData.patient));
  },

  update: async (id, allergyData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ALLERGY_BY_ID(id), {
      method: 'PUT',
      headers,
      body: JSON.stringify(allergyData),
    });
    return handleResponse(response, API_ENDPOINTS.ALLERGY_BY_ID(id));
  },

  delete: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ALLERGY_BY_ID(id), {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.ALLERGY_BY_ID(id));
  },
};

// Analyses services
export const analysesService = {
  getByRelativeId: async (relativeId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ANALYSES(relativeId), {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.ANALYSES(relativeId));
  },

  getById: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ANALYSIS_BY_ID(id), {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.ANALYSIS_BY_ID(id));
  },

  create: async (analysisData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ANALYSES(analysisData.patient), {
      method: 'POST',
      headers,
      body: JSON.stringify(analysisData),
    });
    return handleResponse(response, API_ENDPOINTS.ANALYSES(analysisData.patient));
  },

  update: async (id, analysisData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ANALYSIS_BY_ID(id), {
      method: 'PUT',
      headers,
      body: JSON.stringify(analysisData),
    });
    return handleResponse(response, API_ENDPOINTS.ANALYSIS_BY_ID(id));
  },

  delete: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ANALYSIS_BY_ID(id), {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.ANALYSIS_BY_ID(id));
  },
};

// Cart services
export const cartService = {
  getCart: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.CART, {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.CART);
  },

  addToCart: async (itemData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.CART_ADD, {
      method: 'POST',
      headers,
      body: JSON.stringify(itemData),
    });
    return handleResponse(response, API_ENDPOINTS.CART_ADD);
  },

  updateCartItem: async (service, quantity) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.CART_UPDATE, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ service, quantity }),
    });
    return handleResponse(response, API_ENDPOINTS.CART_UPDATE);
  },

  removeFromCart: async (service) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.CART_REMOVE, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ service }),
    });
    return handleResponse(response, API_ENDPOINTS.CART_REMOVE);
  },

  clearCart: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.CART_CLEAR, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.CART_CLEAR);
  }
};

// Order services
export const orderService = {
  createOrder: async (orderData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ORDERS, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });
    return handleResponse(response, API_ENDPOINTS.ORDERS);
  },

  getMyOrders: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ORDERS, {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.ORDERS);
  },

  getOrderById: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ORDER_BY_ID(id), {
      method: 'GET',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.ORDER_BY_ID(id));
  },

  updateOrderToPaid: async (id, paymentResult) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ORDER_PAY(id), {
      method: 'PUT',
      headers,
      body: JSON.stringify(paymentResult),
    });
    return handleResponse(response, API_ENDPOINTS.ORDER_PAY(id));
  },

  cancelOrder: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.ORDER_CANCEL(id), {
      method: 'PUT',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.ORDER_CANCEL(id));
  }
};

// Services API
export const servicesService = {
  // Lấy tất cả dịch vụ với phân trang và filter
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.SERVICES}?${queryString}` : API_ENDPOINTS.SERVICES;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(response, url);
  },

  // Lấy dịch vụ theo ID
  getById: async (id) => {
    const response = await fetch(API_ENDPOINTS.SERVICE_BY_ID(id), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(response, API_ENDPOINTS.SERVICE_BY_ID(id));
  },

  // Lấy dịch vụ phổ biến
  getPopular: async (limit = 6) => {
    const url = `${API_ENDPOINTS.SERVICES_POPULAR}?limit=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(response, url);
  },

  // Lấy dịch vụ theo danh mục
  getByCategory: async (category) => {
    const response = await fetch(API_ENDPOINTS.SERVICES_CATEGORY(category), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(response, API_ENDPOINTS.SERVICES_CATEGORY(category));
  },

  // Tìm kiếm dịch vụ
  search: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.SERVICES_SEARCH}?${queryString}` : API_ENDPOINTS.SERVICES_SEARCH;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(response, url);
  },

  // Lấy danh sách categories
  getCategories: async () => {
    const response = await fetch(API_ENDPOINTS.SERVICES_CATEGORIES, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(response, API_ENDPOINTS.SERVICES_CATEGORIES);
  },

  // Lấy thống kê dịch vụ
  getStats: async () => {
    const response = await fetch(API_ENDPOINTS.SERVICES_STATS, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(response, API_ENDPOINTS.SERVICES_STATS);
  }
};