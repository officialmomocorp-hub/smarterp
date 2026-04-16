import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { GraduationCap, Users, Settings, Lock, Mail, ArrowRight, Shield, Zap, BookOpen } from 'lucide-react';

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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ background: '#0B1121' }}>
      
      {/* Animated Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)', animation: 'ambientOrb1 12s ease-in-out infinite alternate' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)', animation: 'ambientOrb2 15s ease-in-out infinite alternate' }} />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.3), transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative z-10 w-full max-w-[460px]">
        
        {/* Logo & Brand */}
        <div className="text-center mb-10" style={{ animation: 'cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 relative"
            style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(59,130,246,0.3))', border: '1px solid rgba(56,189,248,0.2)', boxShadow: '0 0 40px rgba(56,189,248,0.2)' }}>
            <GraduationCap className="w-10 h-10 text-sky-400" />
            <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.1), transparent)', animation: 'shimmerSlide 3s ease-in-out infinite' }} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Smart<span className="text-sky-400">ERP</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium tracking-wide">Next-Gen School Management Platform</p>
        </div>

        {/* Login Card */}
        <div className="relative rounded-3xl p-8 overflow-hidden"
          style={{ 
            background: 'rgba(15, 23, 42, 0.8)', 
            backdropFilter: 'blur(24px)', 
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 60px rgba(56,189,248,0.05)',
            animation: 'cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards'
          }}>
          
          {/* Top Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)' }} />

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Email or Phone</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
                  style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="admin@smarterp.in"
                  required
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.15), 0 0 20px rgba(56,189,248,0.08)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
                  style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.15), 0 0 20px rgba(56,189,248,0.08)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
              style={{ 
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                boxShadow: '0 0 30px rgba(37,99,235,0.5), 0 8px 20px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => { e.target.style.boxShadow = '0 0 40px rgba(37,99,235,0.7), 0 12px 28px rgba(0,0,0,0.4)'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.target.style.boxShadow = '0 0 30px rgba(37,99,235,0.5), 0 8px 20px rgba(0,0,0,0.3)'; e.target.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo Access Section */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
              <Zap className="w-3 h-3" /> Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'School Admin', email: 'info@dpsdemo.edu.in', color: '#3b82f6', icon: Settings },
                { role: 'Teacher', email: 'teacher@smarterp.in', color: '#10b981', icon: BookOpen },
                { role: 'Student', email: '9999999999', color: '#8b5cf6', icon: Users },
                { role: 'Parent', email: '9888888888', color: '#f59e0b', icon: Shield },
              ].map((demo, i) => (
                <button 
                  key={i}
                  onClick={() => { 
                    setEmailOrPhone(demo.email); 
                    setPassword(demo.role === 'Super Admin' ? 'Bkb@1234' : 'admin123'); 
                  }}
                  className="text-left p-3 rounded-xl transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
                  style={{ 
                    background: 'rgba(30,41,59,0.4)', 
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = demo.color + '40'; e.currentTarget.style.boxShadow = `0 0 15px ${demo.color}15`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: demo.color + '20' }}>
                      <demo.icon className="w-3 h-3" style={{ color: demo.color }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: demo.color }}>{demo.role}</p>
                      <p className="text-[10px] text-gray-500 group-hover:text-gray-300 truncate transition-colors">{demo.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3" style={{ animation: 'cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards' }}>
          {[
            { label: 'Schools', value: '50+' },
            { label: 'Students', value: '10K+' },
            { label: 'Active', value: '99.9%' },
          ].map((stat, i) => (
            <div key={i} className="text-center py-3 rounded-xl" style={{ background: 'rgba(30,41,59,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-lg font-black text-white">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-gray-600 mt-6 font-medium">
          © 2026 SmartERP. Built with ❤️ for Indian Schools
        </p>
      </div>
    </div>
  );
}
