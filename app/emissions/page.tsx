"use client";

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  History, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  TrendingDown,
  Info
} from 'lucide-react';

interface FactorVersion {
  id: string;
  value: number;
  versionNumber: number;
  validFrom: string;
  remarks: string | null;
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

  // Mock fetching - in a real app, this would be a fetch call to /api/emissions
  useEffect(() => {
    const timer = setTimeout(() => {
      setFactors([
        {
          id: '1',
          category: 'ELECTRICITY',
          name: '전기 (한국전력 기본값)',
          unit: 'kgCO2e / kWh',
          currentValue: 0.456,
          updatedAt: '2026-05-04',
          versions: [
            { id: 'v1', value: 0.456, versionNumber: 1, validFrom: '2026-05-04', remarks: 'Initial system value' }
          ]
        },
        {
          id: '2',
          category: 'MATERIAL',
          name: '원소재 (플라스틱 1)',
          unit: 'kgCO2e / kg',
          currentValue: 2.3,
          updatedAt: '2026-05-04',
          versions: [
            { id: 'v2', value: 2.3, versionNumber: 1, validFrom: '2026-05-04', remarks: 'Initial system value' }
          ]
        },
        {
          id: '3',
          category: 'TRANSPORT',
          name: '운송 (트럭)',
          unit: 'kgCO2e / ton-km',
          currentValue: 3.5,
          updatedAt: '2026-05-04',
          versions: [
            { id: 'v3', value: 3.5, versionNumber: 1, validFrom: '2026-05-04', remarks: 'Initial system value' }
          ]
        }
      ]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Emission Factors</h1>
          <p className="text-zinc-500">Manage and track version history of carbon emission coefficients.</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all">
          <Plus size={18} /> New Factor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Factors List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-zinc-200">
              <Clock className="text-zinc-300 animate-spin mb-4" size={40} />
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
                    <p className="text-xs text-zinc-500">Last updated: {factor.updatedAt}</p>
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
              {/* Background Accent */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500 opacity-10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                  <History className="text-emerald-500" size={24} />
                  <h3 className="font-bold">Version History</h3>
                </div>

                <div className="space-y-6">
                  {selectedFactor.versions.map((v, i) => (
                    <div key={v.id} className="relative pl-6 border-l border-zinc-700">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                        i === 0 ? 'bg-emerald-500' : 'bg-zinc-600'
                      }`}></div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-zinc-400">v{v.versionNumber}</p>
                          <p className="text-[10px] text-zinc-500">{v.validFrom}</p>
                        </div>
                        <p className="text-lg font-bold text-white">{v.value}</p>
                        <p className="text-xs text-zinc-400 italic">"{v.remarks || 'No remarks'}"</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <button className="w-full bg-white text-zinc-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all">
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
    </div>
  );
}
