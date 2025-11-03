// src/utils/authErrorHandler.js
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Biến global để lưu navigation ref
let navigationRef = null;

// Set navigation ref để có thể điều hướng từ bất kỳ đâu
export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

// Xử lý lỗi authentication (401)
export const handleAuthError = async (error, navigation) => {
  // Kiểm tra nếu là lỗi 401
  if (error.message && error.message.includes('Không được phép, token không hợp lệ')) {
    console.log('🚨 handleAuthError: Phát hiện lỗi token không hợp lệ');

    // Xóa token và userInfo
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');

    // Hiển thị thông báo
    Alert.alert(
      'Phiên đăng nhập hết hạn',
      'Vui lòng đăng nhập lại để tiếp tục',
      [
        {
          text: 'OK',
          onPress: () => {
            // Điều hướng về màn hình đăng nhập
            if (navigation) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
              });
            } else if (navigationRef) {
              navigationRef.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
              });
            }
          },
        },
      ],
      { cancelable: false }
    );

    return true; // Đã xử lý lỗi
  }

  return false; // Không phải lỗi 401
};

// Wrapper function cho API calls để tự động xử lý lỗi 401
export const withAuthErrorHandling = async (apiCall, navigation) => {
  try {
    return await apiCall();
  } catch (error) {
    const handled = await handleAuthError(error, navigation);
    if (!handled) {
      // Nếu không phải lỗi 401, throw lại để caller xử lý
      throw error;
    }
    return null;
  }
};
