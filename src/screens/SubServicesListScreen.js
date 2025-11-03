// src/screens/SubServicesListScreen.js - Updated to use local data
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getServicesByCategory } from '../data/medicalServices';

const SubServicesListScreen = ({ navigation, route }) => {
  // Lấy ID và tên danh mục từ route params
  const { categoryId, categoryName, appointmentData } = route.params;

  // State for search
  const [searchText, setSearchText] = useState('');

  // Get services by category from local data
  const allServices = getServicesByCategory(categoryId);
  console.log('📋 SubServicesListScreen loaded services for category:', categoryId, allServices);

  // Xử lý khi chọn một dịch vụ
  const handleServicePress = (service) => {
    navigation.navigate('ServiceDetail', {
      serviceId: service.serviceId, // Use local ID
      serviceData: service, // Pass full service data
      appointmentData: appointmentData // Truyền thông tin đặt khám ngầm
    });
  };

  // Filter services based on search
  const filteredServices = allServices?.filter(service =>
    service.name.toLowerCase().includes(searchText.toLowerCase()) ||
    service.description.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

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
        <Text style={styles.headerTitle}>{categoryName}</Text>
      </View>

      {/* Không hiển thị thông tin - chỉ truyền dữ liệu ngầm */}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm dịch vụ"
          placeholderTextColor="#A0A0A0"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Services List */}
      <ScrollView style={styles.content}>
        {filteredServices.map((service) => (
          <TouchableOpacity
            key={service.serviceId}
            style={styles.serviceItem}
            onPress={() => handleServicePress(service)}
          >
            <View style={[
              styles.serviceIconContainer,
              { backgroundColor: service.iconColor || '#03A9F4' }
            ]}>
              <Icon name={service.icon || 'medkit'} size={28} color="white" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>
                {service.description?.length > 80
                  ? service.description.substring(0, 80) + '...'
                  : service.description
                }
              </Text>
              {service.price && (
                <Text style={styles.servicePrice}>
                  {service.price.toLocaleString('vi-VN')} VNĐ
                </Text>
              )}
              {service.duration && (
                <Text style={styles.serviceDuration}>
                  Thời gian: {service.duration} phút
                </Text>
              )}
            </View>
            <Icon name="chevron-forward" size={20} color="#A0A0A0" />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  serviceDuration: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  }
});

export default SubServicesListScreen;