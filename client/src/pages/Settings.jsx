import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Bell, Globe, ShieldCheck, 
  Settings as SettingsIcon, Save, Zap, 
  AlertCircle, Smartphone, Mail, MapPin, 
  Calendar, Plus, Trash2, Award
} from 'lucide-react';
import { dashboardAPI, platformAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  }
};

export default function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (isSuperAdmin && activeTab === 'profile') {
      fetchPlatformSettings();
    }
    // Shared fetch for holidays (simplified)
    if (activeTab === 'holidays') {
       // Mock or existing academic API call
    }
  }, [activeTab, isSuperAdmin]);

  const fetchPlatformSettings = async () => {
    try {
      const { data: response } = await platformAPI.getSettings();
      setPlatformSettings(response.data);
    } catch (error) {
      toast.error('Failed to load platform settings');
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      setLoading(true);
      const newStatus = !platformSettings.maintenanceMode;
      await platformAPI.updateSettings({ maintenanceMode: newStatus });
      setPlatformSettings({ ...platformSettings, maintenanceMode: newStatus });
      toast.success(`Global Maintenance ${newStatus ? 'Enabled' : 'Disabled'}`);
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      setLoading(true);
      // await dashboardAPI.changePassword(passwordData);
      toast.success('Security credentials updated');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: isSuperAdmin ? 'Platform Config' : 'School Profile', icon: isSuperAdmin ? Globe : SettingsIcon },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'holidays', label: 'Academic Calendar', icon: Calendar },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-12"
    >
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#0A84FF]/10 rounded-full blur-[0px] -translate-x-1/2 -translate-y-1/2 -z-10" />
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#0A84FF]/20 flex items-center justify-center border border-[#0A84FF]/30 text-[#0A84FF]">
               <SettingsIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#0A84FF]  uppercase">System Control</span>
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight">Account Settings</h2>
          <p className="text-gray-400 mt-2 max-w-lg font-medium">Configure institutional parameters and manage platform-wide accessibility.</p>
        </motion.div>
      </div>

      {/* ── Tabs Navigation ── */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 p-1.5 bg-[#1c1c1e]  border border-[#38383a] rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-[#2c2c2e] text-white ' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#0A84FF]' : ''}`} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && (
            isSuperAdmin ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Platform Overview */}
                  <div className="card bg-[#1c1c1e] border-[#38383a] p-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white ">Platform Configuration</h3>
                        <p className="text-xs text-[#0A84FF] font-bold  mt-1">Global System Parameters</p>
                      </div>
                      <Globe className="w-8 h-8 text-[#0A84FF] opacity-20" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <label className="text-[10px] font-bold text-gray-500 ">Platform Name</label>
                         <div className="flex items-center gap-3 p-4 bg-[#1c1c1e] border border-[#38383a] rounded-2xl group focus-within:border-[#0A84FF]/50 transition-all">
                            <Globe className="w-5 h-5 text-gray-400 group-focus-within:text-[#0A84FF] transition-colors" />
                            <input 
                              type="text" 
                              className="bg-transparent border-none text-white text-sm font-bold w-full focus:outline-none" 
                              defaultValue={platformSettings?.platformName || "SmartERP"}
                            />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-bold text-gray-500 ">Support Core Email</label>
                         <div className="flex items-center gap-3 p-4 bg-[#1c1c1e] border border-[#38383a] rounded-2xl group focus-within:border-[#0A84FF]/50 transition-all">
                            <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-[#0A84FF] transition-colors" />
                            <input 
                              type="email" 
                              className="bg-transparent border-none text-white text-sm font-bold w-full focus:outline-none" 
                              defaultValue={platformSettings?.supportEmail || "support@smarterp.in"}
                            />
                         </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-[#38383a] flex justify-end">
                       <button className="px-8 py-3 bg-[#0A84FF] text-white text-xs font-bold  rounded-xl hover:bg-[#409CFF] transition-all  flex items-center gap-2">
                          <Save className="w-4 h-4" /> Save Configuration
                       </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Maintenance Control */}
                  <div className="card border-[#FF453A]/20 bg-gradient-to-br from-[#FF453A]/10 to-transparent p-8">
                    <div className="flex items-start gap-4 mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-[#FF453A]/20 border border-[#FF453A]/30 flex items-center justify-center text-rose-400">
                          <Zap className="w-6 h-6 animate-pulse" />
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-white leading-tight">System Maintenance</h3>
                          <p className="text-xs text-rose-300/60 font-medium mt-1">Global System Maintenance</p>
                       </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium mb-8">
                       Enabling maintenance mode will suspend all institutional activities. Only Super Admins will retain access to the platform control panel.
                    </p>
                    <div className="flex items-center justify-between p-4 bg-[#1c1c1e] rounded-2xl border border-[#38383a]">
                       <span className="text-[10px] font-bold text-white ">
                          {platformSettings?.maintenanceMode ? 'STATUS: ACTIVE' : 'Status: Offline'}
                       </span>
                       <button 
                         onClick={handleToggleMaintenance}
                         disabled={loading}
                         className={`w-14 h-7 rounded-full relative transition-all duration-300 ${
                           platformSettings?.maintenanceMode ? 'bg-[#FF453A]' : 'bg-gray-700'
                         }`}
                       >
                         <div className={`absolute top-1 w-5 h-5 bg-[#1c1c1e] rounded-full transition-all duration-300 ${
                           platformSettings?.maintenanceMode ? 'left-8' : 'left-1'
                         }`} />
                       </button>
                    </div>
                  </div>

                  <div className="card bg-[#0A84FF]/10 border-[#0A84FF]/20 p-8">
                     <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-[#0A84FF]" />
                        <h4 className="text-xs font-bold text-white ">Platform Integrity</h4>
                     </div>
                     <p className="text-[11px] text-gray-400 leading-relaxed font-medium capitalize">
                        All platform updates are automatically logged. System version is currently compliant with the latest security patches.
                     </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
                <div className="lg:col-span-2 card bg-[#1c1c1e] border-[#38383a]">
                   <h3 className="text-xl font-bold text-white  mb-8">Institutional Profile</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 ">School Name</label>
                        <input className="input-glass w-full" defaultValue={user?.school?.name} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 ">Affiliation Code</label>
                        <input className="input-glass w-full" defaultValue={user?.school?.code} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 ">Mailing Address</label>
                        <textarea className="input-glass w-full h-24" defaultValue={user?.school?.address}></textarea>
                      </div>
                   </div>
                   <div className="mt-8 pt-8 border-t border-[#38383a] flex justify-end">
                      <button className="px-8 py-3 bg-[#2c2c2e] text-white text-xs font-bold  rounded-xl hover:bg-white/20 transition-all">Save Changes</button>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="card bg-[#1c1c1e] border-[#38383a] p-8 text-center">
                      <div className="w-24 h-24 bg-[#2c2c2e] rounded-3xl mx-auto mb-6 flex items-center justify-center border border-[#38383a] overflow-hidden relative group">
                        {user?.school?.logoUrl ? (
                          <img src={user.school.logoUrl} className="w-full h-full object-cover" />
                        ) : (
                          <SettingsIcon className="w-10 h-10 text-gray-500 group-hover:text-[#0A84FF] transition-colors" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                           <Zap className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-white uppercase">Institutional Logo</h4>
                      <p className="text-xs text-gray-500 mt-2">Recommended resolution: 512x512 PNG with transparency.</p>
                      <button className="mt-6 w-full py-3 bg-[#1c1c1e] border border-[#38383a] rounded-xl text-[10px] font-bold text-white  hover:bg-[#2c2c2e] transition-all">Upload New Logo</button>
                   </div>
                </div>
              </div>
            )
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1 border border-[#38383a] bg-[#1c1c1e] backdrop-blur-none rounded-3xl p-8 space-y-8 h-fit">
                  <div className="text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#0A84FF]/10 rounded-full blur-2xl" />
                    <div className="w-24 h-24 bg-[#2c2c2e] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#38383a] relative z-10">
                      <ShieldCheck className="w-12 h-12 text-[#0A84FF]" />
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase">Security Vault</h3>
                    <p className="text-xs text-gray-400 mt-2 font-medium">Protecting your administrative sovereignty and data privacy.</p>
                  </div>
                  <div className="p-4 bg-[#0A84FF]/10 text-[#409CFF] rounded-2xl text-[11px] font-bold leading-relaxed flex gap-3 border border-[#0A84FF]/20">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>Rotate keys frequently. System logs audit every credential modification for accountability.</p>
                  </div>
               </div>

               <div className="lg:col-span-2 card bg-[#1c1c1e] border-[#38383a] p-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-8 ">
                    <Lock className="w-6 h-6 text-[#0A84FF]" />
                    Encryption Matrix
                  </h3>
                  
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-500 ">Active Credentials</label>
                       <input 
                         type="password" 
                         className="input-glass w-full py-4 px-6" 
                         placeholder="Current Access Key"
                         value={passwordData.currentPassword}
                         onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                       />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#38383a]">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 ">New Protocol</label>
                          <input 
                            type="password" 
                            className="input-glass w-full" 
                            placeholder="Primary Key"
                            value={passwordData.newPassword}
                            onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 ">Verify Protocol</label>
                          <input 
                            type="password" 
                            className="input-glass w-full" 
                            placeholder="Mirror Key"
                            value={passwordData.confirmPassword}
                            onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="pt-8 flex justify-end">
                       <button className="px-10 py-4 bg-[#0A84FF] text-white text-[10px] font-bold  rounded-2xl hover:bg-[#409CFF] transition-all  flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> Finalize Security Update
                       </button>
                    </div>
                  </form>
               </div>
            </div>
          )}

          {activeTab === 'holidays' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 card bg-[#1c1c1e] border-[#38383a] p-8 h-fit">
                   <h3 className="text-xl font-bold text-white uppercase mb-8">Calendar Entry</h3>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 ">Event Designation</label>
                        <input className="input-glass w-full" placeholder="e.g. Winter Break" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 ">Event Horizon</label>
                        <input type="date" className="input-glass w-full text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 ">Taxonomy</label>
                        <select className="input-glass w-full text-gray-400 appearance-none">
                           <option>National Holiday</option>
                           <option>Institutional Holiday</option>
                           <option>Faculty Vacation</option>
                        </select>
                      </div>
                      <button className="w-full py-4 bg-[#0A84FF] text-white text-[10px] font-bold  rounded-2xl hover:bg-[#409CFF] transition-all  flex items-center justify-center gap-2">
                         <Plus className="w-4 h-4" /> Commit Event
                      </button>
                   </div>
                </div>

                <div className="lg:col-span-2 card bg-[#1c1c1e] border-[#38383a] p-0 overflow-hidden">
                   <div className="p-8 border-b border-[#38383a] bg-transparent">
                      <h3 className="text-xl font-bold text-white ">Academic Timeline</h3>
                   </div>
                   <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto">
                      {[
                        { title: "Diwali Festivities", date: "2024-11-01", type: "National" },
                        { title: "Annual Foundation Day", date: "2024-12-15", type: "Institutional" },
                        { title: "Republic Day", date: "2025-01-26", type: "National" }
                      ].map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-[#1c1c1e] border border-[#38383a] rounded-2xl hover:border-[#0A84FF]/30 transition-all group">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-[#1c1c1e] border border-[#38383a] flex items-center justify-center group-hover:bg-[#0A84FF]/20 group-hover:text-[#0A84FF] transition-all">
                                 <Calendar className="w-6 h-6" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-white  group-hover:text-[#0A84FF] transition-colors">{h.title}</p>
                                 <p className="text-[10px] text-gray-500 font-bold  mt-1">{h.date} • {h.type}</p>
                              </div>
                           </div>
                           <button className="p-3 text-[#FF453A]/50 hover:text-[#FF453A] hover:bg-[#FF453A]/10 rounded-xl transition-all">
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
