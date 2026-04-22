import React, { useState, useEffect } from 'react';
import { transportAPI } from '../services/api';
import { Bus, MapPin, Plus, List, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Transport() {
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('routes');

  const fetchTransportData = async () => {
    setLoading(true);
    try {
      const [routesRes, vehiclesRes] = await Promise.all([
        transportAPI.getRoutes(),
        transportAPI.getVehicles()
      ]);
      setRoutes(routesRes.data.data);
      setVehicles(vehiclesRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch transport data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransportData(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Transport Management</h2>
          <p className="text-gray-500 mt-1">Manage school bus routes, vehicles, and fleet compliance</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Transport
        </button>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('routes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'routes' ? 'bg-white text-[#409CFF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <MapPin className="w-4 h-4" /> Bus Routes
        </button>
        <button 
          onClick={() => setActiveTab('vehicles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'vehicles' ? 'bg-white text-[#409CFF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Bus className="w-4 h-4" /> Vehicle Fleet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'routes' ? (
          <>
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Active Routes</h3>
                <span className="badge badge-blue">{routes.length} Routes</span>
              </div>
              <div className="space-y-4">
                {loading ? (
                    <p className="text-gray-500 py-4 text-center">Loading routes...</p>
                ) : routes.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center">No routes added yet</p>
                ) : routes.map(route => (
                  <div key={route.id} className="p-4 border border-[rgba(84,84,88,0.36)] rounded-xl hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                       <p className="font-bold text-[#409CFF]">{route.routeName}</p>
                       <p className="text-xs font-mono text-gray-400">{route.vehicle?.vehicleNumber || 'No Bus Assigned'}</p>
                    </div>
                    <p className="text-sm text-gray-500">{route.description}</p>
                    <div className="mt-3 flex gap-2">
                       <span className="text-xs bg-gray-50 px-2 py-1 rounded border border-[rgba(84,84,88,0.36)]">{route.stops?.length || 0} Stops</span>
                       <span className="text-xs bg-gray-50 px-2 py-1 rounded border border-[rgba(84,84,88,0.36)]">Fare: ₹{route.transportFee || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card bg-gradient-to-br from-primary-50 to-white border-primary-100">
               <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#0A84FF]/15 flex items-center justify-center text-[#0A84FF] mb-4">
                     <Plus className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Define New Route</h4>
                  <p className="text-gray-500 text-sm mt-2 max-w-xs">Create routes, assign vehicles, and set up pick-up points for students.</p>
                  <button className="mt-6 btn btn-primary">Start Route Setup</button>
               </div>
            </div>
          </>
        ) : (
          <>
            <div className="card">
               <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Vehicle Fleet</h3>
                <span className="badge badge-amber">{vehicles.length} Vehicles</span>
              </div>
              <div className="space-y-4">
                {loading ? (
                    <p className="text-gray-500 py-4 text-center">Loading vehicles...</p>
                ) : vehicles.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center">No vehicles registered</p>
                ) : vehicles.map(vehicle => (
                  <div key={vehicle.id} className="p-4 border border-[rgba(84,84,88,0.36)] rounded-xl flex items-center gap-4">
                     <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                        <Bus className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                        <p className="font-bold text-white">{vehicle.vehicleNumber}</p>
                        <p className="text-xs text-gray-500">{vehicle.vehicleModel} • {vehicle.capacity} Seats</p>
                     </div>
                     <div className="text-right">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${new Date(vehicle.fitnessExpiry) > new Date() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {new Date(vehicle.fitnessExpiry) > new Date() ? 'Fitness OK' : 'Fitness Expired'}
                        </span>
                     </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="card text-center flex flex-col items-center">
                  <ShieldCheck className="w-8 h-8 text-green-600 mb-2" />
                  <p className="font-bold">Insurance Tracking</p>
                  <p className="text-xs text-gray-500 mt-1">Automated alerts for policy renewal</p>
               </div>
               <div className="card text-center flex flex-col items-center">
                  <List className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="font-bold">Fuel Logs</p>
                  <p className="text-xs text-gray-500 mt-1">Manage mileage and service history</p>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
