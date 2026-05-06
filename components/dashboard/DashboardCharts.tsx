"use client";
// 대시보드 차트 컴포넌트 - 월별 탄소 배출량 추이(막대 차트) 및 카테고리별 배출 비중(파이 차트) 시각화
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

interface ChartProps {
  data: any[];
  title: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899'];

export const TrendChart: React.FC<ChartProps & { categories?: string[] }> = ({ data, title, categories }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm h-[400px] flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
        <span className="text-xs text-zinc-400 font-medium">(단위: kgCO2e)</span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#71717a', fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#71717a', fontSize: 12 }} 
            />
            <Tooltip 
              cursor={{ fill: '#f4f4f5' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any, name: any) => [
                Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }), 
                name
              ]}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
            {categories && categories.length > 0 ? (
              categories.map((cat, index) => (
                <Bar 
                  key={cat} 
                  dataKey={cat} 
                  stackId="a" 
                  fill={COLORS[index % COLORS.length]} 
                  radius={index === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
                  barSize={40} 
                />
              ))
            ) : (
              <Bar dataKey="emissions" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const BreakdownChart: React.FC<{ data: any, title: string }> = ({ data, title }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value: value as number
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm h-[400px] flex flex-col">
      <h3 className="text-lg font-bold mb-6 text-zinc-900">{title}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
