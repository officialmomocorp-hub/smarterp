import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, useAppStore } from '../store';
import {
  LayoutDashboard, Users, IndianRupee, Calendar, BookOpen,
  Bus, BedDouble, FileText, MessageSquare, GraduationCap,
  Library, UserCheck, ClipboardList, Settings, LogOut,
  Menu, ChevronDown, ChevronRight, Receipt, BarChart3,
  School, Award, FileSpreadsheet, Bell, Building2
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
  },
  {
    title: 'Manage Schools',
    icon: Building2,
    path: '/manage-schools',
    roles: ['SUPER_ADMIN'],
  },
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
      { title: 'Marks Entry', path: '/exams-enhanced' },
      { title: 'Hall Tickets', path: '/exams-enhanced' },
      { title: 'Results & Analytics', path: '/exams-enhanced' },
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
    title: 'Transport',
    icon: Bus,
    path: '/transport',
    roles: ['ADMIN'],
  },
  {
    title: 'Hostel',
    icon: BedDouble,
    path: '/hostel',
    roles: ['ADMIN'],
  },
  {
    title: 'Notices',
    icon: Bell,
    path: '/notices',
    roles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
  },
  {
    title: 'Reports',
    icon: FileSpreadsheet,
    path: '/reports',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    title: 'Academic',
    icon: School,
    path: '/academic',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'Subscriptions',
    icon: Receipt,
    path: '/billing',
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
];

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = React.useState({});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = (title) => {
    setExpandedMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredMenu = menuItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {sidebarOpen && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Smarterp</span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {filteredMenu.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname.startsWith(item.path)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
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
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-gray-500 hover:bg-gray-50'
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
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
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
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0 lg:ml-20'
        }`}
      >
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {menuItems.find(item => location.pathname === item.path)?.title || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-medium">
                {user?.profile?.firstName?.charAt(0)}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
