import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Image,
  Alert,
  Modal
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentMethodsScreen = ({ navigation }) => {
  // Phương thức thanh toán hiện có (chỉ tiền mặt)
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'cash',
      name: 'Tiền mặt',
      description: 'Thanh toán tại bệnh viện',
      isDefault: true,
      isAvailable: true,
    },
  ]);

  // State cho modal thông tin thanh toán
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  // Các phương thức thanh toán sẽ có trong tương lai
  const upcomingPaymentMethods = [
    {
      id: 'vnpay',
      name: 'VNPAY',
      icon: 'card',
      status: 'Đang ký hợp đồng',
      description: 'Thanh toán qua ví điện tử VNPAY'
    },
    {
      id: 'momo',
      name: 'MoMo',
      icon: 'wallet',
      status: 'Đang ký hợp đồng',
      description: 'Thanh toán qua ví MoMo'
    },
  ];

  // Xử lý khi nhấn vào phương thức thanh toán
  const handlePaymentMethodPress = (method) => {
    if (method.isAvailable) {
      Alert.alert(
        'Phương thức thanh toán',
        `${method.name}\n\n${method.description}\n\nĐây là phương thức thanh toán duy nhất hiện tại.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Tính năng chưa khả dụng',
        `${method.name} - ${method.status}\n\n${method.description}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Xử lý hiển thị thông tin thanh toán
  const handleShowPaymentInfo = () => {
    setInfoModalVisible(true);
  };

  // Lấy icon tương ứng với loại thanh toán
  const getPaymentIcon = (type) => {
    switch(type) {
      case 'cash':
        return 'cash';
      case 'vnpay':
        return 'card';
      case 'momo':
        return 'wallet';
      default:
        return 'card';
    }
  };

  // Lấy màu tương ứng với loại thanh toán
  const getPaymentColor = (type, isAvailable = true) => {
    if (!isAvailable) return '#ccc';

    switch(type) {
      case 'cash':
        return '#4CAF50';
      case 'vnpay':
        return '#1976D2';
      case 'momo':
        return '#E91E63';
      default:
        return '#333';
    }
  };

  // Render phương thức thanh toán khả dụng
  const renderPaymentItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.paymentItem, !item.isAvailable && styles.disabledItem]}
      onPress={() => handlePaymentMethodPress(item)}
    >
      <View style={[styles.paymentIconContainer, { backgroundColor: getPaymentColor(item.type, item.isAvailable) }]}>
        <Icon name={getPaymentIcon(item.type)} size={24} color="#fff" />
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.paymentName}>{item.name}</Text>
        <Text style={styles.paymentDescription}>{item.description}</Text>
        {item.status && (
          <Text style={styles.paymentStatus}>{item.status}</Text>
        )}
      </View>

      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>Đang sử dụng</Text>
        </View>
      )}

      {item.isAvailable && (
        <View style={styles.availableBadge}>
          <Text style={styles.availableBadgeText}>Khả dụng</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render phương thức thanh toán sắp có
  const renderUpcomingItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.paymentItem, styles.upcomingItem]}
      onPress={() => handlePaymentMethodPress(item)}
    >
      <View style={[styles.paymentIconContainer, { backgroundColor: getPaymentColor(item.id, false) }]}>
        <Icon name={getPaymentIcon(item.id)} size={24} color="#fff" />
      </View>

      <View style={styles.paymentInfo}>
        <Text style={[styles.paymentName, styles.upcomingText]}>{item.name}</Text>
        <Text style={styles.paymentDescription}>{item.description}</Text>
        <Text style={styles.paymentStatus}>{item.status}</Text>
      </View>

      <View style={styles.comingSoonBadge}>
        <Text style={styles.comingSoonText}>Sắp có</Text>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
      </View>

      {/* Thông tin quan trọng */}
      <View style={styles.infoContainer}>
        <Icon name="information-circle" size={20} color="#4285F4" />
        <Text style={styles.infoText}>
          Hiện tại chỉ hỗ trợ thanh toán bằng tiền mặt tại bệnh viện
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Phương thức thanh toán hiện có */}
        <Text style={styles.sectionTitle}>Phương thức hiện có</Text>
        <FlatList
          data={paymentMethods}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />

        {/* Phương thức thanh toán sắp có */}
        <Text style={styles.sectionTitle}>Sắp ra mắt</Text>
        <FlatList
          data={upcomingPaymentMethods}
          renderItem={renderUpcomingItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Nút thông tin */}
      <TouchableOpacity
        style={styles.infoButton}
        onPress={handleShowPaymentInfo}
      >
        <Icon name="help-circle-outline" size={20} color="#4285F4" />
        <Text style={styles.infoButtonText}>Thông tin thanh toán</Text>
      </TouchableOpacity>

      {/* Modal thông tin thanh toán */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông tin thanh toán</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setInfoModalVisible(false)}
              >
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.infoSection}>
                <Icon name="cash" size={24} color="#4CAF50" style={styles.infoIcon} />
                <Text style={styles.infoSectionTitle}>Thanh toán tiền mặt</Text>
                <Text style={styles.infoSectionText}>
                  • Thanh toán trực tiếp tại quầy lễ tân{'\n'}
                  • Nhận hóa đơn ngay lập tức{'\n'}
                  • Không phí giao dịch{'\n'}
                  • Hỗ trợ 24/7
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Icon name="time" size={24} color="#FF9800" style={styles.infoIcon} />
                <Text style={styles.infoSectionTitle}>Phương thức sắp có</Text>
                <Text style={styles.infoSectionText}>
                  • VNPAY: Đang ký hợp đồng với ngân hàng{'\n'}
                  • MoMo: Đang hoàn thiện thủ tục pháp lý{'\n'}
                  • Dự kiến ra mắt: Q2/2025
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Icon name="help-circle" size={24} color="#4285F4" style={styles.infoIcon} />
                <Text style={styles.infoSectionTitle}>Hỗ trợ</Text>
                <Text style={styles.infoSectionText}>
                  Nếu bạn có thắc mắc về thanh toán, vui lòng liên hệ:{'\n'}
                  • Hotline: 028 3838 6688{'\n'}
                  • Email: benhvienvanan@gmail.com
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 10,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  upcomingItem: {
    opacity: 0.7,
  },
  disabledItem: {
    opacity: 0.5,
  },
  paymentIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  upcomingText: {
    color: '#666',
  },
  paymentDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  paymentStatus: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 2,
    fontWeight: '500',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  availableBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  comingSoonBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 20,
  },
  infoButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoSectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default PaymentMethodsScreen;