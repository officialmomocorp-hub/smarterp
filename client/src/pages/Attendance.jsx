import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import { Calendar, UserCheck, UserX, Clock, AlertTriangle, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('mark');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');

  const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  const handleMarkAttendance = async () => {
    setLoading(true);
    try {
      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      await attendanceAPI.mark({
        date: selectedDate,
        attendanceRecords: records,
      });

      toast.success('Attendance marked successfully');
    } catch (error) {
      toast.error('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (status) => {
    const newRecords = {};
    students.forEach(s => {
      newRecords[s.id] = status;
    });
    setAttendanceRecords(newRecords);
  };

  // Demo students for attendance
  const demoStudents = [
    { id: '1', rollNumber: 1, name: 'Aarav Verma', profile: { firstName: 'Aarav', lastName: 'Verma' } },
    { id: '2', rollNumber: 2, name: 'Diya Sharma', profile: { firstName: 'Diya', lastName: 'Sharma' } },
    { id: '3', rollNumber: 3, name: 'Arjun Patel', profile: { firstName: 'Arjun', lastName: 'Patel' } },
    { id: '4', rollNumber: 4, name: 'Ananya Singh', profile: { firstName: 'Ananya', lastName: 'Singh' } },
    { id: '5', rollNumber: 5, name: 'Rohan Gupta', profile: { firstName: 'Rohan', lastName: 'Gupta' } },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
        <p className="text-gray-500 mt-1">Mark and track student attendance</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['mark', 'report', 'alerts', 'leaves'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'mark' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Class</label>
                <select className="input" value={classId} onChange={(e) => setClassId(e.target.value)}>
                  <option value="">Select Class</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Section</label>
                <select className="input" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleSelectAll('PRESENT')} className="btn btn-success text-sm">
                  All Present
                </button>
                <button onClick={() => handleSelectAll('ABSENT')} className="btn btn-danger text-sm">
                  All Absent
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {demoStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{student.rollNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium">
                            {student.profile.firstName.charAt(0)}{student.profile.lastName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{student.profile.firstName} {student.profile.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setAttendanceRecords({ ...attendanceRecords, [student.id]: 'PRESENT' })}
                            className={`p-2 rounded-lg transition-colors ${
                              attendanceRecords[student.id] === 'PRESENT'
                                ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                                : 'bg-gray-100 text-gray-400 hover:bg-green-50'
                            }`}
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setAttendanceRecords({ ...attendanceRecords, [student.id]: 'ABSENT' })}
                            className={`p-2 rounded-lg transition-colors ${
                              attendanceRecords[student.id] === 'ABSENT'
                                ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                                : 'bg-gray-100 text-gray-400 hover:bg-red-50'
                            }`}
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setAttendanceRecords({ ...attendanceRecords, [student.id]: 'LATE' })}
                            className={`p-2 rounded-lg transition-colors ${
                              attendanceRecords[student.id] === 'LATE'
                                ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500'
                                : 'bg-gray-100 text-gray-400 hover:bg-amber-50'
                            }`}
                          >
                            <Clock className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input className="input text-sm" placeholder="Optional" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t">
              <button
                onClick={handleMarkAttendance}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Attendance Report</h3>
          <div className="flex gap-4 mb-6">
            <select className="input w-48">
              <option>Class 5</option>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="input w-32">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <select className="input w-32">
              <option>2025</option>
              <option>2026</option>
            </select>
            <button className="btn btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Select class and month to generate report</p>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Attendance Alerts (&lt;75%)</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-900">Minimum 75% attendance required</p>
              <p className="text-sm text-amber-700">Students below 75% attendance will not be eligible for annual exams as per CBSE norms</p>
            </div>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>No students below 75% attendance threshold</p>
          </div>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Applications</h3>
          <div className="text-center py-12 text-gray-500">
            <p>No leave applications found</p>
          </div>
        </div>
      )}
    </div>
  );
}
