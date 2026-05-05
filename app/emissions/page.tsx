"use client";

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  History, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Info,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface FactorVersion {
  id: string;
  value: number;
  versionNumber: number;
  validFrom: string;
  remarks: string | null;
  createdAt: string;
}

interface EmissionFactor {
  id: string;
  category: string;
  name: string;
  unit: string;
  currentValue: number;
  updatedAt: string;
  versions: FactorVersion[];
}

export default function EmissionsPage() {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [selectedFactor, setSelectedFactor] = useState<EmissionFactor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Update Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFactors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/emissions');
      const data = await response.json();
      if (response.ok) {
        setFactors(data);
        // Update selected factor if it exists
        if (selectedFactor) {
          const updated = data.find((f: EmissionFactor) => f.id === selectedFactor.id);
          if (updated) setSelectedFactor(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch factors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFactors();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFactor || !newValue) return;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch('/api/emissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFactor.id,
          newValue: parseFloat(newValue),
          remarks
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update factor');
      }

      setIsModalOpen(false);
      setNewValue('');
      setRemarks('');
      await fetchFactors(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all factors to their initial values?')) return;
    
    setIsResetting(true);
    try {
      const response = await fetch('/api/emissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });
      
      if (response.ok) {
        await fetchFactors();
        alert('All factors have been reset to their original values.');
      } else {
        const data = await response.json();
        alert(`Reset failed: ${data.error}`);
      }
    } catch (err) {
      console.error('Reset error:', err);
      alert('An unexpected error occurred during reset.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Emission Factors</h1>
          <p className="text-zinc-500">Manage and track version history of carbon emission coefficients.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            disabled={isResetting || isLoading}
            className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all disabled:opacity-50"
          >
            {isResetting ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />} Initialize
          </button>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all">
            <Plus size={18} /> New Factor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Factors List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading && factors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-zinc-200">
              <Loader2 className="text-emerald-500 animate-spin mb-4" size={40} />
              <p className="text-zinc-400 font-medium">Loading factors...</p>
            </div>
          ) : (
            factors.map((factor) => (
              <div 
                key={factor.id}
                onClick={() => setSelectedFactor(factor)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer bg-white group ${
                  selectedFactor?.id === factor.id 
                    ? 'border-emerald-500 ring-2 ring-emerald-500 ring-opacity-10' 
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {factor.category}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">
                      {factor.name}
                    </h3>
                    <p className="text-xs text-zinc-500">Last updated: {new Date(factor.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-zinc-900">{factor.currentValue}</p>
                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-tight">{factor.unit}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* History & Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedFactor ? (
            <div className="bg-zinc-900 text-white rounded-2xl p-6 sticky top-24 overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500 opacity-10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                  <History className="text-emerald-500" size={24} />
                  <h3 className="font-bold">Version History</h3>
                </div>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedFactor.versions.map((v, i) => (
                    <div key={v.id} className="relative pl-6 border-l border-zinc-700 pb-6 last:pb-0">
                      <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                        i === 0 ? 'bg-emerald-500' : 'bg-zinc-600'
                      }`}></div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-zinc-400">v{v.versionNumber}</p>
                          <p className="text-[10px] text-zinc-500">{new Date(v.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className="text-lg font-bold text-white">{v.value}</p>
                        <p className="text-xs text-zinc-400 italic">"{v.remarks || 'No remarks'}"</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-white text-zinc-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all"
                  >
                    <Edit3 size={18} /> Update Factor Value
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center mt-3 flex items-center justify-center gap-1">
                    <Info size={10} /> Updating will create v{selectedFactor.versions.length + 1}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-100 border border-zinc-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
              <Database className="text-zinc-300 mb-4" size={48} />
              <p className="text-zinc-500 font-medium">Select a factor to view its full history and manage versions.</p>
            </div>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {isModalOpen && selectedFactor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="font-bold text-zinc-900">Update Emission Factor</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{selectedFactor.category}</p>
                <p className="font-bold text-zinc-900">{selectedFactor.name}</p>
                <p className="text-xs text-zinc-500">Current: {selectedFactor.currentValue} {selectedFactor.unit}</p>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-zinc-700">New Factor Value</span>
                  <div className="relative mt-1">
                    <input 
                      type="number" 
                      step="any"
                      required
                      placeholder="e.g. 0.458"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                    <span className="absolute right-4 top-3 text-xs font-bold text-zinc-400">{selectedFactor.unit.split(' / ')[0]}</span>
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-zinc-700">Change Remarks (Required)</span>
                  <textarea 
                    required
                    placeholder="e.g. 2026 Environment Ministry updated standard"
                    className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-24 resize-none"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-2 text-red-700 text-xs font-medium">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating || !newValue || !remarks}
                  className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
