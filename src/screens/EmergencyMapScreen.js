// src/screens/EmergencyMapScreen.js (Đã bỏ hoàn toàn GPS)
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { emergencyService } from '../services/apiService';

const EmergencyMapScreen = ({ navigation, route }) => {
  // Lấy dữ liệu từ màn hình trước
  const { patient, selectedServices, symptoms, totalServiceCost, baseCost, totalCost } = route.params || {};
  
  const { getToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  // Format currency VND
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Xử lý xác nhận địa chỉ
  const handleConfirmAddress = () => {
    if (!patient.address) {
      Alert.alert('Lỗi', 'Không có thông tin địa chỉ. Vui lòng cập nhật địa chỉ trong hồ sơ.');
      return;
    }
    setAddressConfirmed(true);
  };

  // Xử lý đặt xe cấp cứu
  const handleBookEmergency = async () => {
    if (!addressConfirmed) {
      Alert.alert('Thông báo', 'Vui lòng xác nhận địa chỉ trước khi đặt xe cấp cứu');
      return;
    }

    setLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để tiếp tục');
        navigation.navigate('LoginScreen');
        return;
      }

      // Chuẩn bị dữ liệu gửi lên API (đúng format backend yêu cầu)
      const emergencyData = {
        patient: patient._id === 'current_user' ? null : patient._id,
        patientInfo: {
          name: patient.name || '',
          age: patient.age || 0,
          phone: patient.phone || '',
          address: patient.address || '',
          relationship: patient.relationship || 'Bản thân',
          nationalId: patient.nationalId || '',
          healthInsuranceId: patient.healthInsuranceId || ''
        },
        location: {
          address: patient.address || '',
          // Backend sẽ tự động set GPS mặc định
        },
        symptoms: symptoms || '',
        selectedServices: (selectedServices || []).map(service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price
        })),
        pricing: {
          baseCost: baseCost || 200000,
          servicesCost: totalServiceCost || 0,
          totalCost: totalCost || (baseCost || 200000)
        },
        status: 'pending',
        priority: 'high',
        requestTime: new Date().toISOString()
      };

      console.log('Emergency data to send:', emergencyData);
      
      // Gọi API tạo yêu cầu cấp cứu
      const response = await emergencyService.create(emergencyData);
      console.log('Emergency created successfully:', response);
      
      // Hiển thị thông báo thành công và về HomeScreen
      Alert.alert(
        'Gọi cấp cứu thành công!',
        'Xe cấp cứu sẽ đến sớm nhất có thể. Vui lòng giữ máy để nhận cuộc gọi từ tài xế.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset navigation về HomeScreen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Trang chủ' }],
              });
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error creating emergency request:', error);
      
      let errorMessage = 'Không thể tạo yêu cầu cấp cứu. Vui lòng thử lại.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chỉnh sửa thông tin
  const handleEditInfo = () => {
    navigation.goBack();
  };

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác nhận đơn cấp cứu</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không có thông tin bệnh nhân</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Kiểm tra dữ liệu cần thiết
  if (!patient.name || !patient.phone || !patient.address) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác nhận đơn cấp cứu</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Thông tin bệnh nhân chưa đầy đủ</Text>
          <Text style={styles.errorSubText}>Vui lòng cập nhật đầy đủ họ tên, số điện thoại và địa chỉ</Text>
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => {
              navigation.navigate('Người dùng', {
                screen: 'PersonalInfo'
              });
            }}
          >
            <Text style={styles.updateButtonText}>Cập nhật thông tin</Text>
          </TouchableOpacity>
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
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đơn cấp cứu</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Thông tin bệnh nhân */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#E53935" />
            <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
            <TouchableOpacity onPress={handleEditInfo}>
              <Text style={styles.editText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ tên:</Text>
              <Text style={styles.infoValue}>{patient.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tuổi:</Text>
              <Text style={styles.infoValue}>{patient.age} tuổi</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mối quan hệ:</Text>
              <Text style={styles.infoValue}>{patient.relationship}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại:</Text>
              <Text style={styles.infoValue}>{patient.phone}</Text>
            </View>
            {patient.nationalId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>CMND/CCCD:</Text>
                <Text style={styles.infoValue}>{patient.nationalId}</Text>
              </View>
            )}
            {patient.healthInsuranceId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã BHYT:</Text>
                <Text style={styles.infoValue}>{patient.healthInsuranceId}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Địa chỉ */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#E53935" />
            <Text style={styles.sectionTitle}>Địa chỉ cấp cứu</Text>
          </View>
          
          <View style={styles.addressCard}>
            <Text style={styles.addressText}>{patient.address}</Text>
            
            {!addressConfirmed ? (
              <TouchableOpacity 
                style={styles.confirmAddressButton}
                onPress={handleConfirmAddress}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#4285F4" />
                <Text style={styles.confirmAddressText}>Xác nhận địa chỉ</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.confirmedAddress}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.confirmedAddressText}>Địa chỉ đã xác nhận</Text>
              </View>
            )}
          </View>
        </View>

        {/* Triệu chứng */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color="#E53935" />
            <Text style={styles.sectionTitle}>Triệu chứng</Text>
          </View>
          
          <View style={styles.symptomsCard}>
            <Text style={styles.symptomsText}>{symptoms}</Text>
          </View>
        </View>

        {/* Dịch vụ đã chọn */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color="#E53935" />
            <Text style={styles.sectionTitle}>Dịch vụ bổ sung</Text>
          </View>
          
          <View style={styles.servicesCard}>
            {selectedServices && selectedServices.length > 0 ? (
              selectedServices.map((service, index) => (
                <View key={service.id} style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  </View>
                  <Text style={styles.servicePrice}>{formatCurrency(service.price)} VND</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noServicesText}>Không có dịch vụ bổ sung</Text>
            )}
          </View>
        </View>

        {/* Chi phí */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash" size={20} color="#E53935" />
            <Text style={styles.sectionTitle}>Chi phí</Text>
          </View>
          
          <View style={styles.costCard}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Chi phí cơ bản:</Text>
              <Text style={styles.costValue}>{formatCurrency(baseCost)} VND</Text>
            </View>
            
            {totalServiceCost > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Chi phí dịch vụ:</Text>
                <Text style={styles.costValue}>{formatCurrency(totalServiceCost)} VND</Text>
              </View>
            )}
            
            <View style={[styles.costRow, styles.totalCostRow]}>
              <Text style={styles.totalCostLabel}>Tổng chi phí:</Text>
              <Text style={styles.totalCostValue}>{formatCurrency(totalCost)} VND</Text>
            </View>
          </View>
        </View>

        {/* Lưu ý */}
        <View style={styles.noteContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#FF9800" />
          <Text style={styles.noteText}>
            Thời gian ước tính xe cấp cứu đến: 10-15 phút. 
            Vui lòng giữ máy để nhận cuộc gọi từ tài xế.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.emergencyButton, 
            (!addressConfirmed || loading) && styles.emergencyButtonDisabled
          ]}
          onPress={handleBookEmergency}
          disabled={!addressConfirmed || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="call" size={20} color="#fff" style={styles.emergencyButtonIcon} />
              <Text style={styles.emergencyButtonText}>Gọi xe cấp cứu ngay</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#fff',
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
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  updateButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonText: {
    fontSize: 16,
    color: '#4285F4',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  editText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  confirmAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 8,
  },
  confirmAddressText: {
    fontSize: 14,
    color: '#4285F4',
    marginLeft: 5,
    fontWeight: '500',
  },
  confirmedAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  confirmedAddressText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 5,
    fontWeight: '500',
  },
  symptomsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  symptomsText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  servicesCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935',
  },
  noServicesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  costCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalCostRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 5,
    paddingTop: 10,
  },
  totalCostLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalCostValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 14,
    color: '#FF8F00',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  emergencyButton: {
    flexDirection: 'row',
    backgroundColor: '#E53935',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  emergencyButtonIcon: {
    marginRight: 10,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EmergencyMapScreen;
