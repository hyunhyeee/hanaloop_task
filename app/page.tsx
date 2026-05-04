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

  if (!summary) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Sustainability Overview</h1>
        <p className="text-zinc-500">Real-time performance tracked from your database.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Avg. Product PCF" 
          value={summary.totalAveragePcf} 
          unit="kgCO2e" 
          change={-2.4} 
          icon={Leaf} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Reduction Target" 
          value={summary.reductionTarget} 
          unit="%" 
          icon={Target} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Current Reduction" 
          value={summary.currentReduction} 
          unit="%" 
          change={1.2} 
          icon={Activity} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Total Products" 
          value={products.length} 
          unit="Items" 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductComparisonChart 
          data={summary.topEmissionProducts} 
          title="Product PCF Comparison" 
        />
        <TrendChart 
          data={summary.monthlyTrend} 
          title="Monthly Emission Trend (Total kgCO2e)" 
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {products.length > 0 && (
          <BreakdownChart 
            data={products[0].breakdown} 
            title={`Lifecycle Breakdown: ${products[0].productName}`} 
          />
        )}
      </div>

      {/* Product Table */}
      <ProductTable products={products} />
    </div>
  );
}
