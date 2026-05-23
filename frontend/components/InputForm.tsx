import React, { useState } from 'react';
import { Measurements, Gauges } from '../types.ts';
import { Ruler, Settings2, User, Scissors } from 'lucide-react';

interface InputFormProps {
  onSubmit: (clientName: string, yarnSpec: string, m: Measurements, g: Gauges) => void;
}

const defaultMeasurements: Measurements = {
  T: 52, S: 40.5, C: 20, P: 11, M: 17.5, LC: 65, G: 23.5, SC: 7.7, LM: 54
};

const defaultGauges: Gauges = {
  x: 2.077, y: 5.692
};

export const InputForm: React.FC<InputFormProps> = ({ onSubmit }) => {
  const [clientName, setClientName] = useState('Federico Vairetti');
  const [yarnSpec, setYarnSpec] = useState('Blue Marine 100% Cashmere 2/28');
  const [m, setM] = useState<Measurements>(defaultMeasurements);
  const [g, setG] = useState<Gauges>(defaultGauges);
  const [error, setError] = useState<string | null>(null);

  const handleNumChange = (setter: any, field: string, val: string) => {
    setter((prev: any) => ({ ...prev, [field]: parseFloat(val) || 0 }));
  };

  const validate = (): boolean => {
    if (m.T <= m.S || m.S <= m.C) {
      setError("Il torace deve essere > delle spalle > del collo");
      return false;
    }
    if (m.P >= m.M) {
      setError("Il polso deve essere < del muscolo");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(clientName, yarnSpec, m, g);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      
      {/* Meta Info */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" /> Cliente e Filato
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Cliente</label>
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Specifiche Filato</label>
            <input type="text" value={yarnSpec} onChange={e => setYarnSpec(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
        </div>
      </section>

      {/* Gauges */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-blue-600" /> Calibrazione (Campione)
        </h3>
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Punti / cm (X)</label>
            <input type="number" step="0.001" value={g.x} onChange={e => handleNumChange(setG, 'x', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Passaggi / cm (Y)</label>
            <input type="number" step="0.001" value={g.y} onChange={e => handleNumChange(setG, 'y', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
        </div>
      </section>

      {/* Measurements */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-blue-600" /> Misure (cm)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-1">Larghezze (Asse X)</h4>
            {[
              { key: 'T', label: 'Torace' },
              { key: 'S', label: 'Spalle' },
              { key: 'C', label: 'Coppino' },
              { key: 'P', label: 'Polso' },
              { key: 'M', label: 'Muscolo' },
            ].map(field => (
              <div key={field.key} className="flex items-center justify-between">
                <label className="text-sm text-slate-700">{field.label}</label>
                <input type="number" step="0.1" value={m[field.key as keyof Measurements]} onChange={e => handleNumChange(setM, field.key, e.target.value)} className="w-24 p-1.5 text-right border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-1">Lunghezze (Asse Y)</h4>
            {[
              { key: 'LC', label: 'Lunghezza Corpo' },
              { key: 'G', label: 'Profondità Giromanica' },
              { key: 'SC', label: 'Profondità Scollo' },
              { key: 'LM', label: 'Lunghezza Manica' },
            ].map(field => (
              <div key={field.key} className="flex items-center justify-between">
                <label className="text-sm text-slate-700">{field.label}</label>
                <input type="number" step="0.1" value={m[field.key as keyof Measurements]} onChange={e => handleNumChange(setM, field.key, e.target.value)} className="w-24 p-1.5 text-right border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      <button type="submit" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2">
        <Scissors className="w-5 h-5" /> Genera Script
      </button>
    </form>
  );
};
