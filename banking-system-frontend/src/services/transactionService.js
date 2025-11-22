import api from './api';

export const transactionService = {
  getTransactionHistory: (page = 0, size = 20) => {
    const validSize = Math.max(1, size);
    const validPage = Math.max(0, page);
    
    return api.get('/transactions/history/paginated', {
      params: { page: validPage, size: validSize }
    });
  },

  deposit: (fromAccountId, amount, description) =>
    api.post('/transactions/deposit', {
      fromAccountId,
      amount: parseFloat(amount),
      description,
    }),

  withdraw: (fromAccountId, amount, description) =>
    api.post('/transactions/withdraw', {
      fromAccountId,
      amount: parseFloat(amount),
      description,
    }),

  transfer: (fromAccountId, toAccountId, amount, description) =>
    api.post('/transactions/transfer', {
      fromAccountId,
      toAccountId: parseInt(toAccountId),
      amount: parseFloat(amount),
      description,
    }),

  getTransactionDetails: (transactionId) =>
    api.get(`/transactions/${transactionId}`),

  // NEW: Get all accounts for transfer recipients
  getAllAccountsForTransfer: () =>
    api.get('/accounts/all-for-transfer'),

  getTotalStats: () => api.get('/analytics/dashboard-summary'),

  getSpendingBreakdown: () =>
    api.get('/analytics/spending-by-category'),

  getMonthlyTrends: (months = 12) =>
    api.get('/analytics/monthly-summary', { params: { months } }),

  getAccountSummary: () => api.get('/analytics/account-summary'),
};