// src/utils/sensitiveDataUtils.js - Utilities for CCCD and BHYT validation and encryption
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dynamic encryption key generation
const generateEncryptionKey = () => {
  // In production, this should be derived from secure sources like:
  // - Device-specific identifiers
  // - Server-provided keys
  // - Key derivation functions
  const baseKey = process.env.EXPO_PUBLIC_ENCRYPTION_BASE_KEY || 'healthcare-app-base-key-2024';
  const deviceId = 'device-specific-id'; // In real app, get from device
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Daily rotation

  return CryptoJS.SHA256(baseKey + deviceId + timestamp).toString();
};

// Get encryption key
const getEncryptionKey = () => {
  const keySource = process.env.EXPO_PUBLIC_ENCRYPTION_KEY_SOURCE || 'static';

  if (keySource === 'dynamic') {
    return generateEncryptionKey();
  }

  // Fallback to environment variable or default
  return process.env.EXPO_PUBLIC_ENCRYPTION_STATIC_KEY || 'healthcare-app-sensitive-data-encryption-key-2024';
};

// ==================== ENCRYPTION UTILITIES ====================

/**
 * Encrypt sensitive data using AES encryption
 * @param {string} data - The data to encrypt
 * @returns {string} - Encrypted data
 */
export const encryptSensitiveData = (data) => {
  try {
    if (!data || typeof data !== 'string') return '';

    // Check if encryption is enabled
    const encryptionEnabled = process.env.EXPO_PUBLIC_ENCRYPTION_ENABLED === 'true';

    if (!encryptionEnabled) {
      console.log('🔐 Data passed through (encryption disabled)');
      return data;
    }

    // Get dynamic encryption key
    const encryptionKey = getEncryptionKey();

    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(data, encryptionKey).toString();
    console.log('🔐 Data encrypted successfully');
    return encrypted;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    return data; // Return original data if encryption fails
  }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - The encrypted data
 * @returns {string} - Decrypted data
 */
export const decryptSensitiveData = (encryptedData) => {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') return '';

    // Check if encryption is enabled
    const encryptionEnabled = process.env.EXPO_PUBLIC_ENCRYPTION_ENABLED === 'true';

    if (!encryptionEnabled) {
      console.log('🔓 Data passed through (encryption disabled)');
      return encryptedData;
    }

    // Get dynamic encryption key
    const encryptionKey = getEncryptionKey();

    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey).toString(CryptoJS.enc.Utf8);
    console.log('🔓 Data decrypted successfully');
    return decrypted;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    return encryptedData; // Return original data if decryption fails
  }
};

/**
 * Store encrypted sensitive data in AsyncStorage
 * @param {string} key - Storage key
 * @param {string} data - Data to encrypt and store
 */
export const storeEncryptedData = async (key, data) => {
  try {
    const encryptedData = encryptSensitiveData(data);
    await AsyncStorage.setItem(key, encryptedData);
    console.log('💾 Encrypted data stored successfully');
  } catch (error) {
    console.error('❌ Error storing encrypted data:', error);
  }
};

/**
 * Retrieve and decrypt sensitive data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {string} - Decrypted data
 */
export const retrieveEncryptedData = async (key) => {
  try {
    const encryptedData = await AsyncStorage.getItem(key);
    if (!encryptedData) return '';
    return decryptSensitiveData(encryptedData);
  } catch (error) {
    console.error('❌ Error retrieving encrypted data:', error);
    return '';
  }
};

// ==================== CCCD VALIDATION ====================

/**
 * Validate Vietnamese Citizen ID (CCCD) - 12 digits format
 * @param {string} cccd - CCCD number to validate
 * @returns {object} - Validation result with details
 */
