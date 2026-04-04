import React, { useState, useEffect } from 'react';
import { staffAPI } from '../services/api';
import { Plus, Search, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data } = await staffAPI.getAll({ page: 1, limit: 20 });
        setStaff(data.data.staff || []);
      } catch (error) {
        console.error('Failed to fetch staff');
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-500 mt-1">Manage teaching and non-teaching staff</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-10" placeholder="Search staff..." />
          </div>
          <select className="input w-48">
            <option value="">All Designations</option>
            <option>Teacher</option>
            <option>Senior Teacher</option>
            <option>HOD</option>
            <option>Principal</option>
            <option>Clerk</option>
            <option>Peon</option>
          </select>
          <select className="input w-48">
            <option value="">All Departments</option>
            <option>Mathematics</option>
            <option>Science</option>
            <option>English</option>
            <option>Hindi</option>
            <option>Social Studies</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <>
              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    SS
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sunita Sharma</p>
                    <p className="text-sm text-gray-500">Senior Teacher - Mathematics</p>
                    <p className="text-xs text-gray-400">STF250001 | B.Ed, M.Sc</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Joining Date</p>
                    <p className="font-medium">01/04/2018</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Basic Pay</p>
                    <p className="font-medium">₹45,000</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
