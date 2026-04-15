import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Play,
  Zap,
  Clock,
  Wallet,
  GraduationCap,
  Shield,
  BarChart3,
  Users
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen" style={{ background: '#0B1121' }}>
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(11,17,33,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
              <Sparkles className="text-white" size={22} />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Smart<span style={{ color: '#38bdf8' }}>ERP</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#solutions" className="text-gray-400 hover:text-white transition-colors">Solutions</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
            <Link to="/login" className="px-6 py-2.5 font-bold rounded-full transition-all text-white" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative px-6 pt-40 pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)' }} />
          <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)' }} />
        </div>
        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-8" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
              <span className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ background: '#38bdf8' }}></span>
              <span className="text-sm font-black uppercase tracking-[0.15em]" style={{ color: '#38bdf8' }}>Future of Schooling</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-8 leading-[1.1]">
              <span className="font-serif-elegant italic" style={{ color: '#94a3b8' }}>Premium</span> <br/>
              <span style={{ color: '#38bdf8' }}>Enterprise ERP</span> for <br/>
              <span className="font-serif-elegant italic" style={{ color: '#94a3b8' }}>Ideal Institutions</span>.
            </h1>
            <p className="text-lg mb-10 max-w-lg leading-relaxed" style={{ color: '#64748b' }}>
              Experience the best-in-class Indian ERP solution. Manage students, staff, and finances with unmatched precision and security.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register?plan=PROFESSIONAL" className="px-10 py-5 text-white font-bold rounded-2xl flex items-center gap-2 group transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 0 30px rgba(37,99,235,0.5), 0 8px 20px rgba(0,0,0,0.3)' }}>
                Start Free Trial <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="px-10 py-5 font-bold rounded-2xl flex items-center gap-2 transition-all hover:scale-105" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                <Play size={18} style={{ color: '#38bdf8', fill: '#38bdf8' }} /> Watch Demo
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-10 rounded-full blur-3xl" style={{ background: 'rgba(56,189,248,0.08)' }}></div>
            <div className="relative p-3 rounded-[2rem] overflow-hidden" style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
              <img src="/hero-mockup.png" alt="Dashboard" className="rounded-[1.5rem] w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted Stats Bar ── */}
      <section className="py-16 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '500+', label: 'Schools Onboarded' },
            { value: '1.2L+', label: 'Students Managed' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '4.9★', label: 'Customer Rating' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-sm font-bold uppercase tracking-wider" style={{ color: '#475569' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Solutions Grid ── */}
      <section id="solutions" className="py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] mb-4" style={{ color: '#38bdf8' }}>Ecosystem</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Institution Ecosystem</h2>
          <p className="text-lg mb-16 max-w-2xl mx-auto" style={{ color: '#64748b' }}>Everything your institution needs, unified in one powerful platform.</p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { title: 'Academic Hub', desc: 'Auto-generation of report cards, complex grading systems, and outcome-based education.', icon: <GraduationCap size={24} />, color: '#3b82f6' },
              { title: 'Smart Presence', desc: 'Secure biometric, RFID, and face-recognition integrations with instant SMS alerts.', icon: <Clock size={24} />, color: '#10b981' },
              { title: 'Financial Vault', desc: 'End-to-end fee collection, automated invoicing, and integrated payment gateways.', icon: <Wallet size={24} />, color: '#f59e0b' }
            ].map((s, i) => (
              <div key={i} className="p-8 rounded-2xl transition-all group hover:-translate-y-2 duration-300 relative overflow-hidden" 
                style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}15, transparent 70%)` }} />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all" style={{ background: s.color + '15', color: s.color, border: `1px solid ${s.color}30` }}>
                    {s.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                  <p className="mb-6 leading-relaxed" style={{ color: '#94a3b8' }}>{s.desc}</p>
                  <Link to="/login" className="font-bold flex items-center gap-2 group-hover:gap-3 transition-all" style={{ color: s.color }}>Explore <ArrowRight size={16} /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Highlights ── */}
      <section id="features" className="py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Shield size={22} />, title: 'Bank-Grade Security', desc: 'End-to-end encryption with role-based access control.', color: '#8b5cf6' },
              { icon: <Zap size={22} />, title: 'Lightning Fast', desc: 'Optimized for speed. Pages load in under 200ms.', color: '#f59e0b' },
              { icon: <BarChart3 size={22} />, title: 'Smart Analytics', desc: 'AI-powered insights and predictive reporting.', color: '#10b981' },
              { icon: <Users size={22} />, title: '5 User Roles', desc: 'Admin, Teacher, Student, Parent & Super Admin.', color: '#3b82f6' },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl text-center group hover:-translate-y-1 transition-all duration-300" style={{ background: 'rgba(30,41,59,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: f.color + '15', color: f.color }}>
                  {f.icon}
                </div>
                <h4 className="text-base font-bold text-white mb-2">{f.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="py-32 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10" style={{ background: 'radial-gradient(ellipse, rgba(56,189,248,0.3), transparent 70%)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <p className="text-sm font-black uppercase tracking-[0.2em] mb-4" style={{ color: '#38bdf8' }}>Plans</p>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            <span className="font-serif-elegant italic font-normal" style={{ color: '#94a3b8' }}>Truly</span> Affordable Pricing
          </h2>
          <p className="text-lg mb-16" style={{ color: '#64748b' }}>Choose a plan that scales with your growth. All prices in INR.</p>
          
          <div className="grid md:grid-cols-3 gap-6 text-left items-stretch">
            {[
              { id: 'STARTER', title: 'Basic', price: '2,499', features: ['Up to 500 Students', 'Core Academics', 'Email Support', 'Attendance Mgmt'], color: '#64748b' },
              { id: 'PROFESSIONAL', title: 'Premium', price: '5,999', features: ['Up to 1500 Students', 'Finance & Fees', 'Priority Support', 'Examination Suite'], recommended: true, color: '#3b82f6' },
              { id: 'ENTERPRISE', title: 'Elite', price: '11,999', features: ['Unlimited Students', 'Multi-school Hub', '24/7 Dedicated Support', 'White-labeled App'], color: '#8b5cf6' }
            ].map((p, i) => (
              <div key={i} className={`p-8 rounded-2xl flex flex-col h-full transition-all duration-500 group hover:-translate-y-2 relative overflow-hidden ${p.recommended ? 'scale-105 z-10' : ''}`} 
                style={{ 
                  background: p.recommended ? 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(37,99,235,0.15))' : 'rgba(30,41,59,0.5)', 
                  border: p.recommended ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: p.recommended ? '0 0 40px rgba(37,99,235,0.15), 0 20px 40px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(12px)'
                }}>
                {p.recommended && <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.5), transparent)' }} />}
                {p.recommended && (
                  <div className="text-[10px] font-black px-4 py-1.5 rounded-full w-fit mb-6 tracking-[0.15em] uppercase" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                    MOST POPULAR
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-4">{p.title}</h3>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="font-bold text-2xl pr-1" style={{ color: '#38bdf8' }}>{"\u20B9"}</span>
                  <span className="text-5xl font-black text-white">{p.price}</span>
                  <span className="text-sm ml-1" style={{ color: '#475569' }}>/month</span>
                </div>
                
                <ul className="space-y-4 mb-10 flex-grow">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: p.color + '20' }}>
                        <CheckCircle2 size={12} style={{ color: p.color }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to={`/register?plan=${p.id}`} 
                  className="block w-full py-4 rounded-xl font-bold text-center text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ 
                    background: p.recommended ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'rgba(255,255,255,0.08)', 
                    boxShadow: p.recommended ? '0 0 25px rgba(37,99,235,0.4)' : 'none',
                    border: p.recommended ? 'none' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  Select {p.title} Plan
                </Link>
              </div>
            ))}
          </div>
          
          <p className="mt-16 text-sm font-medium" style={{ color: '#475569' }}>
            * All prices excluding GST. Annual billing discounts available.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
                <Sparkles className="text-white" size={16} />
              </div>
              <span className="text-xl font-black text-white tracking-tight">Smart<span style={{ color: '#38bdf8' }}>ERP</span></span>
            </div>
            <p className="text-sm max-w-xs" style={{ color: '#475569' }}>Building the digital foundation for the institutions of the future.</p>
          </div>
          <div className="flex gap-10 text-sm font-semibold" style={{ color: '#64748b' }}>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <p className="text-sm" style={{ color: '#475569' }}>{"\u00A9"} 2026 SmartERP Solutions.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
