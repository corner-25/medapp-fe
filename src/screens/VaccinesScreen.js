// src/screens/VaccinesScreen.js - Updated for ReportScreen integration
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
import { vaccinesService } from '../services/apiService';

const VaccinesScreen = ({ navigation, route }) => {
  const { getToken, getUserInfo } = useContext(AuthContext);
  
  // Get patient info from ReportScreen or route params
  const selectedPatient = route.params?.selectedPatient;
  const fromReport = route.params?.fromReport || false;
  
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load vaccines data when screen mounts
  useEffect(() => {
    loadVaccinesData();
  }, [selectedPatient]);

  // Load vaccines data for selected patient
  const loadVaccinesData = async () => {
    try {
      setLoading(true);
      
      if (!selectedPatient) {
        Alert.alert('Lỗi', 'Không có thông tin bệnh nhân');
        navigation.goBack();
        return;
      }

      console.log('🔍 Loading vaccines for patient:', selectedPatient);

      // If it's current user, show empty for now (can be implemented later)
      if (selectedPatient._id === 'current_user' || selectedPatient.isCurrentUser) {
        console.log('📝 Current user selected - showing empty state');
        setVaccines([]);
        setLoading(false);
        return;
      }

      // Load vaccines from API for relatives
      const vaccinesData = await vaccinesService.getByRelativeId(selectedPatient._id);
      console.log('💉 Loaded vaccines from API:', vaccinesData);
      setVaccines(vaccinesData || []);

    } catch (error) {
      console.error('❌ Error loading vaccines:', error);
      
      if (error.message?.includes('404')) {
        // No vaccines found - this is normal
        setVaccines([]);
      } else if (error.message?.includes('Network')) {
        Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin tiêm chủng. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadVaccinesData();
    setRefreshing(false);
  };

  // Format date for vaccine doses
  const formatDoseDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return { day, month, year };
  };

  // Format full date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get status color for vaccine
  const getVaccineStatusColor = (vaccine) => {
    if (vaccine.nextDose && vaccine.nextDose.scheduled) {
      return '#FF9800'; // Orange for scheduled
    }
    if (vaccine.doses && vaccine.doses.length > 0) {
      return '#4CAF50'; // Green for completed doses
    }
    return '#666'; // Gray for no data
  };

  // Get status text for vaccine
  const getVaccineStatusText = (vaccine) => {
    if (vaccine.nextDose && vaccine.nextDose.scheduled) {
      return `Đã lên lịch mũi ${vaccine.nextDose.number}`;
    }
    if (vaccine.doses && vaccine.doses.length > 0) {
      return `Đã tiêm ${vaccine.doses.length} mũi`;
    }
    return 'Chưa có thông tin';
  };

  // Render vaccine item
  const renderVaccineItem = ({ item }) => (
    <View style={styles.vaccineItem}>
      <View style={styles.vaccineHeader}>
        <View style={styles.vaccineInfo}>
          <Text style={styles.vaccineName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getVaccineStatusColor(item)}15` }]}>
            <Icon 
              name="shield-checkmark-outline" 
              size={14} 
              color={getVaccineStatusColor(item)} 
            />
            <Text style={[styles.statusText, { color: getVaccineStatusColor(item) }]}>
              {getVaccineStatusText(item)}
            </Text>
          </View>
        </View>
      </View>

      {/* Doses Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Mũi tiêm</Text>
        <View style={styles.dateColumns}>
          <Text style={styles.tableHeaderDateText}>Ngày</Text>
          <Text style={styles.tableHeaderDateText}>Tháng</Text>
          <Text style={styles.tableHeaderDateText}>Năm</Text>
        </View>
      </View>

      {/* Doses List */}
      {item.doses && item.doses.length > 0 ? (
        item.doses.map((dose, index) => {
          const { day, month, year } = formatDoseDate(dose.date);
          return (
            <View key={index} style={styles.doseRow}>
              <Text style={styles.doseNumber}>Mũi {dose.number}</Text>
              <View style={styles.dateColumns}>
                <Text style={styles.dateCell}>{day}</Text>
                <Text style={styles.dateCell}>{month}</Text>
                <Text style={styles.dateCell}>{year}</Text>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.noDosesContainer}>
          <Text style={styles.noDosesText}>Chưa có thông tin tiêm chủng</Text>
        </View>
      )}

      {/* Next Dose Info */}
      {item.nextDose && item.nextDose.scheduled && (
        <View style={styles.nextDoseContainer}>
          <View style={styles.nextDoseHeader}>
            <Icon name="calendar-outline" size={16} color="#FF9800" />
            <Text style={styles.nextDoseTitle}>Mũi tiêm tiếp theo</Text>
          </View>
          <Text style={styles.nextDoseInfo}>
            Mũi {item.nextDose.number} - {item.nextDose.scheduledDate ? formatDate(item.nextDose.scheduledDate) : 'Chưa xác định ngày'}
          </Text>
        </View>
      )}
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="shield-checkmark-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>Chưa có thông tin tiêm chủng</Text>
      <Text style={styles.emptyMessage}>
        {selectedPatient?.relationship === 'Bản thân' 
          ? 'Bạn chưa có thông tin tiêm chủng nào được ghi nhận'
          : `${selectedPatient?.name} chưa có thông tin tiêm chủng nào được ghi nhận`
        }
      </Text>
      <Text style={styles.emptyNote}>
        Thông tin tiêm chủng sẽ được cập nhật bởi y tá sau khi tiêm
      </Text>
    </View>
  );

  // Handle schedule next dose
  const handleScheduleNextDose = () => {
    Alert.alert(
      'Lên lịch tiêm chủng', 
      'Tính năng này sẽ được phát triển trong tương lai',
      [{ text: 'OK' }]
    );
  };

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
          <Text style={styles.headerTitle}>Thông tin tiêm chủng</Text>
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
        <Text style={styles.headerTitle}>Thông tin tiêm chủng</Text>
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
            <Text style={styles.countText}>{vaccines.length}</Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {vaccines.length > 0 ? (
          <>
            <FlatList
              data={vaccines}
              renderItem={renderVaccineItem}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.vaccineList}
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
            
            {/* Schedule Button */}
            <View style={styles.scheduleButtonContainer}>
              <TouchableOpacity 
                style={styles.scheduleButton}
                onPress={handleScheduleNextDose}
              >
                <Icon name="calendar-outline" size={20} color="white" />
                <Text style={styles.scheduleButtonText}>Lên lịch tiêm chủng</Text>
              </TouchableOpacity>
            </View>
          </>
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
    backgroundColor: '#4CAF50',
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

  // Vaccine List
  vaccineList: {
    padding: 20,
    paddingBottom: 100,
  },
  vaccineItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vaccineHeader: {
    marginBottom: 12,
  },
  vaccineInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vaccineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Table
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  dateColumns: {
    flexDirection: 'row',
    width: 120,
  },
  tableHeaderDateText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  doseNumber: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  dateCell: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  noDosesContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noDosesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },

  // Next Dose
  nextDoseContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  nextDoseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nextDoseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
    marginLeft: 6,
  },
  nextDoseInfo: {
    fontSize: 13,
    color: '#666',
  },

  // Schedule Button
  scheduleButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  scheduleButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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

export default VaccinesScreen;