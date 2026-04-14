import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
  Globe,
  Clock,
  Wallet,
  GraduationCap
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 hover:scale-105 transition-transform cursor-pointer">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Sparkles className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight">SmartERP</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#solutions" className="text-slate-600 hover:text-blue-600 transition-colors">Solutions</a>
            <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
            <Link to="/login" className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition-all shadow-md">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-40 pb-32 overflow-hidden mesh-gradient-blob">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative text-left">
          <div className="animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-card border border-blue-100/50 mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              <span className="text-sm font-bold text-blue-900 tracking-wider uppercase">Future of Schooling</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-tight">
              <span className="font-serif-elegant italic text-slate-800">Premium</span> <br/>
              <span className="text-blue-600">Enterprise ERP</span> for <br/>
              <span className="font-serif-elegant italic text-slate-800">Ideal Institutions</span>.
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
              Experience the best-in-class Indian ERP solution. Manage students, staff, and finances with unmatched precision and security.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register?plan=PROFESSIONAL" className="px-10 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-300 group">
                Start Free Trial <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="px-10 py-5 bg-white/50 backdrop-blur-md text-slate-900 font-bold rounded-2xl border border-slate-200 hover:bg-white transition-all flex items-center gap-2 shadow-sm text-center">
                <Play size={18} className="text-blue-600 fill-blue-600" /> Watch Demo
              </Link>
            </div>
          </div>
          <div className="relative animate-in fade-in zoom-in duration-1000">
            <div className="absolute -inset-10 bg-blue-600/10 rounded-full blur-3xl"></div>
            <div className="relative glass-card p-4 rounded-[3rem] shadow-2xl overflow-hidden border border-white/60 group">
              <img src="/hero-mockup.png" alt="Dashboard" className="rounded-[2rem] group-hover:scale-[1.02] transition-transform duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-16 tracking-tight">Institution Ecosystem</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { title: 'Academic Hub', desc: 'Auto-generation of report cards, complex grading systems, and outcome-based education.', icon: <GraduationCap size={24} /> },
              { title: 'Smart Presence', desc: 'Secure biometric, RFID, and face-recognition integrations with instant SMS alerts.', icon: <Clock size={24} /> },
              { title: 'Financial Vault', desc: 'End-to-end fee collection, automated invoicing, and integrated payment gateways.', icon: <Wallet size={24} /> }
            ].map((s, i) => (
              <div key={i} className="p-10 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 shadow-sm transition-all group hover:-translate-y-2 duration-300">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{s.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{s.desc}</p>
                <Link to="/login" className="text-blue-600 font-bold flex items-center gap-2 group-hover:underline">Explore <ArrowRight size={16} /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <div className="mb-20 animate-in fade-in slide-in-from-bottom duration-700">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              <span className="font-serif-elegant italic font-normal text-slate-800 text-6xl md:text-7xl">Truly</span> Affordable Pricing
            </h2>
            <p className="text-slate-500 text-lg font-medium">Choose a plan that scales with your growth. All prices in INR.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-left items-stretch">
            {[
              { id: 'STARTER', title: 'Basic', price: '2,499', features: ['Up to 500 Students', 'Core Academics', 'Email Support', 'Attendance Mgmt'] },
              { id: 'PROFESSIONAL', title: 'Premium', price: '5,999', features: ['Up to 1500 Students', 'Finance & Fees', 'Priority Support', 'Examination Suite'], recommended: true },
              { id: 'ENTERPRISE', title: 'Elite', price: '11,999', features: ['Unlimited Students', 'Multi-school Hub', '24/7 Dedicated Support', 'White-labeled App'] }
            ].map((p, i) => (
              <div key={i} className={`p-10 rounded-[2.5rem] transition-all duration-500 border flex flex-col h-full ${p.recommended ? 'bg-slate-900 text-white scale-105 shadow-2xl shadow-blue-100 z-10' : 'bg-white border-slate-100 shadow-xl hover:border-blue-200'}`}>
                {p.recommended && <div className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full w-fit mb-6 tracking-widest uppercase">MOST POPULAR</div>}
                
                <h3 className="text-2xl font-bold mb-4">{p.title}</h3>
                <div className="mb-10 flex items-baseline gap-1">
                  <span className="text-sky-500 font-bold text-2xl pr-1">{"\u20B9"}</span>
                  <span className="text-5xl font-black">{p.price}</span>
                  <span className={`text-sm ml-1 ${p.recommended ? 'text-slate-400' : 'text-slate-500'}`}>/month</span>
                </div>
                
                <ul className="space-y-5 mb-12 flex-grow">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${p.recommended ? 'bg-blue-600' : 'bg-blue-50'}`}>
                        <CheckCircle2 size={12} className={p.recommended ? 'text-white' : 'text-blue-600'} />
                      </div>
                      <span className={`text-sm font-medium ${p.recommended ? 'text-slate-300' : 'text-slate-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to={`/register?plan=${p.id}`} 
                  className={`block w-full py-5 rounded-2xl font-bold text-center transition-all shadow-lg ${p.recommended ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  Select {p.title} Plan
                </Link>
              </div>
            ))}
          </div>
          
          <p className="mt-16 text-slate-500 text-sm font-medium">
            * All prices excluding GST. Annual billing discounts available.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
             <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                 <Sparkles className="text-white" size={18} />
               </div>
               <span className="text-xl font-bold tracking-tight">SmartERP</span>
             </div>
             <p className="text-slate-500 text-sm max-w-xs">Building the digital foundation for the institutions of the future.</p>
          </div>
          <div className="flex gap-10 text-slate-400 font-medium text-sm">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-blue-400 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a>
          </div>
          <p className="text-slate-500 text-sm">{"\u00A9"} 2026 SmartERP Solutions.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
