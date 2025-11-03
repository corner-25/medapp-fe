// src/services/apiService.js - Kiểm tra và cập nhật
import { API_ENDPOINTS, handleResponse, getAuthHeaders } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureSensitiveApiRequest, logSecurityEvent } from '../utils/apiSecurity';

// Auth services - kiểm tra import API_ENDPOINTS
export const authService = {
  login: async (email, password) => {
    try {
      // Log security event
      await logSecurityEvent('login_attempt', { email }, email);

      const response = await secureSensitiveApiRequest(
        'login',
        API_ENDPOINTS.LOGIN,
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
        email
      );

      const result = await handleResponse(response, API_ENDPOINTS.LOGIN);

      // Log successful login
      if (result.success) {
        await logSecurityEvent('login_success', { email }, email);
      } else {
        await logSecurityEvent('login_failure', { email, error: result.error }, email);
      }

      return result;
    } catch (error) {
      await logSecurityEvent('login_error', { email, error: error.message }, email);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      // Log security event
      await logSecurityEvent('register_attempt', { email: userData.email }, userData.email);

      const response = await secureSensitiveApiRequest(
        'register',
        API_ENDPOINTS.REGISTER,
        {
          method: 'POST',
          body: JSON.stringify(userData),
        },
        userData.email
      );

      const result = await handleResponse(response, API_ENDPOINTS.REGISTER);

      // Log registration result
      if (result.success) {
        await logSecurityEvent('register_success', { email: userData.email }, userData.email);
      } else {
        await logSecurityEvent('register_failure', { email: userData.email, error: result.error }, userData.email);
      }

      return result;
    } catch (error) {
      await logSecurityEvent('register_error', { email: userData.email, error: error.message }, userData.email);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const headers = await getAuthHeaders();
      const userToken = headers.Authorization?.replace('Bearer ', '');

      const response = await secureSensitiveApiRequest(
        'getProfile',
        API_ENDPOINTS.PROFILE,
        {
          method: 'GET',
          headers,
        },
        userToken
      );

      return handleResponse(response, API_ENDPOINTS.PROFILE);
    } catch (error) {
      await logSecurityEvent('profile_access_error', { error: error.message });
      throw error;
    }
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

  updateHealthInfo: async (id, healthData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.RELATIVE_HEALTH_INFO(id), {
      method: 'PUT',
      headers,
      body: JSON.stringify(healthData),
    });
    return handleResponse(response, API_ENDPOINTS.RELATIVE_HEALTH_INFO(id));
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
    const response = await fetch(API_ENDPOINTS.MEDICAL_RECORDS(recordData.patient), {
      method: 'POST',
      headers,
      body: JSON.stringify(recordData),
    });
    return handleResponse(response, API_ENDPOINTS.MEDICAL_RECORDS(recordData.patient));
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
    const response = await fetch(API_ENDPOINTS.VACCINES(vaccineData.patient), {
      method: 'POST',
      headers,
      body: JSON.stringify(vaccineData),
    });
    return handleResponse(response, API_ENDPOINTS.VACCINES(vaccineData.patient));
  },

  update: async (id, vaccineData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.VACCINE_BY_ID(id), {
      method: 'PUT',
      headers,
      body: JSON.stringify(vaccineData),
    });
    return handleResponse(response, API_ENDPOINTS.VACCINE_BY_ID(id));
  },

  addDose: async (id, doseData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_ENDPOINTS.VACCINE_BY_ID(id)}/dose`, {
      method: 'POST',
      headers,
      body: JSON.stringify(doseData),
    });
    return handleResponse(response, `${API_ENDPOINTS.VACCINE_BY_ID(id)}/dose`);
  },

  delete: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.VACCINE_BY_ID(id), {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response, API_ENDPOINTS.VACCINE_BY_ID(id));
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

// Medical Services
export const medicalServicesService = {
  getAll: async (options = {}) => {
    const { category, search, minPrice, maxPrice, sortBy, page = 1, limit = 50 } = options;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (category && category !== 'all') queryParams.append('category', category);
    if (search) queryParams.append('search', search);
    if (minPrice) queryParams.append('minPrice', minPrice.toString());
    if (maxPrice) queryParams.append('maxPrice', maxPrice.toString());
    if (sortBy) queryParams.append('sortBy', sortBy);

    const response = await fetch(`${API_ENDPOINTS.MEDICAL_SERVICES}?${queryParams}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response, API_ENDPOINTS.MEDICAL_SERVICES);
  },

  getById: async (id) => {
    const response = await fetch(API_ENDPOINTS.MEDICAL_SERVICE_BY_ID(id), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response, API_ENDPOINTS.MEDICAL_SERVICE_BY_ID(id));
  },

  getByServiceId: async (serviceId) => {
    const response = await fetch(`${API_ENDPOINTS.MEDICAL_SERVICES}/service/${serviceId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response, `${API_ENDPOINTS.MEDICAL_SERVICES}/service/${serviceId}`);
  },

  getByCategory: async (category) => {
    const response = await fetch(`${API_ENDPOINTS.MEDICAL_SERVICES}/category/${category}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response, `${API_ENDPOINTS.MEDICAL_SERVICES}/category/${category}`);
  },

  search: async (searchTerm, options = {}) => {
    const { category, minPrice, maxPrice, sortBy } = options;
    const queryParams = new URLSearchParams({ search: searchTerm });

    if (category) queryParams.append('category', category);
    if (minPrice) queryParams.append('minPrice', minPrice.toString());
    if (maxPrice) queryParams.append('maxPrice', maxPrice.toString());
    if (sortBy) queryParams.append('sortBy', sortBy);

    const response = await fetch(`${API_ENDPOINTS.MEDICAL_SERVICES}/search?${queryParams}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response, `${API_ENDPOINTS.MEDICAL_SERVICES}/search`);
  },

  incrementBooking: async (serviceId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_ENDPOINTS.MEDICAL_SERVICES}/${serviceId}/book`, {
      method: 'POST',
      headers,
    });
    return handleResponse(response, `${API_ENDPOINTS.MEDICAL_SERVICES}/${serviceId}/book`);
  },
};