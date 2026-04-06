import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { Search, Plus, Edit, Trash2, Eye, Filter, FileOutput, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { CLASSES, SECTIONS } from '../config/constants';
import StudentForm from '../components/Students/StudentForm';
import StudentProfile from '../components/Students/StudentProfile';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [viewStudentModal, setViewStudentModal] = useState(null);
  const [editStudentId, setEditStudentId] = useState(null);
  const [formData, setFormData] = useState({
    profile: {
      firstName: '', middleName: '', lastName: '', dateOfBirth: '',
      gender: 'MALE', casteCategory: 'GENERAL', religion: 'HINDU',
      motherTongue: 'HINDI', aadharNumber: '', bloodGroup: '',
    },
    parentData: {
      fatherName: '', fatherOccupation: '', fatherPhone: '', fatherEmail: '',
      motherName: '', motherOccupation: '', motherPhone: '', motherEmail: '',
      address: '', city: '', state: 'DELHI', pincode: '',
      annualIncome: '',
    },
    class: 'Class 1',
    section: 'A',
    house: 'RED',
    bplStatus: false,
    rteSeat: false,
    midDayMealOpted: true,
    transportOpted: false,
    hostelOpted: false,
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, search, class: filterClass, section: filterSection };
      const { data } = await studentAPI.getAll(params);
      setStudents(data.data.students);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [page, filterClass, filterSection]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editStudentId) {
        await studentAPI.update(editStudentId, formData);
        toast.success('Student updated successfully');
      } else {
        await studentAPI.create(formData);
        toast.success('Student created successfully');
      }
      setShowForm(false);
      setEditStudentId(null);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save student');
    }
  };

  const resetForm = () => {
    setFormData({
        profile: { firstName: '', middleName: '', lastName: '', dateOfBirth: '', gender: 'MALE', casteCategory: 'GENERAL', religion: 'HINDU', motherTongue: 'HINDI', aadharNumber: '', bloodGroup: '' },
        parentData: { fatherName: '', fatherOccupation: '', fatherPhone: '', fatherEmail: '', motherName: '', motherOccupation: '', motherPhone: '', motherEmail: '', address: '', city: '', state: 'DELHI', pincode: '', annualIncome: '' },
        class: 'Class 1', section: 'A', house: 'RED', bplStatus: false, rteSeat: false, midDayMealOpted: true, transportOpted: false, hostelOpted: false,
    });
  };

  const handleEditClick = (student) => {
    setEditStudentId(student.id);
    setFormData({
      profile: {
        firstName: student.profile?.firstName || '', middleName: student.profile?.middleName || '', lastName: student.profile?.lastName || '', 
        dateOfBirth: student.profile?.dateOfBirth ? new Date(student.profile.dateOfBirth).toISOString().split('T')[0] : '', 
        gender: student.profile?.gender || 'MALE', casteCategory: student.profile?.casteCategory || 'GENERAL', religion: student.profile?.religion || 'HINDU', 
        motherTongue: student.profile?.motherTongue || 'HINDI', aadharNumber: student.profile?.aadharNumber || '', bloodGroup: student.profile?.bloodGroup || ''
      },
      parentData: {
        fatherName: student.parents?.[0]?.parent?.fatherName || '', fatherOccupation: student.parents?.[0]?.parent?.fatherOccupation || '', fatherPhone: student.parents?.[0]?.parent?.fatherPhone || '', fatherEmail: student.parents?.[0]?.parent?.fatherEmail || '',
        motherName: student.parents?.[0]?.parent?.motherName || '', motherOccupation: student.parents?.[0]?.parent?.motherOccupation || '', motherPhone: student.parents?.[0]?.parent?.motherPhone || '', motherEmail: student.parents?.[0]?.parent?.motherEmail || '',
        address: student.parents?.[0]?.parent?.address || '', city: student.parents?.[0]?.parent?.city || '', state: student.parents?.[0]?.parent?.state || 'DELHI', pincode: student.parents?.[0]?.parent?.pincode || '', annualIncome: student.parents?.[0]?.parent?.annualIncome || ''
      },
      class: student.class?.name || 'Class 1', section: student.section?.name || 'A', house: student.house || 'RED',
      bplStatus: student.bplStatus || false, rteSeat: student.rteSeat || false, midDayMealOpted: student.midDayMealOpted || false, transportOpted: student.transportOpted || false, hostelOpted: student.hostelOpted || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student (Mark as Dropped Out)?')) return;
    try {
      await studentAPI.delete(id);
      toast.success('Student deleted');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleIssueTC = async (student) => {
    if (!window.confirm(`Are you sure you want to issue Transfer Certificate for ${student.profile?.firstName}?`)) return;
    try {
      const response = await studentAPI.issueTC(student.id, { leavingReason: 'Parent Request' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TC-${student.studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`TC Issued for ${student.profile?.firstName}. Status updated to Transferred.`);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to issue TC');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-gray-500 mt-1">{pagination.total || 0} students enrolled</p>
        </div>
        <button onClick={() => { setEditStudentId(null); resetForm(); setShowForm(true); }} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" className="input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, ID, Aadhar..." />
            </div>
          </div>
          <div>
            <label className="label">Class</label>
            <select className="input" value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setPage(1); }}>
              <option value="">All Classes</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Section</label>
            <select className="input" value={filterSection} onChange={(e) => { setFilterSection(e.target.value); setPage(1); }}>
              <option value="">All Sections</option>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </form>
      </div>

      {/* Student Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">No students found</td></tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{student.rollNumber}</td>
                    <td className="px-4 py-3 text-sm font-mono text-primary-600">{student.studentId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium">
                          {student.profile?.firstName?.charAt(0)}{student.profile?.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.profile?.firstName} {student.profile?.lastName}</p>
                          <p className="text-xs text-gray-500">{student.profile?.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{student.class?.name}</td>
                    <td className="px-4 py-3 text-sm">{student.section?.name}</td>
                    <td className="px-4 py-3"><span className="badge badge-blue">{student.profile?.casteCategory}</span></td>
                    <td className="px-4 py-3 text-sm">{student.parents?.[0]?.parent?.fatherName || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewStudentModal(student)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="View"><Eye className="w-4 h-4" /></button>
                        <button 
                          onClick={async () => {
                            toast.success('Generating ID Card...');
                            try {
                              const response = await studentAPI.generateIDCard(student.id);
                              const url = window.URL.createObjectURL(new Blob([response.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `ID-${student.studentId}.pdf`);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (e) { toast.error('Failed to generate ID card'); }
                          }} 
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" 
                          title="Generate ID Card"
                        >
                          <UserIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleIssueTC(student)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600" title="Issue TC"><FileOutput className="w-4 h-4" /></button>
                        <button onClick={() => handleEditClick(student)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(student.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary text-sm">Previous</button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn btn-secondary text-sm">Next</button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <StudentForm 
          editStudentId={editStudentId} 
          formData={formData} 
          setFormData={setFormData} 
          onSubmit={handleSubmit} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      {viewStudentModal && (
        <StudentProfile 
          student={viewStudentModal} 
          onCancel={() => setViewStudentModal(null)} 
        />
      )}
    </div>
  );
}
