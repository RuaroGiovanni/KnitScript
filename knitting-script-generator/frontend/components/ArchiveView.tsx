import React from 'react';
import { ArchiveRecord } from '../types.ts';
import { Search, Calendar, User, FileText } from 'lucide-react';

interface ArchiveViewProps {
  records: ArchiveRecord[];
  onLoadRecord: (record: ArchiveRecord) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ records, onLoadRecord }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = records.filter(r => 
    r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.yarnSpec.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Historical Archive
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search client, yarn, ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No records found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">ID / Date</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Yarn</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(record => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{record.id}</div>
                    <div className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> {record.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <User className="w-4 h-4 text-slate-400" /> {record.clientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                    {record.yarnSpec}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onLoadRecord(record)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1.5 rounded hover:bg-blue-50 transition-colors"
                    >
                      View Script
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
