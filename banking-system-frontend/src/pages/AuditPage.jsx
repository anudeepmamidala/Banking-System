import React, { useEffect, useState } from 'react';
import { auditService } from '../services/auditService';
import { formatDateTime } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Define a slightly darker primary color for a premium feel
const PRIMARY_COLOR = '#0056b3';

const AuditPage = () => {
  // --- START OF ORIGINAL LOGIC (UNCHANGED) ---
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchLogs();
    // Reset logs only if page is reset externally, otherwise rely on the logic inside fetchLogs
  }, [page]); // Re-fetch when page changes

  const fetchLogs = async () => {
    // Only show spinner if it's the initial load or a page change when data already exists
    if (page === 0) setLoading(true); 
    
    try {
      // Note: Added logging for better error handling visibility
      const res = await auditService.getAuditLogs(page, 20); 
      
      const newLogs = res.data || [];
      const hasMoreData = newLogs.length === 20;

      setLogs((prevLogs) => (page === 0 ? newLogs : [...prevLogs, ...newLogs]));
      setHasMore(hasMoreData);
      setError('');
    } catch (err) {
      console.error('Audit log fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };
  // --- END OF ORIGINAL LOGIC (UNCHANGED) ---

  // Check loading state differently for initial load vs 'Load More'
  if (loading && logs.length === 0) return <LoadingSpinner />;

  // Helper function to dynamically color the action badge
  const getActionBadge = (action) => {
    const actionMap = {
      CREATE: 'bg-success-subtle text-success',
      UPDATE: 'bg-primary-subtle text-primary',
      DELETE: 'bg-danger-subtle text-danger',
      LOGIN: 'bg-info-subtle text-info',
      LOGOUT: 'bg-warning-subtle text-warning',
    };
    return actionMap[action.toUpperCase()] || 'bg-secondary-subtle text-secondary';
  };

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
              System Audit Logs
            </h1>
            <p className="text-secondary fs-6">
              Detailed record of all system and user activities.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 shadow-sm" role="alert">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-lg">
        <div className="card-header bg-light border-bottom border-primary border-3" style={{ borderBottomStyle: 'solid !important' }}>
          <h5 className="mb-0 text-dark fw-bold">Activity Feed</h5>
        </div>
        <div className="card-body p-0">
          {logs.length === 0 ? (
            <p className="text-muted text-center py-5">No audit logs found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-borderless align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-3 px-4 text-uppercase text-secondary" style={{ width: '15%', fontSize: '0.8rem' }}>Timestamp</th>
                    <th className="py-3 px-4 text-uppercase text-secondary" style={{ width: '15%', fontSize: '0.8rem' }}>Action</th>
                    <th className="py-3 px-4 text-uppercase text-secondary" style={{ width: '15%', fontSize: '0.8rem' }}>Entity</th>
                    <th className="py-3 px-4 text-uppercase text-secondary" style={{ width: '55%', fontSize: '0.8rem' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="audit-row">
                      <td className="px-4">
                        <small className="text-muted">{formatDateTime(log.createdAt)}</small>
                      </td>
                      <td className="px-4">
                        <span className={`badge rounded-pill text-uppercase fw-medium ${getActionBadge(log.action)}`} style={{ fontSize: '0.75rem' }}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 fw-medium text-dark">{log.entityType}</td>
                      <td className="px-4">
                        <small className="text-secondary">{log.details || 'N/A'}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hasMore && (
            <div className="text-center pt-4 pb-4">
              <button
                className="btn btn-outline-primary px-5 fw-medium"
                onClick={() => setPage(page + 1)}
                disabled={loading}
                style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
              >
                {loading && logs.length > 0 ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  'Load More Activity'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- ADVANCED STYLING CSS BLOCK --- */}
      <style jsx="true">{`
        /* Table enhancements for visual separation */
        .table-striped > tbody > tr:nth-of-type(odd) {
            background-color: #f7f9fc; /* Use subtle off-white for striping */
        }
        /* Style for subtle text color variations */
        .bg-success-subtle { background-color: #e6ffed !important; }
        .text-success { color: #155724 !important; }
        .bg-primary-subtle { background-color: #e0f0ff !important; }
        .text-primary { color: #004085 !important; }
        .bg-danger-subtle { background-color: #fcecec !important; }
        .text-danger { color: #721c24 !important; }
        .bg-info-subtle { background-color: #d4edee !important; }
        .text-info { color: #0c5460 !important; }
        .bg-warning-subtle { background-color: #fff3cd !important; }
        .text-warning { color: #856404 !important; }

        .audit-row:hover {
            background-color: #f0f4f7 !important;
        }
      `}</style>
    </div>
  );
};

export default AuditPage;