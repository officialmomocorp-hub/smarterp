import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Users, AlertTriangle, TrendingDown, Send, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = '/api/v1';

function formatINR(amount) {
  return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('udise');
  const [loading, setLoading] = useState(false);
  const [below75Students, setBelow75Students] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/academic/classes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setClasses(data.data || []);
    } catch (error) {
      console.error('Failed to fetch classes');
    }
  };

  const handleUDISEExport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/reports-enhanced/udise?year=2025-26`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'UDISE-2025-26.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('UDISE+ data exported successfully');
    } catch (error) {
      toast.error('Failed to export UDISE data');
    } finally {
      setLoading(false);
    }
  };

  const handleBelow75Check = async () => {
    if (!selectedClass) { toast.error('Please select a class'); return; }
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/reports-enhanced/below75/${selectedClass}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBelow75Students(data.data || []);
      toast.success(`Found ${data.data.length} students below 75% attendance`);
    } catch (error) {
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSMSAlert = async (studentId) => {
    try {
      await axios.post(`${API_BASE}/reports-enhanced/sms-alert/${studentId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('SMS alert ready for parent');
    } catch (error) {
      toast.error('Failed to send SMS alert');
    }
  };

  const tabs = [
    { id: 'udise', label: 'UDISE+ Export', icon: Download },
    { id: 'attendance', label: 'Attendance Warnings', icon: AlertTriangle },
    { id: 'pdf', label: 'PDF Generator', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Compliance</h2>
        <p className="text-gray-500 mt-1">UDISE+ export, attendance warnings, PDF generation</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* UDISE+ Export Tab */}
      {activeTab === 'udise' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">UDISE+ Data Export</h3>
            <p className="text-gray-500 mb-6">Export enrollment, teacher, and infrastructure data in UDISE+ format for government submission</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">School Information</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• UDISE Code</li>
                  <li>• School Name & Address</li>
                  <li>• Management Type</li>
                  <li>• Medium of Instruction</li>
                </ul>
              </div>
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Enrollment Data</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Class-wise enrollment</li>
                  <li>• Gender breakdown</li>
                  <li>• Category (Gen/OBC/SC/ST)</li>
                  <li>• CWSN students</li>
                </ul>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Teacher Data</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Teacher count by gender</li>
                  <li>• Qualification details</li>
                  <li>• B.Ed/M.Ed status</li>
                  <li>• Training status</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleUDISEExport}
                disabled={loading}
                data-testid="udise-export-btn"
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {loading ? 'Exporting...' : 'Export UDISE+ Excel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Warnings Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Warning (Below 75%)</h3>
            <p className="text-gray-500 mb-4">CBSE Rule: Students below 75% attendance cannot appear for board exams</p>

            <div className="flex gap-4 mb-6">
              <select className="input w-48" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button onClick={handleBelow75Check} disabled={loading} className="btn btn-primary flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {loading ? 'Checking...' : 'Check Attendance'}
              </button>
            </div>

            {below75Students.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Class</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Attendance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Present/Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Parent Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {below75Students.map(s => (
                      <tr key={s.student.id} className="bg-red-50 hover:bg-red-100">
                        <td className="px-4 py-3 text-sm font-medium">{s.student.name}</td>
                        <td className="px-4 py-3 text-sm">{s.student.class}-{s.student.section}</td>
                        <td className="px-4 py-3">
                          <span className="badge badge-red">{s.attendancePercentage}%</span>
                        </td>
                        <td className="px-4 py-3 text-sm">{s.presentDays}/{s.totalDays}</td>
                        <td className="px-4 py-3 text-sm">{s.student.parentPhone}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleSMSAlert(s.student.id)}
                            className="btn btn-secondary text-xs py-1 px-2 flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> SMS Parent
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {below75Students.length === 0 && selectedClass && (
              <div className="text-center py-8 text-green-600">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                <p className="font-medium">All students have 75%+ attendance</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Generator Tab */}
      {activeTab === 'pdf' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF Document Generator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <FileText className="w-8 h-8 text-blue-600 mb-3" />
                <h4 className="font-medium text-blue-900 mb-2">Fee Receipt</h4>
                <p className="text-sm text-blue-700 mb-4">Print fee receipt with school letterhead, fee breakdown, and duplicate copy</p>
                <button className="btn btn-primary text-sm flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
              </div>
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <FileText className="w-8 h-8 text-green-600 mb-3" />
                <h4 className="font-medium text-green-900 mb-2">Report Card</h4>
                <p className="text-sm text-green-700 mb-4">CBSE-format report card with marks, grades, co-scholastic areas</p>
                <button data-testid="generate-report-card" className="btn btn-success text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" /> Generate Report Card
                </button>
              </div>
              <div className="p-6 bg-amber-50 rounded-lg border border-amber-200">
                <FileText className="w-8 h-8 text-amber-600 mb-3" />
                <h4 className="font-medium text-amber-900 mb-2">Transfer Certificate</h4>
                <p className="text-sm text-amber-700 mb-4">Standard TC format with all required fields and signatures</p>
                <button data-testid="issue-tc-btn" className="btn btn-secondary text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Issue TC
                </button>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                <FileText className="w-8 h-8 text-purple-600 mb-3" />
                <h4 className="font-medium text-purple-900 mb-2">Salary Slip</h4>
                <p className="text-sm text-purple-700 mb-4">Monthly salary slip with earnings, deductions, net salary</p>
                <button className="btn btn-secondary text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" /> Generate Salary Slip
                </button>
              </div>
              <div className="p-6 bg-cyan-50 rounded-lg border border-cyan-200">
                <FileText className="w-8 h-8 text-cyan-600 mb-3" />
                <h4 className="font-medium text-cyan-900 mb-2">Student ID Card</h4>
                <p className="text-sm text-cyan-700 mb-4">Credit card size ID with photo, details, and school info</p>
                <button className="btn btn-secondary text-sm flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Generate ID Card
                </button>
              </div>
              <div className="p-6 bg-pink-50 rounded-lg border border-pink-200">
                <FileText className="w-8 h-8 text-pink-600 mb-3" />
                <h4 className="font-medium text-pink-900 mb-2">Character Certificate</h4>
                <p className="text-sm text-pink-700 mb-4">Standard character & conduct certificate format</p>
                <button className="btn btn-secondary text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" /> Generate Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
