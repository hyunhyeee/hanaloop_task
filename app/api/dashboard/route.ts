import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const productsFromDb = await prisma.company.findMany({
      include: {
        emissions: true
      }
    });

    const allEmissions = await prisma.ghgEmission.findMany();

    const totalEmissions = allEmissions.reduce((sum, e) => sum + e.emissions, 0);
    const avgPcf = productsFromDb.length > 0 ? totalEmissions / productsFromDb.length : 0;

    const trendMap: Record<string, number> = {};
    allEmissions.forEach(e => {
      trendMap[e.yearMonth] = (trendMap[e.yearMonth] || 0) + e.emissions;
    });

    const monthlyTrend = Object.entries(trendMap)
      .map(([month, emissions]) => ({ month, emissions }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const products = productsFromDb.map(p => {
      const totalPcf = p.emissions.reduce((sum, e) => sum + e.emissions, 0);
      
      // Calculate breakdown using Korean categories
      const breakdown: Record<string, number> = {
        '원소재': 0,
        '전력': 0,
        '운송': 0,
        '기타': 0
      };

      p.emissions.forEach(e => {
        const cat = e.category || '기타';
        if (breakdown[cat] !== undefined) {
          breakdown[cat] += e.emissions;
        } else {
          breakdown['기타'] += e.emissions;
        }
      });

      return {
        id: p.id,
        productName: p.name,
        category: p.emissions[0]?.category || '일반',
        totalCo2e: Number(totalPcf.toFixed(3)),
        lastUpdated: p.emissions[p.emissions.length - 1]?.yearMonth || '2026-05',
        breakdown
      };
    });

    const summary = {
      totalAveragePcf: Number(avgPcf.toFixed(1)),
      reductionTarget: 15,
      currentReduction: 8.4,
      monthlyTrend: monthlyTrend.length > 0 ? monthlyTrend : [{ month: '2026-05', emissions: 0 }],
      topEmissionProducts: products
        .sort((a, b) => b.totalCo2e - a.totalCo2e)
        .slice(0, 3)
        .map(p => ({ name: p.productName, value: p.totalCo2e }))
    };

    return NextResponse.json({ summary, products });
  } catch (error: any) {
    console.error('Dashboard Data Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
