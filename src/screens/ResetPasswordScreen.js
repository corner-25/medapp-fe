// src/screens/ResetPasswordScreen.js
import React, { useState, useEffect, useContext } from 'react';
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
import { API_BASE_URL } from '../config/settings';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { signIn } = useContext(AuthContext);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null = checking, true = valid, false = invalid

  // Lấy token từ route params hoặc deep link
  const resetToken = route.params?.token;

  // Kiểm tra token khi component mount
  useEffect(() => {
    if (!resetToken) {
      Alert.alert(
        'Lỗi',
        'Link đặt lại mật khẩu không hợp lệ',
        [{ text: 'OK', onPress: () => navigation.navigate('LoginForm') }]
      );
      return;
    }

    verifyResetToken();
  }, [resetToken]);

  // Xác thực token reset
  const verifyResetToken = async () => {
    try {
      console.log('🔍 Verifying reset token:', resetToken);

      const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: resetToken }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Token is valid');
        setTokenValid(true);
      } else {
        console.log('❌ Token is invalid:', data.message);
        setTokenValid(false);
        Alert.alert(
          'Link hết hạn',
          'Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu link mới.',
          [
            {
              text: 'Yêu cầu link mới',
              onPress: () => navigation.navigate('ForgotPassword')
            },
            {
              text: 'Đăng nhập',
              onPress: () => navigation.navigate('LoginForm')
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error verifying token:', error);
      setTokenValid(false);
      Alert.alert(
        'Lỗi',
        'Không thể xác thực link. Vui lòng thử lại.',
        [{ text: 'OK', onPress: () => navigation.navigate('LoginForm') }]
      );
    }
  };

  // Validate password
  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ thường';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ số';
    }
    return null;
  };

  const handleResetPassword = async () => {
    // Validate inputs
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Mật khẩu không hợp lệ', passwordError);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Resetting password with token:', resetToken);

      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: password,
        }),
      });

      const data = await response.json();
      console.log('📝 Reset password response:', data);

      if (response.ok) {
        // Đặt lại mật khẩu thành công
        Alert.alert(
          'Thành công!',
          'Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập ngay bây giờ.',
          [
            {
              text: 'Đăng nhập ngay',
              onPress: async () => {
                // Tự động đăng nhập nếu API trả về token
                if (data.token) {
                  try {
                    await signIn(data.token, data.user || data);
                    // Navigate to home
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Trang chủ' }],
                    });
                  } catch (error) {
                    console.error('Auto login failed:', error);
                    navigation.navigate('LoginForm');
                  }
                } else {
                  navigation.navigate('LoginForm');
                }
              }
            }
          ]
        );
      } else {
        // Xử lý lỗi
        if (response.status === 400) {
          Alert.alert('Lỗi', data.message || 'Token không hợp lệ hoặc đã hết hạn');
        } else {
          Alert.alert('Lỗi', data.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
      }
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      
      if (error.message.includes('Network request failed')) {
        Alert.alert(
          'Lỗi kết nối',
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.'
        );
      } else {
        Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại sau');
      }
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị loading khi đang kiểm tra token
  if (tokenValid === null) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang xác thực...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Hiển thị lỗi nếu token không hợp lệ
  if (tokenValid === false) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <View style={styles.errorIconCircle}>
            <Icon name="close" size={40} color="#E53935" />
          </View>
          <Text style={styles.errorTitle}>Link không hợp lệ</Text>
          <Text style={styles.errorDescription}>
            Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.
          </Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.errorButtonText}>Yêu cầu link mới</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Đặt lại mật khẩu</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Icon name="key-outline" size={40} color="#4285F4" />
            </View>
          </View>

          {/* Title and Description */}
          <Text style={styles.title}>Tạo mật khẩu mới</Text>
          <Text style={styles.description}>
            Tạo mật khẩu mới cho tài khoản của bạn. Mật khẩu phải đảm bảo an toàn.
          </Text>

          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu mới"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
            <View style={styles.requirementRow}>
              <Icon 
                name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={password.length >= 6 ? "#4CAF50" : "#ccc"} 
              />
              <Text style={[styles.requirementText, password.length >= 6 && styles.requirementMet]}>
                Ít nhất 6 ký tự
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon 
                name={/(?=.*[a-z])/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/(?=.*[a-z])/.test(password) ? "#4CAF50" : "#ccc"} 
              />
              <Text style={[styles.requirementText, /(?=.*[a-z])/.test(password) && styles.requirementMet]}>
                Có chữ thường (a-z)
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon 
                name={/(?=.*[A-Z])/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/(?=.*[A-Z])/.test(password) ? "#4CAF50" : "#ccc"} 
              />
              <Text style={[styles.requirementText, /(?=.*[A-Z])/.test(password) && styles.requirementMet]}>
                Có chữ hoa (A-Z)
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon 
                name={/(?=.*\d)/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/(?=.*\d)/.test(password) ? "#4CAF50" : "#ccc"} 
              />
              <Text style={[styles.requirementText, /(?=.*\d)/.test(password) && styles.requirementMet]}>
                Có chữ số (0-9)
              </Text>
            </View>
          </View>

          {/* Reset Button */}
          <TouchableOpacity 
            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.resetButtonText}>Đặt lại mật khẩu</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <View style={styles.backToLoginContainer}>
            <Text style={styles.backToLoginText}>Nhớ lại mật khẩu? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginForm')}>
              <Text style={styles.backToLoginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  errorDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  errorButton: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  passwordToggle: {
    padding: 8,
  },
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#4CAF50',
  },
  resetButton: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ResetPasswordScreen;