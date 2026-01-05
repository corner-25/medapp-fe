// src/screens/EmergencyDetailScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { emergencyService } from '../services/apiService';

const EmergencyDetailScreen = ({ navigation, route }) => {
  const { emergencyId } = route.params;
  const { getToken } = useContext(AuthContext);
  
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load thông tin cấp cứu
  useEffect(() => {
    loadEmergencyDetail();
  }, [emergencyId]);

  // Auto refresh mỗi 30 giây để cập nhật trạng thái
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadEmergencyDetail(true); // Silent refresh
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading]);

  const loadEmergencyDetail = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const token = getToken();
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem chi tiết');
        navigation.goBack();
        return;
      }

      const data = await emergencyService.getById(emergencyId);
      setEmergency(data);
    } catch (error) {
      console.error('Error loading emergency detail:', error);
      if (!silent) {
        Alert.alert('Lỗi', 'Không thể tải thông tin cấp cứu');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEmergencyDetail();
  };

  // Gọi điện thoại
  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Format thời gian
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Lấy màu trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'requested':
        return '#2196F3';
      case 'dispatched':
        return '#4CAF50';
      case 'arrived':
        return '#8BC34A';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  // Lấy text trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ xử lý';
      case 'requested':
        return 'Đã tiếp nhận';
      case 'dispatched':
        return 'Xe đang trên đường';
      case 'arrived':
        return 'Xe đã đến';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  // Lấy icon trạng thái
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'requested':
        return 'checkmark-circle-outline';
      case 'dispatched':
        return 'car-outline';
      case 'arrived':
        return 'location-outline';
      case 'completed':
        return 'checkmark-done-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-outline';
    }
  };

  if (loading && !emergency) {
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
          <Text style={styles.headerTitle}>Chi tiết cấp cứu</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!emergency) {
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
          <Text style={styles.headerTitle}>Chi tiết cấp cứu</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ddd" />
          <Text style={styles.errorText}>Không tìm thấy thông tin cấp cứu</Text>
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
        <Text style={styles.headerTitle}>Chi tiết cấp cứu</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Ionicons name="refresh" size={20} color="#4285F4" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4285F4']}
          />
        }
      >
        {/* Trạng thái */}
        <View style={[styles.statusCard, { borderLeftColor: getStatusColor(emergency.status) }]}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={getStatusIcon(emergency.status)} 
              size={24} 
              color={getStatusColor(emergency.status)} 
            />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusText, { color: getStatusColor(emergency.status) }]}>
                {getStatusText(emergency.status)}
              </Text>
              <Text style={styles.statusTime}>
                Cập nhật: {formatDateTime(emergency.updatedAt || emergency.createdAt)}
              </Text>
            </View>
          </View>
          
          {emergency.estimatedArrivalTime && emergency.status === 'dispatched' && (
            <View style={styles.estimatedTime}>
              <Ionicons name="time" size={16} color="#4CAF50" />
              <Text style={styles.estimatedTimeText}>
                Dự kiến đến: {formatDateTime(emergency.estimatedArrivalTime)}
              </Text>
            </View>
          )}
        </View>

        {/* Thông tin bệnh nhân */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#4285F4" />
            <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
          </View>
          
          <View style={styles.patientInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ tên:</Text>
              <Text style={styles.infoValue}>{emergency.patientInfo.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tuổi:</Text>
              <Text style={styles.infoValue}>{emergency.patientInfo.age} tuổi</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mối quan hệ:</Text>
              <Text style={styles.infoValue}>{emergency.patientInfo.relationship}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại:</Text>
              <TouchableOpacity onPress={() => handleCall(emergency.patientInfo.phone)}>
                <Text style={[styles.infoValue, styles.phoneLink]}>
                  {emergency.patientInfo.phone}
                </Text>
              </TouchableOpacity>
            </View>
            {emergency.patientInfo.healthInsuranceId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã BHYT:</Text>
                <Text style={styles.infoValue}>{emergency.patientInfo.healthInsuranceId}</Text>
              </View>
            )}
            {emergency.patientInfo.nationalId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>CMND/CCCD:</Text>
                <Text style={styles.infoValue}>{emergency.patientInfo.nationalId}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Địa chỉ cấp cứu */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#E53935" />
            <Text style={styles.sectionTitle}>Địa chỉ cấp cứu</Text>
          </View>
          
          <View style={styles.locationInfo}>
            <Text style={styles.addressText}>{emergency.location.address}</Text>
            {emergency.location.hasGPS && (
              <View style={styles.gpsInfo}>
                <Ionicons name="navigate" size={14} color="#4CAF50" />
                <Text style={styles.gpsText}>Có định vị GPS</Text>
              </View>
            )}
          </View>
        </View>

        {/* Triệu chứng */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color="#FF9800" />
            <Text style={styles.sectionTitle}>Triệu chứng</Text>
          </View>
          
          <Text style={styles.symptomsText}>{emergency.symptoms}</Text>
        </View>

        {/* Dịch vụ bổ sung */}
        {emergency.selectedServices && emergency.selectedServices.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list" size={20} color="#4285F4" />
              <Text style={styles.sectionTitle}>Dịch vụ bổ sung</Text>
            </View>
            
            {emergency.selectedServices.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
                <Text style={styles.servicePrice}>
                  {formatCurrency(service.price)} VND
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Chi phí */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Chi phí</Text>
          </View>
          
          <View style={styles.costInfo}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Chi phí cơ bản:</Text>
              <Text style={styles.costValue}>
                {formatCurrency(emergency.pricing.baseCost)} VND
              </Text>
            </View>
            
            {emergency.pricing.servicesCost > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Chi phí dịch vụ:</Text>
                <Text style={styles.costValue}>
                  {formatCurrency(emergency.pricing.servicesCost)} VND
                </Text>
              </View>
            )}
            
            <View style={[styles.costRow, styles.totalCostRow]}>
              <Text style={styles.totalCostLabel}>Tổng chi phí:</Text>
              <Text style={styles.totalCostValue}>
                {formatCurrency(emergency.pricing.totalCost)} VND
              </Text>
            </View>
          </View>
        </View>

        {/* Thông tin đội cấp cứu */}
        {emergency.emergencyTeam && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={20} color="#4285F4" />
              <Text style={styles.sectionTitle}>Đội cấp cứu</Text>
            </View>
            
            <Text style={styles.teamInfo}>{emergency.emergencyTeam}</Text>
          </View>
        )}

        {/* Ghi chú y tế */}
        {emergency.medicalNotes && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#FF9800" />
              <Text style={styles.sectionTitle}>Ghi chú y tế</Text>
            </View>
            
            <Text style={styles.medicalNotes}>{emergency.medicalNotes}</Text>
          </View>
        )}

        {/* Thời gian */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Thời gian</Text>
          </View>
          
          <View style={styles.timeInfo}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Thời gian yêu cầu:</Text>
              <Text style={styles.timeValue}>
                {formatDateTime(emergency.requestTime || emergency.createdAt)}
              </Text>
            </View>
            
            {emergency.completedAt && (
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>Thời gian hoàn thành:</Text>
                <Text style={styles.timeValue}>
                  {formatDateTime(emergency.completedAt)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Nút gọi khẩn cấp nếu cần */}
      {(emergency.status === 'pending' || emergency.status === 'requested') && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => handleCall(emergency.patientInfo.phone)}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.callButtonText}>Gọi khẩn cấp</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    marginLeft: 10,
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 5,
  },
  estimatedTimeText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 5,
    fontWeight: '500',
  },
  sectionCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  patientInfo: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  phoneLink: {
    color: '#4285F4',
    textDecorationLine: 'underline',
  },
  locationInfo: {},
  addressText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  gpsText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  symptomsText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935',
  },
  costInfo: {},
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalCostRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 5,
    paddingTop: 8,
  },
  totalCostLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalCostValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
  },
  teamInfo: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  medicalNotes: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  timeInfo: {},
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  spacer: {
    height: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: '#E53935',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default EmergencyDetailScreen;