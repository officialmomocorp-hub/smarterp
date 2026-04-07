import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { examAPI, academicAPI, studentAPI } from '../services/api';
import { Award, Users, Search, Save, CheckCircle, TrendingUp, BarChart3, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExaminationsEnhanced() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'verification';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [marksData, setMarksData] = useState({}); // { studentId: marks }
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [examsRes, classesRes] = await Promise.all([
        examAPI.getAll(),
        academicAPI.getClasses()
      ]);
      setExams(examsRes.data.data || []);
      setClasses(classesRes.data.data || []);
    } catch (e) { toast.error('Failed to load initial data'); }
  };

  const handleFetchStudents = async () => {
    if (!selectedClass || !selectedExam || !selectedSubject) {
      return toast.error('Please select Exam, Class and Subject');
    }
    setLoading(true);
    try {
      const { data } = await studentAPI.getAll({ classId: selectedClass, limit: 100 });
      setStudents(data.data.students || []);
      // Initialize marks data
      const initMarks = {};
      (data.data.students || []).forEach(s => { initMarks[s.id] = ''; });
      setMarksData(initMarks);
    } catch (e) { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  const handleSaveMarks = async () => {
    setIsSaving(true);
    try {
      const marksList = Object.entries(marksData).map(([sId, val]) => ({
        studentId: sId,
        subjectId: selectedSubject,
        marksObtained: parseFloat(val) || 0
      }));

      await examAPI.bulkEnterMarks({
        examId: selectedExam,
        marks: marksList
      });
      toast.success('Marks saved successfully!');
    } catch (e) { toast.error('Failed to save marks'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Examinations</h2>
          <p className="text-gray-500 mt-1">Manage marks entry, verification and analytical reporting</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'verification', title: 'Marks Entry', icon: CheckCircle },
          { id: 'hall-tickets', title: 'Hall Tickets', icon: FileText },
          { id: 'analytics', title: 'Performance Analytics', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.title}
          </button>
        ))}
      </div>

      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="card grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="label">Exam</label>
              <select className="input" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                <option value="">Select Exam</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Class</label>
              <select className="input" value={selectedClass} onChange={e => {
                setSelectedClass(e.target.value);
                const cls = classes.find(c => c.id === e.target.value);
                setSubjects(cls?.subjects || []);
              }}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subject</label>
              <select className="input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button onClick={handleFetchStudents} className="btn btn-primary flex items-center gap-2">
              <Search className="w-4 h-4" /> Load Students
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Processing...</div>
          ) : students.length > 0 ? (
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Roll</th>
                      <th className="px-4 py-3 text-left">Student Name</th>
                      <th className="px-4 py-3 text-center w-32">Marks Obtained</th>
                      <th className="px-4 py-3 text-left">Grade (Auto)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{s.rollNumber}</td>
                        <td className="px-4 py-3 text-sm font-medium">{s.profile.firstName} {s.profile.lastName}</td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" className="input text-center py-1" 
                            value={marksData[s.id] || ''}
                            onChange={e => setMarksData({...marksData, [s.id]: e.target.value})}
                          />
                        </td>
                        <td className="px-4 py-3">
                           <span className="text-xs font-bold text-blue-600">
                             {marksData[s.id] ? (parseFloat(marksData[s.id]) >= 33 ? 'QUALIFIED' : 'FAILED') : '--'}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={handleSaveMarks} disabled={isSaving} className="btn btn-primary px-8 flex items-center gap-2">
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Submit Final Marks'}
                </button>
              </div>
            </div>
          ) : (
             <div className="bg-blue-50 p-12 text-center rounded-2xl border border-blue-100 italic text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-blue-200" />
                Select Exam, Class, and Subject to start entering marks.
             </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="card h-64 flex flex-col items-center justify-center text-center opacity-50 grayscale">
          <BarChart3 className="w-16 h-16 mb-4 text-primary-300" />
          <h3 className="text-xl font-bold">Analytics Engine Offline</h3>
          <p className="text-sm text-gray-500">Statistics will appear once results are published for the current academic year.</p>
        </div>
      )}
    </div>
  );
}
