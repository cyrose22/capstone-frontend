import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './register.css';

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
      await axios.post(
        'https://capstone-backend-kiax.onrender.com/register',
        {
          ...formData,
          role: 'user'
        }
      );

      setOtpSent(true);
      setMessage("OTP sent to your email/phone.");
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed.');
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
    } catch {
      setMessage("❌ Invalid OTP.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">

        <h2>Create Account</h2>
        <p className="subtext">Join Oscar D'Great Pet Supplies</p>

        {!otpSent ? (
          <form onSubmit={handleRegister}>

            <input name="fullname" placeholder="Full Name" onChange={handleChange} required />
            <input name="username" placeholder="Email or Username" onChange={handleChange} required />
            <input name="contact" placeholder="Contact Number" onChange={handleChange} required />

            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />

            <h4>Address Information</h4>

            <input name="province" placeholder="Province" onChange={handleChange} required />
            <input name="municipality" placeholder="Municipality" onChange={handleChange} required />
            <input name="barangay" placeholder="Barangay" onChange={handleChange} required />
            <input name="street" placeholder="Street" onChange={handleChange} />
            <input name="block" placeholder="Block #" onChange={handleChange} />

            <button type="submit" className="primary-btn">
              Register & Send OTP
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