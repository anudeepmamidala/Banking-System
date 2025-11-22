import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { validatePassword } from '../utils/validators';

// Define a slightly darker primary color for a premium feel
const PRIMARY_COLOR = '#0056b3';

const ProfilePage = () => {
  // --- START OF ORIGINAL LOGIC (UNCHANGED) ---
  const { user, updateProfile, changePassword } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile(fullName);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword) {
      setError('Please enter your current password');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };
  // --- END OF ORIGINAL LOGIC (UNCHANGED) ---

  // Helper to format creation date
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

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
              User Profile
            </h1>
            <p className="text-secondary fs-6">
              Manage your personal information and security settings.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show border-0 shadow-sm" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      <div className="row">
        
        {/* Profile Card (col-md-4 - WIDER sidebar for prominence) */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-lg h-100 p-3">
            <div className="card-body text-center">
              <div className="mb-4">
                {/* Larger, styled initial avatar */}
                <div
                  className="text-white rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm"
                  style={{ 
                      width: '100px', 
                      height: '100px', 
                      fontSize: '48px',
                      backgroundColor: PRIMARY_COLOR
                  }}
                >
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
              </div>
              <h4 className="card-title fw-bolder text-dark mb-1">{user?.fullName || 'N/A'}</h4>
              <p className="card-text text-primary small fw-medium mb-4">{user?.email}</p>
              
              <hr className="my-3" />
              
              <ul className="list-unstyled text-center p-0 m-0">
                <li className="mb-2">
                  <p className="text-muted mb-0 small text-uppercase fw-medium">Member Since</p>
                  <p className="fw-bold text-dark mb-0">{memberSince}</p>
                </li>
                {/* Add a placeholder for User ID/Role for depth */}
                <li className="mt-3">
                    <span className="badge bg-secondary-subtle text-secondary py-2 px-3">
                        User ID: {user?.id || 'N/A'}
                    </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Settings Panel (col-md-8) */}
        <div className="col-md-8 mb-4">
          <div className="card border-0 shadow-lg h-100">
            
            {/* Styled Tabs */}
            <div className="card-header p-0">
              <ul className="nav nav-pills nav-fill bg-light p-2 border-bottom">
                <li className="nav-item">
                  <button
                    className={`nav-link fw-medium ${activeTab === 'profile' ? 'active shadow-sm' : ''}`}
                    onClick={() => setActiveTab('profile')}
                    style={{ backgroundColor: activeTab === 'profile' ? PRIMARY_COLOR : 'transparent', color: activeTab === 'profile' ? 'white' : '#6c757d' }}
                  >
                    Edit Profile 📝
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link fw-medium ${activeTab === 'password' ? 'active shadow-sm' : ''}`}
                    onClick={() => setActiveTab('password')}
                    style={{ backgroundColor: activeTab === 'password' ? '#dc3545' : 'transparent', color: activeTab === 'password' ? 'white' : '#6c757d' }}
                  >
                    Change Password 🔑
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body p-4">
              
              {/* Edit Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile}>
                  <h5 className="mb-4 fw-bold text-dark">Personal Information</h5>
                  
                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label fw-medium">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                    <small className="text-muted">This name will be displayed across your account.</small>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg bg-light"
                      id="email"
                      value={user?.email || ''}
                      placeholder="Your email"
                      disabled
                    />
                    <small className="text-danger fw-medium">Email cannot be changed here. Contact support to update your email.</small>
                  </div>

                  <div className="d-flex gap-3 pt-3 border-top">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg fw-medium px-5 shadow-sm"
                      disabled={submitting}
                      style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg fw-medium px-4"
                      onClick={() => {
                        setFullName(user?.fullName || '');
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </form>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword}>
                  <h5 className="mb-4 fw-bold text-danger">Security Update</h5>

                  <div className="mb-3">
                    <label htmlFor="oldPassword" className="form-label fw-medium">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="oldPassword"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label fw-medium">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      required
                    />
                    <small className="text-muted">Must be at least 6 characters and include a mix of cases/numbers.</small>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-medium">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>

                  <div className="alert alert-warning border-0 shadow-sm" role="alert">
                    <i className="bi bi-shield-fill-exclamation me-2"></i>
                    <strong>Security Reminder:</strong> Choose a **strong, unique** password that you haven't used elsewhere.
                  </div>

                  <div className="d-flex gap-3 pt-3 border-top">
                    <button
                      type="submit"
                      className="btn btn-danger btn-lg fw-medium px-5 shadow-sm"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Changing...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg fw-medium px-4"
                      onClick={() => {
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      Clear Fields
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
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
      `}</style>
    </div>
  );
};

export default ProfilePage;