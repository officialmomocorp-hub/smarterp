import React, { useState, useEffect } from 'react';
import { attendanceAPI, studentAPI } from '../services/api';
import { Calendar, UserCheck, UserX, Clock, AlertTriangle, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('mark');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [fetched, setFetched] = useState(false);

  const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  // Fetch students from DB when class/section selected
  const fetchStudents = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const { data } = await studentAPI.getAll({ class: classId, section: sectionId, limit: 100 });
      const list = data.data?.students || data.data || [];
      setStudents(list);
      setFetched(true);
      // Reset attendance records
      const init = {};
      list.forEach(s => { init[s.id] = 'PRESENT'; });
      setAttendanceRecords(init);
    } catch (err) {
      console.error('Failed to fetch students', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) fetchStudents();
  }, [classId, sectionId]);

  const handleMarkAttendance = async () => {
    const records = Object.entries(attendanceRecords);
    if (records.length === 0) {
      return toast.error('No attendance to save');
    }

    setSaving(true);
    try {
      const attendanceData = records.map(([studentId, status]) => ({
        studentId,
        status,
      }));

      await attendanceAPI.mark({
        date: selectedDate,
        attendanceRecords: attendanceData,
      });

      toast.success('Attendance saved successfully! ✅');
    } catch (error) {
      console.error('Attendance save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = (status) => {
    const newRecords = {};
    students.forEach(s => {
      newRecords[s.id] = status;
    });
    setAttendanceRecords(newRecords);
  };

  const getStudentName = (student) => {
    if (student.profile?.firstName) return `${student.profile.firstName} ${student.profile.lastName || ''}`.trim();
    if (student.name) return student.name;
    return student.studentId || 'Unknown';
  };

  const getInitials = (student) => {
    const name = getStudentName(student);
    const parts = name.split(' ');
    return (parts[0]?.charAt(0) || '') + (parts[1]?.charAt(0) || '');
  };

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
                  <option value="">All Sections</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
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
            {!classId ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a class to load students for attendance</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12 text-gray-500">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No students found for {classId}{sectionId ? ` - ${sectionId}` : ''}</p>
              </div>
            ) : (
              <>
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
                      {students.map((student, index) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{student.rollNumber || index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium">
                                {getInitials(student)}
                              </div>
                              <span className="text-sm font-medium">{getStudentName(student)}</span>
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

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">{students.length} students loaded</p>
                  <button
                    onClick={handleMarkAttendance}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </>
            )}
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
