import React, { useState, useEffect } from 'react';
import { hostelAPI } from '../services/api';
import { Home, UserPlus, Users, Bed, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Hostel() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');

  const fetchHostelData = async () => {
    setLoading(true);
    try {
      const { data } = await hostelAPI.getAll();
      setHostels(data.data);
    } catch (error) {
      toast.error('Failed to fetch hostel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHostelData(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hostel Management</h2>
          <p className="text-gray-500 mt-1">Manage student accommodations, room allotments, and mess billing</p>
        </div>
        <div className="flex gap-2">
            <button className="btn btn-secondary flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Allot Room
            </button>
            <button className="btn btn-primary flex items-center gap-2">
              <Home className="w-4 h-4" /> New Hostel
            </button>
        </div>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'inventory' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Bed className="w-4 h-4" /> Room Inventory
        </button>
        <button 
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'billing' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <CreditCard className="w-4 h-4" /> Mess & Fees
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
             <div className="card text-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
               <p className="mt-4 text-gray-500">Scanning accommodations...</p>
             </div>
          ) : hostels.length === 0 ? (
             <div className="card text-center py-12">
               <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <h3 className="text-lg font-bold">No hostels found</h3>
               <p className="text-gray-500 max-w-sm mx-auto mt-2">Start by creating your first hostel building to manage rooms and allocations.</p>
               <button className="mt-6 btn btn-primary">Setup First Hostel</button>
             </div>
          ) : hostels.map(hostel => (
             <div key={hostel.id} className="card">
                <div className="flex justify-between items-center mb-6">
                   <div>
                      <h3 className="text-lg font-bold text-gray-900">{hostel.name}</h3>
                      <p className="text-sm text-gray-500">{hostel.type} • {hostel.rooms?.length || 0} Total Rooms</p>
                   </div>
                   <span className="badge badge-success">Operational</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {hostel.rooms?.map(room => (
                     <div key={room.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
                        <div className="flex justify-between items-start mb-2">
                           <p className="font-bold">Room #{room.roomNumber}</p>
                           <p className="text-xs font-medium text-gray-400">{room.category}</p>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                           <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary-600 rounded-full" 
                                style={{ width: `${(room.occupied/room.capacity)*100}%` }}
                              ></div>
                           </div>
                           <span className="text-xs font-bold text-gray-600">{room.occupied}/{room.capacity}</span>
                        </div>
                        <div className="space-y-1">
                           {room.allotments?.map(allot => (
                             <div key={allot.id} className="flex items-center gap-2 text-xs">
                                <div className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                   {allot.student?.profile?.firstName?.charAt(0)}
                                </div>
                                <span className="text-gray-700">{allot.student?.profile?.firstName}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          ))}
        </div>

        <div className="space-y-6">
           <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
              <h3 className="text-lg font-bold mb-4">Hostel Insights</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                    <p className="text-xs opacity-80 uppercase font-bold">Total Space</p>
                    <p className="text-2xl font-black">{hostels.reduce((acc, h) => acc + h.rooms?.reduce((r_acc, r) => r_acc + r.capacity, 0), 0)}</p>
                 </div>
                 <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                    <p className="text-xs opacity-80 uppercase font-bold">Occupied</p>
                    <p className="text-2xl font-black">{hostels.reduce((acc, h) => acc + h.rooms?.reduce((r_acc, r) => r_acc + r.occupied, 0), 0)}</p>
                 </div>
              </div>
              <button className="w-full mt-6 py-2 px-4 bg-white text-primary-700 font-bold rounded-lg text-sm hover:bg-opacity-90 transition-all">
                Download Occupancy Report
              </button>
           </div>

           <div className="card">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <CreditCard className="w-4 h-4 text-primary-600" /> Pending Receipts
              </h4>
              <div className="divide-y divide-gray-100">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="py-3 flex justify-between items-center group cursor-pointer">
                       <div>
                          <p className="text-sm font-medium text-gray-900">Student #{1000 + i}</p>
                          <p className="text-xs text-gray-500">March Mess Fee</p>
                       </div>
                       <p className="text-sm font-black text-amber-600">₹2,400</p>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-4 text-xs text-primary-600 font-bold hover:underline">View All Billing</button>
           </div>
        </div>
      </div>
    </div>
  );
}
