import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, useAppStore } from '../store';
import api from '../services/api';
import {
  LayoutDashboard, Shield, Settings, Building2, Receipt, BarChart3,
  FileText, Users, UserCheck, IndianRupee, Calendar,
  GraduationCap, Library, School, Award, Bell, FileSpreadsheet,
  ChevronDown, ChevronRight, LogOut, Menu, X, Search, BellDot, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MaintenanceOverlay from './MaintenanceOverlay';


const commonMenu = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT', 'STUDENT'] },
  { title: 'Audit Logs', icon: Shield, path: '/audit-logs', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { title: 'Settings', icon: Settings, path: '/settings', roles: ['SUPER_ADMIN', 'ADMIN'] },
];

const superAdminMenu = [
  { title: 'Manage Schools', icon: Building2, path: '/manage-schools', roles: ['SUPER_ADMIN'] },
  { title: 'Subscriptions', icon: Receipt, path: '/billing', roles: ['SUPER_ADMIN'] },
  { title: 'Platform Reports', icon: BarChart3, path: '/platform-reports', roles: ['SUPER_ADMIN'] },
];

const schoolAdminMenu = [
  { title: 'Admissions', icon: FileText, path: '/admissions', roles: ['ADMIN'] },
  { title: 'Students', icon: Users, path: '/students', roles: ['ADMIN', 'TEACHER'] },
  { title: 'Attendance', icon: UserCheck, path: '/attendance', roles: ['ADMIN', 'TEACHER'] },
  {
    title: 'Fee Management', icon: IndianRupee, path: '/fees', roles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
    children: [
      { title: 'Fee Structure', path: '/fees/structure' },
      { title: 'Collect Fee', path: '/fees/collect' },
      { title: 'Defaulter List', path: '/fees/defaulters' },
      { title: 'Collection Report', path: '/fees/reports' },
    ],
  },
  {
    title: 'Examinations', icon: Award, path: '/exams', roles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
    children: [
      { title: 'Exam Schedule', path: '/exams' },
      { title: 'Marks Verification', path: '/exams-enhanced?tab=verification' },
      { title: 'Hall Tickets', path: '/exams-enhanced?tab=hall-tickets' },
      { title: 'Results & Analytics', path: '/exams-enhanced?tab=analytics' },
    ],
  },
  { title: 'Staff', icon: GraduationCap, path: '/staff', roles: ['ADMIN'] },
  { title: 'Timetable', icon: Calendar, path: '/timetable', roles: ['ADMIN', 'TEACHER'] },
  { title: 'Library', icon: Library, path: '/library', roles: ['ADMIN', 'TEACHER'] },
  { title: 'Notices', icon: Bell, path: '/notices', roles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'] },
  { title: 'School Reports', icon: FileSpreadsheet, path: '/reports', roles: ['ADMIN', 'TEACHER'] },
  { title: 'Academic', icon: School, path: '/academic', roles: ['ADMIN', 'TEACHER'] },
];

const getMenuItems = (role, impersonateId) => {
  if (role === 'SUPER_ADMIN') {
    const base = [...commonMenu.filter(i => i.roles.includes(role)), ...superAdminMenu];
    if (impersonateId) return [...base, ...schoolAdminMenu];
    return base;
  }
  return [...commonMenu.filter(i => i.roles.includes(role)), ...schoolAdminMenu.filter(i => i.roles.includes(role))];
};


export default function Layout({ children }) {
  const { user, logout, impersonateId, setImpersonateId } = useAuthStore();
  const { sidebarOpen, toggleSidebar, isUnderMaintenance } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = React.useState({});
  const [schools, setSchools] = React.useState([]);

  React.useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      const fetchSchools = async () => {
        try {
          const { data } = await api.get('/schools');
          setSchools(data.data || []);
        } catch (err) { console.error('Failed to load schools for switcher'); }
      };
      fetchSchools();
    }
  }, [user]);

  React.useEffect(() => {
    if (window.innerWidth < 1024 && sidebarOpen) toggleSidebar();
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const toggleMenu = (title) => { setExpandedMenus(prev => ({ ...prev, [title]: !prev[title] })); };
  const filteredMenu = getMenuItems(user?.role, impersonateId);

  const roleLabels = {
    SUPER_ADMIN: 'Administrator',
    ADMIN: 'School Admin',
    TEACHER: 'Teacher',
    PARENT: 'Parent',
    STUDENT: 'Student'
  };

  return (
    <div className="min-h-screen flex overflow-x-hidden relative" style={{ background: '#000' }}>
      {isUnderMaintenance && <MaintenanceOverlay />}

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* ═══ APPLE SIDEBAR ═══ */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 260 : (window.innerWidth >= 1024 ? 68 : 0),
          x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -260
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="fixed inset-y-0 left-0 z-50 overflow-hidden"
        style={{
          background: 'rgba(28,28,30,0.85)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          borderRight: '1px solid rgba(84,84,88,0.36)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4" style={{ borderBottom: '1px solid rgba(84,84,88,0.2)' }}>
          {sidebarOpen ? (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', boxShadow: '0 2px 8px rgba(10,132,255,0.3)' }}
              >
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-[14px] font-semibold text-white tracking-tight">SmartERP</span>
            </Link>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', boxShadow: '0 2px 8px rgba(10,132,255,0.3)' }}
              >
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
          <button onClick={toggleSidebar} className="p-1 rounded-md text-gray-500 hover:text-white transition-colors lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Context Switcher */}
        {user?.role === 'SUPER_ADMIN' && sidebarOpen && (
          <div className="p-3" style={{ borderBottom: '1px solid rgba(84,84,88,0.2)' }}>
            <select
              className="w-full text-[11px] font-medium p-2 rounded-md text-white outline-none cursor-pointer"
              style={{ background: 'rgba(120,120,128,0.24)', border: 'none' }}
              value={impersonateId || ''}
              onChange={(e) => setImpersonateId(e.target.value)}
            >
              <option value="" style={{ background: '#2c2c2e' }}>Platform Management</option>
              {schools.map(s => (
                <option key={s.id} value={s.id} style={{ background: '#2c2c2e' }}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        <nav className="px-2 py-2 space-y-px overflow-y-auto" style={{ height: 'calc(100vh - 7rem)' }}>
          {filteredMenu.map((item) => {
            const isActive = item.children
              ? location.pathname.startsWith(item.path)
              : location.pathname === item.path;

            return (
              <div key={item.title}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className="w-full flex items-center justify-between px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150"
                      style={{
                        background: isActive ? 'rgba(10,132,255,0.18)' : 'transparent',
                        color: isActive ? '#fff' : 'rgba(235,235,245,0.60)',
                        fontWeight: isActive ? '500' : '400',
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: isActive ? '#0A84FF' : 'rgba(235,235,245,0.40)' }} />
                        {sidebarOpen && <span>{item.title}</span>}
                      </div>
                      {sidebarOpen && (expandedMenus[item.title] ? <ChevronDown className="w-3 h-3 opacity-40" /> : <ChevronRight className="w-3 h-3 opacity-40" />)}
                    </button>
                    {sidebarOpen && expandedMenus[item.title] && (
                      <div className="ml-[30px] mt-0.5 space-y-px">
                        {item.children.map((child) => (
                          <Link key={child.path} to={child.path}
                            className="block px-2.5 py-[6px] rounded-md text-[12px] transition-colors"
                            style={{
                              color: location.pathname === child.path ? '#0A84FF' : 'rgba(235,235,245,0.45)',
                              fontWeight: location.pathname === child.path ? '500' : '400',
                            }}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to={item.path}
                    className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150"
                    style={{
                      background: isActive ? 'rgba(10,132,255,0.18)' : 'transparent',
                      color: isActive ? '#fff' : 'rgba(235,235,245,0.60)',
                      fontWeight: isActive ? '500' : '400',
                    }}
                  >
                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: isActive ? '#0A84FF' : 'rgba(235,235,245,0.40)' }} />
                    {sidebarOpen && <span>{item.title}</span>}
                  </Link>
                )}
              </div>
            );
          })}

          {/* Logout */}
          <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(84,84,88,0.2)' }}>
            <button
              id="logout-btn"
              data-testid="logout"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150"
              style={{ color: '#FF453A' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,69,58,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              {sidebarOpen && <span>Sign Out</span>}
            </button>
          </div>
        </nav>
      </motion.aside>

      {/* ═══ MAIN ═══ */}
      <motion.main
        initial={false}
        animate={{ marginLeft: window.innerWidth >= 1024 ? (sidebarOpen ? 260 : 68) : 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="flex-1 min-h-screen"
        style={{ background: '#000' }}
      >
        {/* ═══ APPLE HEADER ═══ */}
        <header
          className="h-12 flex items-center justify-between px-5 sticky top-0 z-40"
          style={{
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(84,84,88,0.2)',
          }}
        >
          {impersonateId && (
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
              background: 'linear-gradient(90deg, #0A84FF, #5E5CE6, #0A84FF)',
              backgroundSize: '200% 100%',
              animation: 'gradient-x 2s ease infinite'
            }} />
          )}

          <div className="flex items-center gap-2">
            <button onClick={toggleSidebar} className="p-1 rounded-md text-gray-500 hover:text-white transition-colors hidden lg:block">
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-[13px] font-medium text-white">
              {filteredMenu.find(item => location.pathname === item.path)?.title || 'SmartERP'}
            </span>
            {impersonateId && (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                style={{ background: 'rgba(10,132,255,0.15)', color: '#0A84FF' }}
              >
                {schools.find(s=>s.id===impersonateId)?.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] cursor-pointer"
              style={{ background: 'rgba(120,120,128,0.24)', color: 'rgba(235,235,245,0.40)' }}
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
              <span className="text-[9px] px-1 py-px rounded font-mono ml-1" style={{ background: 'rgba(120,120,128,0.3)' }}>⌘K</span>
            </div>

            {/* Notification */}
            <button className="w-7 h-7 rounded-md flex items-center justify-center relative"
              style={{ background: 'rgba(120,120,128,0.18)' }}
            >
              <Bell className="w-3.5 h-3.5" style={{ color: 'rgba(235,235,245,0.50)' }} />
              <div className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] rounded-full" style={{ background: '#FF453A' }} />
            </button>

            {/* User */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-medium text-white leading-tight">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-[10px]" style={{ color: 'rgba(235,235,245,0.40)' }}>
                  {roleLabels[user?.role] || user?.role}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}
              >
                <span className="text-white font-semibold text-[12px]">
                  {user?.profile?.firstName?.charAt(0)}
                </span>
                <div className="absolute -bottom-px -right-px w-[8px] h-[8px] rounded-full border-[1.5px]"
                  style={{ background: '#30D158', borderColor: '#000' }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="p-5"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
