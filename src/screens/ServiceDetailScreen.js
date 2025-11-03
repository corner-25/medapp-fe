// src/screens/ServiceDetailScreen.js - Clean version không hiển thị thông tin người thân
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { medicalServicesService } from '../services/apiService';
import { cartService } from '../services/apiService';
import { encryptSensitiveData } from '../utils/sensitiveDataUtils';
import { getServiceById } from '../data/medicalServices';

const ServiceDetailScreen = ({ navigation, route }) => {
  const { getToken } = useContext(AuthContext);
  const serviceId = route.params?.serviceId;
  const appointmentData = route.params?.appointmentData; // Nhận dữ liệu ngầm
  const serviceData = route.params?.serviceData; // Receive service data from previous screen
  const [service, setService] = useState(serviceData || null); // Use passed data or fetch if needed
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(!serviceData); // Only load if no data passed

  // Load service data if not passed from previous screen
  React.useEffect(() => {
    if (!serviceData && serviceId) {
      loadServiceData();
    }
  }, [serviceId]);

  const loadServiceData = async () => {
    try {
      setDataLoading(true);
      // Try to get from local data first
      const localService = getServiceById(parseInt(serviceId));
      if (localService) {
        setService(localService);
        console.log('✅ Loaded service from local data:', localService.name);
      } else {
        // Fallback to API if not found in local data
        const response = await medicalServicesService.getById(serviceId);
        setService(response);
        console.log('✅ Loaded service from API:', response.name);
      }
    } catch (error) {
      console.error('❌ Error loading service:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin dịch vụ');
    } finally {
      setDataLoading(false);
    }
  };
  
  // Show loading state while fetching data
  if (dataLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết dịch vụ</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải thông tin dịch vụ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết dịch vụ</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin dịch vụ</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Xử lý khi chọn dịch vụ khám bệnh với thông tin đặt khám đầy đủ
  const handleAddToCart = async () => {
    const token = getToken();
    if (!token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để tiếp tục');
      navigation.navigate('LoginScreen');
      return;
    }

    setLoading(true);
    try {
      console.log('=== DEBUG SERVICE DETAIL - ADD TO CART ===');
      console.log('Service:', service.name);
      console.log('Appointment data received:', appointmentData);
      
      if (appointmentData) {
        console.log('Patient info:', appointmentData.patient);
        console.log('Selected day:', appointmentData.selectedDay);
        console.log('Selected time:', appointmentData.selectedTime);
        console.log('Symptoms:', appointmentData.symptoms);
      }
      
      // Chuẩn bị dữ liệu đầy đủ để gửi vào danh sách khám bệnh
      const itemData = {
        service: service.serviceId || service.id,
        name: service.name,
        price: service.price,
        quantity: 1,
        // Thông tin đặt khám từ MedicalExamScreen (nếu có)
        appointmentInfo: appointmentData ? {
          // Thông tin bệnh nhân
          patient: appointmentData.patient ? {
            id: appointmentData.patient._id || appointmentData.patient.id,
            name: appointmentData.patient.name,
            age: appointmentData.patient.age,
            phone: appointmentData.patient.phone,
            address: appointmentData.patient.address,
            relationship: appointmentData.patient.relationship,
            nationalId: appointmentData.patient.nationalId ? encryptSensitiveData(appointmentData.patient.nationalId) : null,
            healthInsuranceId: appointmentData.patient.healthInsuranceId ? encryptSensitiveData(appointmentData.patient.healthInsuranceId) : null,
          } : null,
          // Thông tin lịch hẹn
          date: appointmentData.selectedDay,
          time: appointmentData.selectedTime,
          // Dịch vụ bổ sung đã chọn
          additionalServices: appointmentData.services || [],
          // Mô tả triệu chứng
          symptoms: appointmentData.symptoms,
          // Thời gian tạo
          createdAt: new Date().toISOString(),
        } : null,
      };
      
      console.log('Item data to add to appointment list:', itemData);
      console.log('=== END DEBUG SERVICE DETAIL ===');
      
      await cartService.addToCart(itemData);
      
      Alert.alert(
        'Đã thêm dịch vụ thành công',
        `${service.name} đã được thêm vào danh sách khám bệnh của bạn!`,
        [
          {
            text: 'Chọn thêm dịch vụ khác',
            style: 'cancel',
          },
          {
            text: 'Xem danh sách khám',
            onPress: () => navigation.navigate('Cart'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm dịch vụ vào danh sách khám. Vui lòng thử lại.');
      console.error('Error adding to appointment list:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết dịch vụ</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient */}
        <View style={[styles.heroSection, { backgroundColor: getIconBackground(service.category) }]}>
          <View style={styles.serviceIconLarge}>
            <Text style={styles.serviceEmoji}>{getServiceEmoji(service.category)}</Text>
          </View>
          <Text style={styles.heroTitle}>{service.name}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <Icon
                key={index}
                name="star"
                size={18}
                color="#FFD700"
              />
            ))}
            <Text style={styles.ratingText}>4.8 (127 đánh giá)</Text>
          </View>
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <Text style={styles.priceLabel}>Giá dịch vụ</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-10%</Text>
            </View>
          </View>
          <Text style={styles.priceText}>{formatCurrency(service.price)} VNĐ</Text>
          <Text style={styles.originalPrice}>{formatCurrency(Math.round(service.price * 1.1))} VNĐ</Text>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.quickInfoGrid}>
          <View style={styles.quickInfoCard}>
            <Icon name="time-outline" size={24} color="#4285F4" />
            <Text style={styles.quickInfoLabel}>Thời gian</Text>
            <Text style={styles.quickInfoValue}>{service.duration || 60} phút</Text>
          </View>
          <View style={styles.quickInfoCard}>
            <Icon name="people-outline" size={24} color="#4285F4" />
            <Text style={styles.quickInfoLabel}>Đối tượng</Text>
            <Text style={styles.quickInfoValue}>Mọi lứa tuổi</Text>
          </View>
          <View style={styles.quickInfoCard}>
            <Icon name="shield-checkmark-outline" size={24} color="#4285F4" />
            <Text style={styles.quickInfoLabel}>Bảo hiểm</Text>
            <Text style={styles.quickInfoValue}>Được hỗ trợ</Text>
          </View>
        </View>

        {/* Service Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>📋 Mô tả dịch vụ</Text>
          <Text style={styles.descriptionText}>
            {service.description}
          </Text>
        </View>

        {/* Included Tests */}
        {service.includedTests && (
          <View style={styles.testsCard}>
            <Text style={styles.sectionTitle}>🔬 Các xét nghiệm bao gồm</Text>
            {service.includedTests.map((test, index) => (
              <View key={index} style={styles.testItem}>
                <Icon name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.testText}>{test}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Preparation Instructions */}
        {service.preparationInstructions && (
          <View style={styles.preparationCard}>
            <Text style={styles.sectionTitle}>⚠️ Hướng dẫn chuẩn bị</Text>
            <View style={styles.preparationContent}>
              <Icon name="information-circle-outline" size={20} color="#FF9800" />
              <Text style={styles.preparationText}>{service.preparationInstructions}</Text>
            </View>
          </View>
        )}

        {/* Tags */}
        {service.tags && (
          <View style={styles.tagsContainer}>
            <Text style={styles.sectionTitle}>🏷️ Từ khóa liên quan</Text>
            <View style={styles.tagsWrapper}>
              {service.tags.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Book Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={handleAddToCart}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Icon name="add-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.bookButtonText}>Thêm vào giỏ khám</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Hàm lấy icon phù hợp với loại dịch vụ
const getIconName = (icon) => {
  return icon || 'medical';
};

// Hàm lấy màu phù hợp với loại dịch vụ
const getIconBackground = (category) => {
  switch(category) {
    case 'basic': return '#4CAF50';
    case 'standard': return '#2196F3';
    case 'advanced': return '#9C27B0';
    case 'cancer': return '#E91E63';
    case 'gynecology': return '#E91E63';
    case 'symptom': return '#9C27B0';
    case 'specialty': return '#FF9800';
    default: return '#4285F4';
  }
};

// Hàm lấy emoji phù hợp với loại dịch vụ
const getServiceEmoji = (category) => {
  switch(category) {
    case 'basic': return '🏥';
    case 'standard': return '⭐';
    case 'advanced': return '💎';
    case 'cancer': return '🎗️';
    case 'gynecology': return '🌸';
    case 'symptom': return '🩺';
    case 'specialty': return '🧠';
    default: return '🏥';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#4285F4',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  serviceIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  serviceEmoji: {
    fontSize: 50,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  priceCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 5,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  quickInfoGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  testsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  preparationCard: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  preparationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  preparationText: {
    fontSize: 15,
    color: '#E65100',
    marginLeft: 10,
    flex: 1,
    lineHeight: 22,
  },
  tagsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookButton: {
    backgroundColor: '#4285F4',
    borderRadius: 25,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default ServiceDetailScreen;