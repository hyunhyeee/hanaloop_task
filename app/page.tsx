"use client";

import React, { useState, useEffect } from 'react';
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendChart, BreakdownChart } from "@/components/dashboard/DashboardCharts";
import { ProductComparisonChart } from "@/components/dashboard/ProductComparisonChart";
import { ProductTable } from "@/components/dashboard/ProductTable";
import { PCFDashboardSummary, ProductPCF } from "@/types/pcf";
import { 
  Activity, 
  Target, 
  Leaf, 
  AlertTriangle,
  Loader2
} from "lucide-react";

export default function Dashboard() {
  const [summary, setSummary] = useState<PCFDashboardSummary | null>(null);
  const [products, setProducts] = useState<ProductPCF[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        if (response.ok) {
          setSummary(data.summary);
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="text-emerald-500 animate-spin" />
        <p className="text-zinc-500 font-medium">Loading your sustainability data...</p>
      </div>
    );
  }

  const hasData = summary !== null && (products.length > 0 || summary.totalAveragePcf > 0);

  const EmptyState = ({ message = "데이터를 업로드하여 수치를 확인하세요." }: { message?: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-zinc-400 h-full">
      <p className="text-sm font-medium italic">{message}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Sustainability Overview</h1>
          <p className="text-zinc-500">Real-time performance tracked from your database.</p>
        </div>
        
        {!hasData && !isLoading && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3 text-amber-800 animate-pulse">
            <AlertTriangle size={20} className="shrink-0" />
            <p className="text-sm font-medium">
              표시할 데이터가 없습니다. <a href="/upload" className="underline font-bold hover:text-amber-900">데이터 업로드</a> 페이지에서 PCF 데이터를 등록해 주세요.
            </p>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Avg. Product PCF" 
          value={hasData ? summary!.totalAveragePcf : "-"} 
          unit={hasData ? "kgCO2e" : ""} 
          change={hasData ? -2.4 : undefined} 
          icon={Leaf} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Reduction Target" 
          value={hasData ? summary!.reductionTarget : "-"} 
          unit={hasData ? "%" : ""} 
          icon={Target} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Current Reduction" 
          value={hasData ? summary!.currentReduction : "-"} 
          unit={hasData ? "%" : ""} 
          change={hasData ? 1.2 : undefined} 
          icon={Activity} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Total Products" 
          value={hasData ? products.length : "-"} 
          unit={hasData ? "Items" : ""} 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm h-[450px] flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-zinc-900">Product PCF Comparison</h3>
          {!hasData ? <EmptyState /> : (
            <ProductComparisonChart 
              data={summary!.topEmissionProducts} 
              title="" 
            />
          )}
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm h-[450px] flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-zinc-900">Monthly Emission Trend</h3>
          {!hasData ? <EmptyState /> : (
            <TrendChart 
              data={summary!.monthlyTrend} 
              categories={summary!.categories}
              title="" 
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-zinc-900">Total Emission Breakdown (Company-wide)</h3>
          {!hasData ? <EmptyState /> : (
            summary?.totalBreakdown && (
              <div className="max-w-2xl mx-auto w-full">
                <BreakdownChart 
                  data={summary.totalBreakdown} 
                  title="" 
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* Product Table */}
      {!hasData ? (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100">
            <h3 className="text-lg font-bold text-zinc-900">Product PCF Inventory</h3>
          </div>
          <div className="py-20 flex justify-center">
            <EmptyState message="등록된 제품 데이터가 없습니다. CSV 또는 Excel 파일을 업로드하세요." />
          </div>
        </div>
      ) : (
        <ProductTable products={products} />
      )}
    </div>
  );
}
