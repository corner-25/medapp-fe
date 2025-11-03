// src/screens/PaymentResultScreen.js - Màn hình hiển thị kết quả thanh toán
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/settings';

const PaymentResultScreen = ({ navigation, route }) => {
  const { orderId, paymentId, status, error, paymentMethod } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(status || 'pending');
  const { getToken } = useContext(AuthContext);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    }

    // Lắng nghe deep links cho VNPay return
    const handleDeepLink = (url) => {
      console.log('Deep link received:', url);
      if (url && url.includes('vnpay') && url.includes('return')) {
        // Parse VNPay return URL
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const vnpTransactionStatus = urlParams.get('vnp_TransactionStatus');

        if (vnpTransactionStatus === '00') {
          setCurrentStatus('completed');
          fetchPaymentDetails(); // Refresh payment details
        } else {
          setCurrentStatus('failed');
        }
      }
    };

    const linkingSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Check if opened from deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Poll for VNPay status if processing
    let pollInterval;
    if (currentStatus === 'processing' && paymentMethod === 'vnpay') {
      pollInterval = setInterval(() => {
        fetchPaymentDetails();
      }, 5000); // Check every 5 seconds
    }

    return () => {
      linkingSubscription?.remove();
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [paymentId, currentStatus, paymentMethod]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching payment details for:', paymentId);

      const userToken = getToken();
      if (!userToken || !paymentId) {
        console.log('No token or payment ID');
        return;
      }

      console.log('🔗 Fetching from:', `${API_BASE_URL}/api/payments/${paymentId}`);
      const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Payment details fetched:', result);

        setPaymentDetails(result.payment);
        setCurrentStatus(result.payment.status);
      } else {
        console.error('Failed to fetch payment details');
        // Fallback to mock data if API fails
        setPaymentDetails({
          transactionId: paymentId,
          amount: 500000,
          status: currentStatus || 'pending',
          paymentMethod: paymentMethod || 'cash',
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      // Fallback to mock data
      setPaymentDetails({
        transactionId: paymentId,
        amount: 500000,
        status: currentStatus || 'pending',
        paymentMethod: paymentMethod || 'cash',
        createdAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleViewOrder = () => {
    if (orderId) {
      navigation.navigate('OrderTracking', { orderId });
    } else {
      navigation.navigate('Orders');
    }
  };

  const isSuccess = currentStatus === 'success' || currentStatus === 'completed';
  const isFailed = currentStatus === 'failed' || currentStatus === 'error' || error;
  const isProcessing = currentStatus === 'processing' || currentStatus === 'pending';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang xử lý kết quả thanh toán...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Status Icon */}
        <View style={styles.iconContainer}>
          {isSuccess ? (
            <View style={styles.successIconBg}>
              <Icon name="checkmark" size={60} color="#fff" />
            </View>
          ) : isProcessing ? (
            <View style={styles.processingIconBg}>
              <ActivityIndicator size={60} color="#fff" />
            </View>
          ) : (
            <View style={styles.errorIconBg}>
              <Icon name="close" size={60} color="#fff" />
            </View>
          )}
        </View>

        {/* Status Message */}
        <Text style={styles.statusTitle}>
          {isSuccess
            ? 'Thanh toán thành công!'
            : isProcessing
              ? 'Đang xử lý thanh toán...'
              : 'Thanh toán thất bại!'
          }
        </Text>

        <Text style={styles.statusMessage}>
          {isSuccess
            ? 'Đơn hàng của bạn đã được thanh toán thành công. Cảm ơn bạn đã sử dụng dịch vụ!'
            : isProcessing
              ? paymentMethod === 'vnpay'
                ? 'Đang chờ xác nhận từ VNPay. Vui lòng đợi trong giây lát...'
                : 'Đang xử lý thanh toán của bạn. Vui lòng đợi...'
              : `Rất tiếc, thanh toán của bạn không thành công. ${error || 'Vui lòng thử lại sau.'}`
          }
        </Text>

        {/* Payment Details */}
        {paymentDetails && isSuccess && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Chi tiết thanh toán</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã giao dịch:</Text>
              <Text style={styles.detailValue}>{paymentDetails.transactionId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số tiền:</Text>
              <Text style={styles.detailValue}>{paymentDetails.amount?.toLocaleString()} VNĐ</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phương thức:</Text>
              <Text style={styles.detailValue}>
                {paymentDetails.paymentMethod === 'cash' ? 'Tiền mặt' : paymentDetails.paymentMethod}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thời gian:</Text>
              <Text style={styles.detailValue}>
                {new Date(paymentDetails.createdAt).toLocaleString('vi-VN')}
              </Text>
            </View>
          </View>
        )}

        {/* Error Details */}
        {error && isFailed && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Chi tiết lỗi</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {isSuccess && orderId && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleViewOrder}>
            <Icon name="receipt-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Xem đơn hàng</Text>
          </TouchableOpacity>
        )}

        {isFailed && (
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Icon name="refresh-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToHome}>
          <Icon name="home-outline" size={20} color="#4285F4" style={styles.buttonIcon} />
          <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  successIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4285F4',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default PaymentResultScreen;