import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, BarChart3, Clock, Zap, BookOpen, GraduationCap, Globe, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <GraduationCap className="w-8 h-8" />
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                SmartERP
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#solutions" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Solutions</a>
              <a href="#pricing" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <Link to="/login" className="btn btn-primary px-8 py-3 rounded-full shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform font-bold">
                Go to Portal <ChevronRight className="w-4 h-4 ml-1 inline" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-[#FBFDFF]">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-50 rounded-full blur-3xl opacity-50" />
          
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Next Generation ERP</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tighter">
              World Class <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 italic">Indian ERP</span> for Global Schools.
            </h1>
            <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
                Transform your educational institution with the most advanced, secure, and user-friendly ERP system. 
                Built for multi-tenancy, high performance, and total academic excellence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-[#1E293B] text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 active:scale-95">
                Start Managing Today
              </Link>
              <button className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold text-lg hover:border-blue-200 hover:text-blue-600 transition-all active:scale-95">
                Request Demo
              </button>
            </div>
            
            <div className="mt-20 flex items-center justify-center gap-10 opacity-30 grayscale saturate-0 pointer-events-none">
               <span className="text-2xl font-black italic">CBSE ALIGNED</span>
               <span className="text-2xl font-black italic">ISO CERTIFIED</span>
               <span className="text-2xl font-black italic">SECURE BEYOND BARK</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Powerful Features</h2>
            <p className="text-slate-500 text-lg">Everything you need to automate your institution in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Multi-Tenant SaaS', desc: 'Secure data isolation with individual school dashboards and global visibility.', color: 'blue' },
              { icon: BarChart3, title: 'Real-time Analytics', desc: 'Financial reports, student performance, and deficit alerts at your fingertips.', color: 'cyan' },
              { icon: Shield, title: 'Ironclad Security', desc: 'JWT Authentication, Role-based access control, and 3-level verification workflows.', color: 'purple' },
              { icon: Clock, title: 'Automated Billing', desc: 'Quarterly/Monthly fee generation, late fine automation, and payment gateways.', color: 'green' },
              { icon: GraduationCap, title: 'Academic Hub', desc: 'Exams, Report cards, Hall tickets, and TC generation in one single click.', color: 'amber' },
              { icon: Globe, title: 'Cloud-Native', desc: 'Accessible anywhere with 99.9% uptime. Optimized for performance and scale.', color: 'rose' }
            ].map((f, i) => (
              <div key={i} className="group p-10 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-${f.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-7 h-7 text-${f.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed font-normal">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="bg-slate-900 py-32 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 opacity-10 blur-3xl w-96 h-96 bg-blue-500" />
         <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold italic leading-tight mb-10">
              "Indian values meet modern technology. The smartest investment for your child's institution."
            </h2>
            <div className="h-1 w-20 bg-blue-500 mx-auto mb-6" />
            <p className="uppercase tracking-[0.3em] font-black text-blue-400">SMART ERP SOLUTION</p>
         </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-20 bg-white border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-8">
               <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-1.5 rounded-lg text-white">
                 <GraduationCap className="w-5 h-5" />
               </div>
               <span className="text-xl font-black text-slate-900">SmartERP</span>
            </div>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
               © 2026 SmartERP Solution. All rights reserved.<br />
               Proudly built in India for the Global Education Future.
            </p>
            <div className="flex items-center justify-center gap-6">
               <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Privacy Policy</a>
               <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Terms of Service</a>
               <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Support Hub</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
