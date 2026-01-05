// src/screens/RelativeCareScreen.js - Fixed để truyền đúng thông tin người thân
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { relativesService } from '../services/apiService';

const RelativeCareScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  
  // State cho danh sách người thân
  const [relatives, setRelatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State cho modal chọn người thân
  const [userModalVisible, setUserModalVisible] = useState(false);
  
  // Người thân hiện tại đã chọn
  const [currentRelative, setCurrentRelative] = useState(null);
  
  // State cho các dịch vụ
  const [services, setServices] = useState([
    { id: 1, name: 'Đặt lịch khám', selected: true },
    { id: 2, name: 'Cập nhật thông tin sức khỏe', selected: false },
    { id: 3, name: 'Tư vấn từ xa', selected: false },
  ]);

  // State cho mô tả triệu chứng
  const [symptoms, setSymptoms] = useState('');

  // Load danh sách người thân khi màn hình được mount
  useEffect(() => {
    loadRelatives();
  }, []);

  // Reload khi navigate back từ các màn hình khác
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadRelatives();
    });
    return unsubscribe;
  }, [navigation]);

  // Load danh sách người thân
  const loadRelatives = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để sử dụng tính năng này');
        navigation.navigate('LoginScreen');
        return;
      }
      
      // Gọi API lấy danh sách người thân
      const data = await relativesService.getAll();
      console.log('Relatives data loaded:', data);
      setRelatives(data);
      
      // Thiết lập người thân mặc định (người đầu tiên trong danh sách)
      if (data && data.length > 0) {
        setCurrentRelative(data[0]);
        console.log('Default relative selected:', data[0]);
      }
    } catch (error) {
      console.error('Error loading relatives:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người thân');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Xử lý refresh danh sách
  const handleRefresh = () => {
    setRefreshing(true);
    loadRelatives();
  };

  // Xử lý khi đổi người thân
  const handleChangeRelative = (relative) => {
    console.log('Selected relative:', relative);
    setCurrentRelative(relative);
    setUserModalVisible(false);
  };
  
  // Xử lý khi chọn/bỏ chọn dịch vụ
  const toggleService = (id) => {
    setServices(
      services.map((service) =>
        service.id === id 
          ? { ...service, selected: !service.selected } 
          : service
      )
    );
  };

  // Tiếp tục đến màn hình MedicalExam
  const handleNext = () => {
    if (!currentRelative) {
      Alert.alert('Thông báo', 'Vui lòng chọn người thân trước khi tiếp tục');
      return;
    }
    
    // Kiểm tra thông tin bắt buộc của người thân
    if (!currentRelative.name || !currentRelative.phone) {
      Alert.alert(
        'Thông tin chưa đầy đủ',
        'Thông tin người thân chưa đầy đủ (thiếu tên hoặc số điện thoại). Vui lòng cập nhật thông tin người thân trước khi tiếp tục.',
        [
          { text: 'Hủy' },
          {
            text: 'Cập nhật',
            onPress: () => navigation.navigate('Người dùng', {
              screen: 'RelativesManagement'
            })
          }
        ]
      );
      return;
    }
    
    console.log('Navigating to MedicalExam with relative:', currentRelative);
    
    // Điều hướng đến màn hình MedicalExam với thông tin người thân đã chọn
    navigation.navigate('MedicalExam', {
      relative: currentRelative, // Truyền thông tin người thân đã chọn
      services: services.filter(service => service.selected),
      symptoms: symptoms
    });
  };

  // Render mỗi người thân trong modal
  const renderRelativeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => handleChangeRelative(item)}
    >
      <View style={styles.userItemIcon}>
        <Ionicons name="person" size={24} color="#4285F4" />
      </View>
      <View style={styles.userItemInfo}>
        <Text style={styles.userItemName}>{item.name}</Text>
        <Text style={styles.userItemAge}>
          {item.age} tuổi{item.relationship ? ` - ${item.relationship}` : ''}
        </Text>
        {item.phone && (
          <Text style={styles.userItemPhone}>SĐT: {item.phone}</Text>
        )}
        {item.address && (
          <Text style={styles.userItemAddress}>Địa chỉ: {item.address}</Text>
        )}
      </View>
      {currentRelative && currentRelative._id === item._id && (
        <Ionicons name="checkmark-circle" size={24} color="#4285F4" />
      )}
    </TouchableOpacity>
  );

  if (loading && !currentRelative) {
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
          <Text style={styles.headerTitle}>Chăm sóc sức khỏe người thân</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải danh sách người thân...</Text>
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
        <Text style={styles.headerTitle}>Chăm sóc sức khỏe người thân</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Không có người thân */}
        {relatives.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>Bạn chưa có người thân nào</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('Người dùng', {
                screen: 'RelativeForm'
              })}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Thêm người thân</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* User Selection */}
            <TouchableOpacity 
              style={styles.selectedUserItem}
              onPress={() => setUserModalVisible(true)}
            >
              <View style={styles.selectedUserIcon}>
                <Ionicons name="person" size={24} color="#4285F4" />
              </View>
              <View style={styles.selectedUserInfo}>
                <Text style={styles.selectedUserName}>
                  {currentRelative ? currentRelative.name : 'Chọn người thân'}
                </Text>
                {currentRelative && (
                  <>
                    <Text style={styles.selectedUserAge}>
                      {currentRelative.age} tuổi
                      {currentRelative.relationship ? ` - ${currentRelative.relationship}` : ''}
                    </Text>
                    {currentRelative.phone && (
                      <Text style={styles.selectedUserPhone}>SĐT: {currentRelative.phone}</Text>
                    )}
                    {currentRelative.address && (
                      <Text style={styles.selectedUserAddress}>Địa chỉ: {currentRelative.address}</Text>
                    )}
                  </>
                )}
              </View>
              <Ionicons name="chevron-forward" size={24} color="#A0A0A0" />
            </TouchableOpacity>

            {/* Services */}
            <View style={styles.servicesContainer}>
              <Text style={styles.sectionTitle}>Dịch vụ</Text>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceItem}
                  onPress={() => toggleService(service.id)}
                >
                  <View style={[
                    styles.checkbox, 
                    service.selected ? styles.checkboxSelected : {}
                  ]}>
                    {service.selected && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.serviceText}>{service.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Symptoms Description */}
            <View style={styles.symptomsContainer}>
              <Text style={styles.sectionTitle}>Mô tả một số triệu chứng</Text>
              <TextInput
                style={styles.symptomsInput}
                placeholder="Mô tả sơ bộ triệu chứng để chúng tôi phục vụ tốt hơn...!"
                multiline
                placeholderTextColor="#888"
                value={symptoms}
                onChangeText={setSymptoms}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Next Button - only show if there are relatives */}
      {relatives.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Tiếp theo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal chọn người thân */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={userModalVisible}
        onRequestClose={() => setUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn người thân</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setUserModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={relatives}
              renderItem={renderRelativeItem}
              keyExtractor={item => item._id}
              style={styles.userList}
              contentContainerStyle={relatives.length === 0 ? styles.emptyList : null}
              ListEmptyComponent={() => (
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>Không có người thân nào</Text>
                </View>
              )}
            />
            
            <TouchableOpacity 
              style={styles.addUserButton}
              onPress={() => {
                setUserModalVisible(false);
                navigation.navigate('Người dùng', {
                  screen: 'RelativeForm'
                });
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" style={styles.addUserIcon} />
              <Text style={styles.addUserText}>Thêm người thân mới</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: 500,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  selectedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedUserIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  selectedUserInfo: {
    flex: 1,
  },
  selectedUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedUserAge: {
    fontSize: 14,
    color: '#666',
  },
  selectedUserPhone: {
    fontSize: 14,
    color: '#4285F4',
    marginTop: 2,
  },
  selectedUserAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  servicesContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#4285F4',
  },
  serviceText: {
    fontSize: 16,
    color: '#000',
  },
  symptomsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  symptomsInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
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
  userList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userItemInfo: {
    flex: 1,
  },
  userItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  userItemAge: {
    fontSize: 14,
    color: '#666',
  },
  userItemPhone: {
    fontSize: 12,
    color: '#4285F4',
    marginTop: 2,
  },
  userItemAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addUserButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addUserIcon: {
    marginRight: 10,
  },
  addUserText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RelativeCareScreen;