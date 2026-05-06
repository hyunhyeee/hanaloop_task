"use client";

// PCF 안내 페이지 - PCF의 개념, 중요성 및 관련 표준에 대한 정보를 제공합니다.
import React from 'react';
import { PcfDescription } from '@/components/pcf/PcfDescription';
import { BookOpen, Info } from 'lucide-react';

export default function WhatIsPcfPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <BookOpen className="text-emerald-500" size={32} />
            What is PCF?
          </h1>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2">
          <Info size={16} className="text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">공식 가이드</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <PcfDescription />
        
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 space-y-4">
          <h2 className="text-xl font-bold text-zinc-900">Why does it matter?</h2>
          <p className="text-zinc-600 leading-relaxed">
            탄소 국경 조정 제도(CBAM)와 같은 글로벌 규제가 강화됨에 따라, 제품의 탄소 배출량을 정확히 측정하고 보고하는 능력은 기업의 생존과 직결됩니다. 
          </p>
        </div>
      </div>
    </div>
  );
}
