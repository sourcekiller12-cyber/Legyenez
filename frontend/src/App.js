import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Dashboard Pages
import DashboardOverview from './pages/Dashboard/Overview';
import ScriptGenerator from './pages/Dashboard/ScriptGenerator';
import NotionAnalytics from './pages/Dashboard/NotionAnalytics';
import HookLibrary from './pages/Dashboard/HookLibrary';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="scripts" element={<ScriptGenerator />} />
              <Route path="hooks" element={<div className="text-white">Hook Library (Coming Soon)</div>} />
              <Route path="videos" element={<div className="text-white">Video Factory (Coming Soon)</div>} />
              <Route path="analytics" element={<div className="text-white">Analytics (Coming Soon)</div>} />
              <Route path="notion-analytics" element={<NotionAnalytics />} />
              <Route path="settings" element={<div className="text-white">Settings (Coming Soon)</div>} />
            </Route>

            {/* Redirect root to dashboard or login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          <Toaster 
            position="top-right"
            theme="dark"
            richColors
          />
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
