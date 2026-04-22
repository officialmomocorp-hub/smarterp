import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export default function MaintenanceOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-[#030712]">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg card bg-white/5 backdrop-blur-3xl border-white/10 p-12 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-rose-300 to-rose-500 animate-gradient-x" />
        
        <div className="w-24 h-24 bg-rose-500/20 rounded-3xl mx-auto mb-8 flex items-center justify-center border border-rose-500/30 text-rose-400">
           <Zap className="w-12 h-12 animate-pulse" />
        </div>

        <h1 className="text-4xl font-black text-white tracking-tight uppercase mb-4">
          System <span className="text-rose-500">Standby</span>
        </h1>
        
        <p className="text-gray-400 font-medium leading-relaxed mb-8">
          SmartERP is currently undergoing scheduled platform maintenance. We are tuning the core for peak performance and security.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Security Stable</p>
           </div>
           <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <RefreshCw className="w-6 h-6 text-indigo-400 mx-auto mb-2 animate-spin-slow" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sync in Progress</p>
           </div>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
        >
          Check Platform Status
        </button>

        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-gray-600">
           <AlertTriangle className="w-4 h-4" />
           <span className="text-[10px] font-black uppercase tracking-widest">Administrator Access Protocol active</span>
        </div>
      </motion.div>
    </div>
  );
}
