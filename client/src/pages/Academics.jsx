import React, { useState, useEffect } from 'react';
import { School, Calendar, BookOpen, Layers, Plus } from 'lucide-react';
import { academicAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Academics() {
  const [activeTab, setActiveTab] = useState('years');
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [yearForm, setYearForm] = useState({ name: '', startDate: '', endDate: '', isCurrent: false });
  const [classForm, setClassForm] = useState({ name: '', displayName: '', sortOrder: 1 });
  const [subjectForm, setSubjectForm] = useState({ classId: '', name: '', code: '', description: '' });

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

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const { description, ...payload } = subjectForm;
      await academicAPI.createSubject(payload);
      toast.success('Subject assigned successfully');
      setSubjectForm({ classId: '', name: '', code: '', description: '' });
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

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'years', icon: Calendar, label: 'Academic Years' },
          { id: 'classes', icon: Layers, label: 'Classes & Sections' },
          { id: 'subjects', icon: BookOpen, label: 'Subjects' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="lg:col-span-1">
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
          </div>
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Class List</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classes.map(cls => (
                  <div key={cls.id} className="p-4 border rounded-lg bg-gray-50">
                    <p className="font-bold text-gray-900 mb-2">{cls.displayName}</p>
                    <div className="flex gap-2 flex-wrap">
                      {(cls.sections || []).map(sec => (
                        <span key={sec.id} className="badge bg-white shadow-sm border border-gray-200">
                          Sec {sec.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Assign Subject</h3>
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
                <div>
                  <label className="label">Subject Code</label>
                  <input className="input" placeholder="e.g. MATH-101" value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})} />
                </div>
                <button type="submit" className="w-full btn btn-primary flex justify-center items-center gap-2">
                  <Plus className="w-4 h-4"/> Assign Subject
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="card">
              <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a class from the list to view its subjects.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
