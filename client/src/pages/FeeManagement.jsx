import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { feeAPI, academicAPI } from '../services/api';
import { IndianRupee, Plus, Search, Download, AlertTriangle, CheckCircle, Clock, XCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

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
    try {
      await feeAPI.createStructure({
        ...structureForm,
        totalAmount: parseFloat(structureForm.totalAmount),
        feeHeads: JSON.stringify([{ name: 'General Fee', amount: parseFloat(structureForm.totalAmount) }]),
        installmentType: 'YEARLY',
        dueDates: JSON.stringify([{ installment: 1, amount: parseFloat(structureForm.totalAmount), date: new Date().toISOString() }]),
        lateFinePerDay: 0,
        gstPercentage: 0
      });
      toast.success('Fee structure created specifically required');
      setIsCreateModalOpen(false);
    } catch (err) {
      toast.error('Failed to create fee structure');
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
      // Search through students API
      const { data } = await feeAPI.getStudentFeeStatus(searchQuery, { academicYearId: 'demo-academic-year' });
      setFeeStatus(data.data);
    } catch (error) {
      toast.error('Student not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await feeAPI.processPayment({
        studentId: searchQuery,
        feeStructureId: feeStatus?.student?.activeFeeStructure?.id,
        ...paymentForm,
      });
      toast.success('Payment recorded successfully');
      setPaymentForm({ installmentNumber: 1, paymentMode: 'CASH', amount: '', remarks: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-gray-900" />
          Fee Management
        </h2>
        <p className="text-gray-500 mt-1">Manage fee collection, concessions, and reports</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['collect', 'structure', 'defaulters', 'reports'].map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Student</h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  className="input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Student ID or Aadhar number..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button onClick={handleSearch} className="btn btn-primary" disabled={loading}>
                <Search className="w-4 h-4 mr-2" /> Search
              </button>
            </div>
          </div>

          {feeStatus && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Student Info */}
              <div className="card">
                <h4 className="font-medium text-gray-900 mb-4">Student Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{feeStatus.student?.profile?.firstName} {feeStatus.student?.profile?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-medium">{feeStatus.student?.class?.name} - {feeStatus.student?.section?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-mono text-sm">{feeStatus.student?.studentId}</p>
                  </div>
                </div>
              </div>

              {/* Fee Summary */}
              <div className="card">
                <h4 className="font-medium text-gray-900 mb-4">Fee Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Due</span>
                    <span className="font-bold" data-testid="fee-amount">{formatINR(feeStatus.summary?.totalDue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Paid</span>
                    <span className="font-bold text-green-600" data-testid="fee-amount">{formatINR(feeStatus.summary?.totalPaid || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Balance</span>
                    <span className="font-bold text-red-600" data-testid="fee-amount">{formatINR(feeStatus.summary?.totalBalance || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Late Fine</span>
                    <span className="font-bold text-amber-600" data-testid="fee-amount">{formatINR(feeStatus.summary?.totalLateFine || 0)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Payment %</span>
                      <span className="font-bold">{feeStatus.summary?.paymentPercentage}%</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, parseFloat(feeStatus.summary?.paymentPercentage || 0))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="card">
                <h4 className="font-medium text-gray-900 mb-4">Record Payment</h4>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="label">Installment</label>
                    <select
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
                    <label className="label">Payment Mode</label>
                    <select
                      className="input"
                      value={paymentForm.paymentMode}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                    >
                      <option value="CASH">Cash</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="ONLINE">Online Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="DD">Demand Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Amount (₹)</label>
                    <input
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
                      className="input"
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <button type="submit" className="w-full btn btn-success flex items-center justify-center gap-2">
                    <IndianRupee className="w-4 h-4" /> Record Payment
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Payment History */}
          {feeStatus?.payments && feeStatus.payments.length > 0 && (
            <div className="card">
              <h4 className="font-medium text-gray-900 mb-4">Payment History</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Installment</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {feeStatus.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 text-sm font-mono">{payment.receiptNumber}</td>
                        <td className="px-4 py-3 text-sm">#{payment.installmentNumber}</td>
                        <td className="px-4 py-3 text-sm">{new Date(payment.dueDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm">{formatINR(payment.totalAmount)}</td>
                        <td className="px-4 py-3 text-sm">{formatINR(payment.paidAmount)}</td>
                        <td className="px-4 py-3 text-sm">{formatINR(payment.balanceAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${
                            payment.status === 'PAID' ? 'badge-green' :
                            payment.status === 'PARTIAL' ? 'badge-yellow' :
                            payment.status === 'OVERDUE' ? 'badge-red' : 'badge-gray'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            data-testid="print-receipt"
                            onClick={() => window.open(`/api/v1/pdf/receipt/${payment.id}`, '_blank')}
                            className="btn btn-secondary text-xs py-1 px-2"
                          >
                            Print
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Fee Structure</h3>
            <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Structure
            </button>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900">Class 5 Fee Structure 2025-2026</h4>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
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
                <div key={head.name} className="bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-500">{head.name}</p>
                  <p className="font-bold text-gray-900" data-testid="fee-amount">{formatINR(head.amount)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-blue-200 flex justify-between items-center">
              <span className="font-medium text-blue-900">Total Annual Fee</span>
              <span className="text-xl font-bold text-blue-900" data-testid="fee-amount">{formatINR(31000)}</span>
            </div>
            <div className="mt-3 text-sm text-blue-700">
              <p>Installment Type: Quarterly | Late Fine: ₹5/day | Due Dates: 15th of Apr, Jul, Oct, Jan</p>
            </div>
          </div>
        </div>
      )}

      {/* Defaulters Tab */}
      {activeTab === 'defaulters' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Fee Defaulters</h3>
            <button className="btn btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Search for a student to view their defaulter status</p>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600">Today's Collection</p>
              <p className="text-2xl font-bold text-green-700">₹0</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600">This Month</p>
              <p className="text-2xl font-bold text-blue-700">₹0</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600">This Year</p>
              <p className="text-2xl font-bold text-purple-700">₹0</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Structure Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Fee Structure</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStructure} className="p-6 space-y-4">
              <div>
                <label className="label">Structure Name</label>
                <input 
                  className="input" 
                  required 
                  placeholder="e.g. Class 1 Annual Fee"
                  value={structureForm.name} 
                  onChange={e => setStructureForm({...structureForm, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="label">Select Class</label>
                <select 
                  className="input" 
                  required 
                  value={structureForm.classId} 
                  onChange={e => setStructureForm({...structureForm, classId: e.target.value})}
                >
                  <option value="">Select a class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Academic Year</label>
                <select 
                  className="input" 
                  required 
                  value={structureForm.academicYearId} 
                  onChange={e => setStructureForm({...structureForm, academicYearId: e.target.value})}
                >
                  <option value="">Select an academic year</option>
                  {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Total Amount (₹)</label>
                <input 
                  type="number" 
                  className="input" 
                  required 
                  placeholder="e.g. 50000"
                  value={structureForm.totalAmount} 
                  onChange={e => setStructureForm({...structureForm, totalAmount: e.target.value})} 
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full btn btn-primary flex justify-center items-center gap-2">
                  <Plus className="w-4 h-4"/> Save Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
