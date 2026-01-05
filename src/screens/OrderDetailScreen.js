// src/screens/OrderDetailScreen.js
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
import { orderService } from '../services/apiService';

const OrderDetailScreen = ({ navigation, route }) => {
  const { orderId } = route.params;
  const { getToken } = useContext(AuthContext);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Load thông tin đơn hàng
  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  // Auto refresh mỗi 30 giây để cập nhật trạng thái
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadOrderDetail(true); // Silent refresh
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading]);

  const loadOrderDetail = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const token = getToken();
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem chi tiết');
        navigation.goBack();
        return;
      }

      const data = await orderService.getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Error loading order detail:', error);
      if (!silent) {
        Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrderDetail();
  };

  // Hủy đơn hàng
  const handleCancelOrder = () => {
    if (order.status !== 'pending') {
      Alert.alert('Thông báo', 'Không thể hủy đơn hàng này');
      return;
    }

    Alert.alert(
      'Xác nhận hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn hàng',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await orderService.cancelOrder(orderId);
              Alert.alert('Thành công', 'Đã hủy đơn hàng');
              loadOrderDetail();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
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
      case 'confirmed':
        return '#2196F3';
      case 'processing':
        return '#4CAF50';
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
      case 'confirmed':
        return 'Đã xác nhận';
      case 'processing':
        return 'Đang xử lý';
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
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'processing':
        return 'construct-outline';
      case 'completed':
        return 'checkmark-done-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-outline';
    }
  };

  // Lấy icon dịch vụ
  const getServiceIcon = (serviceId) => {
    switch (serviceId) {
      case 'general-checkup':
        return 'fitness';
      case 'blood-test':
        return 'flask';
      case 'x-ray':
        return 'scan';
      case 'ultrasound':
        return 'scan-outline';
      case 'ecg':
        return 'heart';
      case 'ct-scan':
        return 'body';
      case 'mri':
        return 'body-outline';
      case 'endoscopy':
        return 'eye';
      case 'mammogram':
        return 'scan';
      case 'cancer-screening':
        return 'search';
      default:
        return 'medical';
    }
  };

  if (loading && !order) {
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
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
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
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="receipt-outline" size={60} color="#ddd" />
          <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng</Text>
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
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
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
        {/* Mã đơn hàng và trạng thái */}
        <View style={[styles.orderCard, { borderLeftColor: getStatusColor(order.status) }]}>
          <View style={styles.orderHeader}>
            <View style={styles.orderIdSection}>
              <Text style={styles.orderIdLabel}>Mã đơn hàng</Text>
              <Text style={styles.orderIdValue}>#{order._id.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={styles.statusSection}>
              <Ionicons 
                name={getStatusIcon(order.status)} 
                size={20} 
                color={getStatusColor(order.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.orderTime}>
            Đặt hàng: {formatDateTime(order.createdAt)}
          </Text>
          
          {order.completedAt && (
            <Text style={styles.completedTime}>
              Hoàn thành: {formatDateTime(order.completedAt)}
            </Text>
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
              <Text style={styles.infoValue}>{order.patientInfo.name}</Text>
            </View>
            {order.patientInfo.age && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tuổi:</Text>
                <Text style={styles.infoValue}>{order.patientInfo.age} tuổi</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mối quan hệ:</Text>
              <Text style={styles.infoValue}>{order.patientInfo.relationship}</Text>
            </View>
            {order.patientInfo.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số điện thoại:</Text>
                <TouchableOpacity onPress={() => handleCall(order.patientInfo.phone)}>
                  <Text style={[styles.infoValue, styles.phoneLink]}>
                    {order.patientInfo.phone}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {order.patientInfo.address && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Địa chỉ:</Text>
                <Text style={styles.infoValue}>{order.patientInfo.address}</Text>
              </View>
            )}
            {order.patientInfo.healthInsuranceId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã BHYT:</Text>
                <Text style={styles.infoValue}>{order.patientInfo.healthInsuranceId}</Text>
              </View>
            )}
            {order.patientInfo.nationalId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>CMND/CCCD:</Text>
                <Text style={styles.infoValue}>{order.patientInfo.nationalId}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Thông tin lịch hẹn */}
        {order.appointmentInfo && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
            </View>
            
            <View style={styles.appointmentInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Loại dịch vụ:</Text>
                <Text style={styles.infoValue}>{order.appointmentInfo.serviceType}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày khám:</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(order.appointmentInfo.appointmentDate)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Giờ khám:</Text>
                <Text style={styles.infoValue}>{order.appointmentInfo.appointmentTime}</Text>
              </View>
              {order.appointmentInfo.symptoms && (
                <View style={styles.symptomsContainer}>
                  <Text style={styles.symptomsLabel}>Triệu chứng:</Text>
                  <Text style={styles.symptomsText}>{order.appointmentInfo.symptoms}</Text>
                </View>
              )}
              {order.appointmentInfo.additionalServices && 
               order.appointmentInfo.additionalServices.length > 0 && (
                <View style={styles.additionalServices}>
                  <Text style={styles.additionalServicesLabel}>Dịch vụ bổ sung:</Text>
                  {order.appointmentInfo.additionalServices.map((service, index) => (
                    <Text key={index} style={styles.additionalServiceItem}>
                      • {service}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Danh sách dịch vụ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color="#4285F4" />
            <Text style={styles.sectionTitle}>Dịch vụ đã đặt</Text>
          </View>
          
          {order.items.map((item, index) => (
            <View key={index} style={styles.serviceItem}>
              <View style={styles.serviceIconContainer}>
                <Ionicons 
                  name={getServiceIcon(item.service)} 
                  size={20} 
                  color="#4285F4" 
                />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceQuantity}>Số lượng: {item.quantity}</Text>
              </View>
              <Text style={styles.servicePrice}>
                {formatCurrency(item.price * item.quantity)} VND
              </Text>
            </View>
          ))}
        </View>

        {/* Chi phí */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Chi phí</Text>
          </View>
          
          <View style={styles.costInfo}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Tổng tiền hàng:</Text>
              <Text style={styles.costValue}>
                {formatCurrency(order.totalPrice - order.taxPrice)} VND
              </Text>
            </View>
            
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Thuế VAT:</Text>
              <Text style={styles.costValue}>
                {formatCurrency(order.taxPrice)} VND
              </Text>
            </View>
            
            <View style={[styles.costRow, styles.totalCostRow]}>
              <Text style={styles.totalCostLabel}>Tổng cộng:</Text>
              <Text style={styles.totalCostValue}>
                {formatCurrency(order.totalPrice)} VND
              </Text>
            </View>
          </View>
        </View>

        {/* Phương thức thanh toán */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color="#FF9800" />
            <Text style={styles.sectionTitle}>Thanh toán</Text>
          </View>
          
          <View style={styles.paymentInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phương thức:</Text>
              <Text style={styles.infoValue}>{order.paymentMethod}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trạng thái:</Text>
              <Text style={[
                styles.infoValue, 
                { color: order.isPaid ? '#4CAF50' : '#F44336' }
              ]}>
                {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </Text>
            </View>
            {order.paidAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Thời gian thanh toán:</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(order.paidAt)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bệnh viện được phân công */}
        {order.assignedTo && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business" size={20} color="#2196F3" />
              <Text style={styles.sectionTitle}>Bệnh viện phụ trách</Text>
            </View>
            
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>{order.assignedTo.name}</Text>
              {order.assignedTo.phone && (
                <TouchableOpacity 
                  style={styles.hospitalContact}
                  onPress={() => handleCall(order.assignedTo.phone)}
                >
                  <Ionicons name="call" size={16} color="#4285F4" />
                  <Text style={styles.hospitalPhone}>{order.assignedTo.phone}</Text>
                </TouchableOpacity>
              )}
              {order.assignedTo.address && (
                <Text style={styles.hospitalAddress}>{order.assignedTo.address}</Text>
              )}
            </View>
          </View>
        )}

        {/* Ghi chú */}
        {order.note && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#FF9800" />
              <Text style={styles.sectionTitle}>Ghi chú</Text>
            </View>
            
            <Text style={styles.noteText}>{order.note}</Text>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Nút hủy đơn hàng */}
      {order.status === 'pending' && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.cancelButton, cancelling && styles.cancelButtonDisabled]}
            onPress={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
              </>
            )}
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
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderIdSection: {},
  orderIdLabel: {
    fontSize: 12,
    color: '#666',
  },
  orderIdValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  orderTime: {
    fontSize: 12,
    color: '#666',
  },
  completedTime: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
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
    flex: 1.5,
    textAlign: 'right',
  },
  phoneLink: {
    color: '#4285F4',
    textDecorationLine: 'underline',
  },
  appointmentInfo: {},
  symptomsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  symptomsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  symptomsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  additionalServices: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  additionalServicesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  additionalServiceItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285F4',
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
    color: '#4285F4',
  },
  paymentInfo: {},
  hospitalInfo: {},
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  hospitalContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  hospitalPhone: {
    fontSize: 14,
    color: '#4285F4',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonDisabled: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default OrderDetailScreen;