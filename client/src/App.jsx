import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import FeeManagement from './pages/FeeManagement';
import Attendance from './pages/Attendance';
import Examinations from './pages/Examinations';
import ExamEnhanced from './pages/ExamEnhanced';
import Staff from './pages/Staff';
import Notices from './pages/Notices';
import Admissions from './pages/Admissions';
import Timetable from './pages/Timetable';
import Library from './pages/Library';
import Reports from './pages/Reports';
import Placeholder from './pages/Placeholder';
import ManageSchools from './pages/ManageSchools';
import Subscriptions from './pages/Subscriptions';
import Settings from './pages/Settings';
import Academics from './pages/Academics';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
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
        <Route path="/transport" element={<ProtectedRoute><Placeholder title="Transport Management" /></ProtectedRoute>} />
        <Route path="/hostel" element={<ProtectedRoute><Placeholder title="Hostel Management" /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/academic" element={<ProtectedRoute><Academics /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
