import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User as UserIcon, BookOpen, Plus, Trash2, AlertCircle } from 'lucide-react';
import { timetableAPI, academicAPI, staffAPI } from '../services/api';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_PERIODS = [
  { period: 1, time: '08:00 - 08:45' },
  { period: 2, time: '08:45 - 09:30' },
  { period: 3, time: '09:30 - 10:15' },
  { period: 4, time: '10:15 - 11:00' },
  { period: 5, time: '11:15 - 12:00' },
  { period: 6, time: '12:00 - 12:45' },
  { period: 7, time: '12:45 - 01:30' },
  { period: 8, time: '01:30 - 02:15' },
];

export default function Timetable() {
  const [periods, setPeriods] = useState(DEFAULT_PERIODS);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [timetable, setTimetable] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [newEntry, setNewEntry] = useState({ subjectId: '', teacherId: '' });
  const [classes, setClasses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDependencies = async () => {
    try {
      const [clsRes, staffRes, subRes] = await Promise.all([
        academicAPI.getClasses(),
        staffAPI.getAll(),
        academicAPI.getSubjects()
      ]);
      setClasses(clsRes.data.data || []);
      setStaff(staffRes.data.data.staff || []);
      setSubjects(subRes.data.data || []);
    } catch (e) { toast.error('Failed to load classes or staff'); }
  };

  const fetchTimetable = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const { data } = await timetableAPI.getAll({ classId: selectedClass, sectionId: selectedSection });
      const ttMap = {};
      data.data.forEach(entry => {
        ttMap[`${entry.period - 1}-${entry.dayOfWeek}`] = {
           id: entry.id,
           subject: entry.subject?.name,
           teacher: entry.teacher?.profile?.firstName || 'Staff',
           subjectId: entry.subjectId,
           teacherId: entry.teacherId
        };
      });
      setTimetable(ttMap);
    } catch (e) { toast.error('Failed to load timetable'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDependencies(); }, []);
  useEffect(() => { if (selectedClass) fetchTimetable(); }, [selectedClass, selectedSection]);




  const handleSlotClick = (dayIndex, dayName, periodIndex) => {
    const key = `${periodIndex}-${dayName}`;
    setSelectedSlot({ key, dayIndex, dayName, periodIndex });
    const existing = timetable[key];
    setNewEntry({
      subject: existing?.subject || '',
      teacher: existing?.teacher || '',
    });
    setShowAddModal(true);
  };

  const handleSaveEntry = async () => {
    if (!newEntry.subjectId || !newEntry.teacherId) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await timetableAPI.create({
        dayOfWeek: selectedSlot.dayIndex,
        period: selectedSlot.periodIndex + 1,
        subjectId: newEntry.subjectId,
        staffId: newEntry.teacherId,
        classId: selectedClass,
        sectionId: selectedSection || undefined
      });
      toast.success('Timetable entry saved');
      setShowAddModal(false);
      fetchTimetable();
    } catch (e) { toast.error('Failed to save entry'); }
  };

  const handleDeleteEntry = (key) => {
    toast.success('Entry removed');
  };

  const subjectColors = {
    'Mathematics': 'bg-blue-100 text-blue-800 border-blue-200',
    'English': 'bg-green-100 text-green-800 border-green-200',
    'Hindi': 'bg-orange-100 text-orange-800 border-orange-200',
    'Science': 'bg-purple-100 text-purple-800 border-purple-200',
    'Social Studies': 'bg-pink-100 text-pink-800 border-pink-200',
    'Computer': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Physical Education': 'bg-red-100 text-red-800 border-red-200',
    'Art': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Sanskrit': 'bg-amber-100 text-amber-800 border-amber-200',
    'General Knowledge': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timetable Management</h2>
          <p className="text-gray-500 mt-1">Create and manage class timetables</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowTimeModal(true)} className="btn btn-secondary flex items-center gap-2">
            <Clock className="w-4 h-4" /> Edit Bell Timings
          </button>
          <select className="input w-40" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Select Class</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.displayName}</option>
            ))}
          </select>
          <select className="input w-24" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
            <option value="">All Sec</option>
            {classes.find(c => c.id === selectedClass)?.sections?.map(s => (
               <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Break Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <span className="text-sm text-amber-800">Break: 11:00 - 11:15 (15 min) | Lunch: Not included in periods</span>
      </div>

      {/* Timetable Grid */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 bg-gray-50 border-b border-r w-24">Period</th>
              {DAYS.map(day => (
                <th key={day} className="px-3 py-3 text-xs font-medium text-gray-500 bg-gray-50 border-b text-center">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((p, periodIndex) => (
              <tr key={p.period}>
                <td className="px-3 py-2 border-r border-b bg-gray-50">
                  <div className="text-xs font-medium text-gray-700">Period {p.period}</div>
                  <div className="text-xs text-gray-400">{p.time}</div>
                </td>
                {DAYS.map((day, dayIndex) => {
                  const key = `${periodIndex}-${day}`;
                  const entry = timetable[key];
                  return (
                    <td
                      key={day}
                      className={`px-2 py-2 border-b border-l cursor-pointer hover:bg-gray-50 transition-colors ${
                        periodIndex === 4 && dayIndex === 0 ? 'bg-amber-50' : ''
                      }`}
                      onClick={() => handleSlotClick(dayIndex, day, periodIndex)}
                    >
                      {entry ? (
                        <div className={`rounded-lg p-2 border ${subjectColors[entry.subject] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          <p className="text-xs font-medium truncate">{entry.subject}</p>
                          <p className="text-xs opacity-75 truncate">{entry.teacher}</p>
                        </div>
                      ) : (
                        <div className="h-14 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Teacher Workload Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Workload Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {staff.slice(0, 8).map(teacher => {
            const teacherName = `${teacher.profile.firstName} ${teacher.profile.lastName}`;
            const count = Object.values(timetable).flat().filter(e => e.teacherId === teacher.id).length;
            return (
              <div key={teacher.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{teacherName}</p>
                  <p className="text-xs text-gray-500">{count} periods/week</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {timetable[selectedSlot?.key] ? 'Edit' : 'Add'} Entry
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{DAYS[selectedSlot?.dayIndex]}</span>
                <Clock className="w-4 h-4 ml-2" />
                <span>Period {selectedSlot?.periodIndex + 1} ({PERIODS[selectedSlot?.periodIndex]?.time})</span>
              </div>
              <div>
                <label className="label">Subject</label>
                <select className="input" value={newEntry.subject} onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Teacher</label>
                <select className="input" value={newEntry.teacher} onChange={(e) => setNewEntry({...newEntry, teacher: e.target.value})}>
                  <option value="">Select Teacher</option>
                  {staff.map(t => <option key={t.id} value={t.id}>{t.profile.firstName} {t.profile.lastName}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                {timetable[selectedSlot?.key] && (
                  <button onClick={() => handleDeleteEntry(selectedSlot.key)} className="btn btn-danger flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
                <div className="flex-1"></div>
                <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleSaveEntry} className="btn btn-primary">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Timings Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" /> Edit Bell Timings
              </h3>
              <button onClick={() => setShowTimeModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-sm text-gray-500 mb-2">Adjust the time duration for each period globally.</p>
              {periods.map((p, idx) => (
                <div key={p.period} className="flex gap-4 items-center">
                  <span className="font-medium text-sm text-gray-700 w-20">Period {p.period}</span>
                  <input
                    type="text"
                    className="input flex-1 font-mono text-sm"
                    value={p.time}
                    onChange={(e) => {
                      const newPeriods = [...periods];
                      newPeriods[idx].time = e.target.value;
                      setPeriods(newPeriods);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3 sticky bottom-0 bg-gray-50">
                <button onClick={() => setShowTimeModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={() => {toast.success('Timings updated successfully!'); setShowTimeModal(false);}} className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
