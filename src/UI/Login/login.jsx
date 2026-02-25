import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
import { useNavigate, Link } from 'react-router-dom';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'https://capstone-backend-kiax.onrender.com/login',
        { username, password }
      );

      handleSuccess(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSendOtp = async () => {
    if (!username) {
      setMessage("Please enter your email first.");
      return;
    }

    try {
      await axios.post(
        'https://capstone-backend-kiax.onrender.com/send-login-otp',
        { username }
      );

      setOtpSent(true);
      setMessage('OTP sent to your email');

    } catch (err) {
      if (err.response?.status === 404) {
        setMessage('Account not found. Redirecting to register...');
        setTimeout(() => navigate('/register'), 1500);
      } else {
        setMessage(err.response?.data?.message || 'Failed to send OTP');
      }
    }
  };

  const handleOtpLogin = async () => {
    if (otp.length !== 6) {
      setMessage("OTP must be 6 digits.");
      return;
    }

    try {
      const res = await axios.post(
        'https://capstone-backend-kiax.onrender.com/login-otp',
        { username, otp }
      );

      handleSuccess(res.data);

    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid or expired OTP");
    }
  };

  const handleSuccess = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role);

    if (userData.role === 'admin' || userData.role === 'staff') {
      navigate('/admin-dashboard');
    } else {
      navigate('/consumer-dashboard');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="brand-section">
          <h1>Oscar D'Great</h1>
          <p>Pet Supplies Trading</p>
        </div>

        <div className="login-tabs">
          <button
            className={!useOtp ? 'active' : ''}
            onClick={() => setUseOtp(false)}
          >
            Password
          </button>
          <button
            className={useOtp ? 'active' : ''}
            onClick={() => setUseOtp(true)}
          >
            OTP Login
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
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </form>
        ) : (
          <div className="otp-section">
            <input
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {!otpSent ? (
              <button className="primary-btn" onClick={handleSendOtp}>
                Send OTP
              </button>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button className="primary-btn" onClick={handleOtpLogin}>
                  Verify & Login
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