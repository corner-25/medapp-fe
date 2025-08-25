// src/screens/AnalysisDetailScreen.js - Updated for backend integration
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { analysesService } from '../services/apiService';

const AnalysisDetailScreen = ({ navigation, route }) => {
  const { getToken, getUserInfo } = useContext(AuthContext);
  
  // Get analysis info from route params
  const analysisId = route.params?.analysisId;
  const analysisData = route.params?.analysisData;
  const selectedPatient = route.params?.selectedPatient;
  
  const [analysis, setAnalysis] = useState(analysisData || null);
  const [loading, setLoading] = useState(!analysisData);
  const [refreshing, setRefreshing] = useState(false);

  // Load analysis details when screen mounts
  useEffect(() => {
    if (!analysisData && analysisId) {
      loadAnalysisDetails();
    }
  }, [analysisId]);

  // Load analysis details from API
  const loadAnalysisDetails = async () => {
    try {
      setLoading(true);
      
      if (!analysisId) {
        Alert.alert('Lỗi', 'Không có ID phân tích');
        navigation.goBack();
        return;
      }

      console.log('🔍 Loading analysis details for ID:', analysisId);
      const analysisDetails = await analysesService.getById(analysisId);
      console.log('🧪 Loaded analysis details:', analysisDetails);
      setAnalysis(analysisDetails);

    } catch (error) {
      console.error('❌ Error loading analysis details:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết phân tích. Vui lòng thử lại sau.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalysisDetails();
    setRefreshing(false);
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'blood':
        return '#E53935';
      case 'urine':
        return '#FFC107';
      case 'imaging':
        return '#2196F3';
      case 'other':
        return '#9C27B0';
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

  // Get result status color
  const getResultStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return '#4CAF50';
      case 'high':
        return '#F44336';
      case 'low':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  // Get result status text
  const getResultStatusText = (status) => {
    switch (status) {
      case 'normal':
        return 'Bình thường';
      case 'high':
        return 'Cao';
      case 'low':
        return 'Thấp';
      default:
        return 'Không xác định';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Handle export/share results
  const handleExportResults = async () => {
    if (!analysis || !analysis.results) {
      Alert.alert('Thông báo', 'Không có dữ liệu để xuất');
      return;
    }

    try {
      const resultsText = analysis.results
        .map(result => `${result.name}: ${result.value} ${result.unit || ''} (${getResultStatusText(result.status)})`)
        .join('\n');
      
      const shareContent = `
Kết quả phân tích: ${analysis.name}
Bệnh nhân: ${selectedPatient?.name || 'N/A'}
Ngày: ${formatDate(analysis.date)}

${resultsText}

Ghi chú: ${analysis.description || 'Không có'}
      `.trim();

      await Share.share({
        message: shareContent,
        title: `Kết quả phân tích - ${analysis.name}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Lỗi', 'Không thể chia sẻ kết quả');
    }
  };

  // Render result item
  const renderResultItem = (result, index) => (
    <View key={index} style={styles.resultRow}>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{result.name}</Text>
        {result.normalRange && (
          <Text style={styles.normalRange}>Bình thường: {result.normalRange}</Text>
        )}
      </View>
      <View style={styles.resultValue}>
        <Text style={styles.valueText}>
          {result.value} {result.unit || ''}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getResultStatusColor(result.status)}15` }]}>
          <Text style={[styles.statusText, { color: getResultStatusColor(result.status) }]}>
            {getResultStatusText(result.status)}
          </Text>
        </View>
      </View>
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
          <Text style={styles.headerTitle}>Chi tiết phân tích</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analysis) {
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
          <Text style={styles.headerTitle}>Chi tiết phân tích</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={80} color="#E0E0E0" />
          <Text style={styles.errorTitle}>Không tìm thấy dữ liệu</Text>
          <Text style={styles.errorMessage}>Không thể tải thông tin phân tích</Text>
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
        <Text style={styles.headerTitle}>Chi tiết phân tích</Text>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleExportResults}
        >
          <Icon name="share-outline" size={24} color="#4285F4" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4285F4']}
            tintColor="#4285F4"
          />
        }
      >
        {/* Analysis Info Card */}
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(analysis.category) }]}>
              <Icon 
                name={getCategoryIcon(analysis.category)} 
                size={24} 
                color="white" 
              />
            </View>
            <View style={styles.analysisInfo}>
              <Text style={styles.analysisName}>{analysis.name}</Text>
              <Text style={styles.categoryText}>{getCategoryText(analysis.category)}</Text>
              <Text style={styles.analysisDate}>{formatDate(analysis.date)}</Text>
            </View>
          </View>
          
          {analysis.description && (
            <Text style={styles.analysisDescription}>{analysis.description}</Text>
          )}
        </View>

        {/* Patient Info */}
        {selectedPatient && (
          <View style={styles.patientCard}>
            <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
            <View style={styles.patientInfo}>
              <Icon name="person-outline" size={20} color="#4285F4" />
              <Text style={styles.patientText}>
                {selectedPatient.name} • {selectedPatient.age} tuổi • {selectedPatient.relationship}
              </Text>
            </View>
          </View>
        )}

        {/* Results Section */}
        {analysis.results && analysis.results.length > 0 ? (
          <View style={styles.resultsCard}>
            <Text style={styles.sectionTitle}>Kết quả chi tiết</Text>
            {analysis.results.map((result, index) => renderResultItem(result, index))}
          </View>
        ) : (
          <View style={styles.noResultsCard}>
            <Icon name="time-outline" size={40} color="#FF9800" />
            <Text style={styles.noResultsTitle}>Chưa có kết quả</Text>
            <Text style={styles.noResultsMessage}>
              Kết quả chi tiết sẽ được cập nhật sau khi xét nghiệm hoàn thành
            </Text>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.sectionTitle}>Chú giải</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Bình thường: Trong giới hạn cho phép</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Cao: Vượt quá giới hạn trên</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Thấp: Dưới giới hạn dưới</Text>
          </View>
        </View>

        {/* Report URL */}
        {analysis.reportUrl && (
          <View style={styles.reportCard}>
            <Text style={styles.sectionTitle}>Báo cáo chi tiết</Text>
            <TouchableOpacity style={styles.reportButton}>
              <Icon name="document-text-outline" size={20} color="#4285F4" />
              <Text style={styles.reportButtonText}>Xem báo cáo đầy đủ</Text>
              <Icon name="open-outline" size={16} color="#4285F4" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={handleExportResults}
        >
          <Icon name="download-outline" size={20} color="white" />
          <Text style={styles.exportButtonText}>Xuất kết quả</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#F0F7FF',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  shareButton: {
    padding: 5,
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Loading & Error
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Cards
  analysisCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  analysisInfo: {
    flex: 1,
  },
  analysisName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  analysisDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  analysisDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  patientCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  patientText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },

  resultsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Section Titles
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },

  // Results
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  normalRange: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  resultValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // No Results
  noResultsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  noResultsMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Legend
  legendCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },

  // Report
  reportCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  reportButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
    marginLeft: 8,
  },

  // Bottom Actions
  bottomActions: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AnalysisDetailScreen;