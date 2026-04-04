import React, { useState } from 'react';
import api from '../services/api';
import { Lock, User, Shield, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New password and confirm password do not match');
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-600" />
            Security & Profile Settings
          </h2>
          <p className="text-gray-500 mt-1">Manage your account security and personal preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-gray-200 bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Admin Account</h3>
            <p className="text-sm text-gray-500">Security Management</p>
          </div>
          <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm flex gap-3">
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             <p>It is recommended to change your password every 90 days to maintain security.</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
             <Lock className="w-5 h-5 text-gray-500" />
             Change Password
          </h3>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input 
                type="password" 
                required 
                className="input" 
                value={passwordData.currentPassword} 
                onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">New Password</label>
                <input 
                  type="password" 
                  required 
                  className="input" 
                  value={passwordData.newPassword} 
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                  minLength={6}
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input 
                  type="password" 
                  required 
                  className="input" 
                  value={passwordData.confirmPassword} 
                  onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                  minLength={6}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-6 flex justify-end">
              <button disabled={loading} type="submit" className="btn btn-primary">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
