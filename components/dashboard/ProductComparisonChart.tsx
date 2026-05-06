"use client";
// 제품별 탄소 배출량 비교 차트 컴포넌트 - 제품 간의 총 PCF를 가로 막대 차트로 비교하여 표시
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ComparisonProps {
  data: { name: string; value: number }[];
  title: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export const ProductComparisonChart: React.FC<ComparisonProps> = ({ data, title }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm h-[450px] flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 5, right: 30, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              width={100}
              tick={{ fill: '#18181b', fontSize: 11, fontWeight: 600 }} 
            />
            <Tooltip 
              cursor={{ fill: '#f4f4f5' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
