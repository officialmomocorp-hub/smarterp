import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Plus, Upload, AlertTriangle, 
  Clock, CheckCircle, XCircle, Download, Filter,
  Book, User, Hash, Calendar, ArrowRight,
  TrendingUp, Library as LibraryIcon, ShieldCheck
} from 'lucide-react';
import { libraryAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-[#1c1c1e]  border border-[#38383a] rounded-3xl p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-[#1c1c1e]  border border-[#38383a] rounded-3xl p-6 hover:bg-[#2c2c2e] transition-all group relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 blur-none -mr-12 -mt-12 group-hover:bg-${color}-500/20 transition-all`} />
    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-3.5 rounded-2xl bg-${color}-500/20 border border-${color}-500/20`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400  mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function Library() {
  const [activeTab, setActiveTab] = useState('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    overdueCount: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await libraryAPI.getStats();
      if (data?.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error('Failed to load library stats');
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await libraryAPI.getBooks({ search: searchQuery });
      // Fixed mapping: backend returns { data: { books: [], ... } }
      setBooks(data?.data?.books || []);
    } catch (e) { 
      toast.error('Failed to load books'); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchIssues = async () => {
    try {
      const { data } = await libraryAPI.getIssues();
      setIssues(data?.data || []);
    } catch (e) {
      toast.error('Failed to load issue records');
    }
  };

  useEffect(() => { 
    fetchBooks(); 
    fetchStats();
    if (activeTab === 'issues') fetchIssues();
  }, [searchQuery, activeTab]);

  const handleReturnAction = async (issueId) => {
    try {
      await libraryAPI.returnBook(issueId);
      toast.success('Book returned successfully');
      fetchIssues();
      fetchStats();
    } catch (e) {
      toast.error('Return failed');
    }
  };

  const tabs = [
    { id: 'books', label: 'Book Inventory', icon: Book },
    { id: 'issues', label: 'Issued Books', icon: Clock },
  ];

  return (
    <div className="space-y-8 p-6 lg:p-10 min-h-screen bg-transparent">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/20">
              <LibraryIcon className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs font-bold text-blue-400  tracking-[0.3em]">Knowledge Hub</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Library <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#5E5CE6]">Management</span>
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-3"
        >
          <button 
            onClick={() => setShowAddBook(true)}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center gap-2 transition-all  shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Add New Volume
          </button>
          <button className="px-6 py-3.5 bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white border border-[#38383a] rounded-2xl font-bold flex items-center gap-2 transition-all  active:scale-95">
            <Download className="w-5 h-5" /> Analytics Report
          </button>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={BookOpen} label="Total Resources" value={(stats?.totalBooks || 0).toLocaleString()} color="blue" delay={0.1} />
        <StatCard icon={CheckCircle} label="Ready to Issue" value={(stats?.availableBooks || 0).toLocaleString()} color="green" delay={0.2} />
        <StatCard icon={Clock} label="Currently Out" value={(stats?.issuedBooks || 0).toLocaleString()} color="amber" delay={0.3} />
        <StatCard icon={AlertTriangle} label="Overdue Notice" value={(stats?.overdueCount || 0).toLocaleString()} color="red" delay={0.4} />
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex gap-1 bg-[#1c1c1e] p-1.5 rounded-2xl border border-[#38383a] w-fit ">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white  shadow-blue-600/30' 
                    : 'text-gray-400 hover:text-white hover:bg-[#1c1c1e]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                className="w-full bg-[#1c1c1e] border border-[#38383a] rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search catalog by title, author, isbn..." 
              />
            </div>
            <button className="p-3 bg-[#1c1c1e] border border-[#38383a] rounded-2xl hover:bg-[#2c2c2e] transition-all text-gray-400 hover:text-white">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <GlassCard className="!p-0 overflow-hidden">
          {activeTab === 'books' ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#38383a] bg-transparent">
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 ">Scientific Details</th>
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 ">Author & Pub</th>
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 ">Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 ">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#38383a]">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="h-20 bg-white/[0.01]" />
                        </tr>
                      ))
                    ) : books.length > 0 ? (
                      books.map((book) => (
                        <motion.tr 
                          key={book.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-transparent transition-all group"
                        >
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-white font-bold group-hover:text-blue-400 transition-colors">{book.title}</span>
                              <span className="text-xs text-gray-500 mt-1 font-mono">{book.isbn || 'NO_ISBN_TAG'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-gray-300 font-medium">{book.author}</span>
                              <span className="text-[10px] text-gray-500  tracking-wider">{book.publisher}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              {book.availableCopies > 0 ? (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#30D158]/10 text-[#30D158] text-[10px] font-bold  ring-1 ring-[#30D158]/20">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
                                  Available ({book.availableCopies})
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold  ring-1 ring-red-500/20">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="p-2.5 rounded-xl bg-[#1c1c1e] border border-[#38383a] text-gray-400 hover:text-white hover:bg-[#2c2c2e] transition-all hover:scale-110 active:scale-95">
                              <ArrowRight className="w-5 h-5" />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-6 bg-[#1c1c1e] rounded-full border border-[#38383a]">
                              <Book className="w-12 h-12 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-white font-bold text-lg">Inventory Depleted</p>
                              <p className="text-gray-500 max-w-xs mx-auto mt-2">Could not find any books matching your current search parameters.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
               <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#38383a] bg-transparent">
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 ">Borrower</th>
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 ">Book Information</th>
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 ">Timelines</th>
                    <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 ">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#38383a]">
                {issues.length > 0 ? issues.map(issue => (
                  <tr key={issue.id} className="hover:bg-transparent transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0A84FF]/20 flex items-center justify-center border border-[#0A84FF]/20">
                          <User className="w-5 h-5 text-[#0A84FF]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold">{issue.student?.profile?.firstName} {issue.student?.profile?.lastName}</span>
                          <span className="text-[10px] text-gray-500">ID: {issue.studentId.split('-')[0].toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-gray-300 font-medium">{issue.book?.title}</span>
                        <span className="text-[10px] text-gray-500">{issue.book?.author}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due: {new Date(issue.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {issue.status === 'Issued' ? (
                         <button 
                         onClick={() => handleReturnAction(issue.id)}
                         className="px-4 py-2 rounded-xl bg-[#30D158]/10 text-[#30D158] text-xs font-bold hover:bg-[#30D158]/20 transition-all border border-[#30D158]/20  shadow-[#30D158]/5"
                       >
                         Complete Return
                       </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg bg-[#1c1c1e] text-gray-400 text-xs font-bold ">
                          {issue.status}
                        </span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-gray-500">No active issue records found</td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