export const validateCCCD = (cccd) => {
  const result = {
    isValid: false,
    errors: [],
    details: null,
    formatted: ''
  };

  // Remove spaces and convert to string
  const cleanCCCD = String(cccd || '').replace(/\s/g, '');

  console.log('🔍 CCCD Validation Debug:');
  console.log('Input:', cccd);
  console.log('Clean CCCD:', cleanCCCD);
  console.log('Length:', cleanCCCD.length);

  // Check if empty
  if (!cleanCCCD) {
    result.errors.push('CCCD không được để trống');
    console.log('❌ Empty CCCD');
    return result;
  }

  // Check if contains only digits
  if (!/^\d+$/.test(cleanCCCD)) {
    result.errors.push('CCCD chỉ được chứa số');
    console.log('❌ Contains non-digits');
    return result;
  }

  // Check length (must be 12 digits)
  if (cleanCCCD.length !== 12) {
    result.errors.push('CCCD phải có đúng 12 số');
    console.log('❌ Wrong length:', cleanCCCD.length);
    return result;
  }

  // Extract components
  const provinceCode = cleanCCCD.substring(0, 3);
  const genderCentury = cleanCCCD.substring(3, 4);
  const serialNumber = cleanCCCD.substring(4, 12);

  console.log('Province code:', provinceCode);
  console.log('Gender/Century:', genderCentury);
  console.log('Serial number:', serialNumber);

  // Validate province code (relaxed validation - allow 001-099)
  const provinceCodeNum = parseInt(provinceCode);
  if (provinceCodeNum < 1 || provinceCodeNum > 99) {
    result.errors.push('Mã tỉnh/thành phố không hợp lệ (001-099)');
    console.log('❌ Invalid province code:', provinceCodeNum);
  }

  // Validate gender and century code (0-9)
  const genderCenturyNum = parseInt(genderCentury);
  if (isNaN(genderCenturyNum) || genderCenturyNum < 0 || genderCenturyNum > 9) {
    result.errors.push('Mã giới tính và thế kỷ không hợp lệ');
    console.log('❌ Invalid gender/century:', genderCenturyNum);
  }

  // Validate serial number (8 digits)
  if (!/^\d{8}$/.test(serialNumber)) {
    result.errors.push('Số thứ tự không hợp lệ');
    console.log('❌ Invalid serial number:', serialNumber);
  }

  console.log('Validation errors:', result.errors);

  // If no errors, set as valid
  if (result.errors.length === 0) {
    result.isValid = true;
    result.formatted = `${cleanCCCD.substring(0, 3)} ${cleanCCCD.substring(3, 6)} ${cleanCCCD.substring(6, 9)} ${cleanCCCD.substring(9, 12)}`;

    // Extract details
    result.details = {
      provinceCode: provinceCode,
      genderCentury: genderCentury,
      serialNumber: serialNumber,
      gender: genderCenturyNum >= 0 && genderCenturyNum <= 3 ? 'Nam' :
              genderCenturyNum >= 4 && genderCenturyNum <= 7 ? 'Nữ' :
              genderCenturyNum >= 8 && genderCenturyNum <= 9 ? 'Nam' : 'Không xác định',
      century: genderCenturyNum >= 0 && genderCenturyNum <= 7 ? '20' : '21'
    };

    console.log('✅ CCCD validation passed');
  }

  return result;
};

// ==================== BHYT VALIDATION ====================

/**
 * Validate Vietnamese Health Insurance (BHYT) - 15 characters format
 * @param {string} bhyt - BHYT number to validate
 * @returns {object} - Validation result with details
 */
