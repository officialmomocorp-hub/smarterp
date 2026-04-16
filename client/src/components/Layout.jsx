import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore, useAppStore } from '../store';
import {
  LayoutDashboard, Users, IndianRupee, Calendar, BookOpen,
  Bus, BedDouble, FileText, MessageSquare, GraduationCap,
  Library, UserCheck, ClipboardList, Settings, LogOut,
  Menu, ChevronDown, ChevronRight, Receipt, BarChart3,
  School, Award, FileSpreadsheet, Bell, Building2, X, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const commonMenu = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
  },
  {
    title: 'Audit Logs',
    icon: Shield,
    path: '/audit-logs',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
];

const superAdminMenu = [
  {
    title: 'Manage Schools',
    icon: Building2,
    path: '/manage-schools',
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Subscriptions',
    icon: Receipt,
    path: '/billing',
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Platform Reports',
    icon: BarChart3,
    path: '/platform-reports',
    roles: ['SUPER_ADMIN'],
  },
];

const schoolAdminMenu = [
  {
    title: 'Admissions',
    icon: FileText,
    path: '/admissions',
    roles: ['ADMIN'],
  },
  {
    title: 'Students',
    icon: Users,
    path: '/students',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'Attendance',
    icon: UserCheck,
    path: '/attendance',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'Fee Management',
    icon: IndianRupee,
    path: '/fees',
    roles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
    children: [
      { title: 'Fee Structure', path: '/fees/structure' },
      { title: 'Collect Fee', path: '/fees/collect' },
      { title: 'Defaulter List', path: '/fees/defaulters' },
      { title: 'Collection Report', path: '/fees/reports' },
    ],
  },
  {
    title: 'Examinations',
    icon: Award,
    path: '/exams',
    roles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
    children: [
      { title: 'Exam Schedule', path: '/exams' },
      { title: 'Marks Verification', path: '/exams-enhanced?tab=verification' },
      { title: 'Hall Tickets', path: '/exams-enhanced?tab=hall-tickets' },
      { title: 'Results & Analytics', path: '/exams-enhanced?tab=analytics' },
    ],
  },
  {
    title: 'Staff',
    icon: GraduationCap,
    path: '/staff',
    roles: ['ADMIN'],
  },
  {
    title: 'Timetable',
    icon: Calendar,
    path: '/timetable',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'Library',
    icon: Library,
    path: '/library',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'Notices',
    icon: Bell,
    path: '/notices',
    roles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
  },
  {
    title: 'School Reports',
    icon: FileSpreadsheet,
    path: '/reports',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'Academic',
    icon: School,
    path: '/academic',
    roles: ['ADMIN', 'TEACHER'],
  },
];

const getMenuItems = (role, impersonateId) => {
  if (role === 'SUPER_ADMIN') {
    const base = [...commonMenu.filter(i => i.roles.includes(role)), ...superAdminMenu];
    if (impersonateId) {
      return [...base, ...schoolAdminMenu];
    }
    return base;
  }
  return [...commonMenu.filter(i => i.roles.includes(role)), ...schoolAdminMenu.filter(i => i.roles.includes(role))];
};


export default function Layout({ children }) {
  const { user, logout, impersonateId, setImpersonateId } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useAppStore();
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

  // Close sidebar on navigation (mobile only)
  React.useEffect(() => {
    if (window.innerWidth < 1024 && sidebarOpen) {
      toggleSidebar();
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = (title) => {
    setExpandedMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredMenu = getMenuItems(user?.role, impersonateId);

  return (
    <div className="min-h-screen flex overflow-x-hidden relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] mesh-gradient-blob mix-blend-screen opacity-40"></div>
      
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarOpen ? 256 : (window.innerWidth >= 1024 ? 80 : 0),
          x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -256
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 500 }}
        className="fixed inset-y-0 left-0 z-50 bg-[#0B1121]/90 backdrop-blur-2xl border-r border-white/10 overflow-hidden"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {sidebarOpen && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Smarterp</span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-300 lg:block"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-gray-500 lg:hidden" /> : <Menu className="w-5 h-5" />}
            {!sidebarOpen && <Menu className="w-5 h-5 hidden lg:block" />}
            {sidebarOpen && <Menu className="w-5 h-5 hidden lg:block" />}
          </button>
        </div>

        <div className="p-4 border-b border-white/5 bg-transparent">
          {user?.role === 'SUPER_ADMIN' && sidebarOpen && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Active School Context</label>
              <select 
                className="w-full bg-[#0f172a] border border-white/10 rounded-lg text-xs p-2 text-white outline-none"
                value={impersonateId || ''}
                onChange={(e) => setImpersonateId(e.target.value)}
              >
                <option value="">Platform Management</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {filteredMenu.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname.startsWith(item.path)
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span>{item.title}</span>}
                    </div>
                    {sidebarOpen && (
                      expandedMenus[item.title] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )
                    )}
                  </button>
                  {sidebarOpen && expandedMenus[item.title] && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            location.pathname === child.path
                              ? 'bg-blue-500/10 text-blue-400 font-medium'
                              : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                          }`}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.title}</span>}
                </Link>
              )}
            </div>
          ))}

          <button
            id="logout-btn"
            data-testid="logout"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </nav>
      </motion.aside>

      {/* Main content */}
      <motion.main
        initial={false}
        animate={{ 
          marginLeft: window.innerWidth >= 1024 ? (sidebarOpen ? 256 : 80) : 0
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 500 }}
        className="flex-1 min-h-screen"
      >
        <header className="bg-[#0B1121]/80 backdrop-blur-xl border-b border-white/10 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
          <div>
             {impersonateId && (
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 animate-gradient-x" />
             )}
            <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              {impersonateId && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
              {filteredMenu.find(item => location.pathname === item.path)?.title || 'SmartERP'}
              {impersonateId && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">Impersonating {schools.find(s=>s.id===impersonateId)?.name}</span>}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'ADMIN' ? 'School Admin' : user?.role}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-blue-400 font-bold">
                {user?.profile?.firstName?.charAt(0)}
              </span>
            </div>
          </div>
        </header>

        <motion.div 
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="p-6"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
