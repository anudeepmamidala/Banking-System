import React, { useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';
import { formatCurrency } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Define a slightly darker primary color for a premium feel
const PRIMARY_COLOR = '#0056b3';

const AnalyticsPage = () => {
  // --- START OF ORIGINAL LOGIC (UNCHANGED) ---
  const [totals, setTotals] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [trends, setTrends] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Ensure all service calls are wrapped in checks to avoid crashes if one fails
        const [totalsRes, breakdownRes, trendsRes, summaryRes] = await Promise.all([
          transactionService.getTotalStats().catch(e => { console.error("Totals failed", e); return { data: null }; }),
          transactionService.getSpendingBreakdown('MONTHLY').catch(e => { console.error("Breakdown failed", e); return { data: [] }; }),
          transactionService.getMonthlyTrends().catch(e => { console.error("Trends failed", e); return { data: [] }; }),
          transactionService.getAccountSummary().catch(e => { console.error("Summary failed", e); return { data: [] }; }),
        ]);

        setTotals(totalsRes.data);
        setBreakdown(breakdownRes.data);
        setTrends(trendsRes.data);
        setSummary(summaryRes.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner />;
  // --- END OF ORIGINAL LOGIC (UNCHANGED) ---

  const netBalance = (totals?.totalIncome || 0) - (totals?.totalExpenses || 0);

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
              Financial Analytics
            </h1>
            <p className="text-secondary fs-6">
              Deep dive into your income, spending, and financial trends.
            </p>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger border-0 shadow-sm">{error}</div>}

      {/* Summary Cards */}
      {totals && (
        <div className="row mb-5">
          {/* Card 1: Total Income (Success/Green Accent) */}
          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card border-0 shadow-lg h-100 transition-shadow-hover" style={{ borderLeft: '5px solid #28a745' }}>
              <div className="card-body p-4">
                <h6 className="card-title text-uppercase text-muted fw-bold mb-1">Total Income</h6>
                <h2 className="card-text fw-bolder text-success">
                  {formatCurrency(totals.totalIncome || 0)}
                </h2>
              </div>
            </div>
          </div>
          
          {/* Card 2: Total Expenses (Danger/Red Accent) */}
          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card border-0 shadow-lg h-100 transition-shadow-hover" style={{ borderLeft: '5px solid #dc3545' }}>
              <div className="card-body p-4">
                <h6 className="card-title text-uppercase text-muted fw-bold mb-1">Total Expenses</h6>
                <h2 className="card-text text-danger fw-bolder">
                  {formatCurrency(totals.totalExpenses || 0)}
                </h2>
              </div>
            </div>
          </div>
          
          {/* Card 3: Net Balance (Dynamic Primary/Accent Color) */}
          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card border-0 shadow-lg h-100 transition-shadow-hover" style={{ borderLeft: `5px solid ${netBalance >= 0 ? PRIMARY_COLOR : '#dc3545'}` }}>
              <div className="card-body p-4">
                <h6 className="card-title text-uppercase text-muted fw-bold mb-1">Net Balance</h6>
                <h2 className="card-text fw-bolder" style={{ color: netBalance >= 0 ? PRIMARY_COLOR : '#dc3545' }}>
                  {formatCurrency(netBalance)}
                </h2>
              </div>
            </div>
          </div>
          
          {/* Card 4: Total Transactions (Info/Blue Accent) */}
          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card border-0 shadow-lg h-100 transition-shadow-hover" style={{ borderLeft: '5px solid #17a2b8' }}>
              <div className="card-body p-4">
                <h6 className="card-title text-uppercase text-muted fw-bold mb-1">Total Transactions</h6>
                <h2 className="card-text text-info fw-bolder">{totals.totalTransactions || 0}</h2>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spending Breakdown & Monthly Trends - ASYMMETRICAL LAYOUT */}
      {(breakdown && breakdown.length > 0 || trends && trends.length > 0) && (
        <div className="row mb-5">
          
          {/* Spending Breakdown (WIDER: col-lg-7) */}
          {breakdown && breakdown.length > 0 && (
            <div className="col-lg-7 mb-4">
              <div className="card border-0 shadow-lg h-100">
                <div className="card-header bg-light border-bottom border-primary border-3" style={{ borderBottomStyle: 'solid !important' }}>
                  <h5 className="mb-0 text-dark fw-bold">Spending Breakdown by Category</h5>
                </div>
                <div className="card-body p-4">
                  
                  {/* CHART VISUAL PLACEHOLDER */}
                  <div className="mb-4 text-center">
                    {/* Placeholder for a Doughnut Chart */}
                    <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-center mx-auto" style={{ width: '150px', height: '150px', border: '3px dashed #ccc' }}>
                        <span className="text-secondary fw-bold">Chart Area</span>
                    </div>
                    <small className="text-muted d-block mt-2">Distribution of spending across categories.</small>
                  </div>
                  
                  {/* Detailed Progress Bars */}
                  {breakdown.map((item, index) => (
                    <div key={item.category} className={`mb-3 pb-2 ${index < breakdown.length - 1 ? 'border-bottom' : ''}`}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-medium text-dark">{item.category}</span>
                        <span className="fw-bolder text-danger">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-danger"
                          role="progressbar"
                          // Calculate percentage relative to the largest expense
                          style={{
                            width: `${((item.amount / breakdown[0]?.amount) * 100).toFixed(0)}%`,
                          }}
                          aria-valuenow={item.amount}
                          aria-valuemin="0"
                          aria-valuemax={breakdown[0]?.amount}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Monthly Trends (NARROWER: col-lg-5) */}
          {trends && trends.length > 0 && (
            <div className="col-lg-5 mb-4">
              <div className="card border-0 shadow-lg h-100">
                <div className="card-header bg-light border-bottom border-primary border-3" style={{ borderBottomStyle: 'solid !important' }}>
                  <h5 className="mb-0 text-dark fw-bold">Monthly Trends</h5>
                </div>
                <div className="card-body p-4">

                  {/* CHART VISUAL PLACEHOLDER */}
                  <div className="mb-4">
                    {/* Placeholder for a Line Chart */}
                    <div className="bg-light rounded-3 d-flex align-items-center justify-content-center" style={{ height: '150px', border: '1px solid #eee' }}>
                        <span className="text-secondary">Line Graph Trend</span>
                    </div>
                    <small className="text-muted d-block mt-2">Net flow over the past months.</small>
                  </div>

                  {/* Trends Table */}
                  <div className="table-responsive">
                    <table className="table table-sm table-striped table-borderless align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="text-uppercase text-secondary" style={{ fontSize: '0.8rem' }}>Month</th>
                          <th className="text-uppercase text-secondary text-end" style={{ fontSize: '0.8rem' }}>Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trends.slice(0, 6).map((trend) => (
                          <tr key={trend.month} className={`${(trend.income - trend.expense) >= 0 ? 'text-success' : 'text-danger'}`}>
                            <td className="fw-medium text-dark">{trend.month}</td>
                            <td className="fw-bolder text-end">
                              {formatCurrency(trend.income - trend.expense)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Summary */}
      {summary && summary.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-light border-bottom border-primary border-3" style={{ borderBottomStyle: 'solid !important' }}>
                <h5 className="mb-0 text-dark fw-bold">Account Summary</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-borderless align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3 px-4 text-uppercase text-secondary" style={{ fontSize: '0.85rem' }}>Account Name</th>
                        <th className="py-3 px-4 text-uppercase text-secondary" style={{ fontSize: '0.85rem' }}>Type</th>
                        <th className="py-3 px-4 text-uppercase text-secondary text-end" style={{ fontSize: '0.85rem' }}>Balance</th>
                        <th className="py-3 px-4 text-uppercase text-secondary text-end" style={{ fontSize: '0.85rem' }}>Transactions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.map((account) => (
                        <tr key={account.id}>
                          <td className="px-4 fw-bold text-dark">{account.name}</td>
                          <td className="px-4">
                            <span className="badge bg-secondary-subtle text-secondary">{account.type}</span>
                          </td>
                          <td className="px-4 fw-bolder text-end" style={{ color: PRIMARY_COLOR }}>
                            {formatCurrency(account.balance)}
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
        
        /* Progress bar color for spending breakdown */
        .progress-bar {
            background-color: #dc3545 !important; /* Ensure consistent red for expenses */
        }
        
        /* Table enhancements for visual separation */
        .table-striped > tbody > tr:nth-of-type(odd) {
            background-color: #f7f9fc; /* Use subtle off-white for striping */
        }
      `}</style>
    </div>
  );
};

export default AnalyticsPage;