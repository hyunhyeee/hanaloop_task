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

    const trendMap: Record<string, Record<string, number>> = {};
    const categoriesSet = new Set<string>();

    allEmissions.forEach(e => {
      const month = e.yearMonth;
      let cat = e.category || '기타';
      
      // Map English DB categories to Korean labels for display
      if (cat === 'ELECTRICITY') cat = '전기';
      if (cat === 'MATERIAL') cat = '원소재';
      if (cat === 'TRANSPORT') cat = '운송';
      
      categoriesSet.add(cat);
      
      if (!trendMap[month]) trendMap[month] = {};
      trendMap[month][cat] = (trendMap[month][cat] || 0) + e.emissions;
    });

    const categories = Array.from(categoriesSet);
    const monthlyTrend = Object.entries(trendMap)
      .map(([month, cats]) => ({
        month,
        ...cats,
        total: Object.values(cats).reduce((a, b) => a + b, 0)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const products = productsFromDb.map(p => {
      const totalPcf = p.emissions.reduce((sum, e) => sum + e.emissions, 0);
      
      const breakdown: Record<string, number> = {
        '원소재': 0,
        '전기': 0,
        '운송': 0,
        '기타': 0
      };

      p.emissions.forEach(e => {
        let cat = e.category || '기타';
        if (cat === 'ELECTRICITY') cat = '전기';
        if (cat === 'MATERIAL') cat = '원소재';
        if (cat === 'TRANSPORT') cat = '운송';

        if (breakdown[cat] !== undefined) {
          breakdown[cat] += e.emissions;
        } else {
          breakdown['기타'] += e.emissions;
        }
      });

      return {
        id: p.id,
        productName: p.name,
        category: p.emissions[0]?.category === 'ELECTRICITY' ? '전기' : 
                  p.emissions[0]?.category === 'MATERIAL' ? '원소재' : 
                  p.emissions[0]?.category === 'TRANSPORT' ? '운송' : 
                  p.emissions[0]?.category || '일반',
        totalCo2e: Number(totalPcf.toFixed(3)),
        lastUpdated: p.emissions[p.emissions.length - 1]?.yearMonth || '2025-05',
        breakdown
      };
    });

    const summary = {
      totalAveragePcf: Number(avgPcf.toFixed(1)),
      reductionTarget: 15,
      currentReduction: 8.4,
      categories,
      monthlyTrend: monthlyTrend.length > 0 ? monthlyTrend : [{ month: '2025-05', total: 0 }],
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
