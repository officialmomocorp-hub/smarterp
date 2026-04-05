import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, FileOutput } from 'lucide-react';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'ANDHRA_PRADESH', 'ARUNACHAL_PRADESH', 'ASSAM', 'BIHAR', 'CHHATTISGARH',
  'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL_PRADESH', 'JHARKHAND',
  'KARNATAKA', 'KERALA', 'MADHYA_PRADESH', 'MAHARASHTRA', 'MANIPUR',
  'MEGHALAYA', 'MIZORAM', 'NAGALAND', 'ODISHA', 'PUNJAB', 'RAJASTHAN',
  'SIKKIM', 'TAMIL_NADU', 'TELANGANA', 'TRIPURA', 'UTTAR_PRADESH',
  'UTTARAKHAND', 'WEST_BENGAL', 'DELHI'
];

const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const CASTES = ['GENERAL', 'OBC', 'OBC_NCL', 'SC', 'ST'];
const RELIGIONS = ['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'BUDDHIST', 'JAIN', 'OTHER'];
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const HOUSES = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

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
  const [selectedStudent, setSelectedStudent] = useState(null);
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
      setFormData({
        profile: { firstName: '', middleName: '', lastName: '', dateOfBirth: '', gender: 'MALE', casteCategory: 'GENERAL', religion: 'HINDU', motherTongue: 'HINDI', aadharNumber: '', bloodGroup: '' },
        parentData: { fatherName: '', fatherOccupation: '', fatherPhone: '', fatherEmail: '', motherName: '', motherOccupation: '', motherPhone: '', motherEmail: '', address: '', city: '', state: 'DELHI', pincode: '', annualIncome: '' },
        class: 'Class 1', section: 'A', house: 'RED', bplStatus: false, rteSeat: false, midDayMealOpted: true, transportOpted: false, hostelOpted: false,
      });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save student');
    }
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
        <button id="add-student-btn" data-testid="add-student" onClick={() => { setEditStudentId(null); setShowForm(true); }} className="btn btn-primary flex items-center gap-2">
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
              <input
                type="text"
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, ID, Aadhar..."
              />
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
                          <p className="text-sm font-medium text-gray-900">
                            {student.profile?.firstName} {student.profile?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{student.profile?.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{student.class?.name}</td>
                    <td className="px-4 py-3 text-sm">{student.section?.name}</td>
                    <td className="px-4 py-3">
                      <span className="badge badge-blue">{student.profile?.casteCategory}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{student.parents?.[0]?.parent?.fatherName || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewStudentModal(student)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleIssueTC(student)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600" title="Issue TC">
                          <FileOutput className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEditClick(student)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(student.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn btn-secondary text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-xl font-bold text-gray-900">{editStudentId ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Student Details */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Student Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">First Name *</label>
                    <input className="input" required value={formData.profile.firstName} onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, firstName: e.target.value } })} />
                  </div>
                  <div>
                    <label className="label">Middle Name</label>
                    <input className="input" value={formData.profile.middleName} onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, middleName: e.target.value } })} />
                  </div>
                  <div>
                    <label className="label">Last Name *</label>
                    <input className="input" required value={formData.profile.lastName} onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, lastName: e.target.value } })} />
                  </div>
                  <div>
                    <label className="label">Date of Birth *</label>
                    <input type="date" className="input" required value={formData.profile.dateOfBirth} onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, dateOfBirth: e.target.value } })} />
                  </div>
                  <div>
                    <label className="label">Gender *</label>
                    <select className="input" value={formData.profile.gender} onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, gender: e.target.value } })}>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Aadhar Number *</label>
                    <input className="input" required maxLength="12" pattern="[0-9]{12}" value={formData.profile.aadharNumber} onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, aadharNumber: e.target.value } })} placeholder="12 digit Aadhar" />
                  </div>
                  <div>
                    <label className="label">Caste Category *</label>
                    <select className="input" value={formData.profile.casteCategory} onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, casteCategory: e.target.value } })}>
                      {CASTES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Religion *</label>
                    <select className="input" value={formData.profile.religion} onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, religion: e.target.value } })}>
                      {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Mother Tongue</label>
                    <select className="input" value={formData.profile.motherTongue} onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, motherTongue: e.target.value } })}>
                      {['HINDI', 'ENGLISH', 'URDU', 'BENGALI', 'MARATHI', 'TAMIL', 'TELUGU', 'GUJARATI', 'PUNJABI', 'OTHER'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Blood Group</label>
                    <select className="input" value={formData.profile.bloodGroup} onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, bloodGroup: e.target.value } })}>
                      <option value="">Select</option>
                      {['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE'].map(b => <option key={b} value={b}>{b.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Academic Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Class *</label>
                    <select className="input" required value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })}>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Section *</label>
                    <select className="input" required value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })}>
                      {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">House</label>
                    <select className="input" value={formData.house} onChange={(e) => setFormData({ ...formData, house: e.target.value })}>
                      {HOUSES.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.rteSeat} onChange={(e) => setFormData({ ...formData, rteSeat: e.target.checked })} />
                      <span className="text-sm">RTE Seat</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.bplStatus} onChange={(e) => setFormData({ ...formData, bplStatus: e.target.checked })} />
                      <span className="text-sm">BPL</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.midDayMealOpted} onChange={(e) => setFormData({ ...formData, midDayMealOpted: e.target.checked })} />
                      <span className="text-sm">Mid-Day Meal</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Parent Details */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Father's Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Father's Name *</label>
                    <input className="input" required value={formData.parentData.fatherName} onChange={(e) => setFormData({ ...formData, parentData: { ...formData.parentData, fatherName: e.target.value } })} />
                  </div>
                  <div>
                    <label className="label">Occupation</label>
                    <input className="input" value={formData.parentData.fatherOccupation} onChange={(e) => setFormData({ ...formData, parentData: { ...formData.parentData, fatherOccupation: e.target.value } })} />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input className="input" required maxLength="10" pattern="[0-9]{10}" value={formData.parentData.fatherPhone} onChange={(e) => setFormData({ ...formData, parentData: { ...formData.parentData, fatherPhone: e.target.value } })} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Mother's Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Mother's Name *</label>
                    <input className="input" required value={formData.parentData.motherName} onChange={(e) => setFormData({ ...formData, parentData: { ...formData.parentData, motherName: e.target.value } })} />
                  </div>
                  <div>
                    <label className="label">Occupation</label>
                    <input className="input" value={formData.parentData.motherOccupation} onChange={(e) => setFormData({ ...formData, parentData: { ...formData.parentData, motherOccupation: e.target.value } })} />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input className="input" required maxLength="10" pattern="[0-9]{10}" value={formData.parentData.motherPhone} onChange={(e) => setFormData({ ...formData, parentData: { ...formData.parentData, motherPhone: e.target.value } })} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Address *</label>
                    <input className="input" required value={formData.parentData.address} onChange={(e) => setFormData({ ...formData, parentData: { ...formData.parentData, address: e.target.value } })} />
                  </div>
                  <div>
                    <label className="label">City *</label>
                    <input className="input" required value={formData.parentData.city} onChange={(e) => setFormData({ ...formData, parentData: { ...formData.parentData, city: e.target.value } })} />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <select className="input" required value={formData.parentData.state} onChange={(e) => setFormData({ ...formData, parentData: { ...formData.parentData, state: e.target.value } })}>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Pincode *</label>
                    <input className="input" required maxLength="6" pattern="[0-9]{6}" value={formData.parentData.pincode} onChange={(e) => setFormData({ ...formData, parentData: { ...formData.parentData, pincode: e.target.value } })} />
                  </div>
                  <div>
                    <label className="label">Annual Income</label>
                    <input type="number" className="input" value={formData.parentData.annualIncome} onChange={(e) => setFormData({ ...formData, parentData: { ...formData.parentData, annualIncome: e.target.value } })} placeholder="₹" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white pb-4 px-6 rounded-b-2xl">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editStudentId ? 'Save Changes' : 'Create Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Profile Modal */}
      {viewStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-6 border-b border-gray-200 flex justify-between items-start rounded-t-2xl text-white">
               <div className="flex gap-4 items-center">
                 <div className="w-16 h-16 rounded-full bg-white text-primary-700 flex items-center justify-center text-2xl font-bold shadow-md">
                   {viewStudentModal.profile?.firstName?.charAt(0)}{viewStudentModal.profile?.lastName?.charAt(0)}
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold">
                     {viewStudentModal.profile?.firstName} {viewStudentModal.profile?.middleName} {viewStudentModal.profile?.lastName}
                   </h3>
                   <div className="flex gap-3 text-sm mt-1 opacity-90">
                     <span>ID: <strong className="font-mono">{viewStudentModal.studentId}</strong></span>
                     <span>•</span>
                     <span>Roll: <strong>{viewStudentModal.rollNumber}</strong></span>
                   </div>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <button onClick={() => window.print()} className="btn bg-white/20 hover:bg-white/30 text-white flex items-center gap-2 border-0">
                    <Download className="w-4 h-4" /> Print Profile
                 </button>
                 <button onClick={() => setViewStudentModal(null)} className="text-white opacity-70 hover:opacity-100 text-3xl ml-2">&times;</button>
               </div>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Academic Profile */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Academic Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 text-sm">
                  <div><p className="text-gray-500">Class</p><p className="font-semibold text-gray-900">{viewStudentModal.class?.name}</p></div>
                  <div><p className="text-gray-500">Section</p><p className="font-semibold text-gray-900">{viewStudentModal.section?.name}</p></div>
                  <div><p className="text-gray-500">House</p><p className="font-semibold text-gray-900">{viewStudentModal.house || 'N/A'}</p></div>
                  <div><p className="text-gray-500">Status</p><span className="badge badge-success mt-1 inline-block">Active</span></div>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Personal Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 text-sm">
                  <div><p className="text-gray-500">Date of Birth</p><p className="font-semibold text-gray-900">{new Date(viewStudentModal.profile?.dateOfBirth).toLocaleDateString()}</p></div>
                  <div><p className="text-gray-500">Gender</p><p className="font-semibold text-gray-900">{viewStudentModal.profile?.gender}</p></div>
                  <div><p className="text-gray-500">Blood Group</p><p className="font-semibold text-gray-900">{viewStudentModal.profile?.bloodGroup?.replace('_', ' ') || 'N/A'}</p></div>
                  <div><p className="text-gray-500">Mother Tongue</p><p className="font-semibold text-gray-900">{viewStudentModal.profile?.motherTongue}</p></div>
                  <div><p className="text-gray-500">Category</p><p className="font-semibold text-gray-900">{viewStudentModal.profile?.casteCategory?.replace('_', ' ')}</p></div>
                  <div><p className="text-gray-500">Religion</p><p className="font-semibold text-gray-900">{viewStudentModal.profile?.religion}</p></div>
                  <div><p className="text-gray-500">Aadhar No.</p><p className="font-semibold text-gray-900">{viewStudentModal.profile?.aadharNumber}</p></div>
                </div>
              </div>

              {/* Parents Details */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Family Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900 mb-2 flex items-center gap-2">Father's Details</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex"><span className="text-gray-500 w-24">Name:</span> <span className="font-medium">{viewStudentModal.parents?.[0]?.parent?.fatherName || 'N/A'}</span></div>
                      <div className="flex"><span className="text-gray-500 w-24">Phone:</span> <span className="font-medium">{viewStudentModal.parents?.[0]?.parent?.fatherPhone || 'N/A'}</span></div>
                      <div className="flex"><span className="text-gray-500 w-24">Occupation:</span> <span className="font-medium">{viewStudentModal.parents?.[0]?.parent?.fatherOccupation || 'N/A'}</span></div>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-2 flex items-center gap-2">Mother's Details</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex"><span className="text-gray-500 w-24">Name:</span> <span className="font-medium">{viewStudentModal.parents?.[0]?.parent?.motherName || 'N/A'}</span></div>
                      <div className="flex"><span className="text-gray-500 w-24">Phone:</span> <span className="font-medium">{viewStudentModal.parents?.[0]?.parent?.motherPhone || 'N/A'}</span></div>
                      <div className="flex"><span className="text-gray-500 w-24">Occupation:</span> <span className="font-medium">{viewStudentModal.parents?.[0]?.parent?.motherOccupation || 'N/A'}</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm">
                  <p className="text-gray-500 mb-1">Residential Address</p>
                  <p className="font-medium text-gray-900">
                    {viewStudentModal.parents?.[0]?.parent?.address}, {viewStudentModal.parents?.[0]?.parent?.city}, {viewStudentModal.parents?.[0]?.parent?.state} - {viewStudentModal.parents?.[0]?.parent?.pincode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
