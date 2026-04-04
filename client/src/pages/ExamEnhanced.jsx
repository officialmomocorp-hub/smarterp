import React, { useState, useEffect } from 'react';
import { examAPI } from '../services/api';
import axios from 'axios';
import {
  Award, FileText, Users, CheckCircle, XCircle, Clock,
  Download, Upload, Eye, AlertTriangle, TrendingUp, BarChart3,
  QrCode, Printer, Send, Edit3, Save, ArrowLeft, ArrowRight,
  FileCheck, FileX, Shield, Search, Plus, Calendar, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = '/api/v1';

function formatINR(amount) {
  return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
}

export default function ExamEnhanced() {
  const [activeTab, setActiveTab] = useState('verification');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [pendingMarks, setPendingMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data } = await examAPI.getAll();
      setExams(data.data || []);
    } catch (error) {
      console.error('Failed to fetch exams');
    }
  };

  const fetchPendingVerifications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/exams-enhanced/verification/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPendingMarks(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch pending verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleHODVerify = async (markId, action) => {
    try {
      await axios.put(`${API_BASE}/exams-enhanced/marks/${markId}/hod-verify`,
        { action, remarks: action === 'APPROVE' ? 'Verified' : 'Please review' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success(action === 'APPROVE' ? 'Marks verified' : 'Sent back to teacher');
      fetchPendingVerifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handlePrincipalApprove = async (markId, action) => {
    try {
      await axios.put(`${API_BASE}/exams-enhanced/marks/${markId}/principal-approve`,
        { action, remarks: action === 'APPROVE' ? 'Approved for publication' : 'Needs review' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success(action === 'APPROVE' ? 'Marks approved' : 'Sent back to HOD');
      fetchPendingVerifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleGenerateHallTickets = async () => {
    if (!selectedExam) { toast.error('Please select an exam'); return; }
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/exams-enhanced/hall-tickets/bulk/${selectedExam.id}/${selectedExam.classId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success(`${data.data.count} hall tickets generated`);
    } catch (error) {
      toast.error('Failed to generate hall tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSeating = async () => {
    if (!selectedExam) { toast.error('Please select an exam'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/exams-enhanced/seating/generate`,
        { examId: selectedExam.id, classId: selectedExam.classId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Seating arrangement generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate seating');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnswerBooks = async () => {
    if (!selectedExam) { toast.error('Please select an exam'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/exams-enhanced/answer-books/generate`,
        { examId: selectedExam.id, count: 100 },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('100 answer books generated with barcodes');
    } catch (error) {
      toast.error('Failed to generate answer books');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAnalytics = async () => {
    if (!selectedExam) { toast.error('Please select an exam'); return; }
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/exams-enhanced/analytics/${selectedExam.id}/${selectedExam.classId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setVerificationData(data.data);
      setActiveTab('analytics');
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'verification', label: 'Verification', icon: Shield },
    { id: 'hall-tickets', label: 'Hall Tickets', icon: FileText },
    { id: 'seating', label: 'Seating', icon: MapPin },
    { id: 'answer-books', label: 'Answer Books', icon: QrCode },
    { id: 'compartment', label: 'Compartment', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Examination Management (Enhanced)</h2>
        <p className="text-gray-500 mt-1">Verification workflow, hall tickets, seating, analytics & more</p>
      </div>

      {/* Exam Selector */}
      <div className="card">
        <label className="label">Select Exam</label>
        <select
          className="input max-w-md"
          value={selectedExam?.id || ''}
          onChange={(e) => {
            const exam = exams.find(ex => ex.id === e.target.value);
            setSelectedExam(exam || null);
          }}
        >
          <option value="">-- Select Exam --</option>
          {exams.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.name} ({ex.class?.name}) - {ex.type}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'verification') fetchPendingVerifications();
              if (tab.id === 'analytics') handleFetchAnalytics();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Verification Workflow Tab */}
      {activeTab === 'verification' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">3-Level Verification Workflow</h3>
            <button onClick={fetchPendingVerifications} className="btn btn-secondary text-sm">
              <Search className="w-4 h-4 mr-1" /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                <h4 className="font-medium text-blue-900">Teacher</h4>
              </div>
              <p className="text-sm text-blue-700">Enter marks → Save as DRAFT → Submit for Verification</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">2</div>
                <h4 className="font-medium text-amber-900">HOD/Coordinator</h4>
              </div>
              <p className="text-sm text-amber-700">Review marks → Approve or Send Back with reason</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">3</div>
                <h4 className="font-medium text-green-900">Principal</h4>
              </div>
              <p className="text-sm text-green-700">Final approval → Publish Result to parents/students</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : pendingMarks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
              <p>No pending verifications</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingMarks.map(mark => (
                    <tr key={mark.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{mark.student?.profile?.firstName} {mark.student?.profile?.lastName}</p>
                        <p className="text-xs text-gray-500">{mark.student?.class?.name} - {mark.student?.section?.name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{mark.subject?.name}</td>
                      <td className="px-4 py-3 text-sm font-mono">{mark.marksObtained}/{mark.maxMarks}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${
                          mark.status === 'DRAFT' ? 'badge-gray' :
                          mark.status === 'SUBMITTED' ? 'badge-yellow' :
                          mark.status === 'VERIFIED' ? 'badge-blue' : 'badge-green'
                        }`}>
                          {mark.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">Level {mark.verificationLevel}/3</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {mark.status === 'SUBMITTED' && (
                            <>
                              <button onClick={() => handleHODVerify(mark.id, 'APPROVE')} className="btn btn-success text-xs py-1 px-2">
                                <CheckCircle className="w-3 h-3 mr-1" /> Approve
                              </button>
                              <button onClick={() => handleHODVerify(mark.id, 'SEND_BACK')} className="btn btn-danger text-xs py-1 px-2">
                                <XCircle className="w-3 h-3 mr-1" /> Send Back
                              </button>
                            </>
                          )}
                          {mark.status === 'VERIFIED' && (
                            <>
                              <button onClick={() => handlePrincipalApprove(mark.id, 'APPROVE')} className="btn btn-success text-xs py-1 px-2">
                                <FileCheck className="w-3 h-3 mr-1" /> Publish
                              </button>
                              <button onClick={() => handlePrincipalApprove(mark.id, 'SEND_BACK')} className="btn btn-danger text-xs py-1 px-2">
                                <ArrowLeft className="w-3 h-3 mr-1" /> Send Back
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Hall Tickets Tab */}
      {activeTab === 'hall-tickets' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hall Ticket Generation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Bulk Generate</h4>
                <p className="text-sm text-blue-700 mb-4">Generate hall tickets for all students of the selected exam</p>
                <button
                  onClick={handleGenerateHallTickets}
                  disabled={loading || !selectedExam}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Generate All Hall Tickets
                </button>
              </div>
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Features Included</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✓ Student photo & details</li>
                  <li>✓ Masked Aadhar (XXXX-XXXX-1234)</li>
                  <li>✓ Exam schedule table</li>
                  <li>✓ Room & Seat number</li>
                  <li>✓ QR code for verification</li>
                  <li>✓ 10 exam instructions (Hindi + English)</li>
                  <li>✓ Principal signature line</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seating Arrangement Tab */}
      {activeTab === 'seating' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seating Arrangement Generator</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Auto-Generate</h4>
                <p className="text-sm text-purple-700 mb-3">Mix students from different sections, assign room & seat automatically</p>
                <button
                  onClick={handleGenerateSeating}
                  disabled={loading || !selectedExam}
                  className="btn btn-primary text-sm flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> Generate Seating Plan
                </button>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-900 mb-2">Print Room Charts</h4>
                <p className="text-sm text-amber-700">Room-wise seating chart for door display + attendance sheet</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Invigilator Duty</h4>
                <p className="text-sm text-green-700">Auto-assign teachers to rooms with duty chart</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Answer Books Tab */}
      {activeTab === 'answer-books' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Answer Book Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <QrCode className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <h4 className="font-medium text-blue-900">Generate Barcodes</h4>
                <button
                  onClick={handleGenerateAnswerBooks}
                  disabled={loading || !selectedExam}
                  className="btn btn-primary text-xs mt-2"
                >
                  Generate 100 Books
                </button>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <h4 className="font-medium text-green-900">Distribute</h4>
                <p className="text-xs text-green-700 mt-1">Scan barcode → Assign to student</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <Edit3 className="w-8 h-8 mx-auto text-amber-600 mb-2" />
                <h4 className="font-medium text-amber-900">Checking</h4>
                <p className="text-xs text-amber-700 mt-1">Assign to teacher → Track progress</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <Send className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <h4 className="font-medium text-purple-900">Return</h4>
                <p className="text-xs text-purple-700 mt-1">Marks entered → Return to office</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compartment Tab */}
      {activeTab === 'compartment' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compartment / Back Exam Management</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-amber-900 mb-2">Compartment Rules</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Fail in 1 subject only = Compartment eligible</li>
                <li>• Fail in 2+ subjects = Full fail (no compartment)</li>
                <li>• Compartment exam fee: ₹500 per subject</li>
                <li>• If pass → update original result to PASS</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-primary flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Identify Eligible Students
              </button>
              <button className="btn btn-secondary flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Schedule Compartment Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {verificationData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold">{verificationData.summary?.totalStudents || 0}</p>
                </div>
                <div className="card">
                  <p className="text-sm text-green-500">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{verificationData.summary?.passCount || 0}</p>
                </div>
                <div className="card">
                  <p className="text-sm text-red-500">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{verificationData.summary?.failCount || 0}</p>
                </div>
                <div className="card">
                  <p className="text-sm text-amber-500">Pass %</p>
                  <p className="text-2xl font-bold text-amber-600">{verificationData.summary?.passPercentage || 0}%</p>
                </div>
              </div>

              {verificationData.top10 && verificationData.top10.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Students</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {verificationData.top10.map((student, idx) => (
                          <tr key={student.student?.id || idx} className={idx < 3 ? 'bg-yellow-50' : ''}>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                idx === 0 ? 'bg-yellow-400 text-white' :
                                idx === 1 ? 'bg-gray-400 text-white' :
                                idx === 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {student.rank}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {student.student?.profile?.firstName} {student.student?.profile?.lastName}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold">{student.percentage}%</td>
                            <td className="px-4 py-3">
                              <span className={`badge ${
                                student.result === 'PASS' ? 'badge-green' :
                                student.result === 'COMPARTMENT' ? 'badge-yellow' : 'badge-red'
                              }`}>
                                {student.result}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {verificationData.subjectAverages && verificationData.subjectAverages.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pass %</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {verificationData.subjectAverages.map((subject, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm font-medium">{subject.subject?.name}</td>
                            <td className="px-4 py-3 text-sm">{subject.average}</td>
                            <td className="px-4 py-3">
                              <span className={`text-sm font-medium ${parseFloat(subject.passPercentage) >= 80 ? 'text-green-600' : parseFloat(subject.passPercentage) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                {subject.passPercentage}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600">{subject.failCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select an exam and click "Analytics" tab to view results</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
