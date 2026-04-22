import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { GraduationCap, Users, Settings, Lock, Mail, ArrowRight, Shield, Zap, BookOpen, ShieldCheck, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const demos = [
    { role: 'Super Admin', email: 'admin@smarterp.in', icon: ShieldCheck, color: '#FF453A' },
    { role: 'School Admin', email: 'info@dpsdemo.edu.in', icon: Settings, color: '#0A84FF' },
    { role: 'Teacher', email: 'teacher@smarterp.in', icon: BookOpen, color: '#30D158' },
    { role: 'Student', email: '9999999999', icon: Users, color: '#BF5AF2' },
    { role: 'Parent', email: '9888888888', icon: Shield, color: '#FF9F0A' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#000' }}>
      
      {/* ═══ LEFT — Brand Panel ═══ */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: '#0A84FF' }}>
        
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="absolute top-1/2 right-10 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SmartERP</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 -mt-10">
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-5">
            The future of school management
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Streamline admissions, attendance, exams, fees, and more — all from one beautiful platform built for Indian institutions.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 space-y-4">
            {[
              { label: '500+ schools trust SmartERP', icon: '🏫' },
              { label: '1.2 lakh+ students managed', icon: '🎓' },
              { label: '99.9% uptime guaranteed', icon: '⚡' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm font-medium text-white/80">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-xs relative z-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
          © 2026 SmartERP Solutions · Built for Indian Schools
        </p>
      </div>

      {/* ═══ RIGHT — Login Form ═══ */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[400px]">
          
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" 
              style={{ background: '#0A84FF' }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SmartERP</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm mb-7" style={{ color: 'rgba(235,235,245,0.40)' }}>Sign in to continue to your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'rgba(235,235,245,0.60)' }}>Email or Phone</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px]" style={{ color: 'rgba(235,235,245,0.25)' }} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] text-white focus:outline-none transition-all"
                  style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="admin@smarterp.in"
                  required
                  onFocus={(e) => { e.target.style.borderColor = '#0A84FF'; e.target.style.boxShadow = '0 0 0 3px rgba(10,132,255,0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(84,84,88,0.36)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'rgba(235,235,245,0.60)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px]" style={{ color: 'rgba(235,235,245,0.25)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-[14px] text-white focus:outline-none transition-all"
                  style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.36)' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  onFocus={(e) => { e.target.style.borderColor = '#0A84FF'; e.target.style.boxShadow = '0 0 0 3px rgba(10,132,255,0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(84,84,88,0.36)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5">
                  {showPassword 
                    ? <EyeOff className="w-4 h-4" style={{ color: 'rgba(235,235,245,0.30)' }} />
                    : <Eye className="w-4 h-4" style={{ color: 'rgba(235,235,245,0.30)' }} />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              style={{ background: '#0A84FF' }}
              onMouseEnter={(e) => { e.target.style.background = '#409CFF'; }}
              onMouseLeave={(e) => { e.target.style.background = '#0A84FF'; }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
          <p className="text-center mt-3"><button type="button" className="text-[12px] font-medium" style={{ color: '#0A84FF' }} onClick={() => toast('Contact your school administrator to reset your password')}>Forgot password?</button></p>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(84,84,88,0.36)' }} />
            <span className="text-[11px] font-medium" style={{ color: 'rgba(235,235,245,0.25)' }}>or try a demo account</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(84,84,88,0.36)' }} />
          </div>

          {/* Demo Access */}
          <div className="grid grid-cols-2 gap-2">
            {demos.map((demo, i) => (
              <button 
                key={i}
                onClick={() => { 
                  setEmailOrPhone(demo.email); 
                  setPassword(demo.role === 'Super Admin' ? 'Bkb@1234' : 'admin123'); 
                }}
                className="text-left px-3 py-2.5 rounded-xl transition-all group active:scale-[0.97]"
                style={{ background: '#1c1c1e', border: '1px solid rgba(84,84,88,0.2)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = demo.color + '60'; e.currentTarget.style.background = '#2c2c2e'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(84,84,88,0.2)'; e.currentTarget.style.background = '#1c1c1e'; }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: demo.color + '18' }}>
                    <demo.icon className="w-3.5 h-3.5" style={{ color: demo.color }} />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-white">{demo.role}</p>
                    <p className="text-[10px] truncate" style={{ color: 'rgba(235,235,245,0.25)' }}>{demo.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-[11px] mt-8 lg:hidden" style={{ color: 'rgba(235,235,245,0.15)' }}>
            © 2026 SmartERP · Built for Indian Schools
          </p>
        </div>
      </div>
    </div>
  );
}
