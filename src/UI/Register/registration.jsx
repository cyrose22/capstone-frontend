import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './register.css';
import logo from '../../assets/logo.png';
import { toast } from 'react-toastify';

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    contact: '',
    password: '',
    confirmPassword: '',
    province: '',
    municipality: '',
    barangay: '',
    street: '',
    block: ''
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Live password match validation
    if (
      e.target.name === "password" ||
      e.target.name === "confirmPassword"
    ) {
      if (
        formData.password !== formData.confirmPassword &&
        e.target.value !== formData.password
      ) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError('');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    setPasswordError('');

    try {
      setLoading(true);

      await toast.promise(
        axios.post(
          'https://capstone-backend-kiax.onrender.com/register',
          {
            ...formData,
            role: 'user'
          }
        ),
        {
          pending: 'Sending OTP...',
          success: 'OTP sent to your email address!',
          error: {
            render({ data }) {
              return data.response?.data?.message || 'Registration failed.';
            }
          }
        }
      );

      setOtpSent(true);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      await toast.promise(
        axios.post(
          'https://capstone-backend-kiax.onrender.com/verify-otp',
          {
            username: formData.username,
            otp
          }
        ),
        {
          pending: 'Verifying OTP...',
          success: 'Account verified successfully!',
          error: {
            render({ data }) {
              return data.response?.data?.message || "OTP verification failed.";
            }
          }
        }
      );

      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">

        <div className="brand-section">
          <img src={logo} alt="Oscar Logo" className="brand-logo" />
          <h2>Create Account</h2>
          <p className="subtext">Join Oscar D’Great Pet Supplies</p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleRegister}>

            <input name="fullname" placeholder="Full Name" onChange={handleChange} required />
            <input 
              type="email"
              name="username" 
              placeholder="Email Address" 
              onChange={handleChange} 
              required 
            />
            <input name="contact" placeholder="Contact Number" onChange={handleChange} required />

            {/* Password */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className={passwordError ? "input-error" : ""}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
                className={passwordError ? "input-error" : ""}
                required
              />
              <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? "🙈" : "👁️"}
              </span>
            </div>

            {passwordError && (
              <p className="error-text">{passwordError}</p>
            )}

            {/* Collapsible Address */}
            <div 
              className="address-toggle"
              onClick={() => setShowAddress(!showAddress)}
            >
              <h4 className="section-title">
                Address Information {showAddress ? "▲" : "▼"}
              </h4>
            </div>

            {showAddress && (
              <div className="address-section">
                <input name="province" placeholder="Province" onChange={handleChange} required />
                <input name="municipality" placeholder="Municipality" onChange={handleChange} required />
                <input name="barangay" placeholder="Barangay" onChange={handleChange} required />
                <input name="street" placeholder="Street (Optional)" onChange={handleChange} />
                <input name="block" placeholder="Block # (Optional)" onChange={handleChange} />
              </div>
            )}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Sending..." : "Register & Send OTP"}
            </button>

          </form>
        ) : (
          <div className="otp-section">
            <h4>Enter OTP</h4>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button className="primary-btn" onClick={verifyOtp}>
              Verify Account
            </button>
          </div>
        )}

        <p className="redirect-text">
          Already have an account? <Link to="/">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default RegisterForm;