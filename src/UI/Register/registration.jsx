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
  const [message, setMessage] = useState('');
  const [showAddress, setShowAddress] = useState(false); // ✅ NEW
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

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
      await axios.post(
        'https://capstone-backend-kiax.onrender.com/verify-otp',
        {
          username: formData.username,
          otp
        }
      );

      setMessage("✅ Account verified successfully!");
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ OTP verification failed.");
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

            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />

            {/* ✅ Collapsible Address Section */}
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

        {message && <p className="message">{message}</p>}

        <p className="redirect-text">
          Already have an account? <Link to="/">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default RegisterForm;