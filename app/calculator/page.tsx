"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Zap, 
  Truck, 
  Package, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';

interface EmissionFactor {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  unit: string;
}

export default function CalculatorPage() {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [selectedFactor, setSelectedFactor] = useState<string>('');
  const [activityValue, setActivityValue] = useState<string>('');
  const [yearMonth, setYearMonth] = useState('2026-05');
  const [source, setSource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFactors() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/calculate');
        const data = await response.json();
        if (response.ok) setFactors(data);
      } catch (err) {
        setError('Failed to load emission factors');
      } finally {
        setIsLoading(false);
      }
    }
    fetchFactors();
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
          activityValue,
          yearMonth,
          source
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setResult(data.result);
      setTimeout(() => setResult(null), 5000); // Clear success message after 5s
      setActivityValue('');
      setSource('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Interactive PCF Calculator</h1>
        <p className="text-zinc-500">Enter activity data to automatically calculate carbon footprints based on latest factors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-2xl p-8 space-y-6 shadow-sm">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-zinc-700">1. Select Emission Source</span>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {factors.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFactor(f.id)}
                      className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
                        selectedFactor === f.id 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-zinc-100 hover:border-zinc-200'
                      }`}
                    >
                      <div className="bg-white p-1.5 rounded-lg shadow-sm mb-2">
                        {f.category === 'ELECTRICITY' && <Zap size={16} className="text-amber-500" />}
                        {f.category === 'TRANSPORT' && <Truck size={16} className="text-blue-500" />}
                        {f.category === 'MATERIAL' && <Package size={16} className="text-emerald-500" />}
                      </div>
                      <p className="text-xs font-bold text-zinc-900 line-clamp-1">{f.name}</p>
                      <p className="text-[10px] text-zinc-500">{f.unit}</p>
                    </button>
                  ))}
                </div>
              </label>

              <div className="grid grid-cols-2 gap-6">
                <label className="block">
                  <span className="text-sm font-bold text-zinc-700">2. Input Amount</span>
                  <div className="relative mt-2">
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
                  <span className="text-sm font-bold text-zinc-700">3. Date (Year-Month)</span>
                  <div className="relative mt-2">
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

              <label className="block">
                <span className="text-sm font-bold text-zinc-700">4. Data Source / Note (Optional)</span>
                <input 
                  type="text" 
                  placeholder="e.g. Main Factory, Truck #402"
                  className="w-full mt-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </label>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !selectedFactor || !activityValue}
              className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Record PCF Data</>}
            </button>
          </form>
        </div>

        {/* Live Calculation Preview */}
        <div className="space-y-6">
          <div className="bg-zinc-900 text-white rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden h-full min-h-[400px]">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent"></div>
            
            <Calculator size={48} className="text-emerald-500 mb-6" />
            <h3 className="text-zinc-400 font-medium mb-2">Live Calculation</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black">{liveResult || '0.000'}</span>
              <span className="text-zinc-500 font-bold">kgCO2e</span>
            </div>
            
            <div className="space-y-4 w-full text-left bg-zinc-800 bg-opacity-50 p-4 rounded-xl border border-zinc-700">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Activity:</span>
                <span className="font-bold">{activityValue || '0'} {selectedFactorData?.unit.split(' / ')[1]}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Factor:</span>
                <span className="font-bold">{selectedFactorData?.currentValue || '0'}</span>
              </div>
              <div className="border-t border-zinc-700 pt-2 flex justify-between text-xs">
                <span className="text-emerald-500 font-bold">Formula:</span>
                <span className="text-zinc-400">Amount × Factor</span>
              </div>
            </div>

            {result && (
              <div className="mt-6 bg-emerald-500 bg-opacity-20 border border-emerald-500 text-emerald-400 p-3 rounded-lg text-xs font-bold animate-in zoom-in duration-300">
                Data successfully recorded to DB!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
