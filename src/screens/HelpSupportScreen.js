// src/screens/HelpSupportScreen.js - Bệnh viện Vạn An
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const HelpSupportScreen = ({ navigation }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Thông tin thực của Bệnh viện Vạn An (được cập nhật từ website chính thức)
  const hospitalInfo = {
    name: 'Bệnh viện Đa khoa Vạn An',
    hotline: '0272 2220 115',
    address: '352 Tuyến Tránh Quốc Lộ 1, Ấp 4, Xã Hướng Thọ Phú, TP Tân An, Tỉnh Long An',
    email: 'benhvienvanan@gmail.com',
    website: 'https://benhvienvanan.com',
    workingHours: '24/7 - Tất cả các ngày bao gồm ngày lễ',
    emergencyHotline: '0272 2220 115',
    experience: '17 năm kinh nghiệm',
    doctors: '102 bác sĩ',
    patients: '100.000 bệnh nhân/năm',
    facilities: '3 cơ sở y tế'
  };

  // FAQ dựa trên dịch vụ thực của bệnh viện
  const faqData = [
    {
      id: 1,
      question: 'Làm thế nào để đặt lịch khám qua ứng dụng?',
      answer: 'Bạn có thể đặt lịch khám qua ứng dụng bằng cách:\n• Chọn mục "Đặt lịch khám"\n• Chọn gói khám phù hợp\n• Điền thông tin người khám\n• Chọn ngày và giờ mong muốn\n• Xác nhận và thanh toán\n\nSau khi đặt lịch thành công, bạn sẽ nhận được tin nhắn xác nhận.'
    },
    {
      id: 2,
      question: 'Các gói khám sức khỏe có những gì?',
      answer: 'Bệnh viện Vạn An cung cấp các gói khám sức khỏe:\n\n• Gói khám chuẩn: Xét nghiệm máu cơ bản, siêu âm, X-quang\n\n• Gói khám cao cấp: Khám toàn diện hơn với nội soi\n\n• Gói khám cao cấp dành cho nữ: Chuyên biệt cho sức khỏe phụ nữ\n\nCác gói khám bao gồm khám với bác sĩ chuyên khoa, xét nghiệm, chẩn đoán hình ảnh và tư vấn kết quả chi tiết.\n\nVui lòng liên hệ 0272 2220 115 để biết thêm chi tiết và giá cả.'
    },
    {
      id: 3,
      question: 'Thời gian khám bệnh của bệnh viện?',
      answer: 'Bệnh viện Vạn An hoạt động:\n• Cấp cứu: 24/7 tất cả các ngày\n• Khám bệnh: 24/7 kể cả ngày lễ, tết\n• Xét nghiệm và chẩn đoán hình ảnh: Theo lịch làm việc\n\nĐặc biệt: Bệnh viện luôn sẵn sàng tiếp nhận bệnh nhân cấp cứu 24 giờ.\n\nLiên hệ 0272 2220 115 để biết thêm chi tiết về lịch làm việc cụ thể.'
    },
    {
      id: 4,
      question: 'Bệnh viện có chấp nhận bảo hiểm y tế không?',
      answer: 'Có, Bệnh viện Vạn An chấp nhận:\n• Bảo hiểm y tế xã hội (BHYT)\n• Bảo hiểm y tế tư nhân\n• Thanh toán trực tiếp\n\nVui lòng mang theo thẻ BHYT khi đến khám để được hỗ trợ tối đa chi phí khám chữa bệnh.'
    },
    {
      id: 5,
      question: 'Làm thế nào để hủy lịch khám?',
      answer: 'Để hủy lịch khám:\n• Vào mục "Lịch khám của tôi"\n• Chọn lịch khám cần hủy\n• Nhấn "Hủy lịch khám"\n• Xác nhận hủy\n\nLưu ý: Hủy lịch trước 2 giờ sẽ được hoàn tiền 100%. Hủy muộn hơn có thể bị tính phí.'
    },
    {
      id: 6,
      question: 'Tôi có thể xem kết quả xét nghiệm online không?',
      answer: 'Có, sau khi có kết quả xét nghiệm, bạn có thể:\n• Xem kết quả qua ứng dụng\n• Tải về file PDF\n• Chia sẻ với bác sĩ khác\n\nKết quả thường có trong vòng 24-48h tùy loại xét nghiệm. Một số xét nghiệm đặc biệt có thể mất 3-7 ngày.'
    }
  ];

  // Danh sách dịch vụ nổi bật thực tế của BV Vạn An
  const services = [
    {
      id: 1,
      name: 'Nội Khoa',
      icon: 'heart',
      color: '#E53935',
      description: 'Tim mạch, hô hấp, tiêu hóa, nội tiết'
    },
    {
      id: 2,
      name: 'Ngoại Khoa',
      icon: 'medical',
      color: '#2196F3',
      description: 'Phẫu thuật nội soi, cơ xương khớp'
    },
    {
      id: 3,
      name: 'Sản Phụ Khoa',
      icon: 'woman',
      color: '#E91E63',
      description: 'Chăm sóc sức khỏe sinh sản'
    },
    {
      id: 4,
      name: 'Nhi Khoa',
      icon: 'happy',
      color: '#4CAF50',
      description: 'Chăm sóc sức khỏe trẻ em'
    },
    {
      id: 5,
      name: 'Cấp Cứu 24/7',
      icon: 'medical-outline',
      color: '#FF5722',
      description: 'Cấp cứu và hồi sức tích cực'
    },
    {
      id: 6,
      name: 'Chẩn Đoán Hình Ảnh',
      icon: 'scan',
      color: '#FF9800',
      description: 'X-quang, siêu âm, nội soi'
    }
  ];

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (url) => {
    Linking.openURL(url);
  };

  const handleDirection = () => {
    const address = hospitalInfo.address;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
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
        <Text style={styles.headerTitle}>Trợ giúp & Hỗ trợ</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Hospital Information */}
        <View style={styles.hospitalSection}>
          <View style={styles.hospitalHeader}>
            <Icon name="medical" size={30} color="#4285F4" />
            <Text style={styles.hospitalName}>{hospitalInfo.name}</Text>
          </View>

          <View style={styles.hospitalDetails}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleCall(hospitalInfo.hotline)}
            >
              <Icon name="call" size={20} color="#4CAF50" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Hotline</Text>
                <Text style={styles.contactValue}>{hospitalInfo.hotline}</Text>
              </View>
              <Icon name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleCall(hospitalInfo.emergencyHotline)}
            >
              <Icon name="medical-outline" size={20} color="#E53935" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Cấp cứu</Text>
                <Text style={styles.contactValue}>{hospitalInfo.emergencyHotline}</Text>
              </View>
              <Icon name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleDirection}
            >
              <Icon name="location" size={20} color="#2196F3" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Địa chỉ</Text>
                <Text style={styles.contactValue}>{hospitalInfo.address}</Text>
              </View>
              <Icon name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleEmail(hospitalInfo.email)}
            >
              <Icon name="mail" size={20} color="#FF9800" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{hospitalInfo.email}</Text>
              </View>
              <Icon name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleWebsite(hospitalInfo.website)}
            >
              <Icon name="globe" size={20} color="#9C27B0" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactValue}>benhvienvanan.com</Text>
              </View>
              <Icon name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>

            <View style={styles.workingHours}>
              <Icon name="time" size={20} color="#666" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Giờ làm việc</Text>
                <Text style={styles.contactValue}>{hospitalInfo.workingHours}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>🏥 Dịch vụ nổi bật</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => navigation.navigate('Trang chủ', { screen: 'ServiceCategories' })}
              >
                <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
                  <Icon name={service.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>❓ Câu hỏi thường gặp</Text>
          {faqData.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(faq.id)}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Icon
                  name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              {expandedFAQ === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>🚨 Trường hợp khẩn cấp</Text>
          <Text style={styles.emergencyText}>
            Nếu gặp tình huống khẩn cấp, vui lòng gọi ngay:
          </Text>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => handleCall('115')}
          >
            <Icon name="call" size={24} color="#fff" />
            <Text style={styles.emergencyButtonText}>Gọi 115 - Cấp cứu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.emergencyButton, styles.hospitalEmergency]}
            onPress={() => handleCall(hospitalInfo.hotline)}
          >
            <Icon name="medical" size={24} color="#fff" />
            <Text style={styles.emergencyButtonText}>Gọi BV Vạn An: {hospitalInfo.hotline}</Text>
          </TouchableOpacity>
        </View>

        {/* Hospital Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Thông tin bệnh viện</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="time" size={24} color="#4285F4" />
              <Text style={styles.statNumber}>{hospitalInfo.experience}</Text>
              <Text style={styles.statLabel}>Kinh nghiệm</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="people" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{hospitalInfo.doctors}</Text>
              <Text style={styles.statLabel}>Bác sĩ</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="heart" size={24} color="#E91E63" />
              <Text style={styles.statNumber}>{hospitalInfo.patients}</Text>
              <Text style={styles.statLabel}>Bệnh nhân</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="business" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>{hospitalInfo.facilities}</Text>
              <Text style={styles.statLabel}>Cơ sở</Text>
            </View>
          </View>
        </View>

        {/* Other Facilities */}
        <View style={styles.facilitiesSection}>
          <Text style={styles.sectionTitle}>🏢 Các cơ sở khác</Text>
          <View style={styles.facilityItem}>
            <Icon name="location" size={20} color="#2196F3" />
            <View style={styles.facilityInfo}>
              <Text style={styles.facilityName}>Phòng khám Vạn An 1</Text>
              <Text style={styles.facilityAddress}>26A Bạch Đằng, Phường Long An</Text>
            </View>
          </View>
          <View style={styles.facilityItem}>
            <Icon name="location" size={20} color="#2196F3" />
            <View style={styles.facilityInfo}>
              <Text style={styles.facilityName}>Phòng khám Vạn An 2</Text>
              <Text style={styles.facilityAddress}>198 KDC Mai Thị Non, Nguyễn Hữu Thọ</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  hospitalSection: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  hospitalDetails: {
    gap: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  workingHours: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 10,
    paddingTop: 15,
  },
  servicesSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  faqSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
    paddingBottom: 10,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    paddingTop: 10,
    paddingLeft: 10,
  },
  faqAnswerText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  emergencySection: {
    backgroundColor: '#fff3e0',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 10,
  },
  emergencyText: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 15,
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  hospitalEmergency: {
    backgroundColor: '#4285F4',
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bottomSpacer: {
    height: 30,
  },
  statsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
    textAlign: 'center',
  },
  facilitiesSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  facilityInfo: {
    flex: 1,
    marginLeft: 15,
  },
  facilityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  facilityAddress: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default HelpSupportScreen;