import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BookOpen, GraduationCap, Users, Settings } from 'lucide-react';

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login({ emailOrPhone, password });
      setAuth(data.data.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Smarterp</h1>
          <p className="text-primary-100 mt-1">Indian School ERP System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email or Phone</label>
              <input
                type="text"
                className="input"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="info@dpsdemo.edu.in"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 space-y-3">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary-600" />
              Quick Demo Access:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => { setEmailOrPhone('info@dpsdemo.edu.in'); setPassword('admin123'); }}
                className="text-left p-2 bg-gray-50 hover:bg-primary-50 border border-gray-100 rounded-lg transition-colors group"
              >
                <p className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">School Admin</p>
                <p className="text-[11px] text-gray-500 group-hover:text-primary-600 truncate">info@dpsdemo.edu.in</p>
              </button>
              <button 
                onClick={() => { setEmailOrPhone('teacher@smarterp.in'); setPassword('admin123'); }}
                className="text-left p-2 bg-gray-50 hover:bg-primary-50 border border-gray-100 rounded-lg transition-colors group"
              >
                <p className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Teacher</p>
                <p className="text-[11px] text-gray-500 group-hover:text-primary-600 truncate">teacher@smarterp.in</p>
              </button>
              <button 
                onClick={() => { setEmailOrPhone('9999999999'); setPassword('admin123'); }}
                className="text-left p-2 bg-gray-50 hover:bg-primary-50 border border-gray-100 rounded-lg transition-colors group"
              >
                <p className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Student</p>
                <p className="text-[11px] text-gray-500 group-hover:text-primary-600 truncate">9999999999</p>
              </button>
              <button 
                onClick={() => { setEmailOrPhone('9888888888'); setPassword('admin123'); }}
                className="text-left p-2 bg-gray-50 hover:bg-primary-50 border border-gray-100 rounded-lg transition-colors group"
              >
                <p className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Parent</p>
                <p className="text-[11px] text-gray-500 group-hover:text-primary-600 truncate">9888888888</p>
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400">Password for all demo accounts: <span className="font-mono font-bold">admin123</span></p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
            <BookOpen className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Complete ERP</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
            <Users className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-white text-sm font-medium">5 User Roles</p>
          </div>
        </div>
      </div>
    </div>
  );
}
