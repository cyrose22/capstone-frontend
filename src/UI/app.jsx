import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';

import Sidebar from './Sidebar/Sidebar';
import LoginForm from './Login/login';
import Registration from './Register/registration';
import AdminDashboard from './Admin/AdminDashboard';
import SalesDashboard from './Sales/SalesDashboard';
import ProductDashboard from './Products/ProductDashboard';
import ConsumerDashboard from './ConsumerDashboard/ConsumerDashboard';
import Chatbot from './Chat/ChatBot';

import './app.css';

// Dashboard layout with sidebar
function DashboardLayout() {
  const user = JSON.parse(localStorage.getItem('user'));
  const showSidebar = user?.role === 'admin' || user?.role === 'staff';

  return (
    <div className="modern-layout">
      {showSidebar && <Sidebar />}
      <div className="dashboard-main" style={{ width: showSidebar ? 'calc(100% - 240px)' : '100%' }}>
        <Outlet />
      </div>
    </div>
  );
}

// 🔐 Route guard
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? children : <Navigate to="/" />;
}

// ✅ Wrapper so we can check route & user
function AppWrapper() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // Hide chatbot on login/register OR if no user (logged out)
  const hideChatBot =
    location.pathname === '/' ||
    location.pathname === '/register' ||
    !user;

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

      {/* ✅ Only show chatbot when user is logged in & not on login/register */}
      {!hideChatBot && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
