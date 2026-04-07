import React from 'react';
import { useAuthStore } from '../store';
import SuperAdminDashboard from './SuperAdminDashboard';
import SchoolDashboard from './SchoolDashboard';
import TeacherDashboard from './TeacherDashboard';
import ParentDashboard from './ParentDashboard';
import StudentDashboard from './StudentDashboard';

export default function Dashboard() {
  const { user } = useAuthStore();

  if (user?.role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />;
  }

  if (user?.role === 'TEACHER') {
    return <TeacherDashboard />;
  }

  if (user?.role === 'PARENT') {
    return <ParentDashboard />;
  }

  if (user?.role === 'STUDENT') {
    return <StudentDashboard />;
  }

  // Fallback for ADMIN or unknown roles
  return <SchoolDashboard />;
}

