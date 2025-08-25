// src/screens/SubServicesListScreen.js - Clean version không hiển thị thông tin người thân
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getServicesByCategory } from '../data/medicalServices';

const SubServicesListScreen = ({ navigation, route }) => {
  // Lấy ID và tên danh mục từ route params
  const { categoryId, categoryName, appointmentData } = route.params;
  
  // Lấy danh sách dịch vụ thuộc danh mục này
  const services = getServicesByCategory(categoryId);

  // Xử lý khi chọn một dịch vụ
  const handleServicePress = (serviceId) => {
    navigation.navigate('ServiceDetail', { 
      serviceId,
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
        />
      </View>

      {/* Services List */}
      <ScrollView style={styles.content}>
        {services.map((service) => (
          <TouchableOpacity 
            key={service.id}
            style={styles.serviceItem}
            onPress={() => handleServicePress(service.id)}
          >
            <View style={styles.serviceIconContainer}>
              <Icon name={service.icon || 'medical'} size={28} color="white" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.shortDescription}</Text>
              {service.price && (
                <Text style={styles.servicePrice}>
                  {service.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND
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
  }
});

export default SubServicesListScreen;