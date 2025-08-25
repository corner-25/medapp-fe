import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const PremiumScreen = ({ navigation }) => {
  // State để theo dõi gói đăng ký đã chọn
  const [selectedPlan, setSelectedPlan] = useState('yearly'); // 'monthly' hoặc 'yearly'
  
  // Xử lý khi chọn gói đăng ký
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };
  
  // Xử lý khi nhấn nút đăng ký
  const handleSubscribe = () => {
    Alert.alert(
      'Xác nhận đăng ký',
      `Bạn đã chọn gói ${selectedPlan === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}. Bạn có chắc chắn muốn tiếp tục?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng ký',
          onPress: () => {
            Alert.alert(
              'Đăng ký thành công',
              'Cảm ơn bạn đã đăng ký gói Premium! Bạn đã được nâng cấp lên tài khoản Premium.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Danh sách các lợi ích của gói Premium
  const premiumBenefits = [
    {
      id: '1',
      title: 'Đặt lịch không giới hạn',
      description: 'Đặt lịch khám không giới hạn cho bạn và người thân trong gia đình',
      icon: 'calendar',
    },
    {
      id: '2',
      title: 'Ưu tiên đặt lịch',
      description: 'Được ưu tiên chọn các khung giờ đẹp và bác sĩ yêu cầu',
      icon: 'time',
    },
    {
      id: '3',
      title: 'Giảm giá dịch vụ',
      description: 'Giảm 10% cho tất cả các dịch vụ khám và xét nghiệm',
      icon: 'cash',
    },
    {
      id: '4',
      title: 'Hồ sơ không giới hạn',
      description: 'Thêm và quản lý không giới hạn hồ sơ người thân',
      icon: 'people',
    },
    {
      id: '5',
      title: 'Tư vấn ưu tiên',
      description: 'Được ưu tiên tư vấn qua điện thoại 24/7 với đội ngũ y tá',
      icon: 'call',
    },
    {
      id: '6',
      title: 'Báo cáo chi tiết',
      description: 'Nhận báo cáo phân tích sức khỏe chi tiết hàng tháng',
      icon: 'document-text',
    },
    {
      id: '7',
      title: 'Đón tiễn sân bay',
      description: 'Dịch vụ đưa đón miễn phí từ sân bay đến bệnh viện (áp dụng cho Việt kiều)',
      icon: 'car',
    },
    {
      id: '8',
      title: 'Trợ lý sức khỏe AI',
      description: 'Truy cập vào trợ lý AI phân tích các chỉ số sức khỏe và đưa ra lời khuyên',
      icon: 'pulse',
    },
  ];

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
        <Text style={styles.headerTitle}>Nâng cấp Premium</Text>
      </View>
      
      {/* Main content - scrollable */}
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollContent}>
          {/* Banner Section */}
          <View style={styles.bannerContainer}>
            <Image
              source={require('../../assets/premium-banner.png')} // Sử dụng hình ảnh đề xuất
              style={styles.bannerImage}
              resizeMode="contain"
            />
            <Text style={styles.bannerText}>
              Không còn giới hạn các tính năng! Chăm sóc sức khoẻ gia đình bạn một cách tốt nhất!
            </Text>
          </View>
          
          {/* Plan Selection */}
          <View style={styles.planContainer}>
            <TouchableOpacity 
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && styles.selectedPlanCard
              ]}
              onPress={() => handleSelectPlan('monthly')}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Hàng tháng</Text>
                {selectedPlan === 'monthly' && (
                  <Icon name="checkmark-circle" size={24} color="#4285F4" />
                )}
              </View>
              <Text style={styles.planPrice}>50.000đ/tháng</Text>
              <Text style={styles.planDescription}>Thanh toán hàng tháng</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.planCard,
                selectedPlan === 'yearly' && styles.selectedPlanCard
              ]}
              onPress={() => handleSelectPlan('yearly')}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Hàng năm</Text>
                {selectedPlan === 'yearly' && (
                  <Icon name="checkmark-circle" size={24} color="#4285F4" />
                )}
              </View>
              <View style={styles.bestDealBadge}>
                <Text style={styles.bestDealText}>Tiết kiệm 20%</Text>
              </View>
              <Text style={styles.planPrice}>40.000đ/tháng</Text>
              <Text style={styles.yearlyTotal}>480.000đ/năm</Text>
              <Text style={styles.planDescription}>Thanh toán hàng năm</Text>
            </TouchableOpacity>
          </View>
          
          {/* Benefits Section */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Quyền lợi thành viên Premium</Text>
            
            {premiumBenefits.map((benefit) => (
              <View key={benefit.id} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Icon name={benefit.icon} size={24} color="#4285F4" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}
            
            {/* Padding to ensure content doesn't hide behind the button */}
            <View style={styles.bottomPadding} />
          </View>
        </ScrollView>
        
        {/* Fixed bottom section with subscribe button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={handleSubscribe}
          >
            <Text style={styles.subscribeButtonText}>
              Đăng ký ngay
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.termsText}>
            Bằng cách đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của chúng tôi.
          </Text>
        </View>
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
  mainContainer: {
    flex: 1,
    position: 'relative', // For absolute positioning of bottom container
  },
  scrollContent: {
    flex: 1,
  },
  bannerContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E3F2FD',
  },
  bannerImage: {
    width: width * 0.7,
    height: 150,
    marginBottom: 15,
  },
  bannerText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    color: '#1A237E',
    lineHeight: 26,
  },
  planContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  planCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlanCard: {
    borderColor: '#4285F4',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bestDealBadge: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bestDealText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 5,
  },
  yearlyTotal: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 14,
    color: '#888',
  },
  benefitsContainer: {
    padding: 15,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100, // Extra padding at the bottom to ensure content isn't hidden
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  subscribeButton: {
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PremiumScreen;