// App.js đã sửa lỗi điều hướng và AuthContext - Updated with Forgot Password screens
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, Linking } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import AuthContext
import { AuthContext } from './src/contexts/AuthContext';

// Import các màn hình chính
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import MedicalExamScreen from './src/screens/MedicalExamScreen';
import ServiceCategoriesScreen from './src/screens/ServiceCategoriesScreen';
import SubServicesListScreen from './src/screens/SubServicesListScreen';
import ServiceDetailScreen from './src/screens/ServiceDetailScreen';
import CartScreen from './src/screens/CartScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PersonalInfoScreen from './src/screens/PersonalInfoScreen';
import RelativesManagementScreen from './src/screens/RelativesManagementScreen';
import RelativeFormScreen from './src/screens/RelativeFormScreen';
import RelativeDetailScreen from './src/screens/RelativeDetailScreen';
import PaymentMethodsScreen from './src/screens/PaymentMethodsScreen';
import PrivacySettingsScreen from './src/screens/PrivacySettingsScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import ReportScreen from './src/screens/ReportScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';

// Import màn hình mới RelativeCare
import RelativeCareScreen from './src/screens/RelativeCareScreen';

// Import màn hình đăng nhập/đăng ký
import LoginScreen from './src/screens/LoginScreen';
import LoginFormScreen from './src/screens/LoginFormScreen';
import RegisterFormScreen from './src/screens/RegisterFormScreen';

// Import màn hình Forgot Password - MỚI
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';

// Import màn hình cấp cứu
import EmergencyScreen from './src/screens/EmergencyScreen';
import EmergencyMapScreen from './src/screens/EmergencyMapScreen';
import EmergencyDetailScreen from './src/screens/EmergencyDetailScreen';

// Import màn hình bệnh viện
import HospitalDetailScreen from './src/screens/HospitalDetailScreen';
import HospitalsListScreen from './src/screens/HospitalsListScreen';

// Import màn hình báo cáo chi tiết
import AllergiesScreen from './src/screens/AllergiesScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import AnalysisDetailScreen from './src/screens/AnalysisDetailScreen';
import VaccinesScreen from './src/screens/VaccinesScreen';
import MedicalRecordsScreen from './src/screens/MedicalRecordsScreen';

// Import màn hình đơn hàng
import OrderDetailScreen from './src/screens/OrderDetailScreen';

// Import màn hình thanh toán
import PaymentResultScreen from './src/screens/PaymentResultScreen';

// Placeholder screens cho các màn hình chưa phát triển
const AddNewUserScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Thêm người dùng mới</Text>
  </View>
);

// RelativeDetailScreen đã được import từ file riêng

// HelpSupportScreen đã được import từ file riêng

// Tạo Stack Navigator cho luồng khám bệnh
const MedicalStack = createStackNavigator();

function MedicalStackScreen() {
  return (
    <MedicalStack.Navigator 
      initialRouteName="Home"
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true
      }}
    >
      <MedicalStack.Screen name="Home" component={HomeScreen} />
      <MedicalStack.Screen name="MedicalExam" component={MedicalExamScreen} />
      <MedicalStack.Screen name="ServiceCategories" component={ServiceCategoriesScreen} />
      <MedicalStack.Screen name="SubServicesList" component={SubServicesListScreen} />
      <MedicalStack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <MedicalStack.Screen name="Cart" component={CartScreen} />
      
      {/* Thêm màn hình RelativeCare vào stack chính */}
      <MedicalStack.Screen name="RelativeCare" component={RelativeCareScreen} />
      
      {/* Màn hình cấp cứu */}
      <MedicalStack.Screen name="Emergency" component={EmergencyScreen} />
      <MedicalStack.Screen name="EmergencyMap" component={EmergencyMapScreen} />
      <MedicalStack.Screen name="EmergencyDetail" component={EmergencyDetailScreen} />
      
      {/* Màn hình bệnh viện */}
      <MedicalStack.Screen name="HospitalDetail" component={HospitalDetailScreen} />
      <MedicalStack.Screen name="HospitalsList" component={HospitalsListScreen} />
      
      {/* Màn hình đơn hàng */}
      <MedicalStack.Screen name="OrderDetail" component={OrderDetailScreen} />

      {/* Màn hình thanh toán */}
      <MedicalStack.Screen name="PaymentResult" component={PaymentResultScreen} />
      
      {/* Màn hình xác thực */}
      <MedicalStack.Screen name="LoginScreen" component={LoginScreen} />
      <MedicalStack.Screen name="LoginForm" component={LoginFormScreen} />
      <MedicalStack.Screen name="RegisterForm" component={RegisterFormScreen} />
      
      {/* Màn hình Forgot Password - MỚI */}
      <MedicalStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <MedicalStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </MedicalStack.Navigator>
  );
}

// Tạo Stack Navigator cho luồng báo cáo
const ReportStack = createStackNavigator();

function ReportStackScreen() {
  return (
    <ReportStack.Navigator
      initialRouteName="ReportMain"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true
      }}
    >
      <ReportStack.Screen name="ReportMain" component={ReportScreen} />
      <ReportStack.Screen name="AllergiesScreen" component={AllergiesScreen} />
      <ReportStack.Screen name="AnalysisScreen" component={AnalysisScreen} />
      <ReportStack.Screen name="AnalysisDetailScreen" component={AnalysisDetailScreen} />
      <ReportStack.Screen name="VaccinesScreen" component={VaccinesScreen} />
      <ReportStack.Screen name="MedicalRecordsScreen" component={MedicalRecordsScreen} />
    </ReportStack.Navigator>
  );
}

// Tạo Stack Navigator cho luồng hồ sơ
const ProfileStack = createStackNavigator();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <ProfileStack.Screen name="RelativesManagement" component={RelativesManagementScreen} />
      <ProfileStack.Screen name="RelativeForm" component={RelativeFormScreen} />
      <ProfileStack.Screen name="RelativeDetail" component={RelativeDetailScreen} />
      <ProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <ProfileStack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <ProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <ProfileStack.Screen name="Premium" component={PremiumScreen} />
      <ProfileStack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <ProfileStack.Screen name="AddNewUser" component={AddNewUserScreen} />
    </ProfileStack.Navigator>
  );
}

// Tạo Stack Navigator cho luồng thông báo
const NotificationStack = createStackNavigator();

function NotificationStackScreen() {
  return (
    <NotificationStack.Navigator
      initialRouteName="NotificationMain"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true
      }}
    >
      <NotificationStack.Screen name="NotificationMain" component={NotificationScreen} />
      {/* Thêm các màn hình detail để điều hướng từ thông báo */}
      <NotificationStack.Screen name="EmergencyDetail" component={EmergencyDetailScreen} />
      <NotificationStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <NotificationStack.Screen name="MedicalRecordDetail" component={MedicalRecordsScreen} />
      <NotificationStack.Screen name="AppointmentDetail" component={MedicalExamScreen} />
    </NotificationStack.Navigator>
  );
}

// Tab Navigator chính
const Tab = createBottomTabNavigator();

// Root Stack để bao gồm SplashScreen
const RootStack = createStackNavigator();

function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Trang chủ') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Báo cáo') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Thông báo') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Người dùng') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Trang chủ" component={MedicalStackScreen} />
      <Tab.Screen name="Báo cáo" component={ReportStackScreen} />
      <Tab.Screen name="Thông báo" component={NotificationStackScreen} />
      <Tab.Screen name="Người dùng" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khởi tạo trạng thái xác thực
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userInfoStr = await AsyncStorage.getItem('userInfo');

        if (token) {
          setUserToken(token);
        }

        if (userInfoStr) {
          setUserInfo(JSON.parse(userInfoStr));
        }
      } catch (e) {
        console.log('Lỗi khi khởi tạo trạng thái xác thực:', e);
      } finally {
        // Chờ thêm 1.5s trước khi ẩn SplashScreen
        setTimeout(() => setIsLoading(false), 1500);
      }
    };

    bootstrapAsync();
  }, []);

  // Kiểm tra token định kỳ để phát hiện khi bị xóa do lỗi 401
  useEffect(() => {
    const checkTokenInterval = setInterval(async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');

        // Nếu token trong AsyncStorage bị xóa nhưng state vẫn còn
        if (!token && userToken) {
          console.log('🚨 Phát hiện token đã bị xóa. Đang đăng xuất...');
          setUserToken(null);
          setUserInfo(null);
        }
      } catch (e) {
        console.error('❌ Lỗi kiểm tra token:', e);
      }
    }, 1000); // Kiểm tra mỗi giây

    return () => clearInterval(checkTokenInterval);
  }, [userToken]);

  // Xử lý deep links cho reset password
  useEffect(() => {
    const handleDeepLink = (url) => {
      if (url && url.includes('reset-password')) {
        // Extract token from URL
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const token = urlParams.get('token');
        
        if (token) {
          // Navigate to ResetPasswordScreen with token
          console.log('Deep link detected, navigating to reset password with token:', token);
          // Điều hướng sẽ được xử lý trong navigation container
        }
      }
    };

    // Lắng nghe deep links
    const linkingSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Kiểm tra initial URL khi app được mở bằng deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      linkingSubscription?.remove();
    };
  }, []);

  // Định nghĩa các hàm xác thực để sử dụng trong toàn ứng dụng
  const authContext = React.useMemo(() => ({
    signIn: async (token, userData) => {
      console.log('🔑 AuthContext signIn được gọi với:', {
        token: token ? 'Có' : 'Không',
        userData: userData ? userData.name : 'Không có'
      });
      
      try {
        // Lưu token
        await AsyncStorage.setItem('userToken', token);
        setUserToken(token);
        console.log('✅ Token đã được lưu vào state và AsyncStorage');
        
        // Lưu thông tin người dùng nếu có
        if (userData) {
          await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
          setUserInfo(userData);
          console.log('✅ UserInfo đã được lưu vào state và AsyncStorage:', userData.name);
        } else {
          // Nếu không có userData, thử tải từ AsyncStorage
          const userInfoStr = await AsyncStorage.getItem('userInfo');
          if (userInfoStr) {
            const userInfoData = JSON.parse(userInfoStr);
            setUserInfo(userInfoData);
            console.log('✅ UserInfo đã được tải từ AsyncStorage:', userInfoData.name);
          }
        }
        
        console.log('🎉 Đăng nhập thành công! State đã được cập nhật');
      } catch (e) {
        console.error('❌ Lỗi lưu token hoặc userInfo:', e);
      }
    },
    
    signOut: async () => {
      console.log('🚪 AuthContext signOut được gọi');
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userInfo');
        setUserToken(null);
        setUserInfo(null);
        console.log('✅ Đã đăng xuất và xóa tất cả dữ liệu');
      } catch (e) {
        console.error('❌ Lỗi xóa token:', e);
      }
    },
    
    signUp: async (token, userData) => {
      console.log('📝 AuthContext signUp được gọi');
      try {
        await AsyncStorage.setItem('userToken', token);
        setUserToken(token);
        
        if (userData) {
          await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
          setUserInfo(userData);
        }
        console.log('✅ Đăng ký thành công!');
      } catch (e) {
        console.error('❌ Lỗi lưu token khi đăng ký:', e);
      }
    },
    
    getToken: () => {
      console.log('🔍 getToken được gọi, token hiện tại:', userToken ? 'Có' : 'Không');
      return userToken;
    },
    
    getUserInfo: () => {
      console.log('👤 getUserInfo được gọi, userInfo hiện tại:', userInfo ? userInfo.name : 'Không có');
      return userInfo;
    },
    
    updateUserInfo: async (data) => {
      console.log('🔄 updateUserInfo được gọi với:', data);
      try {
        const updatedUserInfo = { ...userInfo, ...data };
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        setUserInfo(updatedUserInfo);
        console.log('✅ Thông tin người dùng đã được cập nhật:', updatedUserInfo.name);
      } catch (e) {
        console.error('❌ Lỗi cập nhật thông tin người dùng:', e);
      }
    }
  }), [userToken, userInfo]);

  // Hiển thị SplashScreen khi đang tải
  if (isLoading) {
    return <SplashScreen />;
  }

  // Cấu hình deep links
  const linking = {
    prefixes: ['healthcare://'],
    config: {
      screens: {
        MainApp: {
          screens: {
            'Trang chủ': {
              screens: {
                ResetPassword: {
                  path: '/reset-password',
                  parse: {
                    token: (token) => token,
                  },
                },
                PaymentResult: {
                  path: '/payment-result',
                  parse: {
                    orderId: (orderId) => orderId,
                    paymentId: (paymentId) => paymentId,
                    status: (status) => status,
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer linking={linking}>
          <RootStack.Navigator
            initialRouteName="MainApp"
            screenOptions={{
              headerShown: false,
            }}
          >
            <RootStack.Screen name="Splash" component={SplashScreen} />
            <RootStack.Screen name="MainApp" component={MainApp} />
          </RootStack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}