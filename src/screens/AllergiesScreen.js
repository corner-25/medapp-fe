// src/screens/AllergiesScreen.js - Updated for ReportScreen integration
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { allergiesService } from '../services/apiService';

const AllergiesScreen = ({ navigation, route }) => {
  const { getToken, getUserInfo } = useContext(AuthContext);
  
  // Get patient info from ReportScreen or route params
  const selectedPatient = route.params?.selectedPatient;
  const fromReport = route.params?.fromReport || false;
  
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load allergies data when screen mounts
  useEffect(() => {
    loadAllergiesData();
  }, [selectedPatient]);

  // Load allergies data for selected patient
  const loadAllergiesData = async () => {
    try {
      setLoading(true);
      
      if (!selectedPatient) {
        Alert.alert('Lỗi', 'Không có thông tin bệnh nhân');
        navigation.goBack();
        return;
      }

      console.log('🔍 Loading allergies for patient:', selectedPatient);

      // If it's current user, show empty for now (can be implemented later)
      if (selectedPatient._id === 'current_user' || selectedPatient.isCurrentUser) {
        console.log('📝 Current user selected - showing empty state');
        setAllergies([]);
        setLoading(false);
        return;
      }

      // Load allergies from API for relatives
      const allergiesData = await allergiesService.getByRelativeId(selectedPatient._id);
      console.log('🏥 Loaded allergies from API:', allergiesData);
      setAllergies(allergiesData || []);

    } catch (error) {
      console.error('❌ Error loading allergies:', error);
      
      if (error.message?.includes('404')) {
        // No allergies found - this is normal
        setAllergies([]);
      } else if (error.message?.includes('Network')) {
        Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin dị ứng. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllergiesData();
    setRefreshing(false);
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild':
        return '#4CAF50'; // Green
      case 'moderate':
        return '#FF9800'; // Orange
      case 'severe':
        return '#F44336'; // Red
      default:
        return '#FF9800';
    }
  };

  // Get severity text
  const getSeverityText = (severity) => {
    switch (severity) {
      case 'mild':
        return 'Nhẹ';
      case 'moderate':
        return 'Trung bình';
      case 'severe':
        return 'Nghiêm trọng';
      default:
        return 'Trung bình';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'mild':
        return 'alert-circle-outline';
      case 'moderate':
        return 'warning-outline';
      case 'severe':
        return 'alert-outline';
      default:
        return 'warning-outline';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Render allergy item
  const renderAllergyItem = ({ item }) => (
    <View style={[styles.allergyItem, { borderLeftColor: getSeverityColor(item.severity) }]}>
      <View style={styles.allergyHeader}>
        <View style={styles.allergyTitleSection}>
          <Text style={styles.allergyName}>{item.name}</Text>
          <View style={[styles.severityBadge, { backgroundColor: `${getSeverityColor(item.severity)}15` }]}>
            <Icon 
              name={getSeverityIcon(item.severity)} 
              size={14} 
              color={getSeverityColor(item.severity)} 
            />
            <Text style={[styles.severityText, { color: getSeverityColor(item.severity) }]}>
              {getSeverityText(item.severity)}
            </Text>
          </View>
        </View>
      </View>
      
      {item.description ? (
        <Text style={styles.allergyDescription}>{item.description}</Text>
      ) : null}
      
      <View style={styles.allergyFooter}>
        <View style={styles.dateSection}>
          <Icon name="calendar-outline" size={14} color="#666" />
          <Text style={styles.allergyDate}>{formatDate(item.date)}</Text>
        </View>
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="medical-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>Chưa có thông tin dị ứng</Text>
      <Text style={styles.emptyMessage}>
        {selectedPatient?.relationship === 'Bản thân' 
          ? 'Bạn chưa có thông tin dị ứng nào được ghi nhận'
          : `${selectedPatient?.name} chưa có thông tin dị ứng nào được ghi nhận`
        }
      </Text>
      <Text style={styles.emptyNote}>
        Thông tin dị ứng sẽ được cập nhật bởi y tá sau khi khám bệnh
      </Text>
    </View>
  );

  // Loading state
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
          <Text style={styles.headerTitle}>Thông tin dị ứng</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
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
        <Text style={styles.headerTitle}>Thông tin dị ứng</Text>
      </View>
      
      {/* Patient Info */}
      {selectedPatient && (
        <View style={styles.patientInfo}>
          <View style={styles.patientIconContainer}>
            <Icon 
              name={selectedPatient.relationship === 'Bản thân' ? 'person' : 'people'} 
              size={20} 
              color="#4285F4" 
            />
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{selectedPatient.name}</Text>
            <Text style={styles.patientRelation}>
              {selectedPatient.age} tuổi • {selectedPatient.relationship}
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{allergies.length}</Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {allergies.length > 0 ? (
          <FlatList
            data={allergies}
            renderItem={renderAllergyItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.allergyList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4285F4']}
                tintColor="#4285F4"
              />
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#F0F7FF',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Patient Info
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  patientRelation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Content
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },

  // Allergy List
  allergyList: {
    padding: 20,
    paddingBottom: 100,
  },
  allergyItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  allergyHeader: {
    marginBottom: 8,
  },
  allergyTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  allergyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  allergyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  allergyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allergyDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  emptyNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AllergiesScreen;