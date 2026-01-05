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

const ServiceCategoriesScreen = ({ navigation, route }) => {
  // Lấy appointmentData từ route params
  const { appointmentData } = route.params || {};

  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  console.log('=== DEBUG SERVICE CATEGORIES ===');
  console.log('Appointment data received:', appointmentData);
  console.log('Patient info:', appointmentData?.patient);
  console.log('=== END DEBUG ===');

  // Lấy danh sách categories từ API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);

      // Try to load categories from API
      try {
        const response = await servicesService.getCategories();
        console.log('Categories response:', response);

        if (response.success && response.data.categories) {
          // Map categories từ API response và thêm icon properties
          const mappedCategories = response.data.categories.map(category => ({
            id: category.id,
            name: category.name,
            description: getCategoryDescription(category.name),
            icon: getCategoryIcon(category.name),
            iconBg: getCategoryIconBg(category.name),
            hasSubServices: true,
            count: category.count
          }));

          setCategories(mappedCategories);
          return; // Successfully loaded from API
        }
      } catch (apiError) {
        console.log('API categories endpoint not available, using fallback data');
      }

      // Fallback: Use default categories if API fails
      const defaultCategories = [
        {
          id: 'basic',
          name: 'Khám tổng quát',
          description: getCategoryDescription('Khám tổng quát'),
          icon: getCategoryIcon('Khám tổng quát'),
          iconBg: getCategoryIconBg('Khám tổng quát'),
          hasSubServices: true,
          count: 0
        },
        {
          id: 'standard',
          name: 'Khám tiêu chuẩn',
          description: getCategoryDescription('Khám tiêu chuẩn'),
          icon: getCategoryIcon('Khám tiêu chuẩn'),
          iconBg: getCategoryIconBg('Khám tiêu chuẩn'),
          hasSubServices: true,
          count: 0
        },
        {
          id: 'advanced',
          name: 'Khám nâng cao',
          description: getCategoryDescription('Khám nâng cao'),
          icon: getCategoryIcon('Khám nâng cao'),
          iconBg: getCategoryIconBg('Khám nâng cao'),
          hasSubServices: true,
          count: 0
        },
        {
          id: 'cancer',
          name: 'Tầm soát ung thư',
          description: getCategoryDescription('Tầm soát ung thư'),
          icon: getCategoryIcon('Tầm soát ung thư'),
          iconBg: getCategoryIconBg('Tầm soát ung thư'),
          hasSubServices: true,
          count: 0
        },
        {
          id: 'gynecology',
          name: 'Phụ khoa',
          description: getCategoryDescription('Phụ khoa'),
          icon: getCategoryIcon('Phụ khoa'),
          iconBg: getCategoryIconBg('Phụ khoa'),
          hasSubServices: true,
          count: 0
        },
        {
          id: 'symptom',
          name: 'Triệu chứng',
          description: getCategoryDescription('Triệu chứng'),
          icon: getCategoryIcon('Triệu chứng'),
          iconBg: getCategoryIconBg('Triệu chứng'),
          hasSubServices: true,
          count: 0
        },
        {
          id: 'specialty',
          name: 'Chuyên khoa',
          description: getCategoryDescription('Chuyên khoa'),
          icon: getCategoryIcon('Chuyên khoa'),
          iconBg: getCategoryIconBg('Chuyên khoa'),
          hasSubServices: true,
          count: 0
        }
      ];

      setCategories(defaultCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách danh mục. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions để map category với icon và description
  const getCategoryDescription = (categoryName) => {
    const descriptions = {
      'Khám tổng quát': 'Khám sức khỏe tổng quát, kiểm tra định kỳ',
      'Khám tiêu chuẩn': 'Khám sức khỏe tiêu chuẩn, toàn diện hơn',
      'Khám nâng cao': 'Khám sức khỏe nâng cao, chi tiết nhất',
      'Tầm soát ung thư': 'Tầm soát và phát hiện sớm ung thư',
      'Phụ khoa': 'Khám và điều trị các bệnh phụ khoa',
      'Chuyên khoa': 'Khám các chuyên khoa tim mạch, thần kinh',
      'Triệu chứng': 'Khám theo triệu chứng cụ thể',
      'Nhiễm trùng': 'Tầm soát và điều trị các bệnh nhiễm trùng'
    };
    return descriptions[categoryName] || 'Dịch vụ y tế chuyên nghiệp';
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Khám tổng quát': 'medical',
      'Khám tiêu chuẩn': 'fitness',
      'Khám nâng cao': 'star',
      'Tầm soát ung thư': 'search',
      'Phụ khoa': 'woman',
      'Chuyên khoa': 'heart',
      'Triệu chứng': 'alert-circle',
      'Nhiễm trùng': 'shield-checkmark'
    };
    return icons[categoryName] || 'medical';
  };

  const getCategoryIconBg = (categoryName) => {
    const colors = {
      'Khám tổng quát': '#4285F4',
      'Khám tiêu chuẩn': '#34A853',
      'Khám nâng cao': '#FBBC05',
      'Tầm soát ung thư': '#E53935',
      'Phụ khoa': '#EC407A',
      'Chuyên khoa': '#43A047',
      'Triệu chứng': '#FF9800',
      'Nhiễm trùng': '#9C27B0'
    };
    return colors[categoryName] || '#4285F4';
  };

  // Xử lý khi chọn danh mục
  const handleCategoryPress = (category) => {
    navigation.navigate('SubServicesList', {
      categoryId: category.id,
      categoryName: category.name,
      appointmentData: appointmentData // Truyền tiếp appointmentData
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
        <Text style={styles.headerTitle}>Chọn gói dịch vụ</Text>
      </View>

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
          <Text style={styles.loadingText}>Đang tải danh mục...</Text>
        </View>
      ) : (
        /* Categories List */
        <ScrollView style={styles.content}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={[styles.categoryIconContainer, { backgroundColor: category.iconBg || '#4285F4' }]}>
                <Ionicons name={category.icon} size={28} color="white" />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
                {category.count > 0 && (
                  <Text style={styles.categoryCount}>{category.count} dịch vụ</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
            </TouchableOpacity>
          ))}
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
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: '#999',
  },
});

export default ServiceCategoriesScreen;
