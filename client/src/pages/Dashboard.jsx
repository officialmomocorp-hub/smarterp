import React from 'react';
import { useAuthStore } from '../store';
import SuperAdminDashboard from './SuperAdminDashboard';
import SchoolDashboard from './SchoolDashboard';

export default function Dashboard() {
  const { user } = useAuthStore();

  if (user?.role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />;
  }

  // Common school dashboard for ADMIN, TEACHER, etc.
  return <SchoolDashboard />;
}

