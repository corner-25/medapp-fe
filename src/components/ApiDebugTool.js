// src/components/ApiDebugTool.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_ENDPOINTS } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ApiDebugTool = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customHeaders, setCustomHeaders] = useState('{}');
  const [customMethod, setCustomMethod] = useState('GET');
  const [customBody, setCustomBody] = useState('');
  const [useCustomEndpoint, setUseCustomEndpoint] = useState(false);
  const [useToken, setUseToken] = useState(true);
  const [token, setToken] = useState('');

  // Kiểm tra token đã lưu
  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Lỗi khi lấy token:', error);
      }
    };

    checkToken();
  }, []);

  // Thực hiện kiểm tra API
  const runApiTests = async () => {
    setLoading(true);
    setTestResults([]);

    // Tạo một mảng các promise để thực hiện các test đồng thời
    const testPromises = [];

    if (useCustomEndpoint && customEndpoint) {
      // Nếu dùng endpoint tùy chỉnh
      testPromises.push(testCustomEndpoint());
    } else {
      // Kiểm tra health endpoint
      testPromises.push(testEndpoint('API Health Check', `${API_ENDPOINTS.LOGIN.split('/api')[0]}/api/health`));
      
      // Kiểm tra một số endpoint chính
      const endpointsToTest = [
        { name: 'Login API', url: API_ENDPOINTS.LOGIN },
        { name: 'Register API', url: API_ENDPOINTS.REGISTER },
        { name: 'Profile API', url: API_ENDPOINTS.PROFILE, requiresAuth: true },
        { name: 'Relatives API', url: API_ENDPOINTS.RELATIVES, requiresAuth: true }
      ];

      endpointsToTest.forEach(endpoint => {
        // Nếu endpoint yêu cầu auth và không dùng token, bỏ qua
        if (endpoint.requiresAuth && !useToken) return;
        
        testPromises.push(testEndpoint(endpoint.name, endpoint.url, endpoint.requiresAuth));
      });
    }

    // Chờ tất cả các test hoàn thành
    try {
      await Promise.all(testPromises);
    } catch (error) {
      console.error('Lỗi khi chạy API tests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test một endpoint cụ thể
  const testEndpoint = async (name, url, requiresAuth = false) => {
    let startTime = Date.now();
    
    try {
      const headers = requiresAuth && useToken ? 
        { 'Authorization': `Bearer ${token}` } : {};
      
      // Kiểm tra xem URL có sử dụng http hay https
      if (!url.startsWith('http')) {
        addTestResult(name, 'Invalid URL', url, 'error', 0);
        return;
      }

      const response = await fetch(url, { 
        method: 'GET',
        headers 
      });

      const responseTime = Date.now() - startTime;
      const statusText = response.status >= 200 && response.status < 300 ? 'success' : 'error';
      
      let responseBody = '';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const json = await response.json();
          responseBody = JSON.stringify(json, null, 2);
        } else {
          responseBody = await response.text();
        }
      } catch (error) {
        responseBody = 'Không thể đọc response body: ' + error.message;
      }

      addTestResult(
        name, 
        `Status: ${response.status}`, 
        `URL: ${url}\nHeaders: ${JSON.stringify(headers, null, 2)}\nResponse Time: ${responseTime}ms\nResponse: ${responseBody}`,
        statusText,
        responseTime
      );
    } catch (error) {
      const responseTime = Date.now() - startTime;
      addTestResult(
        name, 
        'Error: ' + error.message, 
        `URL: ${url}\nError Details: ${error.stack || 'No details available'}`,
        'error',
        responseTime
      );
    }
  };

  // Test custom endpoint
  const testCustomEndpoint = async () => {
    let headers = {};
    try {
      headers = JSON.parse(customHeaders);
    } catch (error) {
      Alert.alert('Lỗi', 'Custom headers không đúng định dạng JSON');
      return;
    }

    if (useToken) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method: customMethod,
      headers
    };

    if (customMethod !== 'GET' && customMethod !== 'HEAD' && customBody.trim()) {
      try {
        // Kiểm tra xem body có phải JSON không
        JSON.parse(customBody);
        options.body = customBody;
      } catch (error) {
        options.body = customBody;
      }
    }

    await testEndpoint('Custom Endpoint', customEndpoint, false, options);
  };

  // Thêm kết quả vào danh sách
  const addTestResult = (name, status, details, type = 'info', responseTime = 0) => {
    setTestResults(prev => [...prev, { name, status, details, type, responseTime, id: Date.now() }]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>API Debug Tool</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Tùy chọn kiểm tra */}
          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Sử dụng token</Text>
              <Switch 
                value={useToken} 
                onValueChange={setUseToken}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={useToken ? "#4285F4" : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Endpoint tùy chỉnh</Text>
              <Switch 
                value={useCustomEndpoint} 
                onValueChange={setUseCustomEndpoint}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={useCustomEndpoint ? "#4285F4" : "#f4f3f4"}
              />
            </View>
            
            {useCustomEndpoint && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="URL (ví dụ: http://192.168.1.6:5001/api/health)"
                  value={customEndpoint}
                  onChangeText={setCustomEndpoint}
                />
                
                <View style={styles.methodSelector}>
                  {['GET', 'POST', 'PUT', 'DELETE'].map(method => (
                    <TouchableOpacity 
                      key={method}
                      style={[
                        styles.methodButton, 
                        customMethod === method && styles.selectedMethodButton
                      ]}
                      onPress={() => setCustomMethod(method)}
                    >
                      <Text style={[
                        styles.methodButtonText,
                        customMethod === method && styles.selectedMethodButtonText
                      ]}>{method}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Headers (JSON format)"
                  value={customHeaders}
                  onChangeText={setCustomHeaders}
                  multiline
                />
                
                {(customMethod === 'POST' || customMethod === 'PUT') && (
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Body (JSON format)"
                    value={customBody}
                    onChangeText={setCustomBody}
                    multiline
                  />
                )}
              </>
            )}
          </View>

          {/* Nút thực hiện kiểm tra */}
          <TouchableOpacity 
            style={styles.testButton}
            onPress={runApiTests}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="refresh" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.testButtonText}>Kiểm tra kết nối API</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Kết quả kiểm tra */}
          <ScrollView style={styles.resultsContainer}>
            {testResults.length === 0 && !loading ? (
              <Text style={styles.noResultsText}>
                Chưa có kết quả kiểm tra. Nhấn nút "Kiểm tra kết nối API" để bắt đầu.
              </Text>
            ) : (
              testResults.map(result => (
                <View 
                  key={result.id} 
                  style={[
                    styles.resultItem,
                    result.type === 'success' ? styles.successResult : 
                    result.type === 'error' ? styles.errorResult : styles.infoResult
                  ]}
                >
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultName}>{result.name}</Text>
                    <Text style={styles.resultTime}>{result.responseTime}ms</Text>
                  </View>
                  <Text style={styles.resultStatus}>{result.status}</Text>
                  
                  <TouchableOpacity
                    onPress={() => Alert.alert(
                      result.name,
                      result.details,
                      [{ text: 'OK' }],
                      { cancelable: true }
                    )}
                    style={styles.viewDetailsButton}
                  >
                    <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          {/* Thông tin cấu hình hiện tại */}
          <View style={styles.configInfoContainer}>
            <Text style={styles.configInfoTitle}>Cấu hình API hiện tại:</Text>
            <Text style={styles.configInfoText}>Base URL: {API_ENDPOINTS.LOGIN.split('/auth/login')[0]}</Text>
            <Text style={styles.configInfoText}>Token: {useToken ? (token ? `${token.substring(0, 15)}...` : 'Không có') : 'Không sử dụng'}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  optionsContainer: {
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  methodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  methodButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedMethodButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  methodButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedMethodButtonText: {
    color: '#fff',
  },
  testButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    maxHeight: 250,
    marginBottom: 15,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  resultItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  successResult: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  errorResult: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  infoResult: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  resultTime: {
    fontSize: 12,
    color: '#666',
  },
  resultStatus: {
    fontSize: 13,
    color: '#333',
    marginBottom: 5,
  },
  viewDetailsButton: {
    alignSelf: 'flex-end',
  },
  viewDetailsText: {
    color: '#4285F4',
    fontSize: 12,
  },
  configInfoContainer: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  configInfoTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  configInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});

export default ApiDebugTool;