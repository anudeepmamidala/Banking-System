import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/validators';

// Define a slightly darker primary color for a premium feel
const PRIMARY_COLOR = '#0056b3';

const LoginPage = () => {
  // --- START OF ORIGINAL LOGIC (UNCHANGED) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      // Use optional chaining carefully to avoid crashes
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
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
        {/* God-Tier Card Styling: Deep shadow, white background, and primary color accent */}
        <div 
          className="card border-0 shadow-2xl" 
          style={{ 
              borderRadius: '12px', 
              overflow: 'hidden',
              borderTop: `5px solid ${PRIMARY_COLOR}` // Top accent line
          }}
        >
          <div className="card-body p-5">
            <div className="text-center mb-5">
              {/* Enhanced Title/Branding */}
              <div 
                className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '60px', height: '60px' }}
              >
                  <span className="text-primary" style={{ fontSize: '28px' }}>🏦</span>
              </div>
              <h2 className="card-title fw-bolder mb-1" style={{ color: '#212529' }}>Welcome Back</h2>
              <p className="text-secondary">Sign in to access your financial dashboard</p>
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
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label fw-medium text-dark">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                disabled={loading}
                style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
              >
                {loading ? (
                  <>
                    <span 
                      className="spinner-border spinner-border-sm me-2" 
                      role="status" 
                      aria-hidden="true"
                    ></span>
                    Logging in...
                  </>
                ) : (
                  'Secure Login'
                )}
              </button>
            </form>

            <hr className="my-4" />

            <p className="text-center mb-0 text-muted">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-decoration-none fw-bold"
                style={{ color: PRIMARY_COLOR }}
              >
                Register here
              </Link>
            </p>

            {/* Enhanced Demo Credentials Box */}
            <div className="mt-4 p-3 rounded" style={{ backgroundColor: '#eef2f7', border: '1px solid #dee2e6' }}>
              <small className="text-secondary d-block text-center fw-medium mb-1">
                💡 Demo Credentials for Testing
              </small>
              <small className="text-secondary d-block text-center">
                Email: <span className="fw-bold">test@test.com</span>
              </small>
              <small className="text-secondary d-block text-center">
                Password: <span className="fw-bold">123456</span>
              </small>
            </div>
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

export default LoginPage;