import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api';

const PersonalInfoScreen = ({ navigation, route }) => {
  const { getUserInfo, updateUserInfo, getToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState({ key: '', label: '', value: '', type: 'text' });
  const [updatingField, setUpdatingField] = useState('');
  const [highlightedField, setHighlightedField] = useState('');
  
  // State cho thông tin người dùng
  const [userInfo, setUserInfo] = useState(null);
  
  // Load thông tin người dùng
  useEffect(() => {
    const loadUserInfo = async () => {
      setLoading(true);
      try {
        // Nếu có dữ liệu được truyền qua route, sử dụng nó
        if (route.params?.user) {
          console.log("Setting user info from route params:", route.params.user);
          setUserInfo(route.params.user);
        } else {
          // Nếu không, lấy từ context hoặc storage
          const info = getUserInfo();
          console.log("Got user info from context:", info);
          
          if (info) {
            setUserInfo(info);
          } else {
            try {
              const userInfoStr = await AsyncStorage.getItem('userInfo');
              console.log("Got user info from AsyncStorage:", userInfoStr ? "exists" : "null");
              
              if (userInfoStr) {
                const parsedInfo = JSON.parse(userInfoStr);
                setUserInfo(parsedInfo);
                console.log("Parsed user info:", parsedInfo);
              }
            } catch (error) {
              console.error('Error loading user info from storage:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error in loadUserInfo:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserInfo();
  }, []);

  // Kiểm tra trạng thái đăng nhập
  const isLoggedIn = !!getToken();

  // Function để làm mới thông tin người dùng từ API
  const refreshUserInfo = async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    try {
      const token = getToken();
      console.log("Refreshing user info with token:", token ? "exists" : "null");
      
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải thông tin người dùng');
      }
      
      const userData = await response.json();
      console.log("Refreshed user data:", userData);
      
      // Kiểm tra nhiều cấu trúc phản hồi API khác nhau
      if (userData && (userData.user || userData.data || userData)) {
        // API có thể trả về dữ liệu ở nhiều định dạng khác nhau
        const userObject = userData.user || userData.data || userData;
        await updateUserInfo(userObject);
        setUserInfo(userObject);
        Alert.alert('Thành công', 'Đã cập nhật thông tin mới nhất');
      } else {
        throw new Error('Dữ liệu người dùng không hợp lệ');
      }
    } catch (error) {
      console.error("Error refreshing user info:", error);
      Alert.alert('Lỗi', 'Không thể làm mới thông tin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý hiển thị modal chỉnh sửa
  const handleEdit = (key, label, value, type = 'text') => {
    console.log(`Editing field: ${key}, current value: ${value}`);
    setCurrentField({ key, label, value: value || '', type });
    setEditModalVisible(true);
  };

  // Lưu thông tin đã chỉnh sửa
  const handleSave = async () => {
    if (!currentField.value && currentField.key !== 'address') {
      Alert.alert('Lỗi', `${currentField.label} không được để trống`);
      return;
    }
    
    setLoading(true);
    setUpdatingField(currentField.key);
    console.log(`Saving field: ${currentField.key}, new value: ${currentField.value}`);
    
    try {
      // Cập nhật dữ liệu người dùng trong state
      const updatedUserInfo = {
        ...userInfo,
        [currentField.key]: currentField.value
      };
      
      // Nếu đang ở chế độ đăng nhập, gửi API cập nhật thông tin
      if (isLoggedIn) {
        const token = getToken();
        console.log("Using token for update:", token ? "exists" : "null");
        
        // Xây dựng dữ liệu cập nhật
        const updateData = { [currentField.key]: currentField.value };
        console.log("Update data:", updateData);
        
        try {
          // Gọi API cập nhật
          const response = await fetch(API_ENDPOINTS.PROFILE, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          });
          
          console.log("API response status:", response.status);
          
          if (!response.ok) {
            let errorMessage = 'Không thể cập nhật thông tin';
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch (e) {
              console.error("Error parsing error response:", e);
            }
            throw new Error(errorMessage);
          }
          
          // Lấy dữ liệu phản hồi từ API
          const responseData = await response.json();
          console.log("API response data:", responseData);
          
          // Kiểm tra nhiều cấu trúc phản hồi API khác nhau
          if (responseData && (responseData.user || responseData.data || responseData)) {
            // Nếu API trả về toàn bộ thông tin người dùng, sử dụng nó
            const userObject = responseData.user || responseData.data || responseData;
            await updateUserInfo(userObject);
            setUserInfo(userObject);
          } else {
            // Nếu không, sử dụng dữ liệu được cập nhật cục bộ
            await updateUserInfo(updatedUserInfo);
            setUserInfo(updatedUserInfo);
          }
          
          // Đánh dấu trường vừa được cập nhật để tạo highlight
          setHighlightedField(currentField.key);
          setTimeout(() => {
            setHighlightedField('');
          }, 2000); // Tắt highlight sau 2 giây
          
          setEditModalVisible(false);
          Alert.alert('Thành công', 'Đã cập nhật thông tin');
        } catch (apiError) {
          console.error("API error during update:", apiError);
          throw apiError;
        }
      } else {
        // Nếu chưa đăng nhập, chỉ cập nhật state local
        setUserInfo(updatedUserInfo);
        
        // Đánh dấu trường vừa được cập nhật
        setHighlightedField(currentField.key);
        setTimeout(() => {
          setHighlightedField('');
        }, 2000); // Tắt highlight sau 2 giây
        
        setEditModalVisible(false);
        Alert.alert('Thành công', 'Đã cập nhật thông tin (chế độ offline)');
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
      setUpdatingField('');
    }
  };

  // Xử lý khi nhấn nút đăng nhập
  const handleLogin = () => {
    // Điều hướng đến màn hình LoginScreen trên MedicalStack
    navigation.navigate('Trang chủ', {
      screen: 'LoginScreen'
    });
  };

  if (loading && !userInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userInfo && !isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>Vui lòng đăng nhập để xem thông tin cá nhân</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={refreshUserInfo}
          disabled={loading}
        >
          <Ionicons name="refresh" size={20} color="#4285F4" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.editModeButton}
          onPress={() => setEditMode(!editMode)}
        >
          <Text style={styles.editModeButtonText}>{editMode ? 'Xong' : 'Sửa'}</Text>
        </TouchableOpacity>
      </View>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingOverlayText}>
            {updatingField ? `Đang cập nhật ${updatingField}...` : 'Đang xử lý...'}
          </Text>
        </View>
      )}
      
      <ScrollView style={styles.content}>
        {/* Thông tin cơ bản */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="person" size={22} color="#4285F4" />
            <Text style={styles.infoHeaderText}>Thông tin cơ bản</Text>
          </View>
          
          <InfoItem 
            label="Họ và tên"
            value={userInfo?.name}
            editMode={editMode}
            onEdit={() => handleEdit('name', 'Họ và tên', userInfo?.name)}
            highlighted={highlightedField === 'name'}
          />
          
          <InfoItem 
            label="Email"
            value={userInfo?.email}
            editMode={editMode}
            onEdit={() => handleEdit('email', 'Email', userInfo?.email, 'email')}
            highlighted={highlightedField === 'email'}
          />
          
          <InfoItem 
            label="Số điện thoại"
            value={userInfo?.phone}
            editMode={editMode}
            onEdit={() => handleEdit('phone', 'Số điện thoại', userInfo?.phone, 'phone')}
            highlighted={highlightedField === 'phone'}
          />
          
          <InfoItem 
            label="Tuổi"
            value={userInfo?.age ? userInfo.age.toString() : ''}
            editMode={editMode}
            onEdit={() => handleEdit('age', 'Tuổi', userInfo?.age ? userInfo.age.toString() : '', 'number')}
            highlighted={highlightedField === 'age'}
          />
          
          <InfoItem 
            label="Địa chỉ"
            value={userInfo?.address}
            editMode={editMode}
            onEdit={() => handleEdit('address', 'Địa chỉ', userInfo?.address)}
            highlighted={highlightedField === 'address'}
          />
        </View>
        
        {/* Thông tin giấy tờ */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="document-text" size={22} color="#4285F4" />
            <Text style={styles.infoHeaderText}>Thông tin giấy tờ</Text>
          </View>
          
          <InfoItem 
            label="Mã thẻ BHYT"
            value={userInfo?.healthInsuranceId}
            editMode={editMode}
            onEdit={() => handleEdit('healthInsuranceId', 'Mã thẻ BHYT', userInfo?.healthInsuranceId)}
            highlighted={highlightedField === 'healthInsuranceId'}
          />
          
          <InfoItem 
            label="CMND/CCCD"
            value={userInfo?.nationalId}
            editMode={editMode}
            onEdit={() => handleEdit('nationalId', 'CMND/CCCD', userInfo?.nationalId)}
            highlighted={highlightedField === 'nationalId'}
          />
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>
      
      {/* Modal chỉnh sửa thông tin */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa {currentField.label}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEditModalVisible(false)}
                disabled={loading}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <TextInput 
              style={styles.modalInput}
              value={currentField.value}
              onChangeText={(text) => setCurrentField({...currentField, value: text})}
              placeholder={`Nhập ${currentField.label.toLowerCase()}`}
              keyboardType={
                currentField.type === 'number' ? 'numeric' : 
                currentField.type === 'email' ? 'email-address' : 
                currentField.type === 'phone' ? 'phone-pad' : 
                'default'
              }
              editable={!loading}
            />
            
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Component hiển thị từng mục thông tin
const InfoItem = ({ label, value, editMode, onEdit, highlighted }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>
      <Text style={[
        styles.infoValue,
        highlighted && styles.highlightedValue
      ]}>
        {value || '--'}
      </Text>
      {editMode && (
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={20} color="#4285F4" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingOverlayText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4285F4',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    flex: 1,
    color: '#333',
  },
  refreshButton: {
    padding: 5,
    marginRight: 10,
  },
  editModeButton: {
    padding: 5,
  },
  editModeButtonText: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  infoLabel: {
    flex: 0.4,
    fontSize: 14,
    color: '#666',
  },
  infoValueContainer: {
    flex: 0.6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  highlightedValue: {
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
    fontWeight: 'bold',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  editButton: {
    padding: 5,
  },
  spacer: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#4285F4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PersonalInfoScreen;