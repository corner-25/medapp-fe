// src/screens/ServiceDetailScreen.js - Updated to use API
import React, { useState, useContext, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { servicesService, cartService } from '../services/apiService';

const ServiceDetailScreen = ({ navigation, route }) => {
  const { getToken } = useContext(AuthContext);
  const serviceId = route.params?.serviceId;
  const appointmentData = route.params?.appointmentData; // Nhận dữ liệu ngầm

  // State management
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Load service details from API
  useEffect(() => {
    loadServiceDetails();
  }, [serviceId]);

  const loadServiceDetails = async () => {
    try {
      setLoading(true);

      // Check if service was passed from previous screen
      const passedService = route.params?.service;
      if (passedService) {
        setService(passedService);
        setLoading(false);
        return;
      }

      // Otherwise load from API
      const response = await servicesService.getById(serviceId);
      console.log('Service detail response:', response);

      // Backend returns service object directly, not wrapped in success/data
      if (response && response._id) {
        setService(response);
      } else {
        throw new Error('Không thể lấy thông tin dịch vụ');
      }
    } catch (error) {
      console.error('Error loading service details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin dịch vụ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
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

  // Show error state
  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết dịch vụ</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin dịch vụ</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadServiceDetails}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Xử lý khi thêm vào giỏ hàng với thông tin đặt khám đầy đủ
  const handleAddToCart = async () => {
    const token = getToken();
    if (!token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để tiếp tục');
      navigation.navigate('LoginScreen');
      return;
    }

    setAddingToCart(true);
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
      
      // Chuẩn bị dữ liệu đầy đủ để gửi vào giỏ hàng
      const itemData = {
        service: service.id,
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
            nationalId: appointmentData.patient.nationalId,
            healthInsuranceId: appointmentData.patient.healthInsuranceId,
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
      
      console.log('Item data to add to cart:', itemData);
      console.log('=== END DEBUG SERVICE DETAIL ===');
      
      await cartService.addToCart(itemData);
      
      Alert.alert(
        'Thành công',
        `Đã thêm ${service.name} vào giỏ hàng!`,
        [
          {
            text: 'Tiếp tục mua sắm',
            style: 'cancel',
          },
          {
            text: 'Đến giỏ hàng',
            onPress: () => navigation.navigate('Cart'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
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
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{service.name}</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Service Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="medical" size={80} color={getIconBackground(service.category)} />
          </View>
        </View>

        {/* Service Name and Rating */}
        <View style={styles.serviceTitleContainer}>
          <Text style={styles.serviceTitle}>{service.name}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name="star"
                size={16}
                color="#FFD700"
              />
            ))}
            <Text style={styles.ratingText}>{service.statistics?.averageRating?.toFixed(1) || '5.0'}</Text>
            <Text style={styles.reviewCount}>({service.statistics?.reviewCount || 0} đánh giá)</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{formatCurrency(service.price)} {service.currency}</Text>
          {service.originalPrice > service.price && (
            <Text style={styles.originalPriceText}>{formatCurrency(service.originalPrice)} {service.currency}</Text>
          )}
        </View>

        {/* Service Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.infoText}>Thời gian: {service.duration}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people" size={16} color="#666" />
            <Text style={styles.infoText}>Độ tuổi: {service.ageRange}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.infoText}>Giới tính: {service.gender}</Text>
          </View>
        </View>

        {/* Service Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Mô tả dịch vụ</Text>
          <Text style={styles.descriptionText}>
            {service.description}
          </Text>
        </View>

        {/* Includes */}
        {service.includes && service.includes.length > 0 && (
          <View style={styles.includesContainer}>
            <Text style={styles.includesTitle}>Bao gồm:</Text>
            {service.includes.map((item, index) => (
              <View key={index} style={styles.includeItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.includeText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Benefits */}
        {service.benefits && service.benefits.length > 0 && (
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Lợi ích:</Text>
            {service.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="star" size={16} color="#FF9800" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Book Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookButton, addingToCart && styles.bookButtonDisabled]}
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.bookButtonText}>Thêm vào giỏ hàng</Text>
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
    case 'general': return '#4285F4';
    case 'lab': return '#E53935';
    default: return '#FB8C00';
  }
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
    color: '#333',
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
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  originalPriceText: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 5,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  includesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  includesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  includeText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  benefitsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  priceContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  priceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
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
  },
  bookButton: {
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ServiceDetailScreen;