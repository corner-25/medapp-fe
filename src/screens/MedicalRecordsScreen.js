// src/screens/MedicalRecordsScreen.js - Updated for ReportScreen integration
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { medicalRecordsService } from '../services/apiService';

const MedicalRecordsScreen = ({ navigation, route }) => {
  const { getToken } = useContext(AuthContext);
  
  // Get patient info from ReportScreen or route params
  const selectedPatient = route.params?.selectedPatient;
  const fromReport = route.params?.fromReport || false;
  
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load medical records data when screen mounts
  useEffect(() => {
    loadMedicalRecordsData();
  }, [selectedPatient]);

  // Load medical records data for selected patient
  const loadMedicalRecordsData = async () => {
    try {
      setLoading(true);
      
      if (!selectedPatient) {
        Alert.alert('Lỗi', 'Không có thông tin bệnh nhân');
        navigation.goBack();
        return;
      }

      console.log('🔍 Loading medical records for patient:', selectedPatient);

      // If it's current user, show empty for now (can be implemented later)
      if (selectedPatient._id === 'current_user' || selectedPatient.isCurrentUser) {
        console.log('📝 Current user selected - showing empty state');
        setMedicalRecords([]);
        setLoading(false);
        return;
      }

      // Load medical records from API for relatives
      const token = await getToken();
      if (!token) {
        Alert.alert('Lỗi xác thực', 'Vui lòng đăng nhập lại');
        navigation.navigate('LoginScreen');
        return;
      }

      const recordsData = await medicalRecordsService.getByRelativeId(selectedPatient._id);
      console.log('🏥 Loaded medical records from API:', recordsData);

      // Ensure data is array and sort by date (newest first)
      const sortedRecords = Array.isArray(recordsData) ?
        recordsData.sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

      setMedicalRecords(sortedRecords);

    } catch (error) {
      console.error('❌ Error loading medical records:', error);

      if (error.message?.includes('404') || error.message?.includes('Không tìm thấy')) {
        // No records found - this is normal
        setMedicalRecords([]);
      } else if (error.message?.includes('Network') || error.message?.includes('Failed to fetch')) {
        Alert.alert(
          'Lỗi kết nối',
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.',
          [
            { text: 'Thử lại', onPress: () => loadMedicalRecordsData() },
            { text: 'Đóng', style: 'cancel' }
          ]
        );
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        Alert.alert(
          'Lỗi xác thực',
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          [{ text: 'Đăng nhập', onPress: () => navigation.navigate('LoginScreen') }]
        );
      } else {
        Alert.alert(
          'Lỗi',
          'Không thể tải hồ sơ bệnh án. Vui lòng thử lại sau.',
          [
            { text: 'Thử lại', onPress: () => loadMedicalRecordsData() },
            { text: 'Đóng', style: 'cancel' }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicalRecordsData();
    setRefreshing(false);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format short date
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get time since visit
  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 ngày trước';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} tháng trước`;
    return `${Math.ceil(diffDays / 365)} năm trước`;
  };

  // Handle appointment booking
  const handleBookAppointment = () => {
    if (!selectedPatient) {
      Alert.alert('Lỗi', 'Không có thông tin bệnh nhân');
      return;
    }

    // Navigate to MedicalExam screen with pre-filled patient info
    navigation.navigate('Trang chủ', {
      screen: 'MedicalExam',
      params: {
        preSelectedPatient: selectedPatient,
        fromMedicalRecords: true
      }
    });
  };

  // Handle record detail view
  const handleRecordPress = (record) => {
    Alert.alert(
      'Chi tiết khám bệnh',
      `Ngày khám: ${formatDate(record.date)}\n\nChẩn đoán: ${record.diagnosis}\n\nĐiều trị: ${record.treatment}\n\nBác sĩ: ${record.doctor || 'Chưa cập nhật'}\n\nBệnh viện: ${record.hospitalName || 'Chưa cập nhật'}`,
      [
        { text: 'Đóng' },
        { 
          text: 'Đặt tái khám', 
          onPress: handleBookAppointment,
          style: 'default'
        }
      ]
    );
  };

  // Render medical record item
  const renderMedicalRecordItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recordItem}
      onPress={() => handleRecordPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.recordHeader}>
        <View style={styles.hospitalSection}>
          <View style={styles.hospitalIcon}>
            <Ionicons name="medical-outline" size={20} color="#4285F4" />
          </View>
          <View style={styles.recordInfo}>
            <Text style={styles.hospitalName}>
              {item.hospitalName || 'Bệnh viện'}
            </Text>
            <Text style={styles.doctorName}>
              BS. {item.doctor || 'Chưa cập nhật'}
            </Text>
          </View>
        </View>
        <View style={styles.dateSection}>
          <Text style={styles.recordDate}>{formatShortDate(item.date)}</Text>
          <Text style={styles.timeSince}>{getTimeSince(item.date)}</Text>
        </View>
      </View>
      
      <View style={styles.recordContent}>
        <View style={styles.diagnosisSection}>
          <Text style={styles.sectionLabel}>Chẩn đoán</Text>
          <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
        </View>
        
        <View style={styles.treatmentSection}>
          <Text style={styles.sectionLabel}>Điều trị</Text>
          <Text style={styles.treatmentText} numberOfLines={2}>
            {item.treatment}
          </Text>
        </View>
      </View>

      {/* Next Appointment */}
      {item.nextAppointment && item.nextAppointment.isScheduled && (
        <View style={styles.nextAppointmentSection}>
          <Ionicons name="calendar-outline" size={16} color="#FF9800" />
          <Text style={styles.nextAppointmentText}>
            Tái khám: {formatShortDate(item.nextAppointment.date)}
          </Text>
        </View>
      )}

      <View style={styles.recordFooter}>
        <Text style={styles.viewDetailsText}>Nhấn để xem chi tiết</Text>
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>Chưa có hồ sơ bệnh án</Text>
      <Text style={styles.emptyMessage}>
        {selectedPatient?.relationship === 'Bản thân' 
          ? 'Bạn chưa có hồ sơ bệnh án nào được ghi nhận'
          : `${selectedPatient?.name} chưa có hồ sơ bệnh án nào được ghi nhận`
        }
      </Text>
      <Text style={styles.emptyNote}>
        Hồ sơ bệnh án sẽ được tạo sau khi khám bệnh tại bệnh viện
      </Text>
      
      {/* Book Appointment Button in Empty State */}
      <TouchableOpacity 
        style={styles.emptyActionButton}
        onPress={handleBookAppointment}
      >
        <Ionicons name="add-circle-outline" size={20} color="#4285F4" />
        <Text style={styles.emptyActionText}>Đặt lịch khám ngay</Text>
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ bệnh án</Text>
        </View>
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
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ bệnh án</Text>
      </View>
      
      {/* Patient Info */}
      {selectedPatient && (
        <View style={styles.patientInfo}>
          <View style={styles.patientIconContainer}>
            <Ionicons 
              name={selectedPatient.relationship === 'Bản thân' ? 'person' : 'people'} 
              size={20} 
              color="#4285F4" 
            />
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{selectedPatient.name}</Text>
            <Text style={styles.patientRelation}>
              {selectedPatient.age} tuổi • {selectedPatient.relationship}
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{medicalRecords.length}</Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {medicalRecords.length > 0 ? (
          <>
            <FlatList
              data={medicalRecords}
              renderItem={renderMedicalRecordItem}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.recordsList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#4285F4']}
                  tintColor="#4285F4"
                />
              }
              showsVerticalScrollIndicator={false}
            />
            
            {/* Bottom Action Button */}
            <View style={styles.bottomActions}>
              <TouchableOpacity 
                style={styles.bookAppointmentButton}
                onPress={handleBookAppointment}
              >
                <Ionicons name="calendar-outline" size={20} color="white" />
                <Text style={styles.bookAppointmentText}>Đặt lịch tái khám</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          renderEmptyState()
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#F0F7FF',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Patient Info
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  patientRelation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Content
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },

  // Records List
  recordsList: {
    padding: 20,
    paddingBottom: 100,
  },
  recordItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hospitalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hospitalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  doctorName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dateSection: {
    alignItems: 'flex-end',
  },
  recordDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  timeSince: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  recordContent: {
    marginBottom: 12,
  },
  diagnosisSection: {
    marginBottom: 8,
  },
  treatmentSection: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  diagnosisText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  treatmentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  nextAppointmentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  nextAppointmentText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
    marginLeft: 6,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  bookAppointmentButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookAppointmentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  emptyNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4285F4',
  },
  emptyActionText: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default MedicalRecordsScreen;