import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
import { useNavigate, Link } from 'react-router-dom';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // const res = await axios.post(
      //   'http://localhost:5000/login',
      const res = await axios.post(
        'https://capstone-backend-kiax.onrender.com/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const userData = res.data;

      setMessage(userData.message);

      // Store the full object
      localStorage.setItem('user', JSON.stringify(userData));

      // Store individual keys for quick access
      localStorage.setItem('role', userData.role);
      localStorage.setItem('username', userData.username);
      localStorage.setItem('fullname', userData.fullname);
      localStorage.setItem('id', userData.id);
      localStorage.setItem('contact', userData.contact);

      // Redirect based on role
      if (userData.role === 'admin' || userData.role === 'staff') {
        navigate('/admin-dashboard');
      } else {
        navigate('/consumer-dashboard');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="brand">Oscar D'Gr8</h1>
        <p className="subtitle">Pet Supplies Trading</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group password-group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="password-input"
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>


          <button type="submit" className="login-btn">Login</button>
        </form>

        <p className="message">{message}</p>

        <p className="register-link">
          Don’t have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
