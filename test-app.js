// test-app.js - Test script cho các tính năng của app
import { testApiConnection, API_ENDPOINTS } from './src/config/api.js';
import { API_BASE_URL } from './src/config/settings.js';

console.log('🧪 Bắt đầu test ứng dụng Healthcare...');
console.log('📡 API Base URL:', API_BASE_URL);

// Test API connectivity
async function testConnectivity() {
  console.log('\n=== TEST 1: KIỂM TRA KẾT NỐI API ===');
  try {
    const isConnected = await testApiConnection();
    if (isConnected) {
      console.log('✅ Kết nối API thành công!');
      return true;
    } else {
      console.log('❌ Không thể kết nối đến API');
      return false;
    }
  } catch (error) {
    console.log('❌ Lỗi khi test kết nối:', error.message);
    return false;
  }
}

// Test individual endpoints
async function testEndpoints() {
  console.log('\n=== TEST 2: KIỂM TRA CÁC ENDPOINT ===');

  const endpoints = [
    { name: 'Health Check', url: API_ENDPOINTS.HEALTH },
    { name: 'Medical Services', url: API_ENDPOINTS.MEDICAL_SERVICES },
    { name: 'Login', url: API_ENDPOINTS.LOGIN, method: 'POST' },
    { name: 'Register', url: API_ENDPOINTS.REGISTER, method: 'POST' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const response = await fetch(endpoint.url, {
        method: endpoint.method || 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok || response.status === 400 || response.status === 401) {
        console.log(`✅ ${endpoint.name}: ${response.status} (OK)`);
      } else {
        console.log(`⚠️ ${endpoint.name}: ${response.status} (Unexpected)`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }
}

// Main test function
async function runTests() {
  const isConnected = await testConnectivity();

  if (isConnected) {
    await testEndpoints();
    console.log('\n=== TEST HOÀN THÀNH ===');
    console.log('✅ Có thể tiếp tục test các tính năng trong app');
  } else {
    console.log('\n=== TEST THẤT BẠI ===');
    console.log('❌ Cần kiểm tra lại cấu hình backend');
  }
}

// Export cho việc sử dụng trong React Native
export { runTests, testConnectivity, testEndpoints };

// Chạy test nếu được gọi trực tiếp
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
}