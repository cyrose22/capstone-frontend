import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from './Sidebar/Sidebar';
import LoginForm from './Login/login';
import Registration from './Register/registration';
import AdminDashboard from './Admin/AdminDashboard';
import SalesDashboard from './Sales/SalesDashboard';
import ProductDashboard from './Products/ProductDashboard';
import ConsumerDashboard from './ConsumerDashboard/ConsumerDashboard';
import Chatbot from './Chat/ChatBot';

import './app.css';


// ==========================
// Dashboard layout with sidebar
// ==========================
function DashboardLayout() {
  const role = localStorage.getItem('role');
  const showSidebar = role === 'admin' || role === 'staff';

  return (
    <div className="modern-layout">
      {showSidebar && <Sidebar />}
      <div
        className="dashboard-main"
        style={{ width: showSidebar ? 'calc(100% - 240px)' : '100%' }}
      >
        <Outlet />
      </div>
    </div>
  );
}


// ==========================
// 🔐 Route guard
// ==========================
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // If no token → redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}


// ==========================
// Wrapper to check route & auth
// ==========================
function AppWrapper() {
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Hide chatbot on login/register OR if not logged in
  const hideChatBot =
    location.pathname === '/' ||
    location.pathname === '/register' ||
    !token;

  return (
    <>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<Registration />} />

        {/* Optional redirects */}
        <Route path="/admin-dashboard" element={<Navigate to="/dashboard/admin" />} />
        <Route path="/sales-dashboard" element={<Navigate to="/dashboard/sales" />} />
        <Route path="/product-dashboard" element={<Navigate to="/dashboard/products" />} />
        <Route path="/consumer-dashboard" element={<Navigate to="/dashboard/consumer" />} />

        {/* 🔐 Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="sales" element={<SalesDashboard />} />
          <Route path="products" element={<ProductDashboard />} />
          <Route path="consumer" element={<ConsumerDashboard />} />
        </Route>

      </Routes>

      {/* Chatbot only when logged in */}
      {!hideChatBot && <Chatbot />}
    </>
  );
}


// ==========================
// Main App
// ==========================
function App() {
  return (
    <BrowserRouter>
      <AppWrapper />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default App;