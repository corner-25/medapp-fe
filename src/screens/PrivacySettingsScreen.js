import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacySettingsScreen = ({ navigation }) => {
  // State cho các quyền
  const [permissions, setPermissions] = useState([
    {
      id: 'notifications',
      title: 'Thông báo',
      description: 'Cho phép ứng dụng gửi thông báo về lịch khám và cập nhật',
      icon: 'notifications-outline',
      isEnabled: true,
    },
    {
      id: 'location',
      title: 'Vị trí',
      description: 'Cho phép ứng dụng truy cập vị trí để tìm cơ sở y tế gần nhất',
      icon: 'location-outline',
      isEnabled: false,
    },
    {
      id: 'camera',
      title: 'Máy ảnh',
      description: 'Cho phép ứng dụng sử dụng máy ảnh để quét mã QR và tài liệu',
      icon: 'camera-outline',
      isEnabled: false,
    },
    {
      id: 'storage',
      title: 'Bộ nhớ',
      description: 'Cho phép ứng dụng truy cập bộ nhớ để tải lên tài liệu y tế',
      icon: 'folder-outline',
      isEnabled: true,
    },
    {
      id: 'contacts',
      title: 'Danh bạ',
      description: 'Cho phép ứng dụng truy cập danh bạ để thêm người thân',
      icon: 'people-outline',
      isEnabled: false,
    },
    {
      id: 'health',
      title: 'Dữ liệu sức khỏe',
      description: 'Cho phép ứng dụng truy cập và chia sẻ dữ liệu sức khỏe',
      icon: 'fitness-outline',
      isEnabled: true,
    },
    {
      id: 'analytics',
      title: 'Phân tích dữ liệu',
      description: 'Cho phép ứng dụng thu thập dữ liệu phân tích để cải thiện dịch vụ',
      icon: 'analytics-outline',
      isEnabled: true,
    },
  ]);

  // Xử lý khi chuyển đổi quyền
  const togglePermission = (id) => {
    // Kiểm tra xem quyền hiện tại đang bật hay tắt
    const currentPermission = permissions.find(permission => permission.id === id);
    const isCurrentlyEnabled = currentPermission.isEnabled;
    
    // Nếu đang tắt và chuẩn bị bật, hiển thị alert xác nhận
    if (!isCurrentlyEnabled) {
      Alert.alert(
        'Bật quyền ' + currentPermission.title,
        'Bạn có chắc chắn muốn bật quyền này không? Ứng dụng sẽ ' + currentPermission.description.toLowerCase(),
        [
          {
            text: 'Hủy',
            style: 'cancel'
          },
          {
            text: 'Bật',
            onPress: () => {
              // Bật quyền và hiển thị modal yêu cầu quyền hệ thống (giả lập)
              if (Platform.OS === 'ios' || Platform.OS === 'android') {
                // Trong thực tế sẽ sử dụng API của React Native để yêu cầu quyền
                setTimeout(() => {
                  // Cập nhật state sau khi người dùng cấp quyền
                  setPermissions(permissions.map(permission => 
                    permission.id === id ? { ...permission, isEnabled: true } : permission
                  ));
                }, 500);
              } else {
                // Cập nhật trực tiếp nếu không phải môi trường di động
                setPermissions(permissions.map(permission => 
                  permission.id === id ? { ...permission, isEnabled: true } : permission
                ));
              }
            }
          }
        ]
      );
    } else {
      // Nếu đang bật và chuẩn bị tắt, cập nhật trực tiếp
      setPermissions(permissions.map(permission => 
        permission.id === id ? { ...permission, isEnabled: false } : permission
      ));
    }
  };

  // Render từng quyền
  const renderPermissionItem = (permission) => (
    <View key={permission.id} style={styles.permissionItem}>
      <View style={styles.permissionIconContainer}>
        <Icon name={permission.icon} size={24} color="#4285F4" />
      </View>
      
      <View style={styles.permissionInfo}>
        <Text style={styles.permissionTitle}>{permission.title}</Text>
        <Text style={styles.permissionDescription}>{permission.description}</Text>
      </View>
      
      <Switch
        trackColor={{ false: "#ddd", true: "#4CAF50" }}
        thumbColor={permission.isEnabled ? "#fff" : "#fff"}
        ios_backgroundColor="#ddd"
        onValueChange={() => togglePermission(permission.id)}
        value={permission.isEnabled}
      />
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
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quyền riêng tư và Bảo mật</Text>
      </View>
      
      {/* Thông tin giới thiệu */}
      <View style={styles.infoBox}>
        <Icon name="shield-checkmark-outline" size={24} color="#4285F4" style={styles.infoIcon} />
        <Text style={styles.infoText}>
          Quản lý quyền truy cập của ứng dụng để bảo vệ dữ liệu cá nhân và tối ưu hóa trải nghiệm của bạn
        </Text>
      </View>
      
      {/* Danh sách quyền */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Quyền ứng dụng</Text>
        
        {permissions.map(renderPermissionItem)}
        
        <View style={styles.privacyPolicyContainer}>
          <TouchableOpacity 
            style={styles.privacyPolicyButton}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Icon name="document-text-outline" size={20} color="#4285F4" style={styles.policyIcon} />
            <Text style={styles.policyText}>Xem chính sách quyền riêng tư</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.deleteAccountContainer}>
          <TouchableOpacity 
            style={styles.deleteAccountButton}
            onPress={() => {
              Alert.alert(
                'Xóa tài khoản',
                'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác và tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.',
                [
                  {
                    text: 'Hủy',
                    style: 'cancel'
                  },
                  {
                    text: 'Xóa',
                    onPress: () => Alert.alert('Thông báo', 'Chức năng này sẽ được phát triển sau'),
                    style: 'destructive'
                  }
                ]
              );
            }}
          >
            <Icon name="trash-outline" size={20} color="#E53935" style={styles.deleteIcon} />
            <Text style={styles.deleteText}>Xóa tài khoản</Text>
          </TouchableOpacity>
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 5,
  },
  permissionItem: {
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
  permissionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  permissionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  privacyPolicyContainer: {
    marginTop: 20,
  },
  privacyPolicyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  policyIcon: {
    marginRight: 10,
  },
  policyText: {
    fontSize: 16,
    color: '#4285F4',
  },
  deleteAccountContainer: {
    marginTop: 20,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
  },
  deleteIcon: {
    marginRight: 10,
  },
  deleteText: {
    fontSize: 16,
    color: '#E53935',
    fontWeight: '500',
  },
  spacer: {
    height: 40,
  },
});

export default PrivacySettingsScreen;