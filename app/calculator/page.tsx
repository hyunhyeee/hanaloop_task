"use client";

//탄소 예측 계산기 페이지 - 활동 데이터를 입력하여 탄소 배출량을 즉시 예측하고 기록하는 기능을 제공

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
  const [history, setHistory] = useState<any[]>([]);

  const [showTutorial, setShowTutorial] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/calculate/history');
      const data = await response.json();
      if (response.ok) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('기록을 불러오는 데 실패했습니다.');
    }
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/calculate');
        const data = await response.json();
        if (response.ok) {
          setFactors(data.factors);
          setProducts(data.products);
          if (data.factors.length > 0) setSelectedFactor(data.factors[0].id);
        }
        await fetchHistory();
      } catch (err) {
        setError('계산 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const selectedFactorData = factors.find(f => f.id === selectedFactor);
  const liveResult = selectedFactorData && activityValue && !isNaN(Number(activityValue))
    ? (Number(activityValue) * selectedFactorData.currentValue).toFixed(3) 
    : '0.000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFactor || !activityValue || isNaN(Number(activityValue)) || Number(activityValue) <= 0) {
      setError('올바른 활동량을 입력하고 배출 계수를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
try {
  const response = await fetch('/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: 'default-company', 
      factorId: selectedFactor,
          productId: selectedProduct || null,
          scope: selectedScope,
          lifecycleStage: selectedStage,
          activityValue: Number(activityValue),
          yearMonth,
          source
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '서버 오류가 발생했습니다.');

      setResult(data.result);
      setError(null); 
      await fetchHistory();
      setTimeout(() => setResult(null), 8000); 
      setActivityValue('');
      setSource('');
    } catch (err: any) {
      setError(err.message);
      setResult(null); 
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="text-emerald-500 animate-spin mb-4" size={48} />
        <p className="text-zinc-500 font-medium">계산기 데이터를 준비 중입니다...</p>
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
        <button 
          onClick={() => setShowTutorial(!showTutorial)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-sm font-bold transition-all"
        >
          <AlertCircle size={16} />
          {showTutorial ? '튜토리얼 닫기' : '사용 방법 보기'}
        </button>
      </div>

      {showTutorial && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <Calculator size={18} /> 탄소 계산기 튜토리얼
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="inline-block bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">STEP 1</span>
              <p className="text-xs font-bold text-emerald-900">프로젝트 맥락 설정</p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">배출량이 발생하는 대상 제품(선택)과 보고할 연월을 선택하세요.</p>
            </div>
            <div className="space-y-2">
              <span className="inline-block bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">STEP 2</span>
              <p className="text-xs font-bold text-emerald-900">배출 분류 및 항목 선택</p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">스코프와 라이프사이클 단계를 설정하고, 하단의 배출 계수(전기, 원자재 등) 중 하나를 클릭하세요.</p>
            </div>
            <div className="space-y-2">
              <span className="inline-block bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">STEP 3</span>
              <p className="text-xs font-bold text-emerald-900">활동량 입력 및 기록</p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">실제 사용량(kWh, kg 등)을 입력하면 실시간으로 결과가 계산됩니다. 확인 후 버튼을 눌러 기록하세요.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-2xl p-8 space-y-8 shadow-sm">
            
            {/* 1. Basic Info: Product & Date */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Box size={14} /> 1. 프로젝트 맥락
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold text-zinc-700 ml-1">대상 제품 (선택 사항)</span>
                  <select 
                    className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">-- 일반 법인 배출량 --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-zinc-700 ml-1">보고 기간</span>
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
                <Layers size={14} /> 2. 배출량 분류
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold text-zinc-700 ml-1">GHG 스코프 (Scope)</span>
                  <select 
                    className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={selectedScope}
                    onChange={(e) => setSelectedScope(e.target.value as GhgScope)}
                  >
                    <option value="SCOPE_1">Scope 1: 직접 배출</option>
                    <option value="SCOPE_2">Scope 2: 간접 배출 (에너지)</option>
                    <option value="SCOPE_3">Scope 3: 가치사슬 배출</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-zinc-700 ml-1">PCF 라이프사이클 단계</span>
                  <select 
                    className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value as LifecycleStage)}
                  >
                    <option value="RAW_MATERIAL">원재료 획득 (Raw Material)</option>
                    <option value="PRODUCTION">생산 / 제조 (Production)</option>
                    <option value="TRANSPORTATION">운송 / 유통 (Transportation)</option>
                    <option value="USE">제품 사용 (Use)</option>
                    <option value="DISPOSAL">폐기 / 재활용 (Disposal)</option>
                  </select>
                </label>
              </div>
            </div>

            {/* 3. Activity Data */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} /> 3. 활동 데이터 및 배출 계수
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
                      {(f.category === 'ELECTRICITY' || f.category === '전력' || f.category === '전기') && <Zap size={18} className="text-amber-500" />}
                      {(f.category === 'TRANSPORT' || f.category === '운송') && <Truck size={18} className="text-blue-500" />}
                      {(f.category === 'MATERIAL' || f.category === '원소재' || f.category === '원자재') && <Package size={18} className="text-emerald-500" />}
                    </div>
                    <p className="text-xs font-black text-zinc-900 line-clamp-1">{f.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-tight">{f.unit}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <label className="block">
                  <span className="text-xs font-bold text-zinc-700 ml-1">활동량 입력</span>
                  <div className="relative mt-1.5">
                    <input 
                      type="number" 
                      step="any"
                      placeholder="예: 500"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={activityValue}
                      onChange={(e) => setActivityValue(e.target.value)}
                      required
                    />
                    <span className="absolute right-4 top-3.5 text-xs font-bold text-zinc-400">
                      {selectedFactorData?.unit.split(' / ')[1] || '단위'}
                    </span>
                  </div>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-zinc-700 ml-1">데이터 출처 / 시설 메모</span>
                  <input 
                    type="text" 
                    placeholder="예: 인천공장 A라인"
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
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> 계산 완료 및 데이터 기록</>}
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
              <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">실시간 배출량 예측</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black tracking-tighter">{liveResult}</span>
                <span className="text-zinc-500 font-black text-lg">kgCO2e</span>
              </div>
              
              <div className="space-y-4 w-full text-left bg-zinc-800 bg-opacity-40 p-5 rounded-2xl border border-zinc-700 backdrop-blur-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium">활동량</span>
                  <span className="font-bold text-zinc-200">{activityValue || '0'} {selectedFactorData?.unit.split(' / ')[1]}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium">배출 계수</span>
                  <span className="font-bold text-zinc-200">{selectedFactorData?.currentValue || '0'}</span>
                </div>
                <div className="pt-4 border-t border-zinc-700 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                    <span className="text-emerald-500">분류 정보</span>
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
                  <span>데이터가 성공적으로 기록되었습니다.</span>
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

      {/* History Table */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100">
          <h3 className="font-bold text-zinc-900 flex items-center gap-2">
            <Layers size={18} className="text-emerald-500" />
            최근 계산 및 기록 이력
          </h3>
          <p className="text-xs text-zinc-500 mt-1">방금 계산하여 기록한 항목들을 확인할 수 있습니다.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-200">
                <th className="px-6 py-4">연월</th>
                <th className="px-6 py-4">대상 제품</th>
                <th className="px-6 py-4">배출 항목</th>
                <th className="px-6 py-4 text-right">활동량</th>
                <th className="px-6 py-4 text-right">배출량 (kgCO2e)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {history.map((h, i) => (
                <tr key={h.id || i} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{h.yearMonth}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{h.product?.name || '일반 법인'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{h.emissionFactor?.name || h.category}</td>
                  <td className="px-6 py-4 text-sm text-zinc-900 text-right font-bold">{h.activityValue} <span className="text-[10px] text-zinc-400 uppercase">{h.unit}</span></td>
                  <td className="px-6 py-4 text-sm text-emerald-600 text-right font-black">{h.emissions.toLocaleString()}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 text-sm">
                    아직 기록된 계산 이력이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
