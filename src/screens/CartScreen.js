// src/screens/CartScreen.js - Fixed version
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { cartService, orderService } from '../services/apiService';

const CartScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const userToken = getToken();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  
  // Available payment methods
  const paymentMethods = [
    { id: 'visa', name: 'VISA ****4242', icon: 'card' },
    { id: 'mastercard', name: 'MasterCard ****1234', icon: 'card-outline' },
    { id: 'momo', name: 'Ví MoMo', icon: 'wallet' },
    { id: 'zalopay', name: 'ZaloPay', icon: 'wallet-outline' },
    { id: 'cash', name: 'Tiền mặt', icon: 'cash' },
  ];
  
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);

  useEffect(() => {
    console.log("CartScreen mounted - UserToken:", userToken);
    
    if (!userToken) {
      setLoading(false);
      console.log("Chưa đăng nhập, không thể tải giỏ hàng");
    } else {
      loadCart();
    }
  }, [userToken]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("CartScreen focused - UserToken:", userToken);
      if (userToken) {
        loadCart();
      }
    });
    return unsubscribe;
  }, [navigation, userToken]);

  const loadCart = async () => {
    console.log("Đang bắt đầu loadCart...");
    if (!userToken) {
      console.log("Không có token, bỏ qua loadCart");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Đang gọi cartService.getCart()...");
      
      if (!cartService || typeof cartService.getCart !== 'function') {
        console.error("Lỗi: cartService hoặc cartService.getCart không tồn tại");
        setLoading(false);
        Alert.alert('Lỗi', 'Không thể kết nối đến dịch vụ giỏ hàng');
        return;
      }
      
      const data = await cartService.getCart();
      console.log("Kết quả từ cartService.getCart():", data);
      setCart(data);
    } catch (error) {
      console.error('Lỗi chi tiết khi tải giỏ hàng:', error);
      
      if (error.message && error.message.includes('Network request failed')) {
        Alert.alert(
          'Lỗi kết nối',
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn hoặc thử lại sau.'
        );
      } else {
        Alert.alert('Lỗi', `Không thể tải giỏ hàng: ${error.message || 'Lỗi không xác định'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    if (!cart || !cart.items || !cart.items.length) return 0;
    return cart.totalPrice || 0;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleIncreaseQuantity = async (service, currentQuantity) => {
    console.log(`Tăng số lượng cho ${service}, từ ${currentQuantity} lên ${currentQuantity + 1}`);
    setUpdating(true);
    try {
      const updatedCart = await cartService.updateCartItem(service, currentQuantity + 1);
      console.log("Kết quả sau khi cập nhật:", updatedCart);
      setCart(updatedCart);
    } catch (error) {
      console.error('Lỗi chi tiết khi cập nhật số lượng:', error);
      Alert.alert('Lỗi', `Không thể cập nhật số lượng: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDecreaseQuantity = async (service, currentQuantity) => {
    console.log(`Giảm số lượng cho ${service}, từ ${currentQuantity} xuống ${currentQuantity - 1}`);
    if (currentQuantity <= 1) {
      handleRemoveItem(service);
      return;
    }
    
    setUpdating(true);
    try {
      const updatedCart = await cartService.updateCartItem(service, currentQuantity - 1);
      console.log("Kết quả sau khi cập nhật:", updatedCart);
      setCart(updatedCart);
    } catch (error) {
      console.error('Lỗi chi tiết khi cập nhật số lượng:', error);
      Alert.alert('Lỗi', `Không thể cập nhật số lượng: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (service) => {
    console.log(`Xóa sản phẩm ${service}`);
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa dịch vụ này khỏi giỏ hàng?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: async () => {
            setUpdating(true);
            try {
              const updatedCart = await cartService.removeFromCart(service);
              console.log("Kết quả sau khi xóa sản phẩm:", updatedCart);
              setCart(updatedCart);
            } catch (error) {
              console.error('Lỗi chi tiết khi xóa sản phẩm:', error);
              Alert.alert('Lỗi', `Không thể xóa sản phẩm: ${error.message || 'Lỗi không xác định'}`);
            } finally {
              setUpdating(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSelectPaymentMethod = (payment) => {
    console.log("Đã chọn phương thức thanh toán:", payment.name);
    setSelectedPayment(payment);
    setPaymentModalVisible(false);
  };

  const handleCheckout = async () => {
    console.log("Bắt đầu quá trình thanh toán");
    
    if (!cart || !cart.items || cart.items.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống!');
      return;
    }
    
    const userToken = getToken();
    console.log("Token khi thanh toán:", userToken);
    
    if (!userToken) {
      console.log("Chưa đăng nhập, chuyển đến màn hình đăng nhập");
      Alert.alert(
        'Cần đăng nhập',
        'Bạn cần đăng nhập để tiếp tục thanh toán.',
        [
          {
            text: 'Đăng nhập',
            onPress: () => navigation.navigate('LoginScreen')
          },
          {
            text: 'Hủy',
            style: 'cancel'
          }
        ]
      );
      return;
    }
    
    Alert.alert(
      'Xác nhận thanh toán',
      `Tổng giá trị: ${formatCurrency(calculateTotal())} VND\nPhương thức: ${selectedPayment.name}`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Thanh toán',
          onPress: async () => {
            console.log("Bắt đầu tạo đơn hàng...");
            setUpdating(true);
            try {
              const orderData = {
                paymentMethod: selectedPayment.id
              };
              
              console.log("Dữ liệu đơn hàng:", orderData);
              console.log("Đang gọi orderService.createOrder()...");
              
              if (!orderService || typeof orderService.createOrder !== 'function') {
                console.error("Lỗi: orderService hoặc orderService.createOrder không tồn tại");
                setUpdating(false);
                Alert.alert('Lỗi', 'Không thể kết nối đến dịch vụ đơn hàng');
                return;
              }
              
              const newOrder = await orderService.createOrder(orderData);
              console.log("Đơn hàng đã được tạo:", newOrder);
              
              Alert.alert('Thành công', 'Đơn hàng của bạn đã được đặt thành công!');
              
              console.log("Đang xóa giỏ hàng...");
              await cartService.clearCart();
              console.log("Đã xóa giỏ hàng");
              
              navigation.navigate('Home');
            } catch (error) {
              console.error('Lỗi chi tiết khi tạo đơn hàng:', error);
              
              if (error.message && error.message.includes('Network request failed')) {
                Alert.alert(
                  'Lỗi kết nối',
                  'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn hoặc thử lại sau.'
                );
              } else {
                Alert.alert('Lỗi', `Không thể tạo đơn hàng: ${error.message || 'Lỗi không xác định'}`);
              }
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getServiceIcon = (service) => {
    switch(service) {
      case 'general-checkup': return 'fitness';
      case 'blood-test': return 'flask';
      case 'x-ray': return 'scan';
      case 'ultrasound': return 'scan-outline';
      case 'ecg': return 'heart';
      case 'ct-scan': return 'body';
      case 'mri': return 'body-outline';
      case 'endoscopy': return 'eye';
      case 'mammogram': return 'scan';
      case 'cancer-screening': return 'search';
      default: return 'medical';
    }
  };

  // Component để render thông tin đặt khám
  const renderAppointmentInfo = (appointmentInfo) => {
    if (!appointmentInfo) return null;
    
    return (
      <View style={styles.appointmentInfoContainer}>
        <View style={styles.appointmentInfoHeader}>
          <Ionicons name="calendar" size={16} color="#4285F4" />
          <Text style={styles.appointmentInfoHeaderText}>Thông tin đặt khám</Text>
        </View>
        
        {appointmentInfo.patient && (
          <>
            <Text style={styles.appointmentInfo}>
              <Text style={styles.appointmentLabel}>Bệnh nhân: </Text>
              {appointmentInfo.patient.name} ({appointmentInfo.patient.age} tuổi)
            </Text>
            <Text style={styles.appointmentInfo}>
              <Text style={styles.appointmentLabel}>Mối quan hệ: </Text>
              {appointmentInfo.patient.relationship}
            </Text>
            {appointmentInfo.patient.phone && (
              <Text style={styles.appointmentInfo}>
                <Text style={styles.appointmentLabel}>SĐT: </Text>
                {appointmentInfo.patient.phone}
              </Text>
            )}
            {appointmentInfo.patient.healthInsuranceId && (
              <Text style={styles.appointmentInfo}>
                <Text style={styles.appointmentLabel}>BHYT: </Text>
                {appointmentInfo.patient.healthInsuranceId}
              </Text>
            )}
          </>
        )}
        
        <Text style={styles.appointmentInfo}>
          <Text style={styles.appointmentLabel}>Ngày khám: </Text>
          {appointmentInfo.date}
        </Text>
        <Text style={styles.appointmentInfo}>
          <Text style={styles.appointmentLabel}>Giờ khám: </Text>
          {appointmentInfo.time}
        </Text>
        
        {appointmentInfo.symptoms && (
          <Text style={styles.appointmentInfo}>
            <Text style={styles.appointmentLabel}>Triệu chứng: </Text>
            {appointmentInfo.symptoms}
          </Text>
        )}
        
        {appointmentInfo.additionalServices && appointmentInfo.additionalServices.length > 0 && (
          <View style={styles.additionalServicesContainer}>
            <Text style={styles.appointmentLabel}>Dịch vụ bổ sung:</Text>
            {appointmentInfo.additionalServices.map((service, index) => (
              <Text key={index} style={styles.additionalServiceItem}>
                • {service.name}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemRow}>
        <View style={styles.itemIconContainer}>
          <Ionicons name={getServiceIcon(item.service)} size={24} color="#4285F4" />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          
          {/* Hiển thị thông tin đặt khám nếu có */}
          {renderAppointmentInfo(item.appointmentInfo)}
          
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleDecreaseQuantity(item.service, item.quantity)}
              disabled={updating}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, styles.increaseButton]}
              onPress={() => handleIncreaseQuantity(item.service, item.quantity)}
              disabled={updating}
            >
              <Text style={[styles.quantityButtonText, styles.increaseButtonText]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.itemPriceContainer}>
          <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.service)}
            disabled={updating}
          >
            <Ionicons name="trash-outline" size={20} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
      </View>

      {!cart || !cart.items || cart.items.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={80} color="#ddd" />
          <Text style={styles.emptyCartText}>Giỏ hàng trống</Text>
          <TouchableOpacity 
            style={styles.continueShopping}
            onPress={() => navigation.navigate('ServiceCategories')}
          >
            <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.content}>
            {/* Cart Items */}
            <FlatList
              data={cart.items}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.service}
              scrollEnabled={false}
            />

            {/* Order Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Chi tiết đơn hàng</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tổng tiền hàng</Text>
                <Text style={styles.summaryValue}>{formatCurrency(calculateSubtotal())}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Thuế VAT 10%</Text>
                <Text style={styles.summaryValue}>{formatCurrency(calculateTax())}</Text>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentTitle}>Phương thức thanh toán</Text>
              
              <TouchableOpacity 
                style={styles.paymentMethodCard}
                onPress={() => setPaymentModalVisible(true)}
              >
                <View style={styles.paymentMethodLogoContainer}>
                  <Ionicons name={selectedPayment.icon} size={30} color="#1A237E" />
                  <Text style={styles.paymentMethodText}>{selectedPayment.name}</Text>
                </View>
                <Text style={styles.changeMethodText}>Thay đổi</Text>
              </TouchableOpacity>
            </View>

            {/* Spacer for bottom button */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Fixed Checkout Button */}
          <View style={styles.checkoutContainer}>
            <View style={styles.checkoutSummary}>
              <Text style={styles.checkoutLabel}>Tổng</Text>
              <Text style={styles.checkoutTotal}>{formatCurrency(calculateTotal())} VND</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutButton, updating && styles.checkoutButtonDisabled]} 
              onPress={handleCheckout}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.checkoutButtonText}>Thanh toán</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Payment Method Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={paymentMethods}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.paymentOption,
                    selectedPayment.id === item.id && styles.selectedPaymentOption
                  ]}
                  onPress={() => handleSelectPaymentMethod(item)}
                >
                  <Ionicons name={item.icon} size={24} color="#4285F4" />
                  <Text style={styles.paymentOptionText}>{item.name}</Text>
                  {selectedPayment.id === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#4285F4" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.paymentList}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  continueShopping: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#4285F4',
    borderRadius: 25,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  cartItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  appointmentInfoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#4285F4',
  },
  appointmentInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  appointmentInfoHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285F4',
    marginLeft: 5,
  },
  appointmentInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  appointmentLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  additionalServicesContainer: {
    marginTop: 5,
  },
  additionalServiceItem: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
    marginBottom: 2,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  increaseButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  increaseButtonText: {
    color: '#fff',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '500',
    minWidth: 20,
    textAlign: 'center',
  },
  itemPriceContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  removeButton: {
    padding: 5,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 5,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
  },
  paymentMethodLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  changeMethodText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutSummary: {},
  checkoutLabel: {
    fontSize: 14,
    color: '#666',
  },
  checkoutTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  checkoutButtonDisabled: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  paymentList: {
    maxHeight: 300,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedPaymentOption: {
    backgroundColor: '#f5f5f5',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
});

export default CartScreen;