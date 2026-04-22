import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { feeAPI, academicAPI } from '../services/api';
import { useAuthStore } from '../store';
import { IndianRupee, Plus, Search, Download, AlertTriangle, CheckCircle, Clock, XCircle, X, Printer, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { TableSkeleton, StatsSkeleton } from '../components/Skeleton';

function formatINR(amount) {
  return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
}

export default function FeeManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('collect');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeStatus, setFeeStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [structureForm, setStructureForm] = useState({
    name: '', classId: '', academicYearId: '', totalAmount: '',
  });

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (['collect', 'structure', 'defaulters', 'reports'].includes(path)) {
      setActiveTab(path);
    }
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/fees/${tab}`);
  };

  const loadDependencies = async () => {
    try {
      const [clsRes, ayRes] = await Promise.all([
        academicAPI.getClasses(),
        academicAPI.getAcademicYears()
      ]);
      setClasses(clsRes.data.data || []);
      setAcademicYears(ayRes.data.data || []);
    } catch (e) {
      toast.error('Failed to load classes or academic years');
    }
  };

  const openCreateModal = () => {
    loadDependencies();
    setIsCreateModalOpen(true);
  };

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await feeAPI.createStructure({
        ...structureForm,
        class: structureForm.classId,
        academicYear: structureForm.academicYearId,
        totalAmount: parseFloat(structureForm.totalAmount),
        feeHeads: JSON.stringify([{ name: 'General Fee', amount: parseFloat(structureForm.totalAmount) }]),
        installmentType: 'ANNUALLY',
        dueDates: JSON.stringify([{ installment: 1, amount: parseFloat(structureForm.totalAmount), date: new Date().toISOString() }]),
        lateFinePerDay: 0,
        gstPercentage: 0
      });
      toast.success('Fee structure created successfully');
      setIsCreateModalOpen(false);
    } catch (err) {
      toast.error('Failed to create fee structure');
    } finally {
      setProcessing(false);
    }
  };
  const [paymentForm, setPaymentForm] = useState({
    installmentNumber: 1,
    paymentMode: 'CASH',
    amount: '',
    remarks: '',
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const currentYear = academicYears.find(y => y.isCurrent) || academicYears[0];
      const { data } = await feeAPI.getStudentFeeStatus(searchQuery, { academicYearId: currentYear?.id });
      setFeeStatus(data.data);
    } catch (error) {
      toast.error('Student not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await feeAPI.processPayment({
        studentId: searchQuery,
        feeStructureId: feeStatus?.student?.activeFeeStructure?.id,
        ...paymentForm,
      });
      toast.success('Payment recorded successfully');
      setPaymentForm({ installmentNumber: 1, paymentMode: 'CASH', amount: '', remarks: '' });
      handleSearch(); // Refresh fee status after payment
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-[#0A84FF]" aria-hidden="true" />
          Fee Management
        </h2>
        <p className="text-gray-600 mt-1">Manage fee collection, concessions, and reports</p>
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['collect', 'structure', 'defaulters', 'reports'].map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => handleTabChange(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
              activeTab === tab ? 'bg-white text-[#409CFF] ' : 'text-gray-500 hover:text-white'
            }`}
          >
            {tab === 'collect' ? 'Collect Fee' : tab}
          </button>
        ))}
      </div>

      {/* Collect Fee Tab */}
      {activeTab === 'collect' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4">Search Student</h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  aria-label="Student ID or Aadhar number"
                  className="input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Student ID or Aadhar number..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button 
                aria-label="Search student info"
                onClick={handleSearch} 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />} 
                Search
              </button>
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card h-48 animate-pulse bg-gray-50"></div>
              <div className="card h-48 animate-pulse bg-gray-50"></div>
              <div className="card h-48 animate-pulse bg-gray-50"></div>
            </div>
          )}

          {!loading && feeStatus && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Student Info */}
              <div className="card border-l-4 border-l-primary-500">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0A84FF]/150"></div> Student Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</p>
                    <p className="font-bold text-white">{feeStatus.student?.profile?.firstName} {feeStatus.student?.profile?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Class</p>
                    <p className="font-bold text-white">{feeStatus.student?.class?.name} - {feeStatus.student?.section?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</p>
                    <p className="font-mono text-sm font-bold text-[#409CFF]">{feeStatus.student?.studentId}</p>
                  </div>
                </div>
              </div>

              {/* Fee Summary */}
              <div className="card border-l-4 border-l-green-500">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Fee Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Total Due</span>
                    <span className="font-bold text-white" data-testid="fee-amount">{formatINR(feeStatus.summary?.totalDue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Total Paid</span>
                    <span className="font-bold text-green-600" data-testid="fee-amount">{formatINR(feeStatus.summary?.totalPaid || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Balance</span>
                    <span className="font-bold text-red-600" data-testid="fee-amount">{formatINR(feeStatus.summary?.totalBalance || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Late Fine</span>
                    <span className="font-bold text-amber-600" data-testid="fee-amount">{formatINR(feeStatus.summary?.totalLateFine || 0)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700">Payment Progress</span>
                      <span className="font-bold text-[#0A84FF]">{feeStatus.summary?.paymentPercentage}%</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(100, parseFloat(feeStatus.summary?.paymentPercentage || 0))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="card border-l-4 border-l-purple-500">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div> Record Payment
                </h4>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Installment</label>
                      <select
                        aria-label="Select Installment"
                        className="input"
                        value={paymentForm.installmentNumber}
                        onChange={(e) => setPaymentForm({ ...paymentForm, installmentNumber: parseInt(e.target.value) })}
                      >
                        <option value={1}>Q1 (Apr-Jun)</option>
                        <option value={2}>Q2 (Jul-Sep)</option>
                        <option value={3}>Q3 (Oct-Dec)</option>
                        <option value={4}>Q4 (Jan-Mar)</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Mode</label>
                      <select
                        aria-label="Select Payment Mode"
                        className="input"
                        value={paymentForm.paymentMode}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                      >
                        <option value="CASH">Cash</option>
                        <option value="CHEQUE">Cheque</option>
                        <option value="ONLINE">Online</option>
                        <option value="UPI">UPI</option>
                        <option value="DD">DD</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Amount (₹)</label>
                    <input
                      aria-label="Payment Amount"
                      type="number"
                      className="input"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Remarks</label>
                    <input
                      aria-label="Payment Remarks"
                      className="input"
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={processing}
                    className="w-full btn btn-success flex items-center justify-center gap-2  shadow-green-100"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />} 
                    Record Payment
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Payment History */}
          {!loading && feeStatus?.payments && (
            <div className="card">
              <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" aria-hidden="true" /> Payment History
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[rgba(84,84,88,0.36)]">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 ">Receipt</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 ">Installment</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 ">Date</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 ">Total</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 ">Paid</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 ">Balance</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 ">Status</th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 ">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {feeStatus.payments.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-10 text-center text-gray-500 font-medium italic">
                          No payment records found for this student.
                        </td>
                      </tr>
                    ) : feeStatus.payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4 text-sm font-mono font-bold text-[#409CFF]">{payment.receiptNumber}</td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-700">Q{payment.installmentNumber}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-600">{new Date(payment.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-4 text-sm font-bold text-white">{formatINR(payment.totalAmount)}</td>
                        <td className="px-4 py-4 text-sm font-bold text-green-700">{formatINR(payment.paidAmount)}</td>
                        <td className="px-4 py-4 text-sm font-bold text-red-700">{formatINR(payment.balanceAmount)}</td>
                        <td className="px-4 py-4">
                          <span className={`badge ${
                            payment.status === 'PAID' ? 'badge-green' :
                            payment.status === 'PARTIAL' ? 'badge-yellow' :
                            payment.status === 'OVERDUE' ? 'badge-red' : 'badge-gray'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            aria-label={`Print receipt ${payment.receiptNumber}`}
                            onClick={() => {
                              const token = useAuthStore.getState().token;
                              window.open(`/api/v1/pdf/receipt/${payment.id}?token=${token}`, '_blank');
                            }}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-[#0A84FF]/15 text-gray-600 hover:text-[#0A84FF] transition-all active:scale-95"
                            title="Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fee Structure Tab */}
      {activeTab === 'structure' && (
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Fee Structure Management</h3>
            <button 
              aria-label="Create new fee structure"
              onClick={openCreateModal} 
              className="btn btn-primary flex items-center gap-2  "
            >
              <Plus className="w-4 h-4" /> Create Structure
            </button>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-2xl p-6 ">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
               <div>
                  <h4 className="text-lg font-bold text-primary-900">Class 5 Fee Structure</h4>
                  <p className="text-[#409CFF] font-medium">Academic Session 2025-2026</p>
               </div>
               <div className="bg-white px-4 py-2 rounded-xl border border-primary-100">
                  <span className="text-xs font-bold text-primary-500 uppercase block tracking-wider">Total Package</span>
                  <span className="text-2xl font-bold text-primary-900" data-testid="fee-amount">{formatINR(31000)}</span>
               </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Tuition Fee', amount: 15000 },
                { name: 'Development Fee', amount: 5000 },
                { name: 'Lab Fee', amount: 2000 },
                { name: 'Sports Fee', amount: 1500 },
                { name: 'Library Fee', amount: 1000 },
                { name: 'Computer Fee', amount: 2000 },
                { name: 'Annual Charges', amount: 3000 },
                { name: 'Exam Fee', amount: 1500 },
              ].map((head) => (
                <div key={head.name} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white hover:border-primary-200 transition-all">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">{head.name}</p>
                  <p className="font-bold text-white text-lg" data-testid="fee-amount">{formatINR(head.amount)}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-5 border-t border-primary-100 flex flex-wrap gap-4 text-sm font-bold text-primary-800">
              <span className="bg-[#0A84FF]/15 px-3 py-1 rounded-full">Installments: Quarterly</span>
              <span className="bg-[#0A84FF]/15 px-3 py-1 rounded-full">Late Fine: ₹5/day</span>
              <span className="bg-[#0A84FF]/15 px-3 py-1 rounded-full">Due Window: 1st-15th</span>
            </div>
          </div>
        </div>
      )}

      {/* Defaulters Tab */}
      {activeTab === 'defaulters' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Fee Defaulters List</h3>
            <button 
              aria-label="Export defaulters report"
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-gray-300" aria-hidden="true" />
            </div>
            <p className="text-gray-600 font-medium">Search for a student to view their payment and defaulter status</p>
            <p className="text-gray-400 text-sm mt-1">Full class reports can be generated from the Reports tab</p>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-6">Real-time Collection Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl  shadow-green-100 text-white">
              <p className="text-sm font-bold text-green-100  mb-1">Today's Collection</p>
              <p className="text-3xl font-bold">₹0</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-100">
                 <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div> Live Updates
              </div>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl  shadow-blue-100 text-white">
              <p className="text-sm font-bold text-blue-100  mb-1">Monthly Peak</p>
              <p className="text-3xl font-bold">₹0</p>
              <p className="mt-4 text-xs font-bold text-blue-100">Across all classes</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl  shadow-purple-100 text-white">
              <p className="text-sm font-bold text-purple-100  mb-1">Expected Revenue</p>
              <p className="text-3xl font-bold">₹0</p>
              <p className="mt-4 text-xs font-bold text-purple-100 font-mono">EY 2025-26 Target</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Structure Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] rounded-2xl  w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 font-sans">
            <div className="px-6 py-5 border-b border-[rgba(84,84,88,0.36)] flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-white">Configure New Structure</h3>
              <button 
                aria-label="Close modal"
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStructure} className="p-6 space-y-5">
              <div>
                <label className="label">Structure Title</label>
                <input 
                  aria-label="Structure Title"
                  className="input" 
                  required 
                  placeholder="e.g. Class 1 Primary Annual"
                  value={structureForm.name} 
                  onChange={e => setStructureForm({...structureForm, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Class</label>
                  <select 
                    aria-label="Select Class"
                    className="input" 
                    required 
                    value={structureForm.classId} 
                    onChange={e => setStructureForm({...structureForm, classId: e.target.value})}
                  >
                    <option value="">Select</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Year</label>
                  <select 
                    aria-label="Select Academic Year"
                    className="input" 
                    required 
                    value={structureForm.academicYearId} 
                    onChange={e => setStructureForm({...structureForm, academicYearId: e.target.value})}
                  >
                    <option value="">Select</option>
                    {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Lump Sum Amount (₹)</label>
                <input 
                  aria-label="Total Amount"
                  type="number" 
                  className="input font-bold text-lg" 
                  required 
                  placeholder="50,000"
                  value={structureForm.totalAmount} 
                  onChange={e => setStructureForm({...structureForm, totalAmount: e.target.value})} 
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={processing}
                  className="w-full btn btn-primary flex justify-center items-center gap-2 py-3 font-bold  shadow-primary-200"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5"/>} 
                  Generate Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
