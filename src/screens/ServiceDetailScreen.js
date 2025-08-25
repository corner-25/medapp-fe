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
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { getServiceById } from '../data/medicalServices';
import { cartService } from '../services/apiService';

const ServiceDetailScreen = ({ navigation, route }) => {
  const { getToken } = useContext(AuthContext);
  const serviceId = route.params?.serviceId;
  const appointmentData = route.params?.appointmentData; // Nhận dữ liệu ngầm
  const service = getServiceById(serviceId);
  const [loading, setLoading] = useState(false);
  
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

  // Xử lý khi thêm vào giỏ hàng với thông tin đặt khám đầy đủ
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
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{service.name}</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Service Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Icon name={getIconName(service.icon)} size={80} color={getIconBackground(service.category)} />
          </View>
        </View>
        
        {/* Service Name and Rating */}
        <View style={styles.serviceTitleContainer}>
          <Text style={styles.serviceTitle}>{service.name}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <Icon 
                key={index}
                name="star" 
                size={16} 
                color="#FFD700" 
              />
            ))}
            <Text style={styles.ratingText}>{service.rating}</Text>
          </View>
        </View>
        
        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{formatCurrency(service.price)} VND</Text>
        </View>
        
        {/* Service Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Mô tả dịch vụ</Text>
          <Text style={styles.descriptionText}>
            {service.description}
          </Text>
        </View>
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