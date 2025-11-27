import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CoursePreview from './pages/CoursePreview';
import BatchDetailPage from './pages/BatchDetailPage';
import BatchMonthsPage from './pages/BatchMonthsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CheckoutPage from './pages/Checkout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import ContactUs from './pages/ContactUs';
import TelegramChannels from './pages/TelegramChannels';
function ProtectedRoute({
  children,
  adminOnly = false
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const {
    user,
    isAuthenticated,
    loading
  } = useAuth();
  // while auth is loading (initial check on page load), don't redirect - render nothing or a loader
  if (loading) {
    return <div />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
export function AppRouter() {
  return <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute>
              <HomePage />
            </ProtectedRoute>} />
        <Route path="/dashboard/*" element={<ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>} />
        
        <Route path="/batch/:year" element={<ProtectedRoute>
              <BatchDetailPage />
            </ProtectedRoute>} />
        <Route path="/batch/:year/months" element={<ProtectedRoute>
              <BatchMonthsPage />
            </ProtectedRoute>} />
        <Route path="/course-preview/:id" element={<ProtectedRoute>
              <CoursePreview />
            </ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>} />
        <Route path="/privacy-policy" element={<ProtectedRoute>
              <PrivacyPolicy />
            </ProtectedRoute>} />
        <Route path="/terms-conditions" element={<ProtectedRoute>
              <TermsConditions />
            </ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute>
              <ContactUs />
            </ProtectedRoute>} />
        <Route path="/telegram" element={<ProtectedRoute>
              <TelegramChannels />
            </ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>;
}