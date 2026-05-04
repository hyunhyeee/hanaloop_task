import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Fetch all companies and their emissions
    const companies = await prisma.company.findMany({
      include: {
        emissions: true
      }
    });

    // 2. Calculate Total Average PCF (simple mock calculation for now)
    const totalEmissions = companies.reduce((acc, company) => {
      const companySum = company.emissions.reduce((sum, e) => sum + e.emissions, 0);
      return acc + companySum;
    }, 0);
    
    const avgPcf = companies.length > 0 ? totalEmissions / companies.length : 0;

    // 3. Generate Monthly Trend
    // Group emissions by yearMonth
    const allEmissions = await prisma.ghgEmission.findMany();
    const trendMap: Record<string, number> = {};
    
    allEmissions.forEach(e => {
      trendMap[e.yearMonth] = (trendMap[e.yearMonth] || 0) + e.emissions;
    });

    const monthlyTrend = Object.entries(trendMap)
      .map(([month, emissions]) => ({ month, emissions }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 4. Map to Dashboard Summary Interface
    const summary = {
      totalAveragePcf: Number(avgPcf.toFixed(1)),
      reductionTarget: 15, // Default target
      currentReduction: 8.4, // Mock for now until we have baseline comparisons
      monthlyTrend: monthlyTrend.length > 0 ? monthlyTrend : [
        { month: '2024-01', emissions: 0 },
        { month: '2024-02', emissions: 0 }
      ],
      topEmissionProducts: companies.slice(0, 3).map(c => ({
        name: c.name,
        value: c.emissions.reduce((sum, e) => sum + e.emissions, 0)
      }))
    };

    // 5. Map products for the table
    const products = companies.map(c => ({
      id: c.id,
      productName: c.name,
      category: 'General', // Default as we don't have category in schema yet
      totalCo2e: c.emissions.reduce((sum, e) => sum + e.emissions, 0),
      lastUpdated: new Date().toISOString().split('T')[0],
      breakdown: {
        RAW_MATERIAL: 40,
        PRODUCTION: 30,
        TRANSPORTATION: 20,
        USE: 5,
        DISPOSAL: 5
      }
    }));

    return NextResponse.json({ summary, products });
  } catch (error: any) {
    console.error('Dashboard Data Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
