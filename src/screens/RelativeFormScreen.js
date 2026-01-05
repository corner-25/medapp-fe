// src/screens/RelativeFormScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { relativesService } from '../services/apiService';

// Các mối quan hệ
const relationships = [
  'Cha', 'Mẹ', 'Vợ', 'Chồng', 'Con', 'Anh/Chị', 'Em', 'Ông', 'Bà', 'Cháu', 'Bạn', 'Khác'
];

const RelativeFormScreen = ({ navigation, route }) => {
  // Kiểm tra xem đang thêm mới hay chỉnh sửa
  const isEditing = route.params?.relative !== undefined;
  const initialRelative = route.params?.relative || {
    name: '',
    birthDate: new Date(1990, 0, 1),
    phone: '',
    address: '',
    relationship: 'Khác',
    healthInsuranceId: '',
    nationalId: '',
  };

  // Nếu đang edit, chuyển birthDate từ string sang Date object
  if (isEditing && typeof initialRelative.birthDate === 'string') {
    initialRelative.birthDate = new Date(initialRelative.birthDate);
  }

  // State cho thông tin người thân
  const [relative, setRelative] = useState(initialRelative);
  const [loading, setLoading] = useState(false);
  
  // State cho DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // State cho chọn mối quan hệ
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);

  // Hàm xử lý khi thay đổi dữ liệu
  const handleChange = (key, value) => {
    setRelative({
      ...relative,
      [key]: value,
    });
  };

  // Xử lý thay đổi ngày sinh
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('birthDate', selectedDate);
    }
  };

  // Định dạng ngày sinh để hiển thị
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Tính tuổi từ ngày sinh
  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Xử lý khi lưu
  const handleSave = async () => {
    // Kiểm tra tên
    if (!relative.name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ tên người thân');
      return;
    }

    setLoading(true);

    try {
      // Chuẩn bị dữ liệu để gửi
      const relativeData = {
        ...relative,
        age: calculateAge(relative.birthDate)
      };

      if (isEditing) {
        // Cập nhật người thân
        await relativesService.update(relative._id, relativeData);
        Alert.alert('Thành công', 'Đã cập nhật thông tin người thân', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        // Thêm mới người thân
        await relativesService.create(relativeData);
        Alert.alert('Thành công', 'Đã thêm người thân mới', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin người thân. Vui lòng thử lại.');
      console.error('Error saving relative:', error);
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
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ mới'}
        </Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.formContainer}>
          {/* Họ tên */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ và tên <Text style={styles.requiredStar}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                value={relative.name}
                onChangeText={(text) => handleChange('name', text)}
                editable={!loading}
              />
            </View>
          </View>
          
          {/* Ngày sinh */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ngày sinh</Text>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
            >
              <Ionicons name="calendar-outline" size={20} color="#888" style={styles.inputIcon} />
              <Text style={[styles.input, styles.dateText]}>
                {formatDate(relative.birthDate)} ({calculateAge(relative.birthDate)} tuổi)
              </Text>
              <Ionicons name="chevron-down" size={16} color="#888" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={relative.birthDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
          
          {/* Số điện thoại */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                value={relative.phone}
                onChangeText={(text) => handleChange('phone', text)}
                editable={!loading}
              />
            </View>
          </View>
          
          {/* Địa chỉ */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa chỉ</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập địa chỉ"
                value={relative.address}
                onChangeText={(text) => handleChange('address', text)}
                editable={!loading}
              />
            </View>
          </View>
          
          {/* Mối quan hệ */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mối quan hệ</Text>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowRelationshipPicker(!showRelationshipPicker)}
              disabled={loading}
            >
              <Ionicons name="people-outline" size={20} color="#888" style={styles.inputIcon} />
              <Text style={[styles.input, styles.dateText]}>
                {relative.relationship}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#888" />
            </TouchableOpacity>
          </View>
          
          {/* Danh sách mối quan hệ */}
          {showRelationshipPicker && (
            <View style={styles.relationshipList}>
              {relationships.map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[
                    styles.relationshipItem,
                    relative.relationship === item && styles.selectedRelationship
                  ]}
                  onPress={() => {
                    handleChange('relationship', item);
                    setShowRelationshipPicker(false);
                  }}
                  disabled={loading}
                >
                  <Text style={[
                    styles.relationshipItemText,
                    relative.relationship === item && styles.selectedRelationshipText
                  ]}>
                    {item}
                  </Text>
                  {relative.relationship === item && (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Mã thẻ BHYT */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mã thẻ bảo hiểm y tế</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="medical-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mã thẻ BHYT"
                value={relative.healthInsuranceId}
                onChangeText={(text) => handleChange('healthInsuranceId', text)}
                editable={!loading}
              />
            </View>
          </View>
          
          {/* CMND/CCCD */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CMND/CCCD</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="card-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập CMND/CCCD"
                keyboardType="number-pad"
                value={relative.nationalId}
                onChangeText={(text) => handleChange('nationalId', text)}
                editable={!loading}
              />
            </View>
          </View>
          
          {/* Nút lưu */}
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" style={styles.saveButtonIcon} />
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Cập nhật thông tin' : 'Thêm hồ sơ mới'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  formContainer: {
    flex: 1,
    padding: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  requiredStar: {
    color: 'red',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  dateText: {
    paddingVertical: 12,
  },
  relationshipList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    marginTop: -10,
  },
  relationshipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedRelationship: {
    backgroundColor: '#4285F4',
  },
  relationshipItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedRelationshipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonIcon: {
    marginRight: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
});

export default RelativeFormScreen;