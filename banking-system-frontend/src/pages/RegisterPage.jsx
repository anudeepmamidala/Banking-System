import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  validateEmail,
  validatePassword,
  validateFullName,
} from '../utils/validators';

// Define a slightly darker primary color for a premium feel
const PRIMARY_COLOR = '#0056b3';

const RegisterPage = () => {
  // --- START OF ORIGINAL LOGIC (UNCHANGED) ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateFullName(fullName)) {
      setError('Full name must be at least 2 characters');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  // --- END OF ORIGINAL LOGIC (UNCHANGED) ---

  return (
    // Apply background gradient and full viewport height
    <div 
      className="container-fluid d-flex justify-content-center align-items-center" 
      style={{ 
        height: '100vh', 
        background: 'linear-gradient(135deg, #f9fbfd 0%, #eef2f7 100%)' // Subtle, professional gradient
      }}
    >
      <div className="col-md-6 col-lg-4">
        {/* God-Tier Card Styling: Deep shadow, top accent line, and rounded corners */}
        <div 
          className="card border-0 shadow-2xl" 
          style={{ 
              borderRadius: '12px', 
              overflow: 'hidden',
              borderTop: `5px solid #28a745` // Using success color for registration/creation
          }}
        >
          <div className="card-body p-5">
            <div className="text-center mb-4">
              {/* Enhanced Title/Branding */}
              <div 
                className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '60px', height: '60px' }}
              >
                  <span className="text-success" style={{ fontSize: '28px' }}>🚀</span>
              </div>
              <h2 className="card-title fw-bolder mb-1" style={{ color: '#212529' }}>Create Account</h2>
              <p className="text-secondary">Start your financial journey with us</p>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm" role="alert">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError('')}
                  aria-label="Close"
                ></button>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label fw-medium text-dark">
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
              </div>
              
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-medium text-dark">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-medium text-dark">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password (min 6 characters)"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label fw-medium text-dark">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-success btn-lg w-100 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Registering...
                  </>
                ) : (
                  'Register Account'
                )}
              </button>
            </form>
            
            <hr className="my-4" />
            
            <p className="text-center mb-0 text-muted">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-decoration-none fw-bold"
                style={{ color: PRIMARY_COLOR }}
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Adding a global shadow class for the advanced card style */}
      <style jsx="true">{`
        .shadow-2xl {
            box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;