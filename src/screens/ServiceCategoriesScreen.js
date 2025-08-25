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
import { getServiceCategories } from '../data/medicalServices';

const ServiceCategoriesScreen = ({ navigation, route }) => {
  // Lấy appointmentData từ route params
  const { appointmentData } = route.params || {};
  
  // Lấy danh sách danh mục dịch vụ
  const categories = getServiceCategories();

  console.log('=== DEBUG SERVICE CATEGORIES ===');
  console.log('Appointment data received:', appointmentData);
  console.log('Patient info:', appointmentData?.patient);
  console.log('=== END DEBUG ===');

  // Xử lý khi chọn danh mục
  const handleCategoryPress = (category) => {
    if (category.hasSubServices) {
      // Nếu có danh sách dịch vụ con, chuyển đến màn hình danh sách dịch vụ con
      navigation.navigate('SubServicesList', { 
        categoryId: category.id,
        categoryName: category.name,
        appointmentData: appointmentData // Truyền tiếp appointmentData
      });
    } else {
      // Nếu là dịch vụ đơn, đi thẳng đến trang chi tiết
      navigation.navigate('ServiceDetail', { 
        serviceId: `${category.id}-checkup`,
        appointmentData: appointmentData // Truyền tiếp appointmentData
      });
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
        <Text style={styles.headerTitle}>Chọn gói dịch vụ</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm dịch vụ"
          placeholderTextColor="#A0A0A0"
        />
      </View>

      {/* Categories List */}
      <ScrollView style={styles.content}>
        {categories.map((category) => (
          <TouchableOpacity 
            key={category.id}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(category)}
          >
            <View style={[styles.categoryIconContainer, { backgroundColor: category.iconBg || '#4285F4' }]}>
              <Icon name={category.icon} size={28} color="white" />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
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
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  }
});

export default ServiceCategoriesScreen;