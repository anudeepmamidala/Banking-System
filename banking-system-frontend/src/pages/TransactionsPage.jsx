import React, { useContext, useEffect, useState } from 'react';
import { AccountContext } from '../context/AccountContext';
import { transactionService } from '../services/transactionService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TRANSACTION_TYPES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Define a slightly darker primary color for a premium feel
const PRIMARY_COLOR = '#0056b3';

const TransactionsPage = () => {
  // --- START OF ORIGINAL LOGIC (UNCHANGED) ---
  const { accounts, loading: accountsLoading, fetchAccounts } =
    useContext(AccountContext);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('deposit'); // Default to deposit for user action
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // NEW: State for transfer type selection
  const [transferType, setTransferType] = useState('self'); // 'self' or 'other'
  const [allAccounts, setAllAccounts] = useState([]);

  // Form states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  // Fetch transactions only when history is active, but reset page on account change
  useEffect(() => {
      if (activeTab === 'history') {
          fetchTransactions();
      }
  }, [selectedAccount, activeTab, page]);

  // Fetch all accounts when transfer tab is active
  useEffect(() => {
    if (activeTab === 'transfer') {
      fetchAllAccountsForTransfer();
    }
  }, [activeTab]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Adjusted fetch to use selectedAccount ID if needed, but keeping the original logic of fetching all transactions for simplicity based on pagination
      const res = await transactionService.getTransactionHistory(page, 20);
      
      if (res.data && res.data.content) {
        setTransactions(res.data.content);
        setTotalPages(res.data.totalPages || 0);
        setHasMore(res.data.hasNext || false);
      } else {
        setTransactions([]);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAccountsForTransfer = async () => {
    try {
      const res = await transactionService.getAllAccountsForTransfer();
      setAllAccounts(res.data || []);
    } catch (err) {
      console.error('Error fetching all accounts:', err);
      setError(err.response?.data?.message || 'Failed to load accounts');
    }
  };

  const resetForm = () => {
      setAmount('');
      setDescription('');
      setToAccountId('');
      setError('');
  };

  const handleTransactionSuccess = async (message) => {
      setSuccess(message);
      resetForm();
      await fetchAccounts(); // Update account balances
      setPage(0); // Reset history to first page
      if (activeTab === 'history') await fetchTransactions();
      setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await transactionService.deposit(selectedAccount, amount, description);
      await handleTransactionSuccess('Deposit successful!');
    } catch (err) {
      console.error('Deposit error:', err);
      setError(err.response?.data?.message || 'Deposit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await transactionService.withdraw(selectedAccount, amount, description);
      await handleTransactionSuccess('Withdrawal successful!');
    } catch (err) {
      console.error('Withdraw error:', err);
      setError(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!toAccountId) {
      setError('Please select a target account');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await transactionService.transfer(
        selectedAccount,
        parseInt(toAccountId),
        amount,
        description
      );
      await handleTransactionSuccess('Transfer successful!');
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (accountsLoading) return <LoadingSpinner />;

  if (accounts.length === 0) {
    return (
      <div 
        className="container-fluid py-5" 
        style={{ 
          background: 'linear-gradient(to bottom, #ffffff 0%, #f9fbfd 100%)', 
          minHeight: '100vh' 
        }}
      >
        <h1 className="fw-bolder" style={{ color: '#212529' }}>Transactions</h1>
        <div className="alert alert-info border-0 shadow-sm mt-4">
          <span className="fw-bold">No accounts yet.</span> Create an account first to perform transactions.
        </div>
      </div>
    );
  }
  // --- END OF ORIGINAL LOGIC (UNCHANGED) ---


  return (
    <div 
      className="container-fluid py-5" 
      style={{ 
        background: 'linear-gradient(to bottom, #ffffff 0%, #f9fbfd 100%)', 
        minHeight: '100vh' 
      }}
    >
      
      {/* Refined Header Section */}
      <div className="border-bottom pb-4 mb-5">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-bolder" style={{ color: '#212529' }}>
              Transaction Center
            </h1>
            <p className="text-secondary fs-6">
              Review history or initiate new financial actions.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Main Content Row - Asymmetrical Grid (30% / 70%) */}
      <div className="row">
        
        {/* Account Selector (col-lg-4) */}
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-header bg-light border-bottom border-primary border-3">
              <h5 className="mb-0 text-dark fw-bold">Active Account</h5>
            </div>
            <div className="card-body p-4">
              <label className="form-label text-muted fw-medium">Select Source Account</label>
              <select
                className="form-select form-select-lg"
                value={selectedAccount || ''}
                onChange={(e) => {
                  setSelectedAccount(parseInt(e.target.value));
                  setPage(0); // Reset page on account change
                }}
                style={{ borderColor: PRIMARY_COLOR }}
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} - {formatCurrency(acc.balance)}
                  </option>
                ))}
              </select>
              
              {selectedAccount && (
                  <p className="mt-3 mb-0 text-muted">
                      Balance: <span className="fw-bolder" style={{ color: PRIMARY_COLOR }}>
                        {formatCurrency(accounts.find(a => a.id === selectedAccount)?.balance || 0)}
                      </span>
                  </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Tabs and History (col-lg-8) */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-header p-0">
              {/* Elevated Tabs */}
              <ul className="nav nav-pills nav-fill bg-light p-2 border-bottom">
                <li className="nav-item">
                  <button
                    className={`nav-link fw-medium ${activeTab === 'history' ? 'active shadow-sm' : ''}`}
                    onClick={() => setActiveTab('history')}
                    style={{ backgroundColor: activeTab === 'history' ? PRIMARY_COLOR : 'transparent', color: activeTab === 'history' ? 'white' : '#6c757d' }}
                  >
                    History <span className="ms-1">📜</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link fw-medium ${activeTab === 'deposit' ? 'active shadow-sm' : ''}`}
                    onClick={() => { setActiveTab('deposit'); resetForm(); }}
                    style={{ backgroundColor: activeTab === 'deposit' ? '#28a745' : 'transparent', color: activeTab === 'deposit' ? 'white' : '#6c757d' }}
                  >
                    Deposit <span className="ms-1">⬆️</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link fw-medium ${activeTab === 'withdraw' ? 'active shadow-sm' : ''}`}
                    onClick={() => { setActiveTab('withdraw'); resetForm(); }}
                    style={{ backgroundColor: activeTab === 'withdraw' ? '#dc3545' : 'transparent', color: activeTab === 'withdraw' ? 'white' : '#6c757d' }}
                  >
                    Withdraw <span className="ms-1">⬇️</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link fw-medium ${activeTab === 'transfer' ? 'active shadow-sm' : ''}`}
                    onClick={() => { setActiveTab('transfer'); resetForm(); }}
                    style={{ backgroundColor: activeTab === 'transfer' ? '#17a2b8' : 'transparent', color: activeTab === 'transfer' ? 'white' : '#6c757d' }}
                  >
                    Transfer <span className="ms-1">🔁</span>
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body p-4">
              
              {/* History Tab */}
              {activeTab === 'history' && (
                <div>
                  <h5 className="mb-3 fw-bold text-dark">Transaction History</h5>
                  {loading ? (
                    <p className="text-center py-5"><LoadingSpinner /></p>
                  ) : transactions.length === 0 ? (
                    <div className="alert alert-warning border-0 shadow-sm">No transactions found for this account.</div>
                  ) : (
                    <>
                      {/* Fixed Height Container for Transactions */}
                      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-hover table-striped align-middle mb-0">
                          <thead className="table-light sticky-top">
                            <tr>
                              <th className="text-uppercase text-secondary" style={{ fontSize: '0.8rem' }}>Date</th>
                              <th className="text-uppercase text-secondary" style={{ fontSize: '0.8rem' }}>Type</th>
                              <th className="text-uppercase text-secondary" style={{ fontSize: '0.8rem' }}>Amount</th>
                              <th className="text-uppercase text-secondary" style={{ fontSize: '0.8rem' }}>Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((txn, index) => (
                              <tr key={txn.id} className={`${index % 2 === 1 ? 'bg-light-subtle' : ''}`}>
                                <td>{formatDate(txn.createdAt)}</td>
                                <td>
                                  <span
                                    className={`badge rounded-pill text-uppercase ${
                                      txn.type === 'DEPOSIT'
                                        ? 'bg-success-subtle text-success'
                                        : txn.type === 'WITHDRAW'
                                        ? 'bg-danger-subtle text-danger'
                                        : 'bg-info-subtle text-info'
                                    }`}
                                    style={{ fontSize: '0.7rem' }}
                                  >
                                    {txn.type}
                                  </span>
                                </td>
                                <td
                                  className={`fw-bold ${
                                    txn.type === 'DEPOSIT' ? 'text-success' : 'text-danger'
                                  }`}
                                >
                                  {txn.type === 'DEPOSIT' ? '+' : '-'}
                                  {formatCurrency(Math.abs(txn.amount))}
                                </td>
                                <td className="text-muted">{txn.description || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {totalPages > 1 && (
                        <nav className="mt-3 d-flex justify-content-center">
                          <ul className="pagination pagination-sm">
                            <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                              >
                                Previous
                              </button>
                            </li>
                            <li className="page-item active">
                              <span className="page-link bg-primary border-primary">
                                {page + 1} / {totalPages}
                              </span>
                            </li>
                            <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages - 1}
                              >
                                Next
                              </button>
                            </li>
                          </ul>
                        </nav>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Deposit Tab */}
              {activeTab === 'deposit' && (
                <form onSubmit={handleDeposit}>
                    <h5 className="mb-4 fw-bold text-success">Deposit Funds into {accounts.find(a => a.id === selectedAccount)?.name}</h5>
                    <div className="mb-3">
                        <label className="form-label fw-medium">Amount</label>
                        <input
                        type="number"
                        className="form-control form-control-lg"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-medium">Description (Optional)</label>
                        <input
                        type="text"
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Monthly salary, cash deposit"
                        maxLength="255"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-success btn-lg mt-3 px-5 fw-medium shadow-sm"
                        disabled={submitting}
                    >
                        {submitting ? 'Depositing...' : 'Confirm Deposit'}
                    </button>
                </form>
              )}

              {/* Withdraw Tab */}
              {activeTab === 'withdraw' && (
                <form onSubmit={handleWithdraw}>
                    <h5 className="mb-4 fw-bold text-danger">Withdraw Funds from {accounts.find(a => a.id === selectedAccount)?.name}</h5>
                    <div className="mb-3">
                        <label className="form-label fw-medium">Amount</label>
                        <input
                        type="number"
                        className="form-control form-control-lg"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-medium">Description (Optional)</label>
                        <input
                        type="text"
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Rent payment, ATM withdrawal"
                        maxLength="255"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-danger btn-lg mt-3 px-5 fw-medium shadow-sm"
                        disabled={submitting}
                    >
                        {submitting ? 'Withdrawing...' : 'Confirm Withdrawal'}
                    </button>
                </form>
              )}

              {/* Transfer Tab - WITH TWO OPTIONS */}
              {activeTab === 'transfer' && (
                <form onSubmit={handleTransfer}>
                    <h5 className="mb-4 fw-bold text-info">Initiate Fund Transfer from {accounts.find(a => a.id === selectedAccount)?.name}</h5>
                  
                    {/* Transfer Type Selection */}
                    <div className="mb-4">
                        <label className="form-label fw-bold">Transfer Destination</label>
                        <div className="btn-group w-100 shadow-sm" role="group">
                        <input
                            type="radio"
                            className="btn-check"
                            name="transferType"
                            id="selfTransfer"
                            value="self"
                            checked={transferType === 'self'}
                            onChange={(e) => {
                                setTransferType(e.target.value);
                                setToAccountId(''); // Reset selection
                            }}
                        />
                        <label className="btn btn-outline-primary fw-medium" htmlFor="selfTransfer">
                            💰 Own Accounts
                        </label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="transferType"
                            id="otherTransfer"
                            value="other"
                            checked={transferType === 'other'}
                            onChange={(e) => {
                                setTransferType(e.target.value);
                                setToAccountId(''); // Reset selection
                            }}
                        />
                        <label className="btn btn-outline-info fw-medium" htmlFor="otherTransfer">
                            👥 External Account
                        </label>
                        </div>
                    </div>

                    {/* Conditional Dropdown based on transfer type */}
                    <div className="mb-3">
                        <label className="form-label fw-medium">
                            {transferType === 'self' ? 'Transfer To (Your Account)' : 'Transfer To (Recipient Account)'}
                        </label>
                        <select
                        className="form-select form-select-lg"
                        value={toAccountId}
                        onChange={(e) => setToAccountId(e.target.value)}
                        required
                        >
                        <option value="">
                            {transferType === 'self' ? 'Select your account' : 'Select recipient account'}
                        </option>

                        {/* SELF TRANSFER - Show only user's other accounts */}
                        {transferType === 'self' &&
                            accounts
                            .filter((acc) => acc.id !== selectedAccount)
                            .map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                {acc.name} - {formatCurrency(acc.balance)}
                                </option>
                            ))}

                        {/* OTHER ACCOUNT - Show all accounts except selected */}
                        {transferType === 'other' &&
                            allAccounts
                            .filter((acc) => acc.id !== selectedAccount)
                            .map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                {acc.name} (ID: {acc.id}) - {formatCurrency(acc.balance)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-medium">Amount</label>
                        <input
                        type="number"
                        className="form-control form-control-lg"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-medium">Description (Optional)</label>
                        <input
                        type="text"
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Paying rent, investment transfer"
                        maxLength="255"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-info btn-lg mt-3 px-5 fw-medium shadow-sm"
                        style={{ backgroundColor: '#17a2b8', borderColor: '#17a2b8' }}
                        disabled={submitting}
                    >
                        {submitting ? 'Processing...' : 'Confirm Transfer'}
                    </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- ADVANCED STYLING CSS BLOCK --- */}
      <style jsx="true">{`
        /* Zebra Striping Color */
        .bg-light-subtle {
          background-color: #f7f9fc;
        }
        /* Sticky table header for scrollable history */
        .table-responsive .sticky-top th {
            position: sticky;
            top: 0;
            z-index: 10;
            background-color: #f8f9fa; /* Ensure header color is maintained */
            box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

export default TransactionsPage;