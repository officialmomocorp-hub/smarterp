import React from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { BarChart3, Download, FileSpreadsheet, Building2, TrendingUp } from 'lucide-react';

export default function PlatformReports() {
  const reports = [
    { title: 'School Registration Report', description: 'List of all registered schools with their signup dates and contact info.', icon: Building2 },
    { title: 'Revenue Report', description: 'Total MRR, pending payments, and historical revenue growth.', icon: TrendingUp },
    { title: 'Usage Analytics', description: 'Most active schools, student enrollment trends, and module usage.', icon: BarChart3 },
    { title: 'Subscription Expiry', description: 'Schools whose plans are expiring within the next 30 days.', icon: FileSpreadsheet },
  ];

  const [downloading, setDownloading] = React.useState(null);

  const jsonToCSV = (json, title) => {
    if (!json || json.length === 0) return '';
    const items = Array.isArray(json) ? json : [json];
    const replacer = (key, value) => (value === null ? '' : value);
    const header = Object.keys(items[0]);
    const csv = [
      header.join(','),
      ...items.map((row) =>
        header
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(',')
      ),
    ].join('\r\n');
    return csv;
  };

  const handleDownload = async (title) => {
    setDownloading(title);
    try {
      const endpoint = title.includes('School') ? '/platform/reports/school-list' :
                      title.includes('Revenue') ? '/platform/reports/revenue' :
                      title.includes('Usage') ? '/platform/reports/usage' : '/platform/reports/school-list';
      const { data } = await api.get(endpoint);
      const csvData = jsonToCSV(data.data, title);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      toast.success(`${title} downloaded as Excel (CSV)! 📊`);
    } catch (err) {
      toast.error(`Failed to download ${title}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-primary-100 pb-2 inline-block">Platform-Level Reports</h2>
        <p className="text-gray-500 mt-2">Comprehensive data and analytics across all onboarded schools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <report.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{report.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                <button 
                  disabled={!!downloading}
                  onClick={() => handleDownload(report.title)}
                  className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
                >
                   <Download className="w-4 h-4" /> 
                   {downloading === report.title ? 'Generating Excel...' : 'Download Report'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
