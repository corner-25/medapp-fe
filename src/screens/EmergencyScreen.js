// src/screens/EmergencyScreen.js (Đã cập nhật để ghi nhận chi tiết dịch vụ)
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { relativesService } from '../services/apiService';

const EmergencyScreen = ({ navigation }) => {
  // Lấy context xác thực
  const { getToken, getUserInfo } = useContext(AuthContext);
  
  // State cho danh sách người dùng và người thân
  const [relatives, setRelatives] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State cho modal chọn người dùng
  const [userModalVisible, setUserModalVisible] = useState(false);
  
  // State cho các dịch vụ với thông tin chi tiết
  const [services, setServices] = useState([
    { 
      id: 1, 
      name: 'Có băng ca', 
      selected: false,
      description: 'Xe cấp cứu được trang bị băng ca chuyên dụng để vận chuyển bệnh nhân an toàn',
      price: 200000
    },
    { 
      id: 2, 
      name: 'Nhân viên sơ cứu', 
      selected: false,
      description: 'Có nhân viên y tế chuyên nghiệp đi cùng để sơ cứu khẩn cấp',
      price: 500000
    },
    { 
      id: 3, 
      name: 'Bác sĩ đi cùng', 
      selected: false,
      description: 'Có bác sĩ chuyên khoa đi cùng để xử lý các tình huống phức tạp',
      price: 1000000
    },
    { 
      id: 4, 
      name: 'Thiết bị hỗ trợ thở', 
      selected: false,
      description: 'Máy thở và các thiết bị hỗ trợ hô hấp khẩn cấp',
      price: 300000
    },
  ]);
  
  // State cho mô tả triệu chứng
  const [symptoms, setSymptoms] = useState('');

  // Load thông tin người dùng và danh sách người thân khi màn hình được mount
  useEffect(() => {
    loadUserAndRelatives();
  }, []);

  // Reload khi navigate back từ các màn hình khác
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserAndRelatives();
    });
    return unsubscribe;
  }, [navigation]);

  // Load thông tin người dùng hiện tại và danh sách người thân
  const loadUserAndRelatives = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        // Nếu chưa đăng nhập, điều hướng đến màn hình đăng nhập
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để sử dụng tính năng này');
        navigation.navigate('LoginScreen');
        return;
      }
      
      // Lấy thông tin người dùng hiện tại
      const userInfo = getUserInfo();
      console.log('Current user info:', userInfo);
      
      // Tạo đối tượng người dùng hiện tại - LUÔN có thể chọn
      if (userInfo) {
        const currentUserData = {
          _id: 'current_user', // ID đặc biệt cho người dùng hiện tại
          id: 'current_user',
          name: userInfo.name || 'Bạn',
          age: userInfo.age || 30,
          relationship: 'Bản thân',
          phone: userInfo.phone || '',
          address: userInfo.address || '',
          nationalId: userInfo.nationalId || '',
          healthInsuranceId: userInfo.healthInsuranceId || '',
          isSelected: true
        };
        setCurrentUser(currentUserData);
        console.log('Set current user as default:', currentUserData);
      }
      
      // Gọi API lấy danh sách người thân (không bắt buộc)
      try {
        const relativesData = await relativesService.getAll();
        console.log('Relatives data from API:', relativesData);
        
        // Chuẩn hóa dữ liệu người thân để phù hợp với giao diện
        const normalizedRelatives = relativesData.map(relative => ({
          ...relative,
          id: relative._id || relative.id,
          isSelected: false
        }));
        
        setRelatives(normalizedRelatives);
      } catch (relativesError) {
        console.log('Không thể tải danh sách người thân (không sao):', relativesError);
        // Không hiển thị lỗi vì có thể chưa có người thân
        setRelatives([]);
      }
      
    } catch (error) {
      console.error('Error loading user info:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Xử lý refresh danh sách
  const handleRefresh = () => {
    setRefreshing(true);
    loadUserAndRelatives();
  };

  // Xử lý khi đổi người dùng
  const handleChangeUser = (selectedPerson) => {
    console.log('Selected person:', selectedPerson);
    setCurrentUser(selectedPerson);
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

  // Format currency VND
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Tính tổng chi phí các dịch vụ đã chọn
  const calculateTotalServiceCost = () => {
    return services
      .filter(service => service.selected)
      .reduce((total, service) => total + service.price, 0);
  };

  // Tiếp tục đến màn hình xác nhận đơn hàng
  const handleNext = () => {
    if (!currentUser) {
      Alert.alert('Thông báo', 'Vui lòng chọn người cần cấp cứu trước khi tiếp tục');
      return;
    }

    // Kiểm tra thông tin bắt buộc - nếu thiếu thì yêu cầu cập nhật
    const missingInfo = [];
    
    if (!currentUser.phone) {
      missingInfo.push('số điện thoại');
    }
    
    if (!currentUser.address) {
      missingInfo.push('địa chỉ');
    }
    
    if (missingInfo.length > 0) {
      Alert.alert(
        'Thông tin chưa đầy đủ', 
        `Vui lòng cập nhật ${missingInfo.join(' và ')} trong hồ sơ trước khi gọi cấp cứu.`,
        [
          { text: 'Hủy' },
          { 
            text: 'Cập nhật', 
            onPress: () => {
              // Điều hướng đến màn hình cập nhật thông tin
              navigation.navigate('Người dùng', {
                screen: 'PersonalInfo'
              });
            }
          }
        ]
      );
      return;
    }

    // Lấy danh sách dịch vụ đã chọn với thông tin chi tiết
    const selectedServicesList = services.filter(service => service.selected);
    
    console.log('Selected services:', selectedServicesList);
    console.log('Symptoms:', symptoms);
    console.log('Total cost:', calculateTotalServiceCost());

    // Tạo đối tượng dữ liệu để truyền sang màn hình tiếp theo
    const emergencyData = {
      patient: currentUser,
      selectedServices: selectedServicesList,
      symptoms: symptoms,
      totalServiceCost: calculateTotalServiceCost(),
      baseCost: 200000, // Chi phí cơ bản gọi xe cấp cứu
      totalCost: 200000 + calculateTotalServiceCost()
    };

    navigation.navigate('EmergencyMap', emergencyData);
  };

  // Render mỗi người trong modal (bao gồm cả người dùng hiện tại và người thân)
  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => handleChangeUser(item)}
    >
      <View style={styles.userItemIcon}>
        <Icon 
          name={item.relationship === 'Bản thân' ? 'person' : 'people'} 
          size={24} 
          color="#4285F4" 
        />
      </View>
      <View style={styles.userItemInfo}>
        <Text style={styles.userItemName}>{item.name}</Text>
        <Text style={styles.userItemAge}>
          {item.age} tuổi
          {item.relationship && item.relationship !== 'Bản thân' ? ` - ${item.relationship}` : ''}
          {item.relationship === 'Bản thân' ? ' (Bạn)' : ''}
        </Text>
        {item.phone && (
          <Text style={styles.userItemPhone}>SĐT: {item.phone}</Text>
        )}
      </View>
      {currentUser && currentUser.id === item.id && (
        <Icon name="checkmark-circle" size={24} color="#4285F4" />
      )}
    </TouchableOpacity>
  );

  // Tạo danh sách tất cả người (người dùng hiện tại + người thân)
  const getAllPersons = () => {
    const allPersons = [];
    if (currentUser && currentUser.relationship === 'Bản thân') {
      allPersons.push(currentUser);
    }
    allPersons.push(...relatives);
    return allPersons;
  };

  if (loading && !currentUser && relatives.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cấp cứu</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
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
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cấp cứu</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Selection */}
        <TouchableOpacity 
          style={styles.selectedUserItem}
          onPress={() => setUserModalVisible(true)}
        >
          <View style={styles.selectedUserIcon}>
            <Icon 
              name={currentUser?.relationship === 'Bản thân' ? 'person' : 'people'} 
              size={24} 
              color="#4285F4" 
            />
          </View>
          <View style={styles.selectedUserInfo}>
            <Text style={styles.selectedUserName}>
              {currentUser ? currentUser.name : 'Chọn người cần cấp cứu'}
            </Text>
            {currentUser && (
              <>
                <Text style={styles.selectedUserAge}>
                  {currentUser.age} tuổi
                  {currentUser.relationship && currentUser.relationship !== 'Bản thân' 
                    ? ` - ${currentUser.relationship}` 
                    : ' (Bạn)'
                  }
                </Text>
                {currentUser.phone && (
                  <Text style={styles.selectedUserPhone}>SĐT: {currentUser.phone}</Text>
                )}
              </>
            )}
          </View>
          <Icon name="chevron-forward" size={24} color="#A0A0A0" />
        </TouchableOpacity>

        {/* Services */}
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Dịch vụ bổ sung</Text>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceItem, service.selected && styles.selectedServiceItem]}
              onPress={() => toggleService(service.id)}
            >
              <View style={[
                styles.checkbox, 
                service.selected ? styles.checkboxSelected : {}
              ]}>
                {service.selected && (
                  <Icon name="checkmark" size={18} color="#fff" />
                )}
              </View>
              <View style={styles.serviceContent}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceText}>{service.name}</Text>
                  <Text style={styles.servicePrice}>{formatCurrency(service.price)} VND</Text>
                </View>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Tổng chi phí dịch vụ */}
          {calculateTotalServiceCost() > 0 && (
            <View style={styles.serviceTotalContainer}>
              <Text style={styles.serviceTotalLabel}>Tổng chi phí dịch vụ:</Text>
              <Text style={styles.serviceTotalAmount}>
                {formatCurrency(calculateTotalServiceCost())} VND
              </Text>
            </View>
          )}
        </View>

        {/* Symptoms Description */}
        <View style={styles.symptomsContainer}>
          <Text style={styles.sectionTitle}>Mô tả triệu chứng *</Text>
          <TextInput
            style={styles.symptomsInput}
            placeholder="Mô tả chi tiết triệu chứng của bệnh nhân để đội ngũ y tế chuẩn bị tốt nhất..."
            multiline
            placeholderTextColor="#888"
            value={symptoms}
            onChangeText={setSymptoms}
          />
          <Text style={styles.symptomsNote}>
            * Thông tin này rất quan trọng để đội cấp cứu chuẩn bị phương án xử lý phù hợp
          </Text>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.nextButton, (!currentUser || !symptoms.trim()) && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!currentUser || !symptoms.trim()}
        >
          <Text style={styles.nextButtonText}>Xem thông tin đơn hàng</Text>
        </TouchableOpacity>
      </View>

      {/* Modal chọn người dùng */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={userModalVisible}
        onRequestClose={() => setUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn người cần cấp cứu</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setUserModalVisible(false)}
              >
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={getAllPersons()}
              renderItem={renderUserItem}
              keyExtractor={item => item.id}
              style={styles.userList}
              contentContainerStyle={getAllPersons().length === 0 ? styles.emptyList : null}
              ListEmptyComponent={() => (
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>Không có thông tin người dùng</Text>
                </View>
              )}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
            
            <TouchableOpacity 
              style={styles.addUserButton}
              onPress={() => {
                setUserModalVisible(false);
                navigation.navigate('Người dùng', {
                  screen: 'RelativesManagement'
                });
              }}
            >
              <Icon name="add-circle-outline" size={20} color="#fff" style={styles.addUserIcon} />
              <Text style={styles.addUserText}>Quản lý người thân</Text>
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
    alignItems: 'flex-start',
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  selectedServiceItem: {
    borderColor: '#4285F4',
    backgroundColor: '#f0f7ff',
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
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: '#4285F4',
  },
  serviceContent: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  serviceTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  serviceTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  symptomsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  symptomsInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  symptomsNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
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
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal styles (giữ nguyên như cũ)
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

export default EmergencyScreen;