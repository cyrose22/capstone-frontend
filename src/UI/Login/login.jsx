import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import logo from '../../assets/logo.png';
import './login.css';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // ✅ NEW STATES
  const [recoverMode, setRecoverMode] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const otpInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (useOtp && otpSent && !otpVerified) {
      otpInputRef.current?.focus();
    }
  }, [useOtp, otpSent, otpVerified]);

  const handleLogin = async (e) => {
    e.preventDefault();

    await toast.promise(
      axios.post(
        'https://capstone-backend-kiax.onrender.com/login',
        { username, password }
      ),
      {
        pending: 'Logging in...',
        success: {
          render({ data }) {
            handleSuccess(data.data[0]);
            return 'Login successful!';
          }
        },
        error: {
          render({ data }) {
            return data.response?.data?.message || 'Login failed';
          }
        }
      }
    );
  };

  // ✅ UPDATED (handles both OTP login & recover)
  const handleSendOtp = async () => {
    if (!username) {
      toast.error("Please enter your email first.");
      return;
    }

    const endpoint = recoverMode
      ? 'https://capstone-backend-kiax.onrender.com/forgot-password'
      : 'https://capstone-backend-kiax.onrender.com/send-login-otp';

    await toast.promise(
      axios.post(endpoint, { email: username }),
      {
        pending: 'Sending OTP...',
        success: 'OTP sent successfully!',
        error: {
          render({ data }) {
            return data.response?.data?.message || 'Failed to send OTP';
          }
        }
      }
    );

    setOtpSent(true);
  };

  // ✅ UPDATED (handles login OR verify for reset)
  const handleOtpLogin = async () => {
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits.");
      return;
    }

    if (recoverMode) {
      await toast.promise(
        axios.post(
          'https://capstone-backend-kiax.onrender.com/verify-forgot-otp',
          { email: username, otp }
        ),
        {
          pending: 'Verifying OTP...',
          success: 'OTP verified!',
          error: {
            render({ data }) {
              return data.response?.data?.message || 'Invalid or expired OTP';
            }
          }
        }
      );

      setOtpVerified(true);
    } else {
      await toast.promise(
        axios.post(
          'https://capstone-backend-kiax.onrender.com/login-otp',
          { username, otp }
        ),
        {
          pending: 'Verifying OTP...',
          success: {
            render({ data }) {
              handleSuccess(data.data[0]);
              return 'Login successful!';
            }
          },
          error: {
            render({ data }) {
              return data.response?.data?.message || 'Invalid or expired OTP';
            }
          }
        }
      );
    }
  };

  // ✅ NEW FUNCTION
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    await toast.promise(
      axios.post(
        'https://capstone-backend-kiax.onrender.com/reset-password',
        { email: username, newPassword }
      ),
      {
        pending: 'Resetting password...',
        success: 'Password reset successful!',
        error: {
          render({ data }) {
            return data.response?.data?.message || 'Failed to reset password';
          }
        }
      }
    );

    // Reset UI
    setRecoverMode(false);
    setUseOtp(false);
    setOtpSent(false);
    setOtpVerified(false);
    setUsername('');
    setOtp('');
    setNewPassword('');
  };

  const handleSuccess = (userData) => {
    const role = userData.role?.toLowerCase().trim();

    const user = {
      id: userData.id,
      fullname: userData.fullname,
      username: userData.username,
      role: role,
      token: userData.token
    };

    localStorage.setItem('user', JSON.stringify(user));

    if (role === 'admin' || role === 'staff') {
      navigate('/dashboard/admin');
    } else {
      navigate('/dashboard/consumer');
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">

        <div className="brand-section">
          <img src={logo} alt="Logo" className="brand-logo" />
          <div className="brand-text">
            <h1>Oscar D’Great</h1>
            <p>Pet Supplies Trading</p>
          </div>
        </div>

        <div className="login-tabs">
          <button
            className={!useOtp ? 'active' : ''}
            onClick={() => {
              setUseOtp(false);
              setRecoverMode(false);
            }}
          >
            Password
          </button>

          <button
            className={useOtp ? 'active' : ''}
            onClick={() => {
              setUseOtp(true);
              setRecoverMode(false);
            }}
          >
            {recoverMode ? 'Recover Password' : 'OTP Login'}
          </button>
        </div>

        {!useOtp ? (
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            <button type="submit" className="primary-btn">
              Login
            </button>

            <div className="extra-links">
              {/* ✅ Changed to Recover Password (no redirect) */}
              <span
                className="forgot-link"
                onClick={() => {
                  setUseOtp(true);
                  setRecoverMode(true);
                  setOtpSent(false);
                  setOtpVerified(false);
                  setUsername('');
                  setOtp('');
                }}
              >
                Recover Password
              </span>
            </div>
          </form>
        ) : (
          <div className="otp-section">
            <input
              type="text"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {!otpSent ? (
              <button className="primary-btn" onClick={handleSendOtp}>
                Send OTP
              </button>
            ) : !otpVerified ? (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  ref={otpInputRef}
                />
                <button className="primary-btn" onClick={handleOtpLogin}>
                  Verify OTP
                </button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button className="primary-btn" onClick={handleResetPassword}>
                  Change Password
                </button>
              </>
            )}
          </div>
        )}

        <p className="message">{message}</p>

        <div className="register-link">
          Don’t have an account?
          <Link to="/register"> Register here</Link>
        </div>

      </div>
    </div>
  );
}

export default LoginForm;