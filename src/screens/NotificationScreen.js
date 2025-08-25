import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { API_BASE_URL } from '../config/settings'; // Import config

const NotificationScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Lấy thông báo từ API
  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      console.log('🔗 Fetching notifications from:', `${API_BASE_URL}/api/notifications`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notifications received:', data);
        // API trả về object với notifications array
        setNotifications(data.notifications || data);
      } else {
        console.log('❌ Failed to fetch notifications, status:', response.status);
        setNotifications([]);
      }
    } catch (error) {
      console.error('💥 Error fetching notifications:', error);
      
      if (error.name === 'AbortError') {
        console.log('⏰ Request timeout - API might not be ready');
      }
      
      // Hiển thị empty state thay vì crash
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Xử lý pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Xử lý khi nhấp vào thông báo
  const handleNotificationPress = async (notification) => {
    try {
      // Đánh dấu thông báo đã đọc
      if (!notification.read) {
        const token = getToken();
        
        console.log('📝 Marking notification as read:', notification._id);
        
        await fetch(`${API_BASE_URL}/api/notifications/${notification._id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Cập nhật state local
        setNotifications(prev =>
          prev.map(item =>
            item._id === notification._id ? { ...item, read: true } : item
          )
        );
      }

      // Điều hướng dựa trên loại thông báo
      switch (notification.type) {
        case 'appointment':
          if (notification.relatedId) {
            navigation.navigate('AppointmentDetail', { appointmentId: notification.relatedId });
          }
          break;
        case 'order':
          if (notification.relatedId) {
            navigation.navigate('OrderDetail', { orderId: notification.relatedId });
          }
          break;
        case 'medical_record':
          if (notification.relatedId) {
            navigation.navigate('MedicalRecordDetail', { recordId: notification.relatedId });
          }
          break;
        case 'emergency':
          if (notification.relatedId) {
            navigation.navigate('EmergencyDetail', { emergencyId: notification.relatedId });
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  // Xử lý đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Cập nhật state local
        setNotifications(prev =>
          prev.map(item => ({ ...item, read: true }))
        );
        
        Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo đã đọc');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu thông báo');
    }
  };

  // Lấy icon dựa trên loại thông báo
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return 'calendar';
      case 'order':
        return 'bag';
      case 'medical_record':
        return 'document-text';
      case 'emergency':
        return 'medical';
      case 'reminder':
        return 'alarm';
      default:
        return 'notifications';
    }
  };

  // Lấy màu dựa trên loại thông báo
  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment':
        return '#4285F4';
      case 'order':
        return '#4CAF50';
      case 'medical_record':
        return '#FF9800';
      case 'emergency':
        return '#F44336';
      case 'reminder':
        return '#9C27B0';
      default:
        return '#4285F4';
    }
  };

  // Format thời gian
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Vừa xong';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  // Render từng mục thông báo
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: getNotificationColor(item.type) }
      ]}>
        <Icon 
          name={getNotificationIcon(item.type)} 
          size={24} 
          color="white" 
        />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  // Render màn hình trống
  const renderEmptyNotifications = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="notifications-outline" size={80} color="#E0E0E0" />
      </View>
      <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
      <Text style={styles.emptyMessage}>
        Thông báo về lịch hẹn, đơn hàng và các hoạt động khác sẽ xuất hiện ở đây
      </Text>
      <TouchableOpacity 
        style={styles.testButton}
        onPress={() => {
          console.log('🧪 Testing API connection...');
          fetchNotifications();
        }}
      >
        <Text style={styles.testButtonText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thông báo</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        {notifications.length > 0 && notifications.some(n => !n.read) && (
          <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Đánh dấu tất cả</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* List of notifications */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.notificationList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4285F4']}
              tintColor="#4285F4"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyNotifications()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F0F7FF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#4285F4',
  },
  markAllText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  notificationList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
    backgroundColor: '#FAFBFF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
    fontWeight: '400',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4285F4',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
});

export default NotificationScreen;