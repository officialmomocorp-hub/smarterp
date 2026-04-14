import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';
import Layout from './components/Layout';

// Core pages (eagerly loaded)
import Home from './pages/Home';
import Login from './pages/Login';

// Admin & Operations (lazy loaded)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ManageSchools = lazy(() => import('./pages/ManageSchools'));
const Students = lazy(() => import('./pages/Students'));
const FeeManagement = lazy(() => import('./pages/FeeManagement'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Examinations = lazy(() => import('./pages/Examinations'));
const ExamEnhanced = lazy(() => import('./pages/ExamEnhanced'));
const Staff = lazy(() => import('./pages/Staff'));
const Notices = lazy(() => import('./pages/Notices'));
const Admissions = lazy(() => import('./pages/Admissions'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Library = lazy(() => import('./pages/Library'));
const Transport = lazy(() => import('./pages/Transport'));
const Hostel = lazy(() => import('./pages/Hostel'));
const Reports = lazy(() => import('./pages/Reports'));
const PlatformReports = lazy(() => import('./pages/PlatformReports'));
const Academics = lazy(() => import('./pages/Academics'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Settings = lazy(() => import('./pages/Settings'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/manage-schools" element={<ProtectedRoute><ManageSchools /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
          <Route path="/fees/*" element={<ProtectedRoute><FeeManagement /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute><Examinations /></ProtectedRoute>} />
          <Route path="/exams-enhanced" element={<ProtectedRoute><ExamEnhanced /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
          <Route path="/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
          <Route path="/admissions" element={<ProtectedRoute><Admissions /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/transport" element={<ProtectedRoute><Transport /></ProtectedRoute>} />
          <Route path="/hostel" element={<ProtectedRoute><Hostel /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/platform-reports" element={<ProtectedRoute><PlatformReports /></ProtectedRoute>} />
          <Route path="/academic" element={<ProtectedRoute><Academics /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
