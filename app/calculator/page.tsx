"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Zap, 
  Truck, 
  Package, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Box,
  Layers
} from 'lucide-react';
import { LifecycleStage, GhgScope } from '@/types/pcf';

interface EmissionFactor {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  unit: string;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
}

export default function CalculatorPage() {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedFactor, setSelectedFactor] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedScope, setSelectedScope] = useState<GhgScope>('SCOPE_1');
  const [selectedStage, setSelectedStage] = useState<LifecycleStage>('PRODUCTION');
  
  const [activityValue, setActivityValue] = useState<string>('');
  const [yearMonth, setYearMonth] = useState('2026-05');
  const [source, setSource] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/calculate');
        const data = await response.json();
        if (response.ok) {
          setFactors(data.factors);
          setProducts(data.products);
        }
      } catch (err) {
        setError('Failed to load calculation data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const selectedFactorData = factors.find(f => f.id === selectedFactor);
  const liveResult = selectedFactorData && activityValue 
    ? (Number(activityValue) * selectedFactorData.currentValue).toFixed(3) 
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFactor || !activityValue) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'c1', // Mocking for default company
          factorId: selectedFactor,
          productId: selectedProduct || null,
          scope: selectedScope,
          lifecycleStage: selectedStage,
          activityValue,
          yearMonth,
          source
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setResult(data.result);
      setTimeout(() => setResult(null), 5000);
      setActivityValue('');
      setSource('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="text-emerald-500 animate-spin mb-4" size={48} />
        <p className="text-zinc-500 font-medium">Preparing calculator data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">탄소 예측 계산기</h1>
          <p className="text-zinc-500 mt-1">활동 데이터를 입력하여 탄소 배출량을 즉시 예측하고 분석합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-2xl p-8 space-y-8 shadow-sm">
            
            {/* 1. Basic Info: Product & Date */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Box size={14} /> 1. Project Context
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold text-zinc-700 ml-1">Target Product (Optional)</span>
                  <select 
                    className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">-- General Corporate Emission --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-zinc-700 ml-1">Reporting Period</span>
                  <div className="relative mt-1.5">
                    <Calendar className="absolute left-4 top-3.5 text-zinc-400" size={16} />
                    <input 
                      type="month" 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={yearMonth}
                      onChange={(e) => setYearMonth(e.target.value)}
                      required
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* 2. Accounting Scope: GHG & PCF */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} /> 2. Accounting Classification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold text-zinc-700 ml-1">GHG Scope</span>
                  <select 
                    className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={selectedScope}
                    onChange={(e) => setSelectedScope(e.target.value as GhgScope)}
                  >
                    <option value="SCOPE_1">Scope 1: Direct Emissions</option>
                    <option value="SCOPE_2">Scope 2: Indirect (Energy)</option>
                    <option value="SCOPE_3">Scope 3: Value Chain</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-zinc-700 ml-1">PCF Lifecycle Stage</span>
                  <select 
                    className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value as LifecycleStage)}
                  >
                    <option value="RAW_MATERIAL">Raw Material Acquisition</option>
                    <option value="PRODUCTION">Production / Manufacturing</option>
                    <option value="TRANSPORTATION">Transportation / Distribution</option>
                    <option value="USE">Product Use</option>
                    <option value="DISPOSAL">End-of-Life / Disposal</option>
                  </select>
                </label>
              </div>
            </div>

            {/* 3. Activity Data */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} /> 3. Activity & Emission Factor
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {factors.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFactor(f.id)}
                    className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left group ${
                      selectedFactor === f.id 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shadow-sm mb-3 transition-colors ${
                      selectedFactor === f.id ? 'bg-white' : 'bg-zinc-100 group-hover:bg-white'
                    }`}>
                      {f.category === 'ELECTRICITY' && <Zap size={18} className="text-amber-500" />}
                      {f.category === 'TRANSPORT' && <Truck size={18} className="text-blue-500" />}
                      {f.category === 'MATERIAL' && <Package size={18} className="text-emerald-500" />}
                    </div>
                    <p className="text-xs font-black text-zinc-900 line-clamp-1">{f.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-tight">{f.unit}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <label className="block">
                  <span className="text-xs font-bold text-zinc-700 ml-1">Input Activity Amount</span>
                  <div className="relative mt-1.5">
                    <input 
                      type="number" 
                      step="any"
                      placeholder="e.g. 500"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={activityValue}
                      onChange={(e) => setActivityValue(e.target.value)}
                      required
                    />
                    <span className="absolute right-4 top-3.5 text-xs font-bold text-zinc-400">
                      {selectedFactorData?.unit.split(' / ')[1] || 'unit'}
                    </span>
                  </div>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-zinc-700 ml-1">Data Source / Facility Note</span>
                  <input 
                    type="text" 
                    placeholder="e.g. Incheon Factory Line A"
                    className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !selectedFactor || !activityValue}
              className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-lg shadow-zinc-200"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Finalize & Record Entry</>}
            </button>
          </form>
        </div>

        {/* Live Calculation Preview */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="bg-zinc-900 text-white rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[450px] shadow-xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent"></div>
            
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="bg-emerald-500 bg-opacity-10 p-4 rounded-2xl mb-6">
                <Calculator size={40} className="text-emerald-400" />
              </div>
              <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">Real-time Impact Assessment</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-6xl font-black tracking-tighter">{liveResult || '0.000'}</span>
                <span className="text-zinc-500 font-black text-lg">kgCO2e</span>
              </div>
              
              <div className="space-y-4 w-full text-left bg-zinc-800 bg-opacity-40 p-5 rounded-2xl border border-zinc-700 backdrop-blur-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium">Activity</span>
                  <span className="font-bold text-zinc-200">{activityValue || '0'} {selectedFactorData?.unit.split(' / ')[1]}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium">Emission Factor</span>
                  <span className="font-bold text-zinc-200">{selectedFactorData?.currentValue || '0'}</span>
                </div>
                <div className="pt-4 border-t border-zinc-700 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                    <span className="text-emerald-500">Classification</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-zinc-700 px-2 py-1 rounded text-[10px] font-bold text-zinc-300">{selectedScope.replace('_', ' ')}</span>
                    <span className="bg-emerald-900 bg-opacity-30 px-2 py-1 rounded text-[10px] font-bold text-emerald-400">{selectedStage.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {result && (
                <div className="mt-8 w-full bg-emerald-500 bg-opacity-20 border border-emerald-500 text-emerald-400 p-4 rounded-xl text-sm font-bold animate-in slide-in-from-bottom-2 duration-500 flex items-center gap-3">
                  <CheckCircle2 size={20} />
                  <span>Entry successfully recorded</span>
                </div>
              )}

              {error && (
                <div className="mt-8 w-full bg-red-500 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-xl text-sm font-bold animate-in slide-in-from-bottom-2 duration-500 flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
