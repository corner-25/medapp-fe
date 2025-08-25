// src/screens/HospitalDetailScreen.js - Đã sửa lỗi undefined services
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHospitalById } from '../data/hospitals';

const HospitalDetailScreen = ({ navigation, route }) => {
  const { hospitalId } = route.params;
  const hospital = getHospitalById(hospitalId);

  if (!hospital) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết bệnh viện</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin bệnh viện</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Kiểm tra và xử lý các giá trị có thể undefined
  const safeHospital = {
    ...hospital,
    name: hospital.name || 'Tên bệnh viện không có',
    type: hospital.type || 'Bệnh viện',
    rating: hospital.rating || 0,
    totalReviews: hospital.totalReviews || 0,
    description: hospital.description || 'Chưa có mô tả',
    address: hospital.address || 'Chưa có địa chỉ',
    workingHours: hospital.workingHours || '8:00 - 17:00',
    phone: hospital.phone || 'Chưa có số điện thoại',
    email: hospital.email || 'Chưa có email',
    website: hospital.website || 'https://example.com',
    services: hospital.services || [], // Giá trị mặc định là mảng rỗng
    image: hospital.image || require('../../assets/icon.png'), // Ảnh mặc định
  };

  const handleCall = () => {
    if (safeHospital.phone !== 'Chưa có số điện thoại') {
      Linking.openURL(`tel:${safeHospital.phone}`);
    } else {
      Alert.alert('Thông báo', 'Số điện thoại không khả dụng');
    }
  };

  const handleEmail = () => {
    if (safeHospital.email !== 'Chưa có email') {
      Linking.openURL(`mailto:${safeHospital.email}`);
    } else {
      Alert.alert('Thông báo', 'Email không khả dụng');
    }
  };

  const handleWebsite = () => {
    if (safeHospital.website !== 'https://example.com') {
      Linking.openURL(safeHospital.website);
    } else {
      Alert.alert('Thông báo', 'Trang web không khả dụng');
    }
  };

  const handleBookAppointment = () => {
    // Điều hướng đến màn hình đặt khám với thông tin bệnh viện
    navigation.navigate('MedicalExam', { 
      hospital: safeHospital,
      preSelectedHospital: true
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
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết bệnh viện</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Hospital Image */}
        <View style={styles.imageContainer}>
          <Image
            source={safeHospital.image}
            style={styles.hospitalImage}
            resizeMode="cover"
          />
          <View style={styles.hospitalTypeTag}>
            <Text style={styles.hospitalTypeText}>{safeHospital.type}</Text>
          </View>
        </View>

        {/* Hospital Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.hospitalName}>{safeHospital.name}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              {[...Array(5)].map((_, index) => (
                <Icon 
                  key={index}
                  name={index < Math.floor(safeHospital.rating) ? "star" : "star-outline"} 
                  size={16} 
                  color="#FFD700" 
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {safeHospital.rating} ({safeHospital.totalReviews} đánh giá)
            </Text>
          </View>

          <Text style={styles.hospitalDescription}>{safeHospital.description}</Text>

          {/* Address */}
          <View style={styles.detailRow}>
            <Icon name="location-outline" size={20} color="#4285F4" />
            <Text style={styles.detailText}>{safeHospital.address}</Text>
          </View>

          {/* Working Hours */}
          <View style={styles.detailRow}>
            <Icon name="time-outline" size={20} color="#4285F4" />
            <Text style={styles.detailText}>Giờ làm việc: {safeHospital.workingHours}</Text>
          </View>

          {/* Phone */}
          <TouchableOpacity style={styles.detailRow} onPress={handleCall}>
            <Icon name="call-outline" size={20} color="#4285F4" />
            <Text style={[styles.detailText, styles.linkText]}>{safeHospital.phone}</Text>
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity style={styles.detailRow} onPress={handleEmail}>
            <Icon name="mail-outline" size={20} color="#4285F4" />
            <Text style={[styles.detailText, styles.linkText]}>{safeHospital.email}</Text>
          </TouchableOpacity>

          {/* Website */}
          <TouchableOpacity style={styles.detailRow} onPress={handleWebsite}>
            <Icon name="globe-outline" size={20} color="#4285F4" />
            <Text style={[styles.detailText, styles.linkText]}>Trang web</Text>
          </TouchableOpacity>
        </View>

        {/* Services */}
        <View style={styles.servicesContainer}>
          <Text style={styles.servicesTitle}>Dịch vụ</Text>
          {safeHospital.services.length > 0 ? (
            <View style={styles.servicesList}>
              {safeHospital.services.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noServicesContainer}>
              <Icon name="information-circle-outline" size={20} color="#999" />
              <Text style={styles.noServicesText}>Chưa có thông tin dịch vụ</Text>
            </View>
          )}
        </View>

        {/* Spacer for button */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Book Appointment Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBookAppointment}
        >
          <Icon name="calendar" size={20} color="#fff" style={styles.bookButtonIcon} />
          <Text style={styles.bookButtonText}>Đặt lịch khám</Text>
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
    color: '#666',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  hospitalImage: {
    width: '100%',
    height: '100%',
  },
  hospitalTypeTag: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(66, 133, 244, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  hospitalTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  hospitalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  hospitalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  linkText: {
    color: '#4285F4',
  },
  servicesContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  noServicesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noServicesText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  spacer: {
    height: 80,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonIcon: {
    marginRight: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HospitalDetailScreen;