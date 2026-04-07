import React, { useState, useEffect, useRef } from 'react';
import { School, Calendar, BookOpen, Layers, Plus } from 'lucide-react';
import { academicAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Academics() {
  const [activeTab, setActiveTab] = useState('years');
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sectionForm, setSectionForm] = useState({ classId: '', name: '', capacity: 40 });
  const [subjectForm, setSubjectForm] = useState({ classId: '', name: '', code: '', type: 'Theory', maxMarks: 100, passMarks: 33 });
  
  const [yearForm, setYearForm] = useState({ name: '', startDate: '', endDate: '', isCurrent: false });
  const [classForm, setClassForm] = useState({ name: '', displayName: '', sortOrder: 1 });
  const sectionFormRef = useRef(null);

  useEffect(() => {
    fetchAcademicYears();
    fetchClasses();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const { data } = await academicAPI.getAcademicYears();
      setAcademicYears(data.data || []);
    } catch (error) {
      toast.error('Failed to load academic years');
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await academicAPI.getClasses();
      setClasses(data.data || []);
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const handleCreateYear = async (e) => {
    e.preventDefault();
    try {
      await academicAPI.createAcademicYear(yearForm);
      toast.success('Academic year created successfully');
      setYearForm({ name: '', startDate: '', endDate: '', isCurrent: false });
      fetchAcademicYears();
    } catch (error) {
      toast.error('Failed to create academic year');
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const activeYearId = academicYears.find(y => y.isCurrent)?.id || academicYears[0]?.id;
      if (!activeYearId) {
        return toast.error('No active academic year found');
      }
      await academicAPI.createClass({ ...classForm, academicYearId: activeYearId });
      toast.success('Class created successfully');
      setClassForm({ name: '', displayName: '', sortOrder: classForm.sortOrder + 1 });
      fetchClasses();
    } catch (error) {
      toast.error('Failed to create class');
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      await academicAPI.createSection(sectionForm);
      toast.success('Section added successfully');
      setSectionForm({ ...sectionForm, name: '' });
      fetchClasses();
    } catch (error) {
      toast.error('Failed to create section');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await academicAPI.createSubject(subjectForm);
      toast.success('Subject assigned successfully');
      setSubjectForm({ ...subjectForm, name: '', code: '' });
      fetchClasses(); 
    } catch (error) {
      toast.error('Failed to create subject');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <School className="w-6 h-6 text-gray-900" />
          Academic Management
        </h2>
        <p className="text-gray-500 mt-1">Manage academic years, classes, sections, and subjects.</p>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100/50 rounded-xl w-fit mb-6">
        {[
          { id: 'years', icon: Calendar, label: 'Academic Years' },
          { id: 'classes', icon: Layers, label: 'Classes & Sections' },
          { id: 'subjects', icon: BookOpen, label: 'Subjects' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'years' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Create Academic Year</h3>
              <form onSubmit={handleCreateYear} className="space-y-4">
                <div>
                  <label className="label">Session Name (e.g. 2024-25)</label>
                  <input className="input" required value={yearForm.name} onChange={e => setYearForm({...yearForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input type="date" className="input" required value={yearForm.startDate} onChange={e => setYearForm({...yearForm, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input type="date" className="input" required value={yearForm.endDate} onChange={e => setYearForm({...yearForm, endDate: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isCurrent" checked={yearForm.isCurrent} onChange={e => setYearForm({...yearForm, isCurrent: e.target.checked})} />
                  <label htmlFor="isCurrent" className="text-sm">Set as Current Active Year</label>
                </div>
                <button type="submit" className="w-full btn btn-primary flex justify-center items-center gap-2">
                  <Plus className="w-4 h-4"/> Create Year
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Existing Academic Years</h3>
              <div className="space-y-3">
                {academicYears.map(year => (
                  <div key={year.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
                    <div>
                      <p className="font-bold text-gray-900">{year.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    {year.isCurrent && (
                      <span className="badge badge-green">Current Active</span>
                    )}
                  </div>
                ))}
                {academicYears.length === 0 && <p className="text-gray-500 text-center py-4">No academic years found.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Add New Class</h3>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="label">Class Name</label>
                  <input className="input" required placeholder="e.g. Class 1" value={classForm.name} onChange={e => setClassForm({...classForm, name: e.target.value, displayName: e.target.value})} />
                </div>
                <div>
                  <label className="label">Sort Order (for listing)</label>
                  <input type="number" className="input" required value={classForm.sortOrder} onChange={e => setClassForm({...classForm, sortOrder: parseInt(e.target.value)})} />
                </div>
                <button type="submit" className="w-full btn btn-primary flex justify-center items-center gap-2">
                  <Plus className="w-4 h-4"/> Add Class
                </button>
              </form>
            </div>

            <div className="card" ref={sectionFormRef}>
              <h3 className="text-lg font-semibold mb-4">Add Section to Class</h3>
              <form onSubmit={handleCreateSection} className="space-y-4">
                <div>
                  <label className="label">Select Class</label>
                  <select 
                    className="input" 
                    required 
                    value={sectionForm.classId} 
                    onChange={e => setSectionForm({...sectionForm, classId: e.target.value})}
                  >
                    <option value="">Choose Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Section Name</label>
                  <input className="input" required placeholder="e.g. A" value={sectionForm.name} onChange={e => setSectionForm({...sectionForm, name: e.target.value.toUpperCase()})} />
                </div>
                <button type="submit" className="w-full btn btn-secondary flex justify-center items-center gap-2">
                  <Plus className="w-4 h-4"/> Add Section
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Structure View</h3>
              <div className="space-y-4">
                {classes.map(cls => (
                  <div key={cls.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-bold text-gray-900 text-lg">{cls.displayName}</p>
                      <button 
                        onClick={() => {
                          setSectionForm({...sectionForm, classId: cls.id});
                          sectionFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        + Add Section
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(cls.sections || []).length > 0 ? (
                        cls.sections.map(sec => (
                          <span key={sec.id} className="badge bg-white shadow-sm border border-gray-200 py-2 px-4 text-base">
                            Section {sec.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">No sections added yet</p>
                      )}
                    </div>
                  </div>
                ))}
                {classes.length === 0 && <p className="text-gray-500 text-center py-8">No classes defined. Create your first class to start.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Assign New Subject</h3>
              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div>
                  <label className="label">Select Class</label>
                  <select className="input" required value={subjectForm.classId} onChange={e => setSubjectForm({...subjectForm, classId: e.target.value})}>
                    <option value="">Select a class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.displayName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Subject Name</label>
                  <input className="input" required placeholder="e.g. Mathematics" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Code</label>
                    <input className="input" placeholder="MATH-101" value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Type</label>
                    <select className="input" value={subjectForm.type} onChange={e => setSubjectForm({...subjectForm, type: e.target.value})}>
                      <option value="Theory">Theory</option>
                      <option value="Practical">Practical</option>
                      <option value="Combo">Combo</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full btn btn-primary flex justify-center items-center gap-2">
                  <Plus className="w-4 h-4"/> Assign Subject
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Subjects Repository</h3>
              <div className="space-y-4">
                {classes.map(cls => (
                  <div key={cls.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-bold border-b">
                      {cls.displayName}
                    </div>
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(cls.subjects || []).length > 0 ? (
                        cls.subjects.map(sub => (
                          <div key={sub.id} className="p-3 bg-white border rounded shadow-sm">
                            <p className="font-semibold text-sm">{sub.name}</p>
                            <p className="text-xs text-gray-500">{sub.code || 'No Code'}</p>
                          </div>
                        ))
                      ) : (
                        <p className="col-span-full text-center text-sm text-gray-400 py-4">No subjects assigned</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