export const validateBHYT = (bhyt) => {
  const result = {
    isValid: false,
    errors: [],
    details: null,
    formatted: ''
  };

  // Remove spaces and convert to uppercase
  const cleanBHYT = String(bhyt || '').replace(/\s/g, '').toUpperCase();

  console.log('🔍 BHYT Validation Debug:');
  console.log('Input:', bhyt);
  console.log('Clean BHYT:', cleanBHYT);
  console.log('Length:', cleanBHYT.length);

  // Check if empty
  if (!cleanBHYT) {
    result.errors.push('Số BHYT không được để trống');
    console.log('❌ Empty BHYT');
    return result;
  }

  // Check length (must be 15 characters)
  if (cleanBHYT.length !== 15) {
    result.errors.push('Số BHYT phải có đúng 15 ký tự');
    console.log('❌ Wrong length:', cleanBHYT.length);
    return result;
  }

  // Check format: 2 letters + 13 digits
  if (!/^[A-Z]{2}\d{13}$/.test(cleanBHYT)) {
    result.errors.push('Số BHYT phải có định dạng: 2 chữ cái + 13 số');
    console.log('❌ Wrong format');
    return result;
  }

  // Extract components
  const objectCode = cleanBHYT.substring(0, 2); // Mã đối tượng
  const provinceCode = cleanBHYT.substring(2, 5); // Mã tỉnh
  const issueYear = cleanBHYT.substring(5, 7); // Năm cấp
  const serialNumber = cleanBHYT.substring(7, 13); // Số thứ tự
  const checkDigit = cleanBHYT.substring(13, 15); // Số kiểm tra

  console.log('Object code:', objectCode);
  console.log('Province code:', provinceCode);
  console.log('Issue year:', issueYear);
  console.log('Serial number:', serialNumber);
  console.log('Check digit:', checkDigit);

  // Relaxed validation - chỉ kiểm tra cơ bản

  // Basic object code validation (2 letters)
  if (!/^[A-Z]{2}$/.test(objectCode)) {
    result.errors.push('Mã đối tượng BHYT không hợp lệ');
    console.log('❌ Invalid object code:', objectCode);
  }

  // Basic province code validation (3 digits, 001-099)
  const provinceCodeNum = parseInt(provinceCode);
  if (isNaN(provinceCodeNum) || provinceCodeNum < 1 || provinceCodeNum > 99) {
    result.errors.push('Mã tỉnh/thành phố không hợp lệ (001-099)');
    console.log('❌ Invalid province code:', provinceCodeNum);
  }

  // Basic issue year validation (2 digits, 00-99)
  const issueYearNum = parseInt(issueYear);
  if (isNaN(issueYearNum) || issueYearNum < 0 || issueYearNum > 99) {
    result.errors.push('Năm cấp không hợp lệ');
    console.log('❌ Invalid issue year:', issueYearNum);
  }

  // Validate serial number (6 digits)
  if (!/^\d{6}$/.test(serialNumber)) {
    result.errors.push('Số thứ tự không hợp lệ');
    console.log('❌ Invalid serial number:', serialNumber);
  }

  // Validate check digit (2 digits)
  if (!/^\d{2}$/.test(checkDigit)) {
    result.errors.push('Số kiểm tra không hợp lệ');
    console.log('❌ Invalid check digit:', checkDigit);
  }

  console.log('BHYT validation errors:', result.errors);

  // If no errors, set as valid
  if (result.errors.length === 0) {
    result.isValid = true;
    result.formatted = `${objectCode} ${provinceCode} ${issueYear} ${serialNumber} ${checkDigit}`;

    // Extract details
    result.details = {
      objectCode: objectCode,
      objectType: getObjectTypeName(objectCode),
      provinceCode: provinceCode,
      issueYear: `20${issueYear}`,
      serialNumber: serialNumber,
      checkDigit: checkDigit
    };

    console.log('✅ BHYT validation passed');
  }

  return result;
};

/**
 * Get object type name from BHYT object code
 * @param {string} objectCode - 2-letter object code
 * @returns {string} - Object type description
 */
