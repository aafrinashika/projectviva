import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';
import HopPage from './pages/HopPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RecentAnalysisPage from './pages/RecentAnalysisPage';
import PhishingAlertsPage from './pages/PhishingAlertsPage';
import QuarantinePage from './pages/QuarantinePage';
import OrganizationReportsPage from './pages/OrganizationReportsPage';

const personalRoles = ['individual', 'organization_user'];
const adminRoles = ['organization_admin'];

function ProtectedRoute({ children, roles }) {
  const currentRole = localStorage.getItem('phishshield_role');
  if (!currentRole) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(currentRole)) {
    if (adminRoles.includes(currentRole)) return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Individual users AND organization users get the same personal tools. */}
        <Route path="/dashboard" element={<ProtectedRoute roles={personalRoles}><DashboardPage /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute roles={personalRoles}><UploadPage /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute roles={personalRoles}><ResultPage /></ProtectedRoute>} />
        <Route path="/hop/:scanId" element={<ProtectedRoute roles={personalRoles}><HopPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute roles={personalRoles}><HistoryPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={personalRoles}><ReportsPage /></ProtectedRoute>} />

        {/* Organization admin monitoring tools only. */}
        <Route path="/admin" element={<ProtectedRoute roles={adminRoles}><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/analysis" element={<ProtectedRoute roles={adminRoles}><RecentAnalysisPage /></ProtectedRoute>} />
        <Route path="/admin/alerts" element={<ProtectedRoute roles={adminRoles}><PhishingAlertsPage /></ProtectedRoute>} />
        <Route path="/admin/quarantine" element={<ProtectedRoute roles={adminRoles}><QuarantinePage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={adminRoles}><OrganizationReportsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
