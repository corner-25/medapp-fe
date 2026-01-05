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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentMethodsScreen = ({ navigation }) => {
  // Dữ liệu mẫu về phương thức thanh toán
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'visa',
      name: 'VISA',
      cardNumber: '**** **** **** 4242',
      expiryDate: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'mastercard',
      name: 'MasterCard',
      cardNumber: '**** **** **** 5678',
      expiryDate: '09/26',
      isDefault: false,
    },
  ]);

  // State cho modal thêm thẻ
  const [addCardModalVisible, setAddCardModalVisible] = useState(false);

  // Các loại thẻ có thể thêm
  const availableCardTypes = [
    { id: 'visa', name: 'VISA', icon: 'card' },
    { id: 'mastercard', name: 'MasterCard', icon: 'card-outline' },
    { id: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
    { id: 'stripe', name: 'Stripe', icon: 'card' },
    { id: 'applepay', name: 'Apple Pay', icon: 'logo-apple' },
    { id: 'googlepay', name: 'Google Pay', icon: 'logo-google' },
  ];

  // Xử lý khi chọn loại thẻ để thêm
  const handleAddCardType = (cardType) => {
    setAddCardModalVisible(false);
    // Điều hướng đến màn hình thêm thẻ chi tiết
    Alert.alert(
      'Thêm thẻ',
      `Bạn đã chọn thêm phương thức thanh toán ${cardType.name}.\nChức năng này sẽ được phát triển sau.`
    );
  };

  // Xử lý khi nhấn vào thẻ
  const handleCardPress = (card) => {
    // Hiển thị thông tin chi tiết hoặc tùy chọn
    Alert.alert(
      'Tùy chọn',
      'Bạn muốn thực hiện thao tác gì với thẻ này?',
      [
        {
          text: 'Đặt làm mặc định',
          onPress: () => {
            const updatedCards = paymentMethods.map(method => ({
              ...method,
              isDefault: method.id === card.id
            }));
            setPaymentMethods(updatedCards);
          }
        },
        {
          text: 'Xóa thẻ',
          onPress: () => {
            const updatedCards = paymentMethods.filter(method => method.id !== card.id);
            setPaymentMethods(updatedCards);
          },
          style: 'destructive'
        },
        {
          text: 'Hủy',
          style: 'cancel'
        }
      ]
    );
  };

  // Lấy icon tương ứng với loại thẻ
  const getCardIcon = (type) => {
    switch(type) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card-outline';
      case 'paypal':
        return 'logo-paypal';
      default:
        return 'card';
    }
  };

  // Lấy màu tương ứng với loại thẻ
  const getCardColor = (type) => {
    switch(type) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'paypal':
        return '#003087';
      default:
        return '#333';
    }
  };

  // Render từng thẻ thanh toán
  const renderCardItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.cardItem}
      onPress={() => handleCardPress(item)}
    >
      <View style={[styles.cardIconContainer, { backgroundColor: getCardColor(item.type) }]}>
        <Ionicons name={getCardIcon(item.type)} size={24} color="#fff" />
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardNumber}>{item.cardNumber}</Text>
        <Text style={styles.cardExpiry}>Hết hạn: {item.expiryDate}</Text>
      </View>
      
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>Mặc định</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render khi không có phương thức thanh toán
  const renderEmptyPaymentMethods = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="card-outline" size={80} color="#ddd" />
      <Text style={styles.emptyText}>Bạn chưa có phương thức thanh toán nào</Text>
      <Text style={styles.emptySubtext}>Thêm phương thức thanh toán để thanh toán nhanh chóng</Text>
    </View>
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
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
      </View>
      
      {/* Danh sách phương thức thanh toán */}
      <FlatList
        data={paymentMethods}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cardsList}
        ListEmptyComponent={renderEmptyPaymentMethods}
      />
      
      {/* Nút thêm phương thức */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setAddCardModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Thêm phương thức thanh toán</Text>
      </TouchableOpacity>

      {/* Modal chọn loại thẻ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addCardModalVisible}
        onRequestClose={() => setAddCardModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn loại thẻ</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAddCardModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableCardTypes}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.cardTypeItem}
                  onPress={() => handleAddCardType(item)}
                >
                  <Ionicons name={item.icon} size={24} color={getCardColor(item.id)} />
                  <Text style={styles.cardTypeName}>{item.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
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
  cardsList: {
    padding: 15,
    flexGrow: 1,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
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
    paddingTop: 10,
    maxHeight: '70%',
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
  cardTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTypeName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  }
});

export default PaymentMethodsScreen;