import api from './api';

export const accountService = {
  getAllAccounts: () => api.get('/accounts'),

  getAccount: (accountId) => api.get(`/accounts/${accountId}`),

  createAccount: (name, type, initialBalance) =>
    api.post('/accounts/create', { name, type, initialBalance }),

  updateAccount: (accountId, data) =>
    api.put(`/accounts/${accountId}`, data),

  deleteAccount: (accountId) => api.delete(`/accounts/${accountId}`),
};
