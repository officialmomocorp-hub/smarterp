import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, CheckCircle, XCircle, Clock, Eye, Upload, AlertTriangle } from 'lucide-react';
import { admissionAPI } from '../services/api';
import toast from 'react-hot-toast';

const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const CASTES = ['GENERAL', 'OBC', 'OBC_NCL', 'SC', 'ST'];
const RELIGIONS = ['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'BUDDHIST', 'JAIN', 'OTHER'];
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const INDIAN_STATES = ['DELHI', 'UTTAR_PRADESH', 'MAHARASHTRA', 'RAJASTHAN', 'BIHAR', 'MADHYA_PRADESH', 'TAMIL_NADU', 'KARNATAKA', 'GUJARAT', 'ANDHRA_PRADESH', 'TELANGANA', 'WEST_BENGAL', 'KERALA', 'PUNJAB', 'HARYANA', 'ODISHA', 'JHARKHAND', 'ASSAM', 'CHHATTISGARH', 'UTTARAKHAND', 'HIMACHAL_PRADESH', 'GOA', 'TRIPURA', 'MANIPUR', 'MEGHALAYA', 'NAGALAND', 'SIKKIM', 'ARUNACHAL_PRADESH', 'MIZORAM'];

export default function Admissions() {
  const [activeTab, setActiveTab] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    applicantName: '', applicantPhone: '', applicantEmail: '',
    classApplied: 'Class 1', sectionPreferred: 'A',
    dateOfBirth: '', gender: 'MALE',
    casteCategory: 'GENERAL', religion: 'HINDU', motherTongue: 'HINDI',
    aadharNumber: '', previousSchool: '', previousClass: '',
    tcNumber: '', reasonForLeaving: '',
    fatherName: '', fatherOccupation: '', fatherPhone: '',
    motherName: '', motherOccupation: '', motherPhone: '',
    address: '', city: '', state: 'DELHI', pincode: '',
    annualIncome: '',
  });

  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const { data } = await admissionAPI.getAll({ search: searchQuery, status: filterStatus });
      setAdmissions(data.data.admissions);
    } catch (e) {
      toast.error('Failed to load admissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [searchQuery, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.annualIncome) {
        formData.annualIncome = parseFloat(formData.annualIncome);
      }
      await admissionAPI.create({...formData, status: 'PENDING'});
      toast.success('Admission application submitted successfully');
      setShowForm(false);
      setFormData({
        applicantName: '', applicantPhone: '', applicantEmail: '',
        classApplied: 'Class 1', sectionPreferred: 'A',
        dateOfBirth: '', gender: 'MALE',
        casteCategory: 'GENERAL', religion: 'HINDU', motherTongue: 'HINDI',
        aadharNumber: '', previousSchool: '', previousClass: '',
        tcNumber: '', reasonForLeaving: '',
        fatherName: '', fatherOccupation: '', fatherPhone: '',
        motherName: '', motherOccupation: '', motherPhone: '',
        address: '', city: '', state: 'DELHI', pincode: '',
        annualIncome: '',
      });
      fetchAdmissions();
    } catch (e) {
      toast.error('Failed to submit application');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await admissionAPI.updateStatus(id, { status });
      toast.success(`Admission ${status.toLowerCase()}`);
      fetchAdmissions();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'badge-yellow',
      APPROVED: 'badge-green',
      REJECTED: 'badge-red',
      WAITLISTED: 'badge-blue',
    };
    return badges[status] || 'badge-gray';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admission Management</h2>
          <p className="text-gray-500 mt-1">Manage online admissions for academic year 2025-26</p>
        </div>
        <button id="new-admission-btn" data-testid="new-admission" onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Admission
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg"><Clock className="w-6 h-6 text-yellow-600" /></div>
            <div><p className="text-sm text-gray-500">Pending</p><p className="text-xl font-bold text-yellow-600">2</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Approved</p><p className="text-xl font-bold text-green-600">1</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg"><FileText className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Waitlisted</p><p className="text-xl font-bold text-blue-600">1</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg"><XCircle className="w-6 h-6 text-red-600" /></div>
            <div><p className="text-sm text-gray-500">Rejected</p><p className="text-xl font-bold text-red-600">1</p></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" className="input pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Name, ID, Phone..." />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WAITLISTED">Waitlisted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admissions List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">App ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admissions.map((adm) => (
                <tr key={adm.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-primary-600">{adm.admissionNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{adm.applicantName}</p>
                    <p className="text-xs text-gray-500">{new Date(adm.dateOfBirth).toLocaleDateString('en-IN')}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{adm.fatherName}</p>
                    <p className="text-xs text-gray-500">{adm.fatherPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{adm.classApplied}</td>
                  <td className="px-4 py-3"><span className="badge badge-blue">{adm.casteCategory}</span></td>
                  <td className="px-4 py-3 text-sm">{adm.applicantPhone}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 badge ${getStatusBadge(adm.status)}`}>
                      {getStatusIcon(adm.status)} {adm.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="View"><Eye className="w-4 h-4" /></button>
                      {adm.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleStatusChange(adm.id, 'APPROVED')} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleStatusChange(adm.id, 'REJECTED')} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Reject"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-900">New Admission Application</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Student Details */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Applicant Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input" required value={formData.applicantName} onChange={(e) => setFormData({...formData, applicantName: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Date of Birth *</label>
                    <input type="date" className="input" required value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Gender *</label>
                    <select className="input" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Class Applied For *</label>
                    <select className="input" required value={formData.classApplied} onChange={(e) => setFormData({...formData, classApplied: e.target.value})}>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Section Preferred</label>
                    <select className="input" value={formData.sectionPreferred} onChange={(e) => setFormData({...formData, sectionPreferred: e.target.value})}>
                      <option>A</option><option>B</option><option>C</option><option>D</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Aadhar Number</label>
                    <input className="input" maxLength="12" pattern="[0-9]{12}" value={formData.aadharNumber} onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})} placeholder="12 digit Aadhar" />
                  </div>
                  <div>
                    <label className="label">Caste Category *</label>
                    <select className="input" required value={formData.casteCategory} onChange={(e) => setFormData({...formData, casteCategory: e.target.value})}>
                      {CASTES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Religion *</label>
                    <select className="input" required value={formData.religion} onChange={(e) => setFormData({...formData, religion: e.target.value})}>
                      {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Mother Tongue</label>
                    <select className="input" value={formData.motherTongue} onChange={(e) => setFormData({...formData, motherTongue: e.target.value})}>
                      {['HINDI', 'ENGLISH', 'URDU', 'BENGALI', 'MARATHI', 'TAMIL', 'TELUGU', 'GUJARATI', 'PUNJABI', 'OTHER'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Previous School */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Previous School Details (if applicable)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Previous School Name</label>
                    <input className="input" value={formData.previousSchool} onChange={(e) => setFormData({...formData, previousSchool: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Previous Class</label>
                    <input className="input" value={formData.previousClass} onChange={(e) => setFormData({...formData, previousClass: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">TC Number</label>
                    <input className="input" value={formData.tcNumber} onChange={(e) => setFormData({...formData, tcNumber: e.target.value})} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="label">Reason for Leaving</label>
                    <input className="input" value={formData.reasonForLeaving} onChange={(e) => setFormData({...formData, reasonForLeaving: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Parent Details */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Parent/Guardian Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Father's Name *</label>
                    <input className="input" required value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Father's Occupation</label>
                    <input className="input" value={formData.fatherOccupation} onChange={(e) => setFormData({...formData, fatherOccupation: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Father's Phone *</label>
                    <input className="input" required maxLength="10" pattern="[0-9]{10}" value={formData.fatherPhone} onChange={(e) => setFormData({...formData, fatherPhone: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Mother's Name *</label>
                    <input className="input" required value={formData.motherName} onChange={(e) => setFormData({...formData, motherName: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Mother's Occupation</label>
                    <input className="input" value={formData.motherOccupation} onChange={(e) => setFormData({...formData, motherOccupation: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Mother's Phone</label>
                    <input className="input" maxLength="10" pattern="[0-9]{10}" value={formData.motherPhone} onChange={(e) => setFormData({...formData, motherPhone: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Annual Income</label>
                    <input type="number" className="input" value={formData.annualIncome} onChange={(e) => setFormData({...formData, annualIncome: e.target.value})} placeholder="₹" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Address *</label>
                    <input className="input" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">City *</label>
                    <input className="input" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <select className="input" required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})}>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Pincode *</label>
                    <input className="input" required maxLength="6" pattern="[0-9]{6}" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Phone *</label>
                    <input className="input" required maxLength="10" pattern="[0-9]{10}" value={formData.applicantPhone} onChange={(e) => setFormData({...formData, applicantPhone: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" value={formData.applicantEmail} onChange={(e) => setFormData({...formData, applicantEmail: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Document Upload</h4>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Upload Required Documents</p>
                  <p className="text-xs text-gray-400 mt-1">Aadhar Card, Birth Certificate, TC, Photos, Category Certificate</p>
                  <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 5MB each)</p>
                </div>
              </div>

              {/* RTE/BPL */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h4 className="font-medium text-amber-900">Special Categories</h4>
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-amber-800">RTE 25% EWS Seat</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-amber-800">BPL Card Holder</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-amber-800">Staff Ward</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-amber-800">Sibling Discount</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
