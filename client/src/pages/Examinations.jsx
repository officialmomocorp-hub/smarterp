import React from 'react';
import { Award, TrendingUp, Users, AlertTriangle } from 'lucide-react';

export default function Examinations() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Examination & Marks</h2>
        <p className="text-gray-500 mt-1">Manage exams, marks entry, and report cards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Exams</p>
              <p className="text-xl font-bold">4</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Results Published</p>
              <p className="text-xl font-bold">2</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Marks Pending</p>
              <p className="text-xl font-bold">12</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Failed Students</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Schedule - 2025-26</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: 'Unit Test 1', type: 'UNIT_TEST', start: '2025-07-15', end: '2025-07-18', status: 'Completed' },
                { name: 'Half Yearly', type: 'HALF_YEARLY', start: '2025-09-10', end: '2025-09-20', status: 'Completed' },
                { name: 'Unit Test 2', type: 'UNIT_TEST', start: '2025-11-15', end: '2025-11-18', status: 'Upcoming' },
                { name: 'Annual Exam', type: 'ANNUAL', start: '2026-02-15', end: '2026-03-05', status: 'Upcoming' },
              ].map((exam) => (
                <tr key={exam.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{exam.name}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-blue">{exam.type.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{new Date(exam.start).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm">{new Date(exam.end).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${exam.status === 'Completed' ? 'badge-green' : 'badge-yellow'}`}>
                      {exam.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Grading System (CBSE)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { grade: 'A1', range: '91-100', color: 'bg-green-100 text-green-800' },
            { grade: 'A2', range: '81-90', color: 'bg-green-50 text-green-700' },
            { grade: 'B1', range: '71-80', color: 'bg-blue-100 text-blue-800' },
            { grade: 'B2', range: '61-70', color: 'bg-blue-50 text-blue-700' },
            { grade: 'C1', range: '51-60', color: 'bg-amber-100 text-amber-800' },
            { grade: 'C2', range: '41-50', color: 'bg-amber-50 text-amber-700' },
            { grade: 'D', range: '33-40', color: 'bg-orange-100 text-orange-800' },
            { grade: 'E', range: '0-32', color: 'bg-red-100 text-red-800' },
          ].map((g) => (
            <div key={g.grade} className={`rounded-lg p-3 text-center ${g.color}`}>
              <p className="text-lg font-bold">{g.grade}</p>
              <p className="text-xs">{g.range}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
