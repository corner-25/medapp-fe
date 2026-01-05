// src/screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../config/settings';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetEmail = async () => {
    // Kiểm tra email
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Gửi yêu cầu reset mật khẩu cho email:', email);

      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });

      const data = await response.json();
      console.log('📧 Response from forgot-password API:', data);

      if (response.ok) {
        setEmailSent(true);
        Alert.alert(
          'Email đã được gửi!',
          'Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam).',
          [{ text: 'OK' }]
        );
      } else {
        // Xử lý các lỗi cụ thể
        if (response.status === 404) {
          Alert.alert('Lỗi', 'Không tìm thấy tài khoản với email này');
        } else {
          Alert.alert('Lỗi', data.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi gửi email reset:', error);
      
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

  const handleResendEmail = () => {
    setEmailSent(false);
    handleSendResetEmail();
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
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quên mật khẩu</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed-outline" size={40} color="#4285F4" />
            </View>
          </View>

          {!emailSent ? (
            <>
              {/* Title and Description */}
              <Text style={styles.title}>Quên mật khẩu?</Text>
              <Text style={styles.description}>
                Không sao! Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập địa chỉ email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>

              {/* Send Button */}
              <TouchableOpacity 
                style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                onPress={handleSendResetEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Gửi email đặt lại mật khẩu</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Success State */}
              <View style={styles.successIconContainer}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark" size={40} color="#4CAF50" />
                </View>
              </View>

              <Text style={styles.successTitle}>Email đã được gửi!</Text>
              <Text style={styles.successDescription}>
                Chúng tôi đã gửi link đặt lại mật khẩu đến{'\n'}
                <Text style={styles.emailText}>{email}</Text>
              </Text>

              <Text style={styles.checkSpamText}>
                Không thấy email? Hãy kiểm tra thư mục spam hoặc thư rác.
              </Text>

              {/* Resend Button */}
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleResendEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#4285F4" />
                ) : (
                  <Text style={styles.resendButtonText}>Gửi lại email</Text>
                )}
              </TouchableOpacity>
            </>
          )}

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
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 30,
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
  sendButton: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  successDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#4285F4',
  },
  checkSpamText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  resendButton: {
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  resendButtonText: {
    color: '#4285F4',
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
  backToLoginLink: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;