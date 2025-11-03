import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      id: 'storage',
      title: 'Bộ nhớ',
      description: 'Cho phép ứng dụng truy cập bộ nhớ để tải lên tài liệu y tế',
      icon: 'folder-outline',
      isEnabled: true,
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
      isEnabled: false,
    },
  ]);

  // Load settings from AsyncStorage on component mount
  useEffect(() => {
    loadPrivacySettings();
  }, []);

  // Load saved privacy settings
  const loadPrivacySettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('privacySettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setPermissions(currentPermissions =>
          currentPermissions.map(permission => ({
            ...permission,
            isEnabled: parsedSettings[permission.id] !== undefined
              ? parsedSettings[permission.id]
              : permission.isEnabled
          }))
        );
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  // Save settings to AsyncStorage
  const savePrivacySettings = async (updatedPermissions) => {
    try {
      const settingsToSave = {};
      updatedPermissions.forEach(permission => {
        settingsToSave[permission.id] = permission.isEnabled;
      });
      await AsyncStorage.setItem('privacySettings', JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    }
  };

  // Xử lý khi chuyển đổi quyền
  const togglePermission = async (id) => {
    const currentPermission = permissions.find(permission => permission.id === id);
    const isCurrentlyEnabled = currentPermission.isEnabled;

    // Special handling for different permission types
    if (id === 'notifications') {
      if (!isCurrentlyEnabled) {
        Alert.alert(
          'Bật thông báo',
          'Bạn có muốn nhận thông báo về lịch hẹn khám, kết quả xét nghiệm và cập nhật từ ứng dụng?',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Bật',
              onPress: async () => {
                const updatedPermissions = permissions.map(permission =>
                  permission.id === id ? { ...permission, isEnabled: true } : permission
                );
                setPermissions(updatedPermissions);
                await savePrivacySettings(updatedPermissions);
                Alert.alert('Thành công', 'Thông báo đã được bật. Bạn sẽ nhận được thông báo về các hoạt động y tế.');
              }
            }
          ]
        );
      } else {
        const updatedPermissions = permissions.map(permission =>
          permission.id === id ? { ...permission, isEnabled: false } : permission
        );
        setPermissions(updatedPermissions);
        await savePrivacySettings(updatedPermissions);
        Alert.alert('Thông báo', 'Thông báo đã được tắt. Bạn sẽ không nhận được thông báo từ ứng dụng.');
      }
    } else if (id === 'analytics') {
      if (!isCurrentlyEnabled) {
        Alert.alert(
          'Chia sẻ dữ liệu phân tích',
          'Việc chia sẻ dữ liệu phân tích ẩn danh sẽ giúp chúng tôi cải thiện chất lượng dịch vụ y tế. Dữ liệu cá nhân của bạn luôn được bảo mật.',
          [
            { text: 'Từ chối', style: 'cancel' },
            {
              text: 'Đồng ý',
              onPress: async () => {
                const updatedPermissions = permissions.map(permission =>
                  permission.id === id ? { ...permission, isEnabled: true } : permission
                );
                setPermissions(updatedPermissions);
                await savePrivacySettings(updatedPermissions);
                Alert.alert('Cảm ơn', 'Cảm ơn bạn đã giúp cải thiện dịch vụ của chúng tôi.');
              }
            }
          ]
        );
      } else {
        const updatedPermissions = permissions.map(permission =>
          permission.id === id ? { ...permission, isEnabled: false } : permission
        );
        setPermissions(updatedPermissions);
        await savePrivacySettings(updatedPermissions);
      }
    } else {
      // For other permissions (storage, health data)
      const updatedPermissions = permissions.map(permission =>
        permission.id === id ? { ...permission, isEnabled: !isCurrentlyEnabled } : permission
      );
      setPermissions(updatedPermissions);
      await savePrivacySettings(updatedPermissions);

      if (id === 'health') {
        const message = !isCurrentlyEnabled
          ? 'Dữ liệu sức khỏe sẽ được đồng bộ và bảo mật trên cloud.'
          : 'Dữ liệu sức khỏe sẽ chỉ được lưu cục bộ trên thiết bị.';
        Alert.alert('Cập nhật', message);
      }
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