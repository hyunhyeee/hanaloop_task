import React from 'react';
import { Info, BookOpen, Layers, Factory, Truck, Trash2, Zap } from 'lucide-react';

export const PcfDescription = () => {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
        <BookOpen className="text-emerald-500" size={24} />
        <h2 className="text-xl font-bold text-zinc-900">Understanding PCF & GHG Scope</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PCF Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="text-emerald-600" size={20} />
            <h3 className="font-bold text-zinc-800">Product Carbon Footprint (PCF)</h3>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed">
            PCF는 제품의 전과정(Life Cycle) 동안 발생하는 총 온실가스 배출량을 의미합니다. 
            원료 채취부터 폐기까지 각 단계별 배출량을 추적하여 제품의 환경 영향을 평가합니다.
          </p>
          <div className="grid grid-cols-1 gap-2">
            <LifecycleItem icon={<Factory size={14} />} title="Raw Material" desc="원자재 추출 및 가공" />
            <LifecycleItem icon={<Zap size={14} />} title="Production" desc="제조 공정 및 에너지 소비" />
            <LifecycleItem icon={<Truck size={14} />} title="Transportation" desc="물류 및 운송 단계" />
            <LifecycleItem icon={<Trash2 size={14} />} title="Disposal" desc="사용 후 폐기 및 재활용" />
          </div>
        </div>

        {/* GHG Scope Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="text-blue-600" size={20} />
            <h3 className="font-bold text-zinc-800">GHG Protocol Scopes</h3>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed">
            기업의 탄소 배출은 발생원과 통제 범위에 따라 세 가지 Scope로 구분됩니다.
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
              <h4 className="text-xs font-bold text-blue-700 uppercase">Scope 1: Direct</h4>
              <p className="text-[11px] text-blue-600 mt-1">기업이 소유하거나 통제하는 시설에서의 직접 배출 (예: 보일러 연료 연소)</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
              <h4 className="text-xs font-bold text-amber-700 uppercase">Scope 2: Indirect (Energy)</h4>
              <p className="text-[11px] text-amber-600 mt-1">구매한 전기, 열, 스팀의 생산 과정에서 발생하는 간접 배출</p>
            </div>
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <h4 className="text-xs font-bold text-zinc-700 uppercase">Scope 3: Other Indirect</h4>
              <p className="text-[11px] text-zinc-600 mt-1">공급망, 제품 사용 및 폐기 등 가치 사슬 전반에서의 기타 간접 배출</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LifecycleItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg transition-colors">
    <div className="bg-zinc-100 p-2 rounded-lg text-zinc-600">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-zinc-800">{title}</p>
      <p className="text-[10px] text-zinc-500">{desc}</p>
    </div>
  </div>
);
