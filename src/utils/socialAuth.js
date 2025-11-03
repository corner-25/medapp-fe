// src/utils/socialAuth.js - Social Authentication utilities
import { Platform } from 'react-native';

// Try to import Google Sign-in, fallback if not available
let GoogleSignin;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (error) {
  console.warn('Google Sign-in not available:', error.message);
  GoogleSignin = null;
}

// Try to import Apple Auth, fallback if not available
let appleAuth;
try {
  appleAuth = require('@invertase/react-native-apple-authentication').appleAuth;
} catch (error) {
  console.warn('Apple Auth not available:', error.message);
  appleAuth = null;
}

// Configure Google Sign-In
export const configureGoogleSignIn = () => {
  if (!GoogleSignin) {
    console.warn('Google Sign-in not available');
    return;
  }

  // Get client IDs from environment variables
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_WEB;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_ANDROID;

  // Validate that required client IDs are present
  if (!webClientId || !iosClientId || !androidClientId) {
    console.error('❌ Missing Google OAuth client IDs in environment variables');
    console.error('Required: EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_WEB, EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS, EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_ANDROID');
    return;
  }

  try {
    GoogleSignin.configure({
      webClientId: webClientId,
      iosClientId: iosClientId,
      androidClientId: androidClientId,
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
      scopes: ['profile', 'email'],
    });
    console.log('✅ Google Sign-In configured successfully');
  } catch (error) {
    console.error('❌ Error configuring Google Sign-In:', error);
  }
};

// Google Sign-In function
export const signInWithGoogle = async () => {
  if (!GoogleSignin) {
    throw new Error('Google Sign-in không khả dụng');
  }
  try {
    console.log('🔍 Checking Google Play Services...');
    await GoogleSignin.hasPlayServices();

    console.log('🚀 Starting Google Sign-In...');
    const userInfo = await GoogleSignin.signIn();

    console.log('✅ Google Sign-In successful:', userInfo);

    // Extract user data
    const userData = {
      id: userInfo.user.id,
      email: userInfo.user.email,
      name: userInfo.user.name,
      photo: userInfo.user.photo,
      familyName: userInfo.user.familyName,
      givenName: userInfo.user.givenName,
      idToken: userInfo.idToken,
      accessToken: userInfo.serverAuthCode,
      provider: 'google'
    };

    return userData;
  } catch (error) {
    console.error('❌ Google Sign-In error:', error);

    // Handle different error codes
    if (error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Đăng nhập bị hủy bởi người dùng');
    } else if (error.code === 'IN_PROGRESS') {
      throw new Error('Đang trong quá trình đăng nhập');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw new Error('Google Play Services không khả dụng');
    } else {
      throw new Error('Lỗi đăng nhập Google: ' + (error.message || 'Không xác định'));
    }
  }
};

// Apple Sign-In function
export const signInWithApple = async () => {
  if (!appleAuth) {
    throw new Error('Apple Sign-in không khả dụng');
  }
  try {
    // Check if Apple Sign-In is supported
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In chỉ khả dụng trên iOS');
    }

    // Check if Apple Sign-In is available
    const isAvailable = await appleAuth.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple Sign-In không khả dụng trên thiết bị này');
    }

    console.log('🍎 Starting Apple Sign-In...');

    // Start Apple Sign-In request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    console.log('✅ Apple Sign-In successful:', appleAuthRequestResponse);

    // Get credential state
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user
    );

    if (credentialState === appleAuth.State.AUTHORIZED) {
      // Extract user data
      const userData = {
        id: appleAuthRequestResponse.user,
        email: appleAuthRequestResponse.email,
        name: appleAuthRequestResponse.fullName
          ? `${appleAuthRequestResponse.fullName.givenName || ''} ${appleAuthRequestResponse.fullName.familyName || ''}`.trim()
          : null,
        familyName: appleAuthRequestResponse.fullName?.familyName,
        givenName: appleAuthRequestResponse.fullName?.givenName,
        identityToken: appleAuthRequestResponse.identityToken,
        authorizationCode: appleAuthRequestResponse.authorizationCode,
        provider: 'apple'
      };

      return userData;
    } else {
      throw new Error('Xác thực Apple không thành công');
    }
  } catch (error) {
    console.error('❌ Apple Sign-In error:', error);

    if (error.code === '1001') {
      throw new Error('Đăng nhập bị hủy bởi người dùng');
    } else {
      throw new Error('Lỗi đăng nhập Apple: ' + (error.message || 'Không xác định'));
    }
  }
};

// Sign out from Google
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    console.log('✅ Google sign-out successful');
  } catch (error) {
    console.error('❌ Google sign-out error:', error);
  }
};

// Sign out from Apple (Note: Apple doesn't provide direct sign-out)
export const signOutFromApple = async () => {
  // Apple doesn't provide a direct sign-out method
  // The app should handle this by clearing local authentication state
  console.log('ℹ️ Apple sign-out: Clearing local state');
};

// Generic social sign-out
export const signOutFromSocial = async (provider) => {
  switch (provider) {
    case 'google':
      await signOutFromGoogle();
      break;
    case 'apple':
      await signOutFromApple();
      break;
    default:
      console.log('Unknown social provider:', provider);
  }
};

// Check if user is signed in with Google
export const isSignedInWithGoogle = async () => {
  try {
    return await GoogleSignin.isSignedIn();
  } catch (error) {
    console.error('❌ Error checking Google sign-in status:', error);
    return false;
  }
};

// Get current Google user
export const getCurrentGoogleUser = async () => {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    return userInfo;
  } catch (error) {
    console.error('❌ Error getting current Google user:', error);
    return null;
  }
};

export default {
  configureGoogleSignIn,
  signInWithGoogle,
  signInWithApple,
  signOutFromGoogle,
  signOutFromApple,
  signOutFromSocial,
  isSignedInWithGoogle,
  getCurrentGoogleUser,
};