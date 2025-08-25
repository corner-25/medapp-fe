// src/screens/PrivacyPolicyScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyPolicyScreen = ({ navigation }) => {
  // Xử lý khi nhấn vào email hoặc số điện thoại
  const handleContactPress = (type, value) => {
    if (type === 'email') {
      Linking.openURL(`mailto:${value}`);
    } else if (type === 'phone') {
      Linking.openURL(`tel:${value}`);
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
        <Text style={styles.headerTitle}>Chính sách quyền riêng tư</Text>
      </View>
      
      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ngày cập nhật */}
        <View style={styles.updateInfo}>
          <Icon name="calendar-outline" size={16} color="#666" />
          <Text style={styles.updateText}>Cập nhật lần cuối: 15/12/2024</Text>
        </View>

        {/* Giới thiệu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Giới thiệu</Text>
          <Text style={styles.paragraph}>
            Healthcare App cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. 
            Chính sách này mô tả cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ 
            thông tin của bạn khi sử dụng ứng dụng đặt khám bệnh và cấp cứu.
          </Text>
        </View>

        {/* Thông tin thu thập */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Thông tin chúng tôi thu thập</Text>
          
          <Text style={styles.subTitle}>2.1. Thông tin cá nhân</Text>
          <Text style={styles.paragraph}>
            • Họ tên, ngày sinh, giới tính{'\n'}
            • Số điện thoại, địa chỉ email{'\n'}
            • Địa chỉ nhà, nơi làm việc{'\n'}
            • Số CMND/CCCD, số thẻ BHYT{'\n'}
            • Thông tin người thân và người liên hệ khẩn cấp
          </Text>

          <Text style={styles.subTitle}>2.2. Thông tin y tế</Text>
          <Text style={styles.paragraph}>
            • Lịch sử bệnh án và tiền sử bệnh{'\n'}
            • Kết quả xét nghiệm và chẩn đoán{'\n'}
            • Thông tin về dị ứng và thuốc đang dùng{'\n'}
            • Lịch tiêm chủng và vaccine{'\n'}
            • Triệu chứng và lý do khám bệnh
          </Text>

          <Text style={styles.subTitle}>2.3. Thông tin kỹ thuật</Text>
          <Text style={styles.paragraph}>
            • Dữ liệu vị trí (chỉ khi bạn cho phép){'\n'}
            • Thông tin thiết bị và phiên bản ứng dụng{'\n'}
            • Địa chỉ IP và nhật ký sử dụng{'\n'}
            • Dữ liệu cookie và token xác thực
          </Text>
        </View>

        {/* Mục đích sử dụng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Mục đích sử dụng thông tin</Text>
          <Text style={styles.paragraph}>
            • Cung cấp dịch vụ đặt khám bệnh và cấp cứu{'\n'}
            • Quản lý hồ sơ bệnh án điện tử{'\n'}
            • Liên hệ và hỗ trợ khách hàng{'\n'}
            • Gửi thông báo về lịch hẹn và kết quả khám{'\n'}
            • Cải thiện chất lượng dịch vụ{'\n'}
            • Tuân thủ các quy định pháp luật về y tế{'\n'}
            • Phân tích và thống kê (dữ liệu đã ẩn danh)
          </Text>
        </View>

        {/* Chia sẻ thông tin */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Chia sẻ thông tin</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.highlight}>Chúng tôi KHÔNG bán thông tin cá nhân của bạn.</Text>
            {'\n\n'}Thông tin chỉ được chia sẻ với:
          </Text>
          <Text style={styles.paragraph}>
            • Bác sĩ và nhân viên y tế để cung cấp dịch vụ{'\n'}
            • Bệnh viện và cơ sở y tế hợp tác{'\n'}
            • Công ty bảo hiểm (chỉ khi được sự đồng ý){'\n'}
            • Cơ quan pháp luật (khi có yêu cầu hợp pháp){'\n'}
            • Đối tác kỹ thuật để vận hành hệ thống
          </Text>
        </View>

        {/* Bảo mật */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Bảo mật thông tin</Text>
          <Text style={styles.paragraph}>
            • Mã hóa dữ liệu bằng tiêu chuẩn SSL/TLS{'\n'}
            • Lưu trữ trên server có chứng chỉ bảo mật{'\n'}
            • Kiểm soát truy cập nghiêm ngặt{'\n'}
            • Sao lưu dữ liệu định kỳ{'\n'}
            • Giám sát bảo mật 24/7{'\n'}
            • Tuân thủ tiêu chuẩn ISO 27001
          </Text>
        </View>

        {/* Quyền của người dùng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Quyền của bạn</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.highlight}>Quyền truy cập:</Text> Xem thông tin cá nhân được lưu trữ{'\n'}
            • <Text style={styles.highlight}>Quyền chỉnh sửa:</Text> Cập nhật thông tin không chính xác{'\n'}
            • <Text style={styles.highlight}>Quyền xóa:</Text> Yêu cầu xóa tài khoản và dữ liệu{'\n'}
            • <Text style={styles.highlight}>Quyền hạn chế:</Text> Giới hạn việc xử lý dữ liệu{'\n'}
            • <Text style={styles.highlight}>Quyền di chuyển:</Text> Xuất dữ liệu sang định dạng khác{'\n'}
            • <Text style={styles.highlight}>Quyền phản đối:</Text> Từ chối một số hoạt động xử lý
          </Text>
        </View>

        {/* Lưu trữ dữ liệu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Thời gian lưu trữ</Text>
          <Text style={styles.paragraph}>
            • Thông tin cá nhân: Lưu trữ trong suốt thời gian sử dụng dịch vụ{'\n'}
            • Hồ sơ y tế: Lưu trữ tối thiểu 15 năm (theo quy định pháp luật){'\n'}
            • Dữ liệu kỹ thuật: Lưu trữ tối đa 2 năm{'\n'}
            • Dữ liệu đã ẩn danh: Có thể lưu trữ vô thời hạn cho mục đích nghiên cứu
          </Text>
        </View>

        {/* Quyền trẻ em */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Quyền riêng tư trẻ em</Text>
          <Text style={styles.paragraph}>
            Ứng dụng không thu thập thông tin của trẻ dưới 13 tuổi mà không có 
            sự đồng ý của cha mẹ hoặc người giám hộ. Nếu bạn phát hiện chúng tôi 
            đã thu thập thông tin của trẻ em một cách không hợp lệ, vui lòng liên hệ 
            để chúng tôi xóa thông tin đó.
          </Text>
        </View>

        {/* Thay đổi chính sách */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Thay đổi chính sách</Text>
          <Text style={styles.paragraph}>
            Chúng tôi có thể cập nhật chính sách này để phản ánh các thay đổi 
            về thực tiễn hoặc pháp luật. Bạn sẽ được thông báo về những thay đổi 
            quan trọng qua email hoặc thông báo trong ứng dụng.
          </Text>
        </View>

        {/* Liên hệ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Liên hệ</Text>
          <Text style={styles.paragraph}>
            Nếu bạn có câu hỏi về chính sách này hoặc muốn thực hiện quyền của mình:
          </Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Icon name="mail-outline" size={16} color="#4285F4" />
              <TouchableOpacity onPress={() => handleContactPress('email', 'privacy@healthcare.vn')}>
                <Text style={styles.contactText}>privacy@healthcare.vn</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.contactItem}>
              <Icon name="call-outline" size={16} color="#4285F4" />
              <TouchableOpacity onPress={() => handleContactPress('phone', '1900-1234')}>
                <Text style={styles.contactText}>1900-1234</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.contactItem}>
              <Icon name="location-outline" size={16} color="#4285F4" />
              <Text style={styles.contactAddress}>
                123 Đường Nguyễn Huệ, Quận 1, TP.HCM
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Healthcare App. Tất cả quyền được bảo lưu.
          </Text>
          <Text style={styles.footerSubText}>
            Phiên bản chính sách: 2.1
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  updateText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 8,
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#4285F4',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    textAlign: 'justify',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#4285F4',
  },
  contactInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#4285F4',
    marginLeft: 10,
    textDecorationLine: 'underline',
  },
  contactAddress: {
    fontSize: 15,
    color: '#555',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  footerSubText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  spacer: {
    height: 30,
  },
});

export default PrivacyPolicyScreen;