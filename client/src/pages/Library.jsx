import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, Upload, AlertTriangle, Clock, CheckCircle, XCircle, Download, Filter } from 'lucide-react';
import { libraryAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Library() {
  const [activeTab, setActiveTab] = useState('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await libraryAPI.getBooks({ search: searchQuery });
      setBooks(data.data || []);
    } catch (e) { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, [searchQuery]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Issued': return 'badge-blue';
      case 'Overdue': return 'badge-red';
      case 'Returned': return 'badge-green';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Library Management</h2>
          <p className="text-gray-500 mt-1">Manage books, issue/return tracking, and digital library</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddBook(true)} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Book
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg"><BookOpen className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Total Books</p><p className="text-xl font-bold">1,245</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Available</p><p className="text-xl font-bold">987</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg"><Clock className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-sm text-gray-500">Issued</p><p className="text-xl font-bold">248</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
            <div><p className="text-sm text-gray-500">Overdue</p><p className="text-xl font-bold">12</p></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['books', 'issues', 'returns'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'books' && (
        <div className="card">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title, author, or ISBN..." />
            </div>
            <select className="input w-48">
              <option value="">All Categories</option>
              <option>Textbook</option>
              <option>Reference</option>
              <option>Story Book</option>
              <option>Magazine</option>
              <option>Dictionary</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ISBN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rack</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {books.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{book.title}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{book.author}</td>
                    <td className="px-4 py-3 text-sm font-mono text-xs">{book.isbn}</td>
                    <td className="px-4 py-3"><span className="badge badge-blue">{book.category}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${book.availableCopies === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {book.availableCopies}/{book.totalCopies}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{book.rack}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setShowIssueModal(true)}
                        disabled={book.availableCopies === 0}
                        className="btn btn-primary text-xs py-1 px-3"
                      >
                        Issue
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Currently Issued Books</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {issues.map(issue => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{issue.book}</td>
                    <td className="px-4 py-3 text-sm">{issue.student}</td>
                    <td className="px-4 py-3 text-sm">{issue.class}</td>
                    <td className="px-4 py-3 text-sm">{new Date(issue.issueDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm">{new Date(issue.dueDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3"><span className={`badge ${getStatusBadge(issue.status)}`}>{issue.status}</span></td>
                    <td className="px-4 py-3 text-sm font-medium text-red-600">₹{issue.fine}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toast.success('Book returned')} className="btn btn-success text-xs py-1 px-3">
                        Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Book</h3>
          <div className="flex gap-4 mb-6">
            <input className="input flex-1" placeholder="Scan barcode or enter Book ID / Student ID..." />
            <button className="btn btn-primary">Search</button>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
            <p className="font-medium text-green-900">Scan book barcode or enter details to process return</p>
            <p className="text-sm text-green-700 mt-1">Fine will be calculated automatically if overdue</p>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Book</h3>
              <button onClick={() => setShowAddBook(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input className="input" placeholder="Book title" />
              </div>
              <div>
                <label className="label">Author *</label>
                <input className="input" placeholder="Author name" />
              </div>
              <div>
                <label className="label">ISBN</label>
                <input className="input" placeholder="978-XXXXXXXXXX" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select className="input">
                    <option>Textbook</option>
                    <option>Reference</option>
                    <option>Story Book</option>
                    <option>Magazine</option>
                    <option>Dictionary</option>
                  </select>
                </div>
                <div>
                  <label className="label">Language</label>
                  <select className="input">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Sanskrit</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Total Copies</label>
                  <input type="number" className="input" defaultValue="1" />
                </div>
                <div>
                  <label className="label">Rack Number</label>
                  <input className="input" placeholder="A-1" />
                </div>
                <div>
                  <label className="label">Price (₹)</label>
                  <input type="number" className="input" placeholder="₹" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => setShowAddBook(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={() => { toast.success('Book added'); setShowAddBook(false); }} className="btn btn-primary">Add Book</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Issue Book</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Student ID or Name</label>
                <input className="input" placeholder="Enter student ID or name" />
              </div>
              <div>
                <label className="label">Due Date</label>
                <input type="date" className="input" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <p>Fine: ₹5 per day after due date</p>
                <p>Maximum 2 books per student</p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => setShowIssueModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={() => { toast.success('Book issued'); setShowIssueModal(false); }} className="btn btn-primary">Issue Book</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
