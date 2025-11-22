import React, { createContext, useState, useCallback } from 'react';
import { accountService } from '../services/accountService';

export const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountService.getAllAccounts();
      setAccounts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccount = async (name, type, initialBalance) => {
    try {
      const res = await accountService.createAccount(name, type, initialBalance);
      setAccounts([...accounts, res.data]);
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to create account';
    }
  };

  const deleteAccount = async (accountId) => {
    try {
      await accountService.deleteAccount(accountId);
      setAccounts(accounts.filter((acc) => acc.id !== accountId));
    } catch (err) {
      throw err.response?.data?.message || 'Failed to delete account';
    }
  };

  const updateAccount = async (accountId, data) => {
    try {
      const res = await accountService.updateAccount(accountId, data);
      setAccounts(
        accounts.map((acc) => (acc.id === accountId ? res.data : acc))
      );
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to update account';
    }
  };

  return (
    <AccountContext.Provider
      value={{
        accounts,
        loading,
        error,
        fetchAccounts,
        createAccount,
        deleteAccount,
        updateAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};