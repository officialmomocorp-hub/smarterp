import React from 'react';
import { Download } from 'lucide-react';

export default function StudentProfile({ student, onCancel }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-6 border-b border-gray-200 flex justify-between items-start rounded-t-2xl text-white z-10">
           <div className="flex gap-4 items-center">
             <div className="w-16 h-16 rounded-full bg-white text-primary-700 flex items-center justify-center text-2xl font-bold shadow-md">
               {student.profile?.firstName?.charAt(0)}{student.profile?.lastName?.charAt(0)}
             </div>
             <div>
               <h3 className="text-2xl font-bold">
                 {student.profile?.firstName} {student.profile?.middleName} {student.profile?.lastName}
               </h3>
               <div className="flex gap-3 text-sm mt-1 opacity-90">
                 <span>ID: <strong className="font-mono">{student.studentId}</strong></span>
                 <span>•</span>
                 <span>Roll: <strong>{student.rollNumber}</strong></span>
               </div>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <button onClick={() => window.print()} className="btn bg-white/20 hover:bg-white/30 text-white flex items-center gap-2 border-0">
                <Download className="w-4 h-4" /> Print Profile
             </button>
             <button onClick={onCancel} className="text-white opacity-70 hover:opacity-100 text-3xl ml-2">&times;</button>
           </div>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Academic Profile */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Academic Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 text-sm">
              <div><p className="text-gray-500">Class</p><p className="font-semibold text-gray-900">{student.class?.name}</p></div>
              <div><p className="text-gray-500">Section</p><p className="font-semibold text-gray-900">{student.section?.name}</p></div>
              <div><p className="text-gray-500">House</p><p className="font-semibold text-gray-900">{student.house || 'N/A'}</p></div>
              <div><p className="text-gray-500">Status</p><span className="badge badge-success mt-1 inline-block">Active</span></div>
            </div>
          </div>

          {/* Personal Details */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Personal Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 text-sm">
              <div><p className="text-gray-500">Date of Birth</p><p className="font-semibold text-gray-900">{new Date(student.profile?.dateOfBirth).toLocaleDateString()}</p></div>
              <div><p className="text-gray-500">Gender</p><p className="font-semibold text-gray-900">{student.profile?.gender}</p></div>
              <div><p className="text-gray-500">Blood Group</p><p className="font-semibold text-gray-900">{student.profile?.bloodGroup?.replace('_', ' ') || 'N/A'}</p></div>
              <div><p className="text-gray-500">Mother Tongue</p><p className="font-semibold text-gray-900">{student.profile?.motherTongue}</p></div>
              <div><p className="text-gray-500">Category</p><p className="font-semibold text-gray-900">{student.profile?.casteCategory?.replace('_', ' ')}</p></div>
              <div><p className="text-gray-500">Religion</p><p className="font-semibold text-gray-900">{student.profile?.religion}</p></div>
              <div><p className="text-gray-500">Aadhar No.</p><p className="font-semibold text-gray-900">{student.profile?.aadharNumber}</p></div>
            </div>
          </div>

          {/* Parents Details */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Family Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="font-bold text-gray-900 mb-2 flex items-center gap-2">Father's Details</p>
                <div className="space-y-2 text-sm">
                  <div className="flex"><span className="text-gray-500 w-24">Name:</span> <span className="font-medium">{student.parents?.[0]?.parent?.fatherName || 'N/A'}</span></div>
                  <div className="flex"><span className="text-gray-500 w-24">Phone:</span> <span className="font-medium">{student.parents?.[0]?.parent?.fatherPhone || 'N/A'}</span></div>
                  <div className="flex"><span className="text-gray-500 w-24">Occupation:</span> <span className="font-medium">{student.parents?.[0]?.parent?.fatherOccupation || 'N/A'}</span></div>
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-2 flex items-center gap-2">Mother's Details</p>
                <div className="space-y-2 text-sm">
                  <div className="flex"><span className="text-gray-500 w-24">Name:</span> <span className="font-medium">{student.parents?.[0]?.parent?.motherName || 'N/A'}</span></div>
                  <div className="flex"><span className="text-gray-500 w-24">Phone:</span> <span className="font-medium">{student.parents?.[0]?.parent?.motherPhone || 'N/A'}</span></div>
                  <div className="flex"><span className="text-gray-500 w-24">Occupation:</span> <span className="font-medium">{student.parents?.[0]?.parent?.motherOccupation || 'N/A'}</span></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm">
              <p className="text-gray-500 mb-1">Residential Address</p>
              <p className="font-medium text-gray-900">
                {student.parents?.[0]?.parent?.address}, {student.parents?.[0]?.parent?.city}, {student.parents?.[0]?.parent?.state} - {student.parents?.[0]?.parent?.pincode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
