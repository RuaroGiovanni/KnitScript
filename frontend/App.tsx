import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm.tsx';
import { ScriptViewer } from './components/ScriptViewer.tsx';
import { ArchiveView } from './components/ArchiveView.tsx';
import { generateFullScript } from './services/engine.ts';
import { GeneratedScript, ArchiveRecord, Measurements, Gauges } from './types.ts';
import { Scissors, Archive, PlusCircle } from 'lucide-react';

type ViewState = 'input' | 'script' | 'archive';

export default function App() {
  const [view, setView] = useState<ViewState>('input');
  const [currentScript, setCurrentScript] = useState<GeneratedScript | null>(null);
  const [archive, setArchive] = useState<ArchiveRecord[]>([]);

  // Load archive from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('knitting_archive');
    if (saved) {
      try {
        setArchive(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse archive", e);
      }
    }
  }, []);

  const handleGenerate = (clientName: string, yarnSpec: string, m: Measurements, g: Gauges) => {
    const script = generateFullScript(clientName, yarnSpec, m, g);
    setCurrentScript(script);
    setView('script');
  };

  const handleSaveToArchive = (script: GeneratedScript) => {
    const newRecord: ArchiveRecord = { ...script };
    const updatedArchive = [newRecord, ...archive];
    setArchive(updatedArchive);
    localStorage.setItem('knitting_archive', JSON.stringify(updatedArchive));
    alert('Script saved to archive!');
  };

  const handleLoadFromArchive = (record: ArchiveRecord) => {
    setCurrentScript(record);
    setView('script');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700">
            <Scissors className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">KnitScript Gen</h1>
          </div>
          <nav className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setView('input')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === 'input' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <PlusCircle className="w-4 h-4" /> New
            </button>
            <button 
              onClick={() => setView('archive')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === 'archive' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Archive className="w-4 h-4" /> Archive
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {view === 'input' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">New Script</h2>
              <p className="text-slate-500">Enter client measurements to generate a bespoke knitting pattern.</p>
            </div>
            <InputForm onSubmit={handleGenerate} />
          </div>
        )}

        {view === 'script' && currentScript && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Generated Script</h2>
                <p className="text-slate-500">Ready for the knitting machine.</p>
              </div>
              <button onClick={() => setView('input')} className="text-sm text-blue-600 hover:underline font-medium">
                &larr; Back to Editor
              </button>
            </div>
            <ScriptViewer script={currentScript} onSave={handleSaveToArchive} />
          </div>
        )}

        {view === 'archive' && (
          <div className="animate-in fade-in duration-300">
            <ArchiveView records={archive} onLoadRecord={handleLoadFromArchive} />
          </div>
        )}
      </main>
    </div>
  );
}