const getObjectTypeName = (objectCode) => {
  const objectTypes = {
    'HO': 'Học sinh, sinh viên',
    'HC': 'Trẻ em dưới 6 tuổi',
    'HX': 'Hộ gia đình',
    'HN': 'Người nghèo',
    'HT': 'Đồng bào dân tộc thiểu số',
    'HS': 'Học sinh phổ thông',
    'HH': 'Hộ cận nghèo',
    'HG': 'Gia đình có công',
    'HK': 'Khuyến học',
    'HM': 'Hộ nông dân',
    'CA': 'Công an',
    'CB': 'Cán bộ công chức',
    'KC': 'Khám chữa bệnh',
    'DU': 'Đối tượng khác',
    'DT': 'Dân tộc thiểu số',
    'DN': 'Doanh nghiệp',
    'DK': 'Đăng ký tự nguyện',
    'TE': 'Trẻ em',
    'QN': 'Quân nhân',
    'CY': 'Cựu chiến binh',
    'XB': 'Xã hội hóa bảo hiểm',
    'XK': 'Xã hội hóa khám bệnh',
    'XN': 'Xuất nhập khẩu lao động',
    'LA': 'Lao động',
    'NN': 'Nông nghiệp',
    'CT': 'Công tác xã hội',
    'CH': 'Chính sách xã hội',
    'CK': 'Chăm sóc sức khỏe',
    'TN': 'Thanh niên',
    'GD': 'Gia đình'
  };

  return objectTypes[objectCode] || 'Không xác định';
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format CCCD number with spaces
 * @param {string} cccd - CCCD number
 * @returns {string} - Formatted CCCD
 */
export const formatCCCD = (cccd) => {
  const cleanCCCD = String(cccd || '').replace(/\s/g, '');
  if (cleanCCCD.length === 12) {
    return `${cleanCCCD.substring(0, 3)} ${cleanCCCD.substring(3, 6)} ${cleanCCCD.substring(6, 9)} ${cleanCCCD.substring(9, 12)}`;
  }
  return cleanCCCD;
};

/**
 * Format BHYT number with spaces
 * @param {string} bhyt - BHYT number
 * @returns {string} - Formatted BHYT
 */
export const formatBHYT = (bhyt) => {
  const cleanBHYT = String(bhyt || '').replace(/\s/g, '').toUpperCase();
  if (cleanBHYT.length === 15) {
    return `${cleanBHYT.substring(0, 2)} ${cleanBHYT.substring(2, 5)} ${cleanBHYT.substring(5, 7)} ${cleanBHYT.substring(7, 13)} ${cleanBHYT.substring(13, 15)}`;
  }
  return cleanBHYT;
};

/**
 * Mask sensitive data for display (show only first and last characters)
 * @param {string} data - Sensitive data to mask
 * @param {number} visibleChars - Number of characters to show at start and end
 * @returns {string} - Masked data
 */
export const maskSensitiveData = (data, visibleChars = 2) => {
  if (!data || data.length <= visibleChars * 2) return data;

  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const middle = '*'.repeat(Math.max(0, data.length - visibleChars * 2));

  return `${start}${middle}${end}`;
};

/**
 * Validate and encrypt CCCD
 * @param {string} cccd - CCCD to validate and encrypt
 * @returns {object} - Validation result and encrypted data
 */
export const processeCCCD = (cccd) => {
  const validation = validateCCCD(cccd);
  return {
    ...validation,
    encrypted: validation.isValid ? encryptSensitiveData(cccd.replace(/\s/g, '')) : null
  };
};

/**
 * Validate and encrypt BHYT
 * @param {string} bhyt - BHYT to validate and encrypt
 * @returns {object} - Validation result and encrypted data
 */
export const processBHYT = (bhyt) => {
  const validation = validateBHYT(bhyt);
  return {
    ...validation,
    encrypted: validation.isValid ? encryptSensitiveData(bhyt.replace(/\s/g, '').toUpperCase()) : null
  };
};

export default {
  // Encryption
  encryptSensitiveData,
  decryptSensitiveData,
  storeEncryptedData,
  retrieveEncryptedData,

  // Validation
  validateCCCD,
  validateBHYT,

  // Processing
  processeCCCD,
  processBHYT,

  // Formatting
  formatCCCD,
  formatBHYT,
  maskSensitiveData
};