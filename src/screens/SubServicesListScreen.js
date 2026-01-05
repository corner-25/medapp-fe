// src/screens/SubServicesListScreen.js - Updated to use API
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { servicesService } from '../services/apiService';

const SubServicesListScreen = ({ navigation, route }) => {
  // Lấy tên danh mục từ route params
  const { categoryId, categoryName, appointmentData } = route.params;

  // State management
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Lấy danh sách dịch vụ từ API
  useEffect(() => {
    loadServicesByCategory();
  }, [categoryId]);

  const loadServicesByCategory = async () => {
    try {
      setLoading(true);
      // Use categoryId (English) instead of categoryName (Vietnamese)
      const response = await servicesService.getByCategory(categoryId);
      console.log('Services by category response:', response);

      // Backend returns { services, category, total } directly
      if (response && Array.isArray(response.services)) {
        setServices(response.services);
      } else {
        // If no services found, set empty array instead of throwing error
        setServices([]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách dịch vụ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Xử lý khi chọn một dịch vụ
  const handleServicePress = (service) => {
    navigation.navigate('ServiceDetail', {
      serviceId: service.id,
      appointmentData: appointmentData // Truyền thông tin đặt khám ngầm
    });
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
        <Text style={styles.headerTitle}>{categoryName}</Text>
      </View>

      {/* Không hiển thị thông tin - chỉ truyền dữ liệu ngầm */}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm dịch vụ"
          placeholderTextColor="#A0A0A0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải dịch vụ...</Text>
        </View>
      ) : (
        /* Services List */
        <ScrollView style={styles.content}>
          {services.length > 0 ? (
            services.map((service) => (
              <TouchableOpacity
                key={service._id || service.id}
                style={styles.serviceItem}
                onPress={() => handleServicePress(service)}
              >
                <View style={styles.serviceIconContainer}>
                  <Ionicons name="medical" size={28} color="white" />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription} numberOfLines={2}>
                    {service.description}
                  </Text>
                  <Text style={styles.servicePrice}>
                    {formatCurrency(service.price)} {service.currency}
                  </Text>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.serviceDuration}>⏱ {service.duration}</Text>
                    <Text style={styles.serviceAge}>👤 {service.ageRange}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Không có dịch vụ nào trong danh mục này</Text>
            </View>
          )}
        </ScrollView>
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#03A9F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285F4',
    marginTop: 5,
  },
  serviceDetails: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 15,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#888',
  },
  serviceAge: {
    fontSize: 12,
    color: '#888',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default SubServicesListScreen;