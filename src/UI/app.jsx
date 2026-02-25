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
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const showSidebar =
    user?.role === 'admin' || user?.role === 'staff';

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
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  return user?.token ? children : <Navigate to="/" />;
}


// ==========================
// Wrapper
// ==========================
function AppWrapper() {
  const location = useLocation();

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const hideChatBot =
    location.pathname === '/' ||
    location.pathname === '/register' ||
    !user?.token;

  return (
    <>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<Registration />} />

        {/* Protected routes */}
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