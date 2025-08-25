// src/screens/AnalysisScreen.js - Updated for ReportScreen integration
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
import { analysesService } from '../services/apiService';

const AnalysisScreen = ({ navigation, route }) => {
  const { getToken, getUserInfo } = useContext(AuthContext);
  
  // Get patient info from ReportScreen or route params
  const selectedPatient = route.params?.selectedPatient;
  const fromReport = route.params?.fromReport || false;
  
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load analyses data when screen mounts
  useEffect(() => {
    loadAnalysesData();
  }, [selectedPatient]);

  // Load analyses data for selected patient
  const loadAnalysesData = async () => {
    try {
      setLoading(true);
      
      if (!selectedPatient) {
        Alert.alert('Lỗi', 'Không có thông tin bệnh nhân');
        navigation.goBack();
        return;
      }

      console.log('🔍 Loading analyses for patient:', selectedPatient);

      // If it's current user, show empty for now (can be implemented later)
      if (selectedPatient._id === 'current_user' || selectedPatient.isCurrentUser) {
        console.log('📝 Current user selected - showing empty state');
        setAnalyses([]);
        setLoading(false);
        return;
      }

      // Load analyses from API for relatives
      const analysesData = await analysesService.getByRelativeId(selectedPatient._id);
      console.log('🧪 Loaded analyses from API:', analysesData);
      setAnalyses(analysesData || []);

    } catch (error) {
      console.error('❌ Error loading analyses:', error);
      
      if (error.message?.includes('404')) {
        // No analyses found - this is normal
        setAnalyses([]);
      } else if (error.message?.includes('Network')) {
        Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin phân tích. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalysesData();
    setRefreshing(false);
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'blood':
        return '#E53935'; // Red
      case 'urine':
        return '#FFC107'; // Yellow
      case 'imaging':
        return '#2196F3'; // Blue
      case 'other':
        return '#9C27B0'; // Purple
      default:
        return '#666';
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'blood':
        return 'water-outline';
      case 'urine':
        return 'flask-outline';
      case 'imaging':
        return 'scan-outline';
      case 'other':
        return 'document-text-outline';
      default:
        return 'analytics-outline';
    }
  };

  // Get category text
  const getCategoryText = (category) => {
    switch (category) {
      case 'blood':
        return 'Xét nghiệm máu';
      case 'urine':
        return 'Xét nghiệm nước tiểu';
      case 'imaging':
        return 'Chẩn đoán hình ảnh';
      case 'other':
        return 'Khác';
      default:
        return 'Phân tích';
    }
  };

  // Check if analysis has results
  const hasResults = (analysis) => {
    return analysis.results && analysis.results.length > 0;
  };

  // Get results summary
  const getResultsSummary = (analysis) => {
    if (!hasResults(analysis)) return 'Chưa có kết quả';
    
    const normalCount = analysis.results.filter(r => r.status === 'normal').length;
    const totalCount = analysis.results.length;
    
    if (normalCount === totalCount) {
      return `${totalCount} chỉ số bình thường`;
    } else {
      const abnormalCount = totalCount - normalCount;
      return `${normalCount} bình thường, ${abnormalCount} bất thường`;
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

  // Handle analysis press
  const handleAnalysisPress = (analysis) => {
    if (hasResults(analysis)) {
      navigation.navigate('AnalysisDetailScreen', { 
        analysisId: analysis._id,
        analysisData: analysis,
        selectedPatient: selectedPatient
      });
    } else {
      Alert.alert(
        'Chưa có kết quả', 
        'Phân tích này chưa có kết quả chi tiết. Kết quả sẽ được cập nhật bởi y tá sau khi hoàn thành xét nghiệm.',
        [{ text: 'OK' }]
      );
    }
  };

  // Render analysis item
  const renderAnalysisItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.analysisItem}
      onPress={() => handleAnalysisPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.analysisHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item.category) }]}>
          <Icon 
            name={getCategoryIcon(item.category)} 
            size={20} 
            color="white" 
          />
        </View>
        <View style={styles.analysisInfo}>
          <Text style={styles.analysisName}>{item.name}</Text>
          <Text style={styles.categoryText}>{getCategoryText(item.category)}</Text>
        </View>
        <View style={styles.analysisStatus}>
          {hasResults(item) ? (
            <View style={styles.hasResultsBadge}>
              <Icon name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.hasResultsText}>Có kết quả</Text>
            </View>
          ) : (
            <View style={styles.noResultsBadge}>
              <Icon name="time-outline" size={16} color="#FF9800" />
              <Text style={styles.noResultsText}>Chờ kết quả</Text>
            </View>
          )}
        </View>
      </View>
      
      {item.description ? (
        <Text style={styles.analysisDescription}>{item.description}</Text>
      ) : null}
      
      <View style={styles.analysisFooter}>
        <View style={styles.dateSection}>
          <Icon name="calendar-outline" size={14} color="#666" />
          <Text style={styles.analysisDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.resultsSection}>
          <Text style={styles.resultsSummary}>{getResultsSummary(item)}</Text>
          <Icon name="chevron-forward" size={16} color="#999" />
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="flask-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>Chưa có kết quả phân tích</Text>
      <Text style={styles.emptyMessage}>
        {selectedPatient?.relationship === 'Bản thân' 
          ? 'Bạn chưa có kết quả phân tích nào được ghi nhận'
          : `${selectedPatient?.name} chưa có kết quả phân tích nào được ghi nhận`
        }
      </Text>
      <Text style={styles.emptyNote}>
        Kết quả phân tích sẽ được cập nhật sau khi xét nghiệm hoàn thành
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
          <Text style={styles.headerTitle}>Kết quả phân tích</Text>
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
        <Text style={styles.headerTitle}>Kết quả phân tích</Text>
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
            <Text style={styles.countText}>{analyses.length}</Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {analyses.length > 0 ? (
          <FlatList
            data={analyses}
            renderItem={renderAnalysisItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.analysisList}
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
    backgroundColor: '#FF9800',
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

  // Analysis List
  analysisList: {
    padding: 20,
    paddingBottom: 100,
  },
  analysisItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  analysisInfo: {
    flex: 1,
  },
  analysisName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  analysisStatus: {
    alignItems: 'flex-end',
  },
  hasResultsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hasResultsText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  noResultsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noResultsText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginLeft: 4,
  },
  analysisDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  analysisFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analysisDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  resultsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsSummary: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
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

export default AnalysisScreen;