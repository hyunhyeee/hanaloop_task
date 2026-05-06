import React from 'react';
import { Info, Calculator, Target, TrendingDown } from 'lucide-react';

interface Props {
  isVisible: boolean;
}

export const CalculationMethodology: React.FC<Props> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4 duration-500 mb-8">
      <h3 className="font-bold text-indigo-800 mb-4 flex items-center gap-2">
        <Info size={18} /> 데이터 산정 방법론 (Calculation Methodology)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <Calculator size={16} />
            <h4 className="font-bold text-xs">평균 제품 PCF (Product Carbon Footprint)</h4>
          </div>
          <p className="text-[11px] text-indigo-900 leading-relaxed">
            등록된 모든 제품의 총 탄소 배출량 합계를 제품 수로 나눈 산술 평균값입니다. 
            각 제품의 배출량은 원자재 조달, 제조, 운송 등 전과정 단계별 활동 데이터에 국가 표준 탄소 배출 계수를 곱하여 산출됩니다.
          </p>
          <div className="bg-white bg-opacity-50 p-2 rounded text-[10px] font-mono text-indigo-700 border border-indigo-100">
            Σ(활동량 × 배출계수) / 전체 제품 수
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-blue-700">
            <Target size={16} />
            <h4 className="font-bold text-xs">배출 감소 목표 및 현재 감소율</h4>
          </div>
          <p className="text-[11px] text-indigo-900 leading-relaxed">
            <strong>감소 목표:</strong> 전년도 대비 당사에서 설정한 탄소 중립 이행 목표치(현재 15%)를 의미합니다.<br />
            <strong>현재 감소율:</strong> 기준 시점(전년 평균) 대비 현재 월까지의 배출량 절감 성과를 백분율로 나타낸 지표입니다.
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-indigo-100 flex items-start gap-3">
        <TrendingDown size={14} className="text-indigo-400 mt-0.5" />
        <p className="text-[10px] text-indigo-400 italic">
          모든 데이터는 ISO 14067(제품 탄소 발자국) 및 GHG Protocol 기준에 따라 산정되었으며, 최신 배출 계수 업데이트를 기반으로 실시간 집계됩니다.
        </p>
      </div>
    </div>
  );
};
