import React, { useContext, useEffect, useState } from 'react';
import { AccountContext } from '../context/AccountContext';
import { transactionService } from '../services/transactionService';
import { formatCurrency, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Define a slightly darker primary color for a premium feel
const PRIMARY_COLOR = '#0056b3'; // Darker blue

const DashboardPage = () => {
  // --- START OF ORIGINAL LOGIC/HOOKS (UNCHANGED) ---
  const { accounts, loading: accountsLoading, fetchAccounts } =
    useContext(AccountContext);
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [accountSummary, setAccountSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAccounts();
        const [statsRes, summaryRes] = await Promise.all([
          transactionService.getTotalStats(),
          transactionService.getAccountSummary(),
        ]);
        setStats(statsRes.data);
        setAccountSummary(summaryRes.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchAccounts]);

  // Fetch recent transactions for the first account
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (accounts.length > 0) {
        try {
          const res = await transactionService.getTransactionHistory(
            accounts[0].id,
            0,
            10
          );
          // Handle paginated response
          setRecentTransactions(res.data.content || res.data || []);
        } catch (err) {
          console.error('Failed to fetch recent transactions:', err);
          setRecentTransactions([]);
        }
      }
    };

    fetchRecentTransactions();
  }, [accounts]);
  // --- END OF ORIGINAL LOGIC/HOOKS (UNCHANGED) ---

  if (loading || accountsLoading) return <LoadingSpinner />;

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    // Main container with advanced gradient background
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
              Financial Dashboard
            </h1>
            <p className="text-secondary fs-6">
              Welcome back! A concise overview of your financial health.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}

      {/* Summary Cards (Kept at col-lg-3 for consistent sizing) */}
      <div className="row mb-5">
        
        {/* Total Balance Card */}
        <div className="col-md-6 col-lg-3 mb-4">
          <div 
            className="card border-0 shadow-lg h-100 transition-shadow-hover advanced-card"
            style={{ borderLeft: `5px solid ${PRIMARY_COLOR}` }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="card-text text-uppercase text-muted fw-bold mb-2">
                    Total Balance
                  </p>
                  <h3 className="card-title fw-bolder" style={{ color: PRIMARY_COLOR }}>
                    {formatCurrency(totalBalance)}
                  </h3>
                </div>
                <div
                  className="bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center advanced-icon"
                  style={{ width: '45px', height: '45px' }}
                >
                  <span className="text-primary" style={{ fontSize: '20px' }}>💰</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Accounts Card */}
        <div className="col-md-6 col-lg-3 mb-4">
          <div 
            className="card border-0 shadow-lg h-100 transition-shadow-hover advanced-card"
            style={{ borderLeft: `5px solid #28a745` }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="card-text text-uppercase text-muted fw-bold mb-2">
                    Total Accounts
                  </p>
                  <h3 className="card-title fw-bolder text-success mb-0">
                    {accounts.length}
                  </h3>
                </div>
                <div
                  className="bg-success bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center advanced-icon"
                  style={{ width: '45px', height: '45px' }}
                >
                  <span className="text-success" style={{ fontSize: '20px' }}>🏦</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {stats && (
          <>
            {/* Total Income Card */}
            <div className="col-md-6 col-lg-3 mb-4">
              <div 
                className="card border-0 shadow-lg h-100 transition-shadow-hover advanced-card"
                style={{ borderLeft: `5px solid #17a2b8` }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="card-text text-uppercase text-muted fw-bold mb-2">
                        Total Income
                      </p>
                      <h3 className="card-title fw-bolder text-info mb-0">
                        {formatCurrency(stats.totalIncome || 0)}
                      </h3>
                    </div>
                    <div
                      className="bg-info bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center advanced-icon"
                      style={{ width: '45px', height: '45px' }}
                    >
                      <span className="text-info" style={{ fontSize: '20px' }}>📈</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Expenses Card */}
            <div className="col-md-6 col-lg-3 mb-4">
              <div 
                className="card border-0 shadow-lg h-100 transition-shadow-hover advanced-card"
                style={{ borderLeft: `5px solid #ffc107` }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="card-text text-uppercase text-muted fw-bold mb-2">
                        Total Expenses
                      </p>
                      <h3 className="card-title fw-bolder text-warning mb-0">
                        {formatCurrency(stats.totalExpenses || 0)}
                      </h3>
                    </div>
                    <div
                      className="bg-warning bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center advanced-icon"
                      style={{ width: '45px', height: '45px' }}
                    >
                      <span className="text-warning" style={{ fontSize: '20px' }}>📉</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Accounts Overview & Recent Transactions - ASYMMETRICAL LAYOUT */}
      <div className="row mb-5">
        
        {/* Accounts Overview: WIDER (col-lg-7) */}
        <div className="col-lg-7 mb-4">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-header bg-light border-bottom border-primary border-3" style={{ borderBottomStyle: 'solid !important' }}>
              <h5 className="mb-0 text-dark fw-bold">Your Accounts</h5>
            </div>
            <div className="card-body p-4">
              {accounts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-3">No accounts yet. Create one to get started.</p>
                  <a href="/accounts" className="btn btn-sm" style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
                    Create Account
                  </a>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="list-group-item d-flex justify-content-between align-items-center p-3"
                      style={{ border: 'none', borderBottom: '1px solid #eee' }}
                    >
                      <div>
                        <h6 className="mb-0 fw-bold">{account.name}</h6>
                        <small className="text-secondary">{account.type}</small>
                      </div>
                      <div className="text-end">
                        <h6 className="mb-0 fw-bolder" style={{ color: PRIMARY_COLOR }}>
                          {formatCurrency(account.balance)}
                        </h6>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions: NARROWER (col-lg-5) */}
        <div className="col-lg-5 mb-4">
          <div className="card border-0 shadow-lg h-100">
             <div className="card-header bg-light border-bottom border-primary border-3" style={{ borderBottomStyle: 'solid !important' }}>
              <h5 className="mb-0 text-dark fw-bold">Recent Transactions</h5>
            </div>
            <div className="card-body p-4">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-3">No transactions yet.</p>
                  <a href="/transactions" className="btn btn-sm" style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
                    Make Transaction
                  </a>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentTransactions.slice(0, 5).map((txn, index) => (
                    <div
                      key={txn.id}
                      className={`list-group-item d-flex justify-content-between align-items-center p-3 ${
                        index % 2 === 1 ? 'bg-light-subtle' : ''
                      }`}
                      style={{ border: 'none', borderBottom: '1px solid #eee' }}
                    >
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span
                            className={`badge rounded-pill text-uppercase ${
                              txn.type === 'DEPOSIT'
                                ? 'bg-success text-white'
                                : txn.type === 'WITHDRAWAL'
                                ? 'bg-danger text-white'
                                : 'bg-info text-white'
                            }`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {txn.type}
                          </span>
                          <small className="text-secondary">
                            {formatDate(txn.transactionDate)}
                          </small>
                        </div>
                        <p className="mb-0 fw-normal text-dark">{txn.description || 'No description'}</p>
                      </div>
                      <div className="text-end ms-3">
                        <h6
                          className={`mb-0 fw-bolder ${
                            txn.type === 'DEPOSIT' ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {txn.type === 'DEPOSIT' ? '+' : '-'}
                          {formatCurrency(txn.amount)}
                        </h6>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card-footer bg-light border-0">
              <a href="/transactions" className="btn btn-sm btn-outline-primary w-100" style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}>
                View All Transactions
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Account Summary & Quick Actions remain full width/standard */}
      
      {/* Account Summary (Still col-12) */}
      {accountSummary && accountSummary.length > 0 && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-light border-bottom border-primary border-3" style={{ borderBottomStyle: 'solid !important' }}>
                <h5 className="mb-0 text-dark fw-bold">Detailed Account Summary</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-borderless align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="py-3 px-4 text-uppercase text-secondary" style={{ fontSize: '0.85rem' }}>Account Name</th>
                        <th className="py-3 px-4 text-uppercase text-secondary" style={{ fontSize: '0.85rem' }}>Type</th>
                        <th className="py-3 px-4 text-uppercase text-secondary text-end" style={{ fontSize: '0.85rem' }}>Balance</th>
                        <th className="py-3 px-4 text-uppercase text-secondary text-end" style={{ fontSize: '0.85rem' }}># Txn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accountSummary.map((account) => (
                        <tr key={account.id}>
                          <td className="px-4">
                            <strong className='text-dark'>{account.name}</strong>
                          </td>
                          <td className="px-4">
                            <span className="badge bg-secondary-subtle text-secondary">{account.type}</span>
                          </td>
                          <td className="px-4 text-end">
                            <h6 className="mb-0 fw-bolder" style={{ color: PRIMARY_COLOR }}>
                              {formatCurrency(account.balance)}
                            </h6>
                          </td>
                          <td className="px-4 text-end text-muted">{account.transactionCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions (Still col-12) */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-light border-bottom border-primary border-3" style={{ borderBottomStyle: 'solid !important' }}>
              <h5 className="mb-0 text-dark fw-bold">Quick Actions</h5>
            </div>
            <div className="card-body p-4">
              <div className="d-flex gap-3 flex-wrap">
                <a href="/accounts" className="btn btn-outline-primary px-4 py-2 fw-medium" style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}>
                  <span className="me-2">📊</span> Manage Accounts
                </a>
                <a href="/transactions" className="btn btn-outline-primary px-4 py-2 fw-medium" style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}>
                  <span className="me-2">💳</span> Make Transaction
                </a>
                <a href="/analytics" className="btn btn-outline-primary px-4 py-2 fw-medium" style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}>
                  <span className="me-2">📈</span> View Analytics
                </a>
                <a href="/profile" className="btn btn-outline-primary px-4 py-2 fw-medium" style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}>
                  <span className="me-2">👤</span> Edit Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ADVANCED STYLING CSS BLOCK (UNCHANGED) --- */}
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

        /* Card Micro-Interaction setup */
        .advanced-card {
          overflow: hidden;
          position: relative;
        }
        
        /* Icon Micro-Interaction on card hover */
        .advanced-card:hover .advanced-icon {
          transform: translateY(-5px) scale(1.05);
          transition: transform 0.3s ease-in-out;
        }
        .advanced-icon {
          transition: transform 0.3s ease-in-out;
        }
        
        /* Transaction List Zebra Striping Color */
        .bg-light-subtle {
          background-color: #f7f9fc;
        }

      `}</style>
    </div>
  );
};

export default DashboardPage;