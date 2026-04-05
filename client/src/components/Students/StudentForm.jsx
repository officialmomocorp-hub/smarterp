import React from 'react';
import { INDIAN_STATES, CLASSES, SECTIONS, CASTES, RELIGIONS, GENDERS, HOUSES, BLOOD_GROUPS, LANGUAGES } from '../../config/constants';

export default function StudentForm({ editStudentId, formData, setFormData, onSubmit, onCancel }) {
  const updateProfile = (field, value) => {
    setFormData(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  };

  const updateParent = (field, value) => {
    setFormData(prev => ({ ...prev, parentData: { ...prev.parentData, [field]: value } }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-xl font-bold text-gray-900">{editStudentId ? 'Edit Student' : 'Add New Student'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Student Details */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Student Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input className="input" required value={formData.profile.firstName} onChange={(e) => updateProfile('firstName', e.target.value)} />
              </div>
              <div>
                <label className="label">Middle Name</label>
                <input className="input" value={formData.profile.middleName} onChange={(e) => updateProfile('middleName', e.target.value)} />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input className="input" required value={formData.profile.lastName} onChange={(e) => updateProfile('lastName', e.target.value)} />
              </div>
              <div>
                <label className="label">Date of Birth *</label>
                <input type="date" className="input" required value={formData.profile.dateOfBirth} onChange={(e) => updateProfile('dateOfBirth', e.target.value)} />
              </div>
              <div>
                <label className="label">Gender *</label>
                <select className="input" value={formData.profile.gender} onChange={(e) => updateProfile('gender', e.target.value)}>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Aadhar Number *</label>
                <input className="input" required maxLength="12" pattern="[0-9]{12}" value={formData.profile.aadharNumber} onChange={(e) => updateProfile('aadharNumber', e.target.value)} placeholder="12 digit Aadhar" />
              </div>
              <div>
                <label className="label">Caste Category *</label>
                <select className="input" value={formData.profile.casteCategory} onChange={(e) => updateProfile('casteCategory', e.target.value)}>
                  {CASTES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Religion *</label>
                <select className="input" value={formData.profile.religion} onChange={(e) => updateProfile('religion', e.target.value)}>
                  {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Mother Tongue</label>
                <select className="input" value={formData.profile.motherTongue} onChange={(e) => updateProfile('motherTongue', e.target.value)}>
                  {LANGUAGES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Blood Group</label>
                <select className="input" value={formData.profile.bloodGroup} onChange={(e) => updateProfile('bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b.replace('_', ' ')}</option>)}
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
                <input className="input" required value={formData.parentData.fatherName} onChange={(e) => updateParent('fatherName', e.target.value)} />
              </div>
              <div>
                <label className="label">Occupation</label>
                <input className="input" value={formData.parentData.fatherOccupation} onChange={(e) => updateParent('fatherOccupation', e.target.value)} />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input className="input" required maxLength="10" pattern="[0-9]{10}" value={formData.parentData.fatherPhone} onChange={(e) => updateParent('fatherPhone', e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Mother's Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Mother's Name *</label>
                <input className="input" required value={formData.parentData.motherName} onChange={(e) => updateParent('motherName', e.target.value)} />
              </div>
              <div>
                <label className="label">Occupation</label>
                <input className="input" value={formData.parentData.motherOccupation} onChange={(e) => updateParent('motherOccupation', e.target.value)} />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input className="input" required maxLength="10" pattern="[0-9]{10}" value={formData.parentData.motherPhone} onChange={(e) => updateParent('motherPhone', e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="label">Address *</label>
                <input className="input" required value={formData.parentData.address} onChange={(e) => updateParent('address', e.target.value)} />
              </div>
              <div>
                <label className="label">City *</label>
                <input className="input" required value={formData.parentData.city} onChange={(e) => updateParent('city', e.target.value)} />
              </div>
              <div>
                <label className="label">State *</label>
                <select className="input" required value={formData.parentData.state} onChange={(e) => updateParent('state', e.target.value)}>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Pincode *</label>
                <input className="input" required maxLength="6" pattern="[0-9]{6}" value={formData.parentData.pincode} onChange={(e) => updateParent('pincode', e.target.value)} />
              </div>
              <div>
                <label className="label">Annual Income</label>
                <input type="number" className="input" value={formData.parentData.annualIncome} onChange={(e) => updateParent('annualIncome', e.target.value)} placeholder="₹" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white pb-4 px-6 rounded-b-2xl">
            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">{editStudentId ? 'Save Changes' : 'Create Student'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
