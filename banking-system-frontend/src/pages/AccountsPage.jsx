import React, { useContext, useEffect, useState } from 'react';
import { AccountContext } from '../context/AccountContext';
import { formatCurrency } from '../utils/formatters';
import { ACCOUNT_TYPES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Define a slightly darker primary color for a premium feel
const PRIMARY_COLOR = '#0056b3';

const AccountsPage = () => {
  // --- START OF ORIGINAL LOGIC (UNCHANGED) ---
  const { accounts, loading, fetchAccounts, createAccount, deleteAccount } =
    useContext(AccountContext);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('SAVINGS');
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Account name is required');
      return;
    }

    if (!initialBalance || parseFloat(initialBalance) < 0) {
      setError('Initial balance must be a positive number');
      return;
    }

    setSubmitting(true);
    try {
      await createAccount(name, type, parseFloat(initialBalance));
      setSuccess('Account created successfully!');
      setName('');
      setType('SAVINGS');
      setInitialBalance('');
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(accountId);
        setSuccess('Account deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete account');
      }
    }
  };
  // --- END OF ORIGINAL LOGIC (UNCHANGED) ---

  if (loading) return <LoadingSpinner />;

  // Icon mapping for account types
  const getAccountIcon = (accountType) => {
    switch (accountType) {
      case 'CHECKING':
        return '💳';
      case 'SAVINGS':
        return '💰';
      case 'INVESTMENT':
        return '📈';
      default:
        return '🏦';
    }
  };

  return (
    <div 
      className="container-fluid py-5" 
      style={{ 
        background: 'linear-gradient(to bottom, #ffffff 0%, #f9fbfd 100%)', 
        minHeight: '100vh' 
      }}
    >
      
      {/* Refined Header Section with Custom Style */}
      <div className="border-bottom pb-4 mb-5 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="fw-bolder" style={{ color: '#212529' }}>
            Account Management
          </h1>
          <p className="text-secondary fs-6 mb-0">
            View, create, and manage your financial accounts.
          </p>
        </div>
        <button
          className="btn btn-primary px-4 py-2 fw-medium shadow-sm"
          onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
        >
          {showForm ? 'Close Form' : 'Create New Account'}
        </button>
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

      {/* Create Account Form (Advanced Card Styling) */}
      {showForm && (
        <div className="card mb-5 border-0 shadow-lg" style={{ borderLeft: `5px solid ${PRIMARY_COLOR}` }}>
          <div className="card-body p-4">
            <h5 className="card-title text-dark fw-bold mb-3">
              <span className="me-2 text-primary">➕</span> Create New Account
            </h5>
            <form onSubmit={handleCreateAccount}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label text-muted fw-medium">Account Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., My Emergency Fund"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted fw-medium">Account Type</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {/* Using ACCOUNT_TYPES constant */}
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted fw-medium">Initial Balance</label>
                  <input
                    type="number"
                    className="form-control"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-success mt-4 px-4 py-2 fw-medium"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Confirm Creation'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="row">
        {accounts.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info border-0 shadow-sm">
              <span className="fw-bold">Heads up!</span> No accounts yet. Use the "Create New Account" button to get started.
            </div>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="col-md-6 col-lg-4 mb-4">
              {/* Individual Account Card (God-Tier Style) */}
              <div 
                className="card h-100 border-0 shadow-lg transition-shadow-hover account-card" 
                // Set a dynamic border color based on the account type
                style={{ borderTop: `4px solid ${account.type === 'SAVINGS' ? '#28a745' : account.type === 'CHECKING' ? PRIMARY_COLOR : '#ffc107'}` }}
              >
                <div className="card-body d-flex flex-column justify-content-between p-4">
                  
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title fw-bold text-dark mb-1">{account.name}</h5>
                      <span className={`badge rounded-pill text-uppercase bg-primary-subtle text-primary`} style={{ fontSize: '0.75rem', backgroundColor: `${account.type === 'SAVINGS' ? '#d4edda' : account.type === 'CHECKING' ? '#cce5ff' : '#fff3cd'} !important`, color: `${account.type === 'SAVINGS' ? '#155724' : account.type === 'CHECKING' ? '#004085' : '#856404'} !important` }}>
                        {account.type}
                      </span>
                    </div>
                    {/* Floating Icon */}
                    <div
                      className="bg-light rounded-circle d-flex align-items-center justify-content-center account-icon"
                      style={{ width: '40px', height: '40px', fontSize: '1.5rem' }}
                    >
                      {getAccountIcon(account.type)}
                    </div>
                  </div>

                  {/* Balance Display - Large and Prominent */}
                  <div className="mb-4">
                    <p className="text-muted mb-0 text-uppercase fw-medium" style={{ fontSize: '0.8rem' }}>Current Balance</p>
                    <h1 className="card-text fw-bolder" style={{ color: PRIMARY_COLOR, fontSize: '2.5rem' }}>
                      {formatCurrency(account.balance)}
                    </h1>
                  </div>

                  <button
                    className="btn btn-outline-danger btn-sm mt-3"
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- ADVANCED STYLING CSS BLOCK --- */}
      <style jsx="true">{`
        /* Smoother and deeper shadow effect on hover for cards */
        .transition-shadow-hover:hover {
          box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-3px);
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .transition-shadow-hover {
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        /* Account Card Micro-Interaction setup */
        .account-card {
          overflow: hidden;
          position: relative;
        }
        
        /* Icon Micro-Interaction on card hover */
        .account-card:hover .account-icon {
          transform: scale(1.1) rotate(5deg);
          transition: transform 0.3s ease-in-out;
        }
        .account-icon {
          transition: transform 0.3s ease-in-out;
        }
        
      `}</style>
    </div>
  );
};

export default AccountsPage;