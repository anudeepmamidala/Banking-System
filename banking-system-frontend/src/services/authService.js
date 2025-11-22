import api from './api';

export const authService = {
  register: (email, password, fullName) =>
    api.post('/auth/register', { email, password, fullName }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (fullName, email) =>
    api.put('/auth/profile', { fullName, email }),

  changePassword: (oldPassword, newPassword) =>
    api.post('/auth/change-password', { oldPassword, newPassword }),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};
