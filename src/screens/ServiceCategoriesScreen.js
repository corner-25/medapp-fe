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
import { Ionicons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { medicalServicesCategories } from '../data/medicalServices';

const ServiceCategoriesScreen = ({ navigation, route }) => {
  // Lấy appointmentData từ route params
  const { appointmentData } = route.params || {};

  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  console.log('=== DEBUG SERVICE CATEGORIES ===');
  console.log('Appointment data received:', appointmentData);
  console.log('Patient info:', appointmentData?.patient);
  console.log('=== END DEBUG ===');

  // Map backend categories to frontend categories
  const mapBackendToFrontendCategories = (services) => {
    const categoryMapping = {
      'basic': { id: 'general', name: 'Khám tổng quát', icon: 'medical', iconBg: '#4285F4' },
      'standard': { id: 'general', name: 'Khám tổng quát', icon: 'medical', iconBg: '#4285F4' },
      'advanced': { id: 'specialist', name: 'Khám chuyên khoa', icon: 'heart', iconBg: '#E53935' },
      'cancer': { id: 'specialist', name: 'Khám chuyên khoa', icon: 'heart', iconBg: '#E53935' },
      'gynecology': { id: 'specialist', name: 'Khám chuyên khoa', icon: 'heart', iconBg: '#E53935' },
      'symptom': { id: 'diagnostic', name: 'Chẩn đoán hình ảnh', icon: 'scan', iconBg: '#43A047' },
      'specialty': { id: 'laboratory', name: 'Xét nghiệm', icon: 'flask', iconBg: '#FF9800' }
    };

    // Group services by mapped categories
    const groupedCategories = {};
    services.forEach(service => {
      const mappedCategory = categoryMapping[service.category] || categoryMapping['basic'];
      if (!groupedCategories[mappedCategory.id]) {
        groupedCategories[mappedCategory.id] = {
          ...mappedCategory,
          hasSubServices: true,
          services: []
        };
      }
      groupedCategories[mappedCategory.id].services.push(service);
    });

    return Object.values(groupedCategories);
  };

  // Load categories from local data
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    try {
      setLoading(true);
      console.log('📋 Loading categories from local data:', medicalServicesCategories);

      // Use local categories directly
      setCategories(medicalServicesCategories);

    } catch (error) {
      console.error('❌ Error loading categories:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi chọn danh mục
  const handleCategoryPress = (category) => {
    // Chuyển đến màn hình danh sách dịch vụ theo category
    navigation.navigate('SubServicesList', {
      categoryId: category.id,
      categoryName: category.name,
      appointmentData: appointmentData // Truyền tiếp appointmentData
    });
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn gói dịch vụ</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải dịch vụ...</Text>
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
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Categories List */}
      <ScrollView style={styles.content}>
        {filteredCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              category.highlight && styles.highlightedCategoryItem
            ]}
            onPress={() => handleCategoryPress(category)}
          >
            <View style={[styles.categoryIconContainer, { backgroundColor: category.color || '#4285F4' }]}>
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[
                styles.categoryName,
                category.highlight && styles.highlightedCategoryName
              ]}>
                {category.name}
              </Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
              {category.highlight && (
                <View style={styles.highlightBadge}>
                  <Text style={styles.highlightBadgeText}>PHỔ BIẾN</Text>
                </View>
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
  },
  highlightedCategoryItem: {
    borderColor: '#FFD700',
    borderWidth: 2,
    backgroundColor: '#FFFBF0',
  },
  highlightedCategoryName: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  highlightBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  highlightBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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

export default ServiceCategoriesScreen;