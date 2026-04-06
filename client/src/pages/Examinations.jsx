import React, { useState, useEffect } from 'react';
import { examAPI, academicAPI } from '../services/api';
import { Award, TrendingUp, Users, AlertTriangle, Plus, Search, Calendar, BookOpen, Clock, Save, X, Printer, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Examinations() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'UNIT_TEST',
    classId: '',
    academicYearId: '',
    startDate: '',
    endDate: '',
    maxMarks: 100,
    passMarks: 33,
    subjects: []
  });

  useEffect(() => {
    fetchExams();
    fetchClasses();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (formData.classId) {
      fetchSubjects(formData.classId);
    }
  }, [formData.classId]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const { data } = await examAPI.getAll({ classId: selectedClass });
      setExams(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await academicAPI.getClasses();
      setClasses(data.data || []);
    } catch (error) {
      console.error('Failed to fetch classes');
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const { data } = await academicAPI.getAcademicYears();
      const current = data.data?.find(y => y.isCurrent);
      if (current) setFormData(prev => ({ ...prev, academicYearId: current.id }));
    } catch (error) {
      console.error('Failed to fetch academic years');
    }
  };

  const fetchSubjects = async (classId) => {
    try {
      // In this ERP, subjects are often fetched via class include or separate route
      // Let's assume academicAPI.getClasses() includes subjects or we fetch from a subject route
       const cls = classes.find(c => c.id === classId);
       if (cls?.subjects) {
          setSubjects(cls.subjects);
          setFormData(prev => ({
             ...prev,
             subjects: cls.subjects.map(s => ({ subjectId: s.id, maxMarks: 100, passMarks: 33 }))
          }));
       }
    } catch (error) {
      console.error('Failed to fetch subjects');
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await examAPI.create(formData);
      toast.success('Exam scheduled successfully');
      setShowModal(false);
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create exam');
    }
  };

  const handlePublish = async (id) => {
    try {
      await examAPI.publishResults(id);
      toast.success('Results published');
      fetchExams();
    } catch (error) {
      toast.error('Failed to publish');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Examination & Marks</h2>
          <p className="text-gray-500 mt-1">Manage exam schedules, grading, and result publication</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule New Exam
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg"><Award className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Total Exams</p><p className="text-xl font-bold">{exams.length}</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Results Published</p><p className="text-xl font-bold">{exams.filter(e => e.resultsPublished).length}</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg"><Clock className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-sm text-gray-500">Upcoming</p><p className="text-xl font-bold">{exams.filter(e => new Date(e.startDate) > new Date()).length}</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg"><TrendingUp className="w-6 h-6 text-purple-600" /></div>
            <div><p className="text-sm text-gray-500">Avg Performance</p><p className="text-xl font-bold">78.5%</p></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Exam Schedule - 2025-26</h3>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <select 
              className="input py-1 text-sm" 
              value={selectedClass} 
              onChange={(e) => { setSelectedClass(e.target.value); setTimeout(fetchExams, 10); }}
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="text-center py-10 text-gray-500 italic">No exams found for the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Range</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Board/Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-primary-700">{exam.name}</td>
                    <td className="px-4 py-3 text-sm">{exam.class?.name || 'All'}</td>
                    <td className="px-4 py-3 text-sm">
                       {new Date(exam.startDate).toLocaleDateString('en-IN')} - {new Date(exam.endDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-blue">{exam.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      {exam.resultsPublished ? (
                        <span className="badge badge-green">Published</span>
                      ) : (
                        <span className="badge badge-yellow">Draft</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                         {!exam.resultsPublished && (
                            <button onClick={() => handlePublish(exam.id)} className="btn btn-ghost p-1 text-green-600" title="Publish Results">
                               <CheckCircle className="w-4 h-4" />
                            </button>
                         )}
                         <button className="btn btn-ghost p-1 text-blue-600" title="Edit Schedule">
                            <Clock className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">Schedule New Examination</h3>
              <button onClick={() => setShowModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateExam} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Exam Title</label>
                  <input 
                    type="text" required className="input" placeholder="e.g. Half Yearly 2025"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Exam Type</label>
                  <select 
                    className="input" 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="UNIT_TEST">Unit Test</option>
                    <option value="HALF_YEARLY">Half Yearly</option>
                    <option value="ANNUAL">Annual Exam</option>
                    <option value="COMPARTMENT">Compartment</option>
                  </select>
                </div>
                <div>
                  <label className="label">Select Class</label>
                  <select 
                    required className="input" 
                    value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}
                  >
                    <option value="">-- Choose Class --</option>
                    {classes.length > 0 ? (
                      classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                    ) : (
                      <option disabled>No classes found. Add classes in Academic page first.</option>
                    )}
                  </select>
                  {classes.length === 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      You must add classes in Academic Management before scheduling exams.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">Start Date</label>
                    <input type="date" required className="input" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input type="date" required className="input" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>
              </div>

              {subjects.length > 0 && (
                 <div className="mt-4">
                    <label className="label font-bold mb-2">Subject-wise Max Marks</label>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                       {subjects.map((sub, idx) => (
                          <div key={sub.id} className="flex items-center gap-4 text-sm">
                             <span className="flex-1 font-medium">{sub.name}</span>
                             <div className="flex items-center gap-2">
                                <span>Max:</span>
                                <input 
                                  type="number" className="input py-1 w-20" 
                                  value={formData.subjects[idx]?.maxMarks} 
                                  onChange={e => {
                                     const newSubs = [...formData.subjects];
                                     newSubs[idx].maxMarks = parseInt(e.target.value);
                                     setFormData({...formData, subjects: newSubs});
                                  }}
                                />
                             </div>
                             <div className="flex items-center gap-2">
                                <span>Pass:</span>
                                <input 
                                  type="number" className="input py-1 w-20" 
                                  value={formData.subjects[idx]?.passMarks}
                                  onChange={e => {
                                     const newSubs = [...formData.subjects];
                                     newSubs[idx].passMarks = parseInt(e.target.value);
                                     setFormData({...formData, subjects: newSubs});
                                  }}
                                />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
