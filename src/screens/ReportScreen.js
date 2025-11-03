// src/screens/ReportScreen.js - New version with backend integration
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { relativesService, allergiesService, vaccinesService, analysesService, medicalRecordsService } from '../services/apiService';

const { width } = Dimensions.get('window');
const cardSize = (width - 50) / 2; // Kích thước cho mỗi thẻ (2 thẻ trên một hàng)

// Helper function to calculate BMI
const calculateBMI = (weight, height) => {
  if (!weight || !height) return 'N/A';

  // Remove units and convert to numbers
  const weightNum = parseFloat(weight.toString().replace(/[^\d.]/g, ''));
  const heightNum = parseFloat(height.toString().replace(/[^\d.]/g, ''));

  if (weightNum <= 0 || heightNum <= 0) return 'N/A';

  // Convert height from cm to meters if needed
  const heightInMeters = heightNum > 3 ? heightNum / 100 : heightNum;

  const bmi = weightNum / (heightInMeters * heightInMeters);

  // Return BMI with classification
  const bmiValue = bmi.toFixed(1);
  let classification = '';

  if (bmi < 18.5) classification = '(Thiếu cân)';
  else if (bmi < 25) classification = '(Bình thường)';
  else if (bmi < 30) classification = '(Thừa cân)';
  else classification = '(Béo phì)';

  return `${bmiValue} ${classification}`;
};

const ReportScreen = ({ navigation }) => {
  const { getToken, getUserInfo } = useContext(AuthContext);
  const userToken = getToken();
  const userInfo = getUserInfo();
  
  const [searchText, setSearchText] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientModalVisible, setPatientModalVisible] = useState(false);
  const [relatives, setRelatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data counts for each report type
  const [reportCounts, setReportCounts] = useState({
    allergies: 0,
    vaccines: 0,
    analyses: 0,
    medicalRecords: 0,
  });

  // Load data when screen mounts
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load data when screen focuses
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (selectedPatient) {
        loadReportCounts(selectedPatient._id);
      }
    });
    return unsubscribe;
  }, [navigation, selectedPatient]);

  // Load initial data (relatives and set default patient)
  const loadInitialData = async () => {
    try {
      setLoading(true);

      if (!userToken) {
        setLoading(false);
        return;
      }

      // Load danh sách người thân từ API
      const relativesData = await relativesService.getAll();
      console.log('📋 Loaded relatives from API:', relativesData);

      // Find existing "self" relative record
      const selfRelative = relativesData.find(rel => rel.relationship === 'Bản thân');
      console.log('🔍 Found self relative:', selfRelative);

      let currentUserAsPatient;

      if (selfRelative) {
        // Use existing self relative
        currentUserAsPatient = {
          ...selfRelative,
          isCurrentUser: true
        };
      } else {
        // Create a fallback object for current user (will show empty data)
        currentUserAsPatient = {
          _id: 'current_user',
          name: userInfo?.name || 'Bạn',
          age: userInfo?.age || 30,
          relationship: 'Bản thân',
          phone: userInfo?.phone || '',
          address: userInfo?.address || '',
          gender: userInfo?.gender || 'Nam',
          bloodType: userInfo?.bloodType || 'O+',
          weight: userInfo?.weight || '70 kg',
          isCurrentUser: true,
          user: userInfo?._id
        };
      }

      // Combine current user with other relatives (exclude self from relatives list)
      const otherRelatives = relativesData.filter(rel => rel.relationship !== 'Bản thân');
      const allPatients = [currentUserAsPatient, ...otherRelatives];
      setRelatives(allPatients);

      // Set default patient (current user)
      setSelectedPatient(currentUserAsPatient);

      // Load report counts for default patient
      await loadReportCounts(currentUserAsPatient._id);

    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Load report counts for selected patient
  const loadReportCounts = async (patientId) => {
    try {
      console.log('📊 Loading report counts for patient:', patientId);

      if (patientId === 'current_user') {
        // For fallback current user, we don't have backend data yet
        setReportCounts({
          allergies: 0,
          vaccines: 0,
          analyses: 0,
          medicalRecords: 0,
        });
        return;
      }

      // Load data counts from APIs
      const [allergiesData, vaccinesData, analysesData, medicalRecordsData] = await Promise.allSettled([
        allergiesService.getByRelativeId(patientId),
        vaccinesService.getByRelativeId(patientId),
        analysesService.getByRelativeId(patientId),
        medicalRecordsService.getByRelativeId(patientId),
      ]);

      setReportCounts({
        allergies: allergiesData.status === 'fulfilled' ? allergiesData.value?.length || 0 : 0,
        vaccines: vaccinesData.status === 'fulfilled' ? vaccinesData.value?.length || 0 : 0,
        analyses: analysesData.status === 'fulfilled' ? analysesData.value?.length || 0 : 0,
        medicalRecords: medicalRecordsData.status === 'fulfilled' ? medicalRecordsData.value?.length || 0 : 0,
      });

      console.log('📊 Report counts loaded:', {
        allergies: allergiesData.status === 'fulfilled' ? allergiesData.value?.length || 0 : 0,
        vaccines: vaccinesData.status === 'fulfilled' ? vaccinesData.value?.length || 0 : 0,
        analyses: analysesData.status === 'fulfilled' ? analysesData.value?.length || 0 : 0,
        medicalRecords: medicalRecordsData.status === 'fulfilled' ? medicalRecordsData.value?.length || 0 : 0,
      });

    } catch (error) {
      console.error('❌ Error loading report counts:', error);
      // Don't show alert for count loading errors, just use 0 values
      setReportCounts({
        allergies: 0,
        vaccines: 0,
        analyses: 0,
        medicalRecords: 0,
      });
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // Handle card press
  const handleCardPress = (cardType) => {
    if (!userToken) {
      Alert.alert(
        'Đăng nhập cần thiết',
        'Vui lòng đăng nhập để xem báo cáo y tế',
        [
          { text: 'Hủy' },
          { 
            text: 'Đăng nhập', 
            onPress: () => navigation.navigate('Trang chủ', { screen: 'LoginScreen' })
          }
        ]
      );
      return;
    }

    if (!selectedPatient) {
      Alert.alert('Thông báo', 'Vui lòng chọn bệnh nhân');
      return;
    }
    
    // Navigate to appropriate screen with patient info
    switch (cardType) {
      case 'allergies':
        navigation.navigate('AllergiesScreen', { 
          selectedPatient: selectedPatient,
          fromReport: true 
        });
        break;
      case 'analysis':
        navigation.navigate('AnalysisScreen', { 
          selectedPatient: selectedPatient,
          fromReport: true 
        });
        break;
      case 'vaccines':
        navigation.navigate('VaccinesScreen', { 
          selectedPatient: selectedPatient,
          fromReport: true 
        });
        break;
      case 'records':
        navigation.navigate('MedicalRecordsScreen', { 
          selectedPatient: selectedPatient,
          fromReport: true 
        });
        break;
      default:
        break;
    }
  };

  // Handle patient selection
  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);
    setPatientModalVisible(false);
    
    // Load report counts for new patient
    await loadReportCounts(patient._id);
  };

  // Render patient item in modal
  const renderPatientItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.patientItem,
        selectedPatient?._id === item._id && styles.selectedPatientItem
      ]}
      onPress={() => handlePatientSelect(item)}
    >
      <View style={styles.patientIconContainer}>
        <Icon 
          name={item.isCurrentUser ? 'person' : 'people'} 
          size={20} 
          color="#4285F4" 
        />
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientRelation}>
          {item.age} tuổi - {item.relationship}
        </Text>
      </View>
      {selectedPatient?._id === item._id && (
        <Icon name="checkmark-circle" size={20} color="#4285F4" />
      )}
    </TouchableOpacity>
  );

  // Render card with count
  const renderReportCard = (type, icon, title, subtitle, color, count) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: 'white' }]}
      onPress={() => handleCardPress(type)}
    >
      <View style={[styles.cardIconContainer, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color="white" />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4285F4']}
            tintColor="#4285F4"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Báo cáo y tế</Text>
          <Text style={styles.headerSubtitle}>Theo dõi sức khỏe của bạn</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm báo cáo, xét nghiệm..."
            placeholderTextColor="#A0A0A0"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Patient Selector or Login Prompt */}
        {userToken && selectedPatient ? (
          <TouchableOpacity 
            style={styles.patientSelector}
            onPress={() => setPatientModalVisible(true)}
          >
            <View style={styles.selectedPatientContainer}>
              <View style={styles.selectedPatientIcon}>
                <Icon 
                  name={selectedPatient.isCurrentUser ? 'person' : 'people'} 
                  size={20} 
                  color="#4285F4" 
                />
              </View>
              <View style={styles.selectedPatientInfo}>
                <Text style={styles.selectedPatientName}>{selectedPatient.name}</Text>
                <Text style={styles.selectedPatientRelation}>{selectedPatient.relationship}</Text>
              </View>
              <Icon name="chevron-down" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.loginPromptContainer}>
            <Icon name="lock-closed-outline" size={60} color="#ddd" />
            <Text style={styles.loginPromptText}>Vui lòng đăng nhập để xem báo cáo y tế</Text>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Trang chủ', { screen: 'LoginScreen' })}
            >
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Patient Info Cards */}
        {userToken && selectedPatient && (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <Icon name="person-outline" size={20} color="#4285F4" />
                <Text style={styles.infoLabel}>Giới tính</Text>
                <Text style={styles.infoValue}>{selectedPatient.gender || 'Chưa cập nhật'}</Text>
              </View>

              <View style={styles.infoCard}>
                <Icon name="water-outline" size={20} color="#E53935" />
                <Text style={styles.infoLabel}>Nhóm máu</Text>
                <Text style={styles.infoValue}>{selectedPatient.bloodType || 'Chưa xác định'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <Icon name="calendar-outline" size={20} color="#FF9800" />
                <Text style={styles.infoLabel}>Tuổi</Text>
                <Text style={styles.infoValue}>{selectedPatient.age} tuổi</Text>
              </View>

              <View style={styles.infoCard}>
                <Icon name="fitness-outline" size={20} color="#4CAF50" />
                <Text style={styles.infoLabel}>BMI</Text>
                <Text style={styles.infoValue}>
                  {selectedPatient.height && selectedPatient.weight
                    ? calculateBMI(selectedPatient.weight, selectedPatient.height)
                    : 'Chưa cập nhật'
                  }
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Category Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.cardsRow}>
            {/* Dị ứng */}
            {renderReportCard(
              'allergies',
              'medical-outline',
              'Dị ứng',
              'Thông tin dị ứng',
              '#E53935',
              reportCounts.allergies
            )}
            
            {/* Phân tích */}
            {renderReportCard(
              'analysis',
              'flask-outline',
              'Phân tích',
              'Kết quả xét nghiệm',
              '#FF9800',
              reportCounts.analyses
            )}
          </View>
          
          <View style={styles.cardsRow}>
            {/* Vắc-xin */}
            {renderReportCard(
              'vaccines',
              'shield-checkmark-outline',
              'Vắc-xin',
              'Lịch sử tiêm chủng',
              '#4CAF50',
              reportCounts.vaccines
            )}
            
            {/* Hồ sơ bệnh án */}
            {renderReportCard(
              'records',
              'document-text-outline',
              'Hồ sơ bệnh án',
              'Lịch sử khám bệnh',
              '#9C27B0',
              reportCounts.medicalRecords
            )}
          </View>
        </View>
      </ScrollView>

      {/* Patient Selection Modal */}
      <Modal
        visible={patientModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPatientModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn bệnh nhân</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPatientModalVisible(false)}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={relatives}
              keyExtractor={(item) => item._id}
              renderItem={renderPatientItem}
              style={styles.patientList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  scrollView: {
    flex: 1,
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#F0F7FF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  patientSelector: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPatientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  selectedPatientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedPatientInfo: {
    flex: 1,
  },
  selectedPatientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedPatientRelation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  loginPromptContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginPromptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    width: cardSize,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4285F4',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  patientList: {
    maxHeight: 300,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedPatientItem: {
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
  },
  patientIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  patientRelation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default ReportScreen;