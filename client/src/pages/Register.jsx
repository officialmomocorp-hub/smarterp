import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  School, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const selectedPlan = queryParams.get('plan') || 'STARTER';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    udiseCode: '',
    schoolCode: '',
    plan: selectedPlan
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Basic validation
      if (formData.phone.length < 10) {
        toast.error('Please enter a valid phone number');
        return;
      }
      
      const response = await axios.post('/api/auth/register-school', formData);
      if (response.data.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const plans = {
    STARTER: { name: 'Basic', price: '2,499' },
    PROFESSIONAL: { name: 'Premium', price: '5,999' },
    ENTERPRISE: { name: 'Elite', price: '11,999' }
  };

  const planInfo = plans[selectedPlan] || plans.STARTER;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-y-auto">
      <div className="max-w-5xl w-full grid md:grid-cols-5 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 my-8">
        
        {/* Left Side: Plan Info (2 cols) */}
        <div className="md:col-span-2 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full mesh-gradient-blob opacity-20 pointer-events-none"></div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity w-fit">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <span className="font-bold text-xl tracking-tight">SmartERP</span>
            </Link>

            <h2 className="text-3xl font-bold mb-6 leading-tight">Welcome to the <br/><span className="text-blue-400">Future of Education</span></h2>
            <p className="text-slate-400 mb-10 leading-relaxed text-sm">
              You've chosen the <span className="text-white font-bold">{planInfo.name}</span> plan. 
              Join 100+ institutions transforming their academic workflows today.
            </p>

            <div className="space-y-6">
              {[
                { title: 'Priority Onboarding', desc: 'Get your data migrated in 24 hours.' },
                { title: '24/7 Premium Support', desc: 'Dedicated manager for your school.' },
                { title: 'Feature Suite', desc: 'Academics, Finance & Transport.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-10 border-t border-white/10 relative z-10 mt-12">
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-slate-400">Starting at</span>
              <span className="text-3xl font-black">{"\u20B9"}{planInfo.price}</span>
              <span className="text-sm text-slate-500">/mo</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-bold">Billing starts after 14-day trial</p>
          </div>
        </div>

        {/* Right Side: Form (3 cols) */}
        <div className="md:col-span-3 p-12 bg-white">
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Register Institution</h3>
            <p className="text-slate-500 text-sm font-medium">Please provide your school and admin details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Identity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">School Name</label>
                <div className="relative">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="schoolName"
                    required
                    placeholder="Institution Name"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">UDISE Code</label>
                <div className="relative">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="udiseCode"
                    required
                    placeholder="11-digit Code"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Street Address"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="City"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="State"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  placeholder="Pincode"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Admin Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="adminName"
                    required
                    placeholder="Proprietor Name"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="phone"
                    required
                    maxLength={10}
                    placeholder="10-digit Mobile"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    name="adminEmail"
                    required
                    placeholder="admin@school.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    name="adminPassword"
                    required
                    placeholder="Create Password"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Complete Registration <ArrowRight className="group-hover:translate-x-1 transition-transform" /> </>}
            </button>

            <p className="text-center text-slate-500 text-xs mt-6 font-medium">
              By registering, you agree to our <span className="text-slate-900 underline cursor-pointer">Terms of Service</span>.
            </p>
            
            <p className="text-center text-slate-500 text-xs mt-2">
              Already a member? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
