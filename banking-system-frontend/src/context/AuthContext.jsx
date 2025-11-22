import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  useEffect(() => {
    if (accessToken) {
      authService
        .getProfile()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          // If profile fails, just set basic user from stored data
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { accessToken, refreshToken } = res.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Set user with basic info (don't wait for profile)
    const basicUser = { email, fullName: 'User' };
    setUser(basicUser);
    localStorage.setItem('user', JSON.stringify(basicUser));
    
    setAccessToken(accessToken);
    
    return res.data;
  };

  const register = async (email, password, fullName) => {
    return await authService.register(email, password, fullName);
  };

  const logout = () => {
    authService.logout();
    setAccessToken(null);
    setUser(null);
  };

  const updateProfile = async (fullName) => {
    try {
      const res = await authService.updateProfile(fullName);
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      throw err;
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    return await authService.changePassword(oldPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
