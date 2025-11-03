// src/screens/LoginFormScreen.js - Updated with Forgot Password
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/settings'; // Import từ config
import { API_ENDPOINTS } from '../config/api';
import { signInWithGoogle, signInWithApple, configureGoogleSignIn } from '../utils/socialAuth';

const LoginFormScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Lấy hàm đăng nhập từ AuthContext
  const { signIn } = useContext(AuthContext);

  // Khởi tạo Google Sign-In khi component mount
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  
  const handleLogin = async () => {
    // Kiểm tra đầu vào
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }
    
    setLoading(true);
    console.log('🔐 Bắt đầu đăng nhập với email:', email);
    
    try {
      const loginEndpoint = API_ENDPOINTS.LOGIN || `${API_BASE_URL}/api/auth/login`;
      console.log('🌐 Gọi API đăng nhập:', loginEndpoint);
      
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });
      
      console.log('📡 Nhận response từ server, status:', response.status);
      let data;
      
      try {
        data = await response.json();
        console.log('📊 Dữ liệu trả về:', data);
      } catch (parseError) {
        console.error('❌ Lỗi phân tích response JSON:', parseError);
        const text = await response.text();
        console.log('📄 Response text:', text);
        throw new Error('Lỗi khi phân tích dữ liệu từ server');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }
      
      // Kiểm tra dữ liệu trả về
      if (!data.token) {
        console.error('❌ Thiếu token trong dữ liệu trả về:', data);
        throw new Error('Thiếu token xác thực từ server');
      }
      
      // Lưu thông tin người dùng vào AsyncStorage
      try {
        await AsyncStorage.setItem('userInfo', JSON.stringify(data));
        console.log('💾 Đã lưu thông tin người dùng vào AsyncStorage');
      } catch (storageError) {
        console.error('❌ Lỗi khi lưu thông tin người dùng:', storageError);
      }
      
      // Lưu token và chuyển hướng
      console.log('🔑 Gọi signIn với token và data');
      await signIn(data.token, data);
      
      
      console.log('✅ Đăng nhập thành công, chuyển đến Trang chủ');
      
      // Chuyển về màn hình chính
      navigation.reset({
        index: 0,
        routes: [{ name: 'Trang chủ' }],
      });
      
    } catch (error) {
      console.error('❌ Lỗi đăng nhập chi tiết:', error);
      
      // Xử lý lỗi chi tiết hơn
      let errorMessage = 'Có lỗi xảy ra, vui lòng thử lại';
      
      if (error.message.includes('Network request failed') || 
          error.message.includes('timeout') ||
          error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Lỗi phản hồi từ server. Vui lòng thử lại sau.';
      } else if (error.message.includes('Email hoặc mật khẩu không đúng')) {
        errorMessage = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Lỗi đăng nhập', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi nhấn "Quên mật khẩu"
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      console.log('🔵 Starting Google Sign-In...');
      const userData = await signInWithGoogle();

      console.log('🔵 Google user data:', userData);

      // Send to backend for authentication
      const response = await fetch(`${API_BASE_URL}/api/auth/social-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'google',
          socialId: userData.id,
          email: userData.email,
          name: userData.name,
          avatar: userData.photo,
          idToken: userData.idToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Social login failed');
      }

      // Save user info and sign in
      await AsyncStorage.setItem('userInfo', JSON.stringify(data));
      await signIn(data.token, data);

      console.log('✅ Google Sign-In successful');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Trang chủ' }],
      });

    } catch (error) {
      console.error('❌ Google Sign-In error:', error);
      Alert.alert('Lỗi đăng nhập Google', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Apple Sign-In
  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      console.log('🍎 Starting Apple Sign-In...');
      const userData = await signInWithApple();

      console.log('🍎 Apple user data:', userData);

      // Send to backend for authentication
      const response = await fetch(`${API_BASE_URL}/api/auth/social-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'apple',
          socialId: userData.id,
          email: userData.email,
          name: userData.name,
          identityToken: userData.identityToken,
          authorizationCode: userData.authorizationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Social login failed');
      }

      // Save user info and sign in
      await AsyncStorage.setItem('userInfo', JSON.stringify(data));
      await signIn(data.token, data);

      console.log('✅ Apple Sign-In successful');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Trang chủ' }],
      });

    } catch (error) {
      console.error('❌ Apple Sign-In error:', error);
      Alert.alert('Lỗi đăng nhập Apple', error.message);
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Đăng nhập</Text>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.formContainer}>
          <Text style={styles.label}>Email hoặc số điện thoại</Text>
          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập email hoặc số điện thoại"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>
          
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
            </TouchableOpacity>
          </View>
          
          {/* Forgot Password Button */}
          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
          
          
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>HOẶC</Text>
            <View style={styles.orLine} />
          </View>
          
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Icon name="logo-google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, styles.socialButtonDisabled]}
              disabled={true}
            >
              <Icon name="logo-facebook" size={24} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleAppleSignIn}
              disabled={loading}
            >
              <Icon name="logo-apple" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('RegisterForm')}>
              <Text style={styles.registerLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
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
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    paddingHorizontal: 10,
    color: '#888',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: '#fff',
  },
  socialButtonDisabled: {
    opacity: 0.5,
    borderColor: '#ccc',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: 'bold',
  },
});

export default LoginFormScreen;