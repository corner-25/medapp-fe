// src/screens/MedicalExamScreen.js - Updated để lấy thông tin người dùng đầy đủ
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MedicalExamScreen = ({ navigation, route }) => {
  const { getToken, getUserInfo } = useContext(AuthContext);
  
  // Lấy dữ liệu từ màn hình trước nếu có
  const { relative, services: relativeServices, symptoms: relativeSymptoms } = route.params || {};
  
  // State cho ngày được chọn
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('02:00 PM');
  const [days, setDays] = useState([]);
  
  // State cho các dịch vụ
  const [services, setServices] = useState([
    { id: 1, name: 'Dịch vụ đưa đón tận nhà', selected: true },
    { id: 2, name: 'Dịch vụ thêm 1', selected: false },
    { id: 3, name: 'Dịch vụ thêm 2', selected: false },
  ]);
  
  // State cho mô tả triệu chứng
  const [symptoms, setSymptoms] = useState(relativeSymptoms || '');
  const [loading, setLoading] = useState(false);
  
  // State cho thông tin bệnh nhân
  const [currentPatient, setCurrentPatient] = useState(null);

  // Khởi tạo 7 ngày kể từ hôm nay
  useEffect(() => {
    const today = new Date();
    const nextDays = [];
    
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      
      // Lấy thứ trong tuần
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[nextDate.getDay()];
      
      // Lấy ngày (chỉ lấy số)
      const date = nextDate.getDate().toString();
      
      nextDays.push({
        day: dayName,
        date: date,
        fullDate: nextDate
      });
    }
    
    setDays(nextDays);
    
    // Mặc định chọn ngày hôm nay
    setSelectedDay(nextDays[0].date);
  }, []);

  // Load thông tin bệnh nhân
  useEffect(() => {
    const loadPatientInfo = async () => {
      console.log('Loading patient info, relative from params:', relative);
      
      if (relative) {
        // Nếu có thông tin người thân từ route params (từ RelativeCareScreen)
        console.log('Using relative info:', relative);
        setCurrentPatient(relative);
      } else {
        // Nếu không có, lấy thông tin người dùng hiện tại (đặt khám cho bản thân)
        try {
          const userInfo = getUserInfo();
          if (userInfo) {
            // Tạo object bệnh nhân từ thông tin người dùng hiện tại
            const currentUserAsPatient = {
              _id: 'current_user',
              id: 'current_user',
              name: userInfo.name || 'Bạn',
              age: userInfo.age || 30,
              phone: userInfo.phone || '',
              address: userInfo.address || '',
              relationship: 'Bản thân',
              nationalId: userInfo.nationalId || '',
              healthInsuranceId: userInfo.healthInsuranceId || '',
            };
            console.log('Using current user info as patient:', currentUserAsPatient);
            setCurrentPatient(currentUserAsPatient);
          } else {
            // Nếu không có thông tin user, thử lấy từ AsyncStorage
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
              const parsedUserInfo = JSON.parse(userInfoStr);
              const currentUserAsPatient = {
                _id: 'current_user',
                id: 'current_user',
                name: parsedUserInfo.name || 'Bạn',
                age: parsedUserInfo.age || 30,
                phone: parsedUserInfo.phone || '',
                address: parsedUserInfo.address || '',
                relationship: 'Bản thân',
                nationalId: parsedUserInfo.nationalId || '',
                healthInsuranceId: parsedUserInfo.healthInsuranceId || '',
              };
              console.log('Using parsed user info as patient:', currentUserAsPatient);
              setCurrentPatient(currentUserAsPatient);
            }
          }
        } catch (error) {
          console.error('Error loading patient info:', error);
        }
      }
    };

    loadPatientInfo();
  }, [relative, getUserInfo]);

  // Xử lý khi chọn/bỏ chọn dịch vụ
  const toggleService = (id) => {
    setServices(
      services.map((service) =>
        service.id === id 
          ? { ...service, selected: !service.selected } 
          : service
      )
    );
  };

  // Tiếp tục đến màn hình danh sách dịch vụ và đặt lịch khám
  const handleNext = async () => {
    // Kiểm tra người dùng đã đăng nhập chưa
    const token = getToken();
    if (!token) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để tiếp tục đặt lịch khám.',
        [
          { text: 'Hủy' },
          { 
            text: 'Đăng nhập', 
            onPress: () => navigation.navigate('LoginScreen', {
              returnScreen: 'MedicalExam',
              params: {
                relative: currentPatient,
                services: services.filter(s => s.selected),
                symptoms
              }
            })
          }
        ]
      );
      return;
    }

    // Kiểm tra thông tin bệnh nhân
    if (!currentPatient) {
      Alert.alert('Thông báo', 'Không thể lấy thông tin bệnh nhân');
      return;
    }

    // Kiểm tra thông tin bắt buộc
    if (!currentPatient.name || !currentPatient.phone) {
      Alert.alert(
        'Thông tin chưa đầy đủ',
        'Vui lòng cập nhật đầy đủ họ tên và số điện thoại trong hồ sơ cá nhân trước khi đặt lịch.',
        [
          { text: 'Hủy' },
          {
            text: 'Cập nhật',
            onPress: () => navigation.navigate('Người dùng', {
              screen: 'PersonalInfo'
            })
          }
        ]
      );
      return;
    }

    // Kiểm tra thông tin lịch hẹn
    if (!selectedDay || !selectedTime) {
      Alert.alert('Thông báo', 'Vui lòng chọn ngày và giờ khám');
      return;
    }

    // Chuyển ngày và giờ thành chuỗi định dạng
    const selectedDayObj = days.find(day => day.date === selectedDay);
    const formattedDate = selectedDayObj ? 
      `${selectedDayObj.day}, ${selectedDay} ${new Date().toLocaleString('default', { month: 'long' })}` :
      selectedDay;

    setLoading(true);

    try {
      // Tạo đối tượng chứa thông tin đặt khám đầy đủ
      const appointmentData = {
        patient: currentPatient, // Thông tin đầy đủ của bệnh nhân
        selectedDay: formattedDate,
        selectedTime,
        services: services.filter(s => s.selected),
        symptoms: symptoms.trim(),
        createdAt: new Date().toISOString(),
      };

      console.log('=== DEBUG APPOINTMENT DATA ===');
      console.log('Current patient:', currentPatient);
      console.log('Patient relationship:', currentPatient?.relationship);
      console.log('Full appointment data:', appointmentData);
      console.log('=== END DEBUG ===');

      // Điều hướng đến màn hình danh sách dịch vụ với thông tin đầy đủ
      navigation.navigate('ServiceCategories', {
        appointmentData: appointmentData
      });
    } catch (error) {
      console.error('Error preparing appointment data:', error);
      Alert.alert('Lỗi', 'Không thể xử lý thông tin đặt khám.');
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Đặt lịch khám</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Patient Info if available */}
        {currentPatient && (
          <View style={styles.patientInfoContainer}>
            <View style={styles.patientInfoHeader}>
              <Icon name="person" size={24} color="#4285F4" />
              <Text style={styles.patientInfoTitle}>Thông tin bệnh nhân</Text>
            </View>
            <View style={styles.patientInfoContent}>
              <Text style={styles.patientName}>{currentPatient.name}</Text>
              <Text style={styles.patientDetails}>
                {currentPatient.age} tuổi {currentPatient.relationship ? `- ${currentPatient.relationship}` : ''}
              </Text>
              {currentPatient.phone && <Text style={styles.patientDetails}>SĐT: {currentPatient.phone}</Text>}
              {currentPatient.address && <Text style={styles.patientDetails}>Địa chỉ: {currentPatient.address}</Text>}
              {currentPatient.healthInsuranceId && (
                <Text style={styles.patientDetails}>BHYT: {currentPatient.healthInsuranceId}</Text>
              )}
              {currentPatient.nationalId && (
                <Text style={styles.patientDetails}>CMND/CCCD: {currentPatient.nationalId}</Text>
              )}
            </View>
          </View>
        )}

        {/* Services */}
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Dịch vụ bổ sung</Text>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceItem}
              onPress={() => toggleService(service.id)}
            >
              <View style={[
                styles.checkbox, 
                service.selected ? styles.checkboxSelected : {}
              ]}>
                {service.selected && (
                  <Icon name="checkmark" size={18} color="#fff" />
                )}
              </View>
              <Text style={styles.serviceText}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Symptoms Description */}
        <View style={styles.symptomsContainer}>
          <Text style={styles.sectionTitle}>Mô tả triệu chứng</Text>
          <TextInput
            style={styles.symptomsInput}
            placeholder="Mô tả sơ bộ triệu chứng để chúng tôi phục vụ tốt hơn...!"
            multiline
            placeholderTextColor="#888"
            value={symptoms}
            onChangeText={setSymptoms}
          />
        </View>

        {/* Date Selection */}
        <View style={styles.dateContainer}>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {days.map((item) => (
              <TouchableOpacity
                key={item.date + item.day}
                style={[
                  styles.dateItem,
                  selectedDay === item.date ? styles.selectedDateItem : {}
                ]}
                onPress={() => setSelectedDay(item.date)}
              >
                <Text style={[
                  styles.dayText,
                  selectedDay === item.date ? styles.selectedDayText : {}
                ]}>
                  {item.day}
                </Text>
                <Text style={[
                  styles.dateText,
                  selectedDay === item.date ? styles.selectedDayText : {}
                ]}>
                  {item.date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.timeContainer}>
          <Text style={styles.sectionTitle}>Chọn giờ</Text>
          <View style={styles.timeRow}>
            <TouchableOpacity
              style={[
                styles.timeItem,
                selectedTime === '09:00 AM' ? styles.selectedTimeItem : {},
                false ? styles.disabledTimeItem : {}
              ]}
              onPress={() => setSelectedTime('09:00 AM')}
              disabled={false}
            >
              <Text style={[
                styles.timeText,
                selectedTime === '09:00 AM' ? styles.selectedTimeText : {},
                false ? styles.disabledTimeText : {}
              ]}>
                09:00 AM
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.timeItem,
                selectedTime === '10:00 AM' ? styles.selectedTimeItem : {}
              ]}
              onPress={() => setSelectedTime('10:00 AM')}
            >
              <Text style={[
                styles.timeText,
                selectedTime === '10:00 AM' ? styles.selectedTimeText : {}
              ]}>
                10:00 AM
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.timeItem,
                selectedTime === '11:00 AM' ? styles.selectedTimeItem : {}
              ]}
              onPress={() => setSelectedTime('11:00 AM')}
            >
              <Text style={[
                styles.timeText,
                selectedTime === '11:00 AM' ? styles.selectedTimeText : {}
              ]}>
                11:00 AM
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeRow}>
            <TouchableOpacity
              style={[
                styles.timeItem,
                selectedTime === '01:00 PM' ? styles.selectedTimeItem : {}
              ]}
              onPress={() => setSelectedTime('01:00 PM')}
            >
              <Text style={[
                styles.timeText,
                selectedTime === '01:00 PM' ? styles.selectedTimeText : {}
              ]}>
                01:00 PM
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.timeItem,
                selectedTime === '02:00 PM' ? styles.selectedTimeItem : {}
              ]}
              onPress={() => setSelectedTime('02:00 PM')}
            >
              <Text style={[
                styles.timeText,
                selectedTime === '02:00 PM' ? styles.selectedTimeText : {}
              ]}>
                02:00 PM
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.timeItem,
                selectedTime === '03:00 PM' ? styles.selectedTimeItem : {}
              ]}
              onPress={() => setSelectedTime('03:00 PM')}
            >
              <Text style={[
                styles.timeText,
                selectedTime === '03:00 PM' ? styles.selectedTimeText : {}
              ]}>
                03:00 PM
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeRow}>
            <TouchableOpacity
              style={[
                styles.timeItem,
                selectedTime === '04:00 PM' ? styles.selectedTimeItem : {}
              ]}
              onPress={() => setSelectedTime('04:00 PM')}
            >
              <Text style={[
                styles.timeText,
                selectedTime === '04:00 PM' ? styles.selectedTimeText : {}
              ]}>
                04:00 PM
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.timeItem,
                selectedTime === '07:00 PM' ? styles.selectedTimeItem : {}
              ]}
              onPress={() => setSelectedTime('07:00 PM')}
            >
              <Text style={[
                styles.timeText,
                selectedTime === '07:00 PM' ? styles.selectedTimeText : {}
              ]}>
                07:00 PM
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.timeItem,
                selectedTime === '08:00 PM' ? styles.selectedTimeItem : {},
                false ? styles.disabledTimeItem : {}
              ]}
              onPress={() => setSelectedTime('08:00 PM')}
              disabled={false}
            >
              <Text style={[
                styles.timeText,
                selectedTime === '08:00 PM' ? styles.selectedTimeText : {},
                false ? styles.disabledTimeText : {}
              ]}>
                08:00 PM
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.nextButtonText}>Tiếp theo</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
  },
  patientInfoContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4285F4',
  },
  patientInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  patientInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
    marginLeft: 8,
  },
  patientInfoContent: {
    paddingLeft: 5,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  patientDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  servicesContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#4285F4',
  },
  serviceText: {
    fontSize: 16,
    color: '#000',
  },
  symptomsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  symptomsInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  dateContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  dateItem: {
    width: 80,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    marginRight: 10,
  },
  selectedDateItem: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  dayText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  selectedDayText: {
    color: '#fff',
  },
  timeContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timeItem: {
    width: '31%',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTimeItem: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  disabledTimeItem: {
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  timeText: {
    fontSize: 16,
    color: '#000',
  },
  selectedTimeText: {
    color: '#fff',
  },
  disabledTimeText: {
    color: '#ccc',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MedicalExamScreen;