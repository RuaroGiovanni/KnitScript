import React from 'react';
import { GeneratedScript, PanelScript } from '../types.ts';
import { Printer, Save, ChevronRight } from 'lucide-react';

interface ScriptViewerProps {
  script: GeneratedScript;
  onSave: (script: GeneratedScript) => void;
}

export const ScriptViewer: React.FC<ScriptViewerProps> = ({ script, onSave }) => {
  
  const renderPanel = (panel: PanelScript) => (
    <div key={panel.name} className="mb-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
        <h3 className="font-bold text-slate-800">{panel.name}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Details</th>
              <th className="px-4 py-3 font-medium text-right">Needles</th>
              <th className="px-4 py-3 font-medium text-right">Row</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {panel.instructions.map((inst, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{inst.action}</td>
                <td className="px-4 py-3 text-slate-600 font-mono text-xs">{inst.details}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-blue-700">{inst.runningTotal}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-500">({inst.rowCounter})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{script.clientName}</h2>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <span>ID: {script.id}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{script.date}</span>
          </p>
          <p className="text-slate-700 text-sm mt-2 font-medium">{script.yarnSpec}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => window.print()} className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={() => onSave(script)} className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm">
            <Save className="w-4 h-4" /> Save to Archive
          </button>
        </div>
      </div>

      {/* Panels */}
      <div className="space-y-6">
        {script.panels.map(renderPanel)}
      </div>
    </div>
  );
};
