import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getServiceById } from '../data/medicalServices';

const GeneralCheckupDetailScreen = ({ navigation, route }) => {
  // Lấy ID dịch vụ từ route params hoặc mặc định là '1' (Khám bệnh tổng quát)
  const serviceId = route.params?.serviceId || '1';
  
  // Lấy thông tin dịch vụ từ ID
  const service = getServiceById(serviceId);
  
  // Nếu không tìm thấy dịch vụ
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
        </View>
      </SafeAreaView>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Xử lý khi thêm vào giỏ hàng
  const handleAddToCart = () => {
    // Thêm vào giỏ hàng
    
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
            <Ionicons name={getIconName(service.type)} size={80} color={getIconBackground(service.type)} />
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
          <TouchableOpacity>
            <Text style={styles.readMoreText}>Đọc thêm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Book Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.bookButtonText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Hàm lấy icon phù hợp với loại dịch vụ
const getIconName = (type) => {
  switch(type) {
    case 'general': return 'fitness';
    case 'screening': return 'search';
    case 'cardio': return 'heart';
    default: return 'medical';
  }
};

// Hàm lấy màu phù hợp với loại dịch vụ
const getIconBackground = (type) => {
  switch(type) {
    case 'general': return '#4285F4';
    case 'screening': return '#E53935';
    case 'cardio': return '#43A047';
    default: return '#FB8C00';
  }
};

// Giữ lại các styles hiện có

export default GeneralCheckupDetailScreen;