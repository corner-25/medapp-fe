// src/utils/apiSecurity.js - API Security utilities for rate limiting and request signing
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== RATE LIMITING ====================

const RATE_LIMIT_PREFIX = '@rate_limit_';
const DEFAULT_RATE_LIMITS = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  register: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  forgotPassword: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  apiGeneral: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  sensitiveData: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute for sensitive operations
};

/**
 * Check if request is within rate limit
 * @param {string} endpoint - API endpoint identifier
 * @param {string} userId - User identifier (optional, defaults to device)
 * @returns {Promise<{allowed: boolean, resetTime?: number, remaining?: number}>}
 */
export const checkRateLimit = async (endpoint, userId = 'anonymous') => {
  try {
    const rateLimitEnabled = process.env.EXPO_PUBLIC_API_RATE_LIMIT_ENABLED === 'true';

    if (!rateLimitEnabled) {
      console.log('📊 Rate limiting disabled');
      return { allowed: true };
    }

    const limit = DEFAULT_RATE_LIMITS[endpoint] || DEFAULT_RATE_LIMITS.apiGeneral;
    const key = `${RATE_LIMIT_PREFIX}${endpoint}_${userId}`;

    // Get current rate limit data
    const rateLimitData = await AsyncStorage.getItem(key);
    const now = Date.now();

    let requestLog = [];
    if (rateLimitData) {
      const parsed = JSON.parse(rateLimitData);
      requestLog = parsed.requests || [];
    }

    // Remove expired requests
    requestLog = requestLog.filter(timestamp => now - timestamp < limit.windowMs);

    // Check if within limit
    if (requestLog.length >= limit.maxRequests) {
      const oldestRequest = Math.min(...requestLog);
      const resetTime = oldestRequest + limit.windowMs;

      console.log(`🚫 Rate limit exceeded for ${endpoint}. Reset at: ${new Date(resetTime)}`);
      return {
        allowed: false,
        resetTime: resetTime,
        remaining: 0
      };
    }

    // Add current request
    requestLog.push(now);

    // Store updated log
    await AsyncStorage.setItem(key, JSON.stringify({
      requests: requestLog,
      lastUpdate: now
    }));

    const remaining = limit.maxRequests - requestLog.length;
    console.log(`✅ Rate limit check passed for ${endpoint}. Remaining: ${remaining}`);

    return {
      allowed: true,
      remaining: remaining,
      resetTime: now + limit.windowMs
    };
  } catch (error) {
    console.error('❌ Rate limit check error:', error);
    // In case of error, allow the request
    return { allowed: true };
  }
};

/**
 * Clear rate limit data for an endpoint and user
 * @param {string} endpoint - API endpoint identifier
 * @param {string} userId - User identifier
 */
export const clearRateLimit = async (endpoint, userId = 'anonymous') => {
  try {
    const key = `${RATE_LIMIT_PREFIX}${endpoint}_${userId}`;
    await AsyncStorage.removeItem(key);
    console.log(`🧹 Rate limit cleared for ${endpoint}`);
  } catch (error) {
    console.error('❌ Error clearing rate limit:', error);
  }
};

// ==================== REQUEST SIGNING ====================

/**
 * Generate API request signature
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {object} body - Request body
 * @param {string} timestamp - Request timestamp
 * @param {string} nonce - Random nonce
 * @returns {string} - Request signature
 */
export const generateRequestSignature = (method, url, body, timestamp, nonce) => {
  try {
    const requestSigningEnabled = process.env.EXPO_PUBLIC_REQUEST_SIGNING_ENABLED === 'true';

    if (!requestSigningEnabled) {
      console.log('🔏 Request signing disabled');
      return null;
    }

    // Get signing key from environment
    const signingKey = process.env.EXPO_PUBLIC_API_SIGNING_KEY || 'default-signing-key-2024';

    // Create string to sign
    const bodyString = body ? JSON.stringify(body) : '';
    const stringToSign = `${method.toUpperCase()}\n${url}\n${bodyString}\n${timestamp}\n${nonce}`;

    // Generate HMAC-SHA256 signature
    const signature = CryptoJS.HmacSHA256(stringToSign, signingKey).toString();

    console.log('🔐 Request signature generated');
    return signature;
  } catch (error) {
    console.error('❌ Error generating request signature:', error);
    return null;
  }
};

/**
 * Generate secure headers for API requests
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {object} body - Request body
 * @param {string} userToken - User authentication token
 * @returns {object} - Security headers
 */
export const generateSecureHeaders = (method, url, body, userToken) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add user token if available
  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }

  // Add request signing if enabled
  const requestSigningEnabled = process.env.EXPO_PUBLIC_REQUEST_SIGNING_ENABLED === 'true';

  if (requestSigningEnabled) {
    const timestamp = Date.now().toString();
    // Generate nonce without using native crypto (React Native compatible)
    const nonce = CryptoJS.lib.WordArray.create(Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))).toString();
    const signature = generateRequestSignature(method, url, body, timestamp, nonce);

    if (signature) {
      headers['X-Request-Timestamp'] = timestamp;
      headers['X-Request-Nonce'] = nonce;
      headers['X-Request-Signature'] = signature;
    }
  }

  // Add additional security headers
  headers['X-Client-Version'] = '1.0.0';
  headers['X-Platform'] = 'mobile';

  return headers;
};

// ==================== SECURE API WRAPPER ====================

/**
 * Secure API request wrapper with rate limiting and signing
 * @param {string} endpoint - API endpoint identifier for rate limiting
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {string} userId - User identifier for rate limiting
 * @returns {Promise<Response>} - Fetch response
 */
export const secureApiRequest = async (endpoint, url, options = {}, userId = 'anonymous') => {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(endpoint, userId);

    if (!rateLimitResult.allowed) {
      const error = new Error('Rate limit exceeded');
      error.resetTime = rateLimitResult.resetTime;
      error.rateLimited = true;
      throw error;
    }

    // Generate secure headers
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;
    const userToken = options.headers?.Authorization?.replace('Bearer ', '');

    const secureHeaders = generateSecureHeaders(method, url, body, userToken);

    // Merge with existing headers
    const finalOptions = {
      ...options,
      headers: {
        ...options.headers,
        ...secureHeaders
      }
    };

    console.log(`🔒 Secure API request to ${endpoint}: ${method} ${url}`);

    // Make the request
    const response = await fetch(url, finalOptions);

    console.log(`📡 API response: ${response.status} ${response.statusText}`);

    return response;
  } catch (error) {
    console.error('❌ Secure API request error:', error);
    throw error;
  }
};

// ==================== SENSITIVE DATA ENDPOINTS ====================

/**
 * List of endpoints that handle sensitive data
 */
const SENSITIVE_ENDPOINTS = [
  'login',
  'register',
  'forgotPassword',
  'updateProfile',
  'uploadDocument',
  'medicalRecord',
  'payment',
  'healthData'
];

/**
 * Check if an endpoint handles sensitive data
 * @param {string} endpoint - Endpoint identifier
 * @returns {boolean} - True if endpoint is sensitive
 */
export const isSensitiveEndpoint = (endpoint) => {
  return SENSITIVE_ENDPOINTS.includes(endpoint);
};

/**
 * Make API request to sensitive endpoint with extra security
 * @param {string} endpoint - API endpoint identifier
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {string} userId - User identifier
 * @returns {Promise<Response>} - Fetch response
 */
export const secureSensitiveApiRequest = async (endpoint, url, options = {}, userId = 'anonymous') => {
  try {
    console.log(`🔐 Sensitive API request to ${endpoint}`);

    // Use stricter rate limiting for sensitive endpoints
    const sensitiveEndpoint = isSensitiveEndpoint(endpoint) ? 'sensitiveData' : endpoint;

    return await secureApiRequest(sensitiveEndpoint, url, options, userId);
  } catch (error) {
    console.error('❌ Sensitive API request error:', error);
    throw error;
  }
};

// ==================== SECURITY MONITORING ====================

/**
 * Log security events for monitoring
 * @param {string} event - Event type
 * @param {object} details - Event details
 * @param {string} userId - User identifier
 */
export const logSecurityEvent = async (event, details = {}, userId = 'anonymous') => {
  try {
    const securityLog = {
      timestamp: new Date().toISOString(),
      event: event,
      userId: userId,
      details: details,
      platform: 'mobile',
      version: '1.0.0'
    };

    console.log('🔍 Security Event:', securityLog);

    // In production, you might want to send this to a security monitoring service
    // await sendToSecurityMonitoring(securityLog);

    // Store locally for debugging (optional)
    const logKey = `@security_log_${Date.now()}`;
    await AsyncStorage.setItem(logKey, JSON.stringify(securityLog));

  } catch (error) {
    console.error('❌ Error logging security event:', error);
  }
};

export default {
  // Rate limiting
  checkRateLimit,
  clearRateLimit,

  // Request signing
  generateRequestSignature,
  generateSecureHeaders,

  // Secure API calls
  secureApiRequest,
  secureSensitiveApiRequest,
  isSensitiveEndpoint,

  // Security monitoring
  logSecurityEvent
};