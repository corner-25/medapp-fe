import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  // Lấy hàm đăng xuất từ AuthContext
  const { signOut, getUserInfo, getToken } = useContext(AuthContext);
  
  // State để quản lý loading và thông tin người dùng
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  // Kiểm tra trạng thái đăng nhập và cập nhật mỗi khi component mounted
  useEffect(() => {
    const checkLoginStatus = async () => {
      setLoading(true);
      try {
        // Kiểm tra token
        const token = getToken();
        console.log('Current token:', token);
        
        if (token) {
          // Lấy thông tin từ context
          const info = getUserInfo();
          console.log('User info from context:', info);
          
          if (info) {
            setUserInfo(info);
          } else {
            // Nếu không có thông tin trong context, thử lấy từ AsyncStorage
            try {
              const userInfoStr = await AsyncStorage.getItem('userInfo');
              console.log('User info from AsyncStorage:', userInfoStr);
              
              if (userInfoStr) {
                const parsedInfo = JSON.parse(userInfoStr);
                setUserInfo(parsedInfo);
                console.log('Parsed user info:', parsedInfo);
              }
            } catch (error) {
              console.error('Error loading user info from storage:', error);
            }
          }
        } else {
          // Nếu không có token, reset user info
          setUserInfo(null);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoginStatus();
    
    // Thêm listener cho sự kiện focus để cập nhật khi quay lại screen
    const unsubscribe = navigation.addListener('focus', () => {
      checkLoginStatus();
    });
    
    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, []);

  // Xử lý khi nhấn nút đăng xuất
  const handleSignOut = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            await signOut();
            setUserInfo(null); // Reset user info ngay lập tức
            Alert.alert('Thông báo', 'Bạn đã đăng xuất thành công!');
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Kiểm tra trạng thái đăng nhập bằng token hiện tại và userInfo
  const isLoggedIn = !!getToken() && !!userInfo;

  // Xử lý khi nhấn nút đăng nhập
  const handleLogin = () => {
    // Điều hướng đến màn hình LoginScreen trên MedicalStack
    navigation.navigate('Trang chủ', {
      screen: 'LoginScreen',
      params: {
        // Truyền callback để cập nhật profile screen sau khi đăng nhập thành công
        onLoginSuccess: () => {
          const token = getToken();
          const info = getUserInfo();
          if (token && info) {
            setUserInfo(info);
          }
        }
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
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
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Thông tin người dùng */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Icon name="person" size={40} color="#4285F4" />
          </View>
          <View style={styles.profileInfo}>
            {isLoggedIn && userInfo ? (
              <>
                <Text style={styles.userName}>{userInfo.name}</Text>
                <Text style={styles.userEmail}>{userInfo.email}</Text>
              </>
            ) : (
              <>
                <Text style={styles.userName}>Chưa đăng nhập</Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.loginPrompt}>Nhấn để đăng nhập</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        
        {/* Danh sách tùy chọn */}
        <View style={styles.optionsSection}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => {
              if (isLoggedIn) {
                navigation.navigate('PersonalInfo', { user: userInfo });
              } else {
                handleLogin();
              }
            }}
          >
            <Icon name="person-outline" size={24} color="#4285F4" style={styles.optionIcon} />
            <Text style={styles.optionText}>Thông tin cá nhân</Text>
            <Icon name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => {
              if (isLoggedIn) {
                navigation.navigate('RelativesManagement');
              } else {
                handleLogin();
              }
            }}
          >
            <Icon name="people-outline" size={24} color="#4285F4" style={styles.optionIcon} />
            <Text style={styles.optionText}>Quản lý người thân</Text>
            <Icon name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('Premium')}
          >
            <Icon name="star-outline" size={24} color="#FFC107" style={styles.optionIcon} />
            <Text style={styles.optionText}>Nâng cấp tài khoản</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => {
              if (isLoggedIn) {
                navigation.navigate('PaymentMethods');
              } else {
                handleLogin();
              }
            }}
          >
            <Icon name="card-outline" size={24} color="#4285F4" style={styles.optionIcon} />
            <Text style={styles.optionText}>Phương thức thanh toán</Text>
            <Icon name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('PrivacySettings')}
          >
            <Icon name="shield-outline" size={24} color="#4285F4" style={styles.optionIcon} />
            <Text style={styles.optionText}>Quyền riêng tư và Bảo mật</Text>
            <Icon name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <Icon name="help-circle-outline" size={24} color="#4285F4" style={styles.optionIcon} />
            <Text style={styles.optionText}>Trợ giúp & Hỗ trợ</Text>
            <Icon name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          {isLoggedIn ? (
            <TouchableOpacity 
              style={[styles.optionItem, styles.logoutOption]}
              onPress={handleSignOut}
            >
              <Icon name="log-out-outline" size={24} color="#E53935" style={styles.optionIcon} />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.optionItem, styles.loginOption]}
              onPress={handleLogin}
            >
              <Icon name="log-in-outline" size={24} color="#4285F4" style={styles.optionIcon} />
              <Text style={styles.loginText}>Đăng nhập</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
        </View>
      </ScrollView>
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
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  loginPrompt: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
  },
  optionsSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  premiumBadge: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutOption: {
    borderBottomWidth: 0,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#E53935',
    fontWeight: '500',
  },
  loginOption: {
    borderBottomWidth: 0,
  },
  loginText: {
    flex: 1,
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '500',
  },
  versionInfo: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ProfileScreen;