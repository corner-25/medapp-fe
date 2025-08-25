// src/context/AuthContext.js - Tách AuthContext ra khỏi App.js để tránh require cycle
import React, { createContext } from 'react';

// Tạo Context cho việc xác thực
export const AuthContext = createContext({
  userToken: null,
  userInfo: null,
  isLoading: true,
  signIn: () => {},
  signUp: () => {},
  signOut: () => {},
  getToken: () => null,
  getUserInfo: () => null,
});

export default AuthContext;