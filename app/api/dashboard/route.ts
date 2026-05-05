import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const productsFromDb = await prisma.company.findMany({
      include: {
        emissions: {
          include: {
            emissionFactor: true
          }
        }
      }
    });

    const allEmissions = await prisma.ghgEmission.findMany({
      include: {
        emissionFactor: true
      }
    });

    const totalEmissions = allEmissions.reduce((sum, e) => {
      // Calculate dynamic emissions based on current factor value if available, 
      // otherwise fallback to stored emission value
      const currentEmissions = e.emissionFactor && e.activityValue 
        ? e.activityValue * e.emissionFactor.currentValue 
        : e.emissions;
      return sum + currentEmissions;
    }, 0);
    
    const avgPcf = productsFromDb.length > 0 ? totalEmissions / productsFromDb.length : 0;

    const trendMap: Record<string, Record<string, number>> = {};
    const categoriesSet = new Set<string>();

    allEmissions.forEach(e => {
      const month = e.yearMonth;
      let cat = e.category || '기타';
      
      // Map English/Old Korean DB categories to consistent Korean labels for display
      if (cat === 'ELECTRICITY' || cat === '전력') cat = '전기';
      if (cat === 'MATERIAL' || cat === '원소재') cat = '원자재';
      if (cat === 'TRANSPORT') cat = '운송';
      
      categoriesSet.add(cat);
      
      if (!trendMap[month]) trendMap[month] = {};
      
      const currentEmissions = e.emissionFactor && e.activityValue 
        ? e.activityValue * e.emissionFactor.currentValue 
        : e.emissions;
        
      trendMap[month][cat] = (trendMap[month][cat] || 0) + currentEmissions;
    });

    const categories = Array.from(categoriesSet);
    const monthlyTrend = Object.entries(trendMap)
      .map(([month, cats]) => ({
        month,
        ...cats,
        total: Object.values(cats).reduce((a, b) => a + b, 0)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const totalBreakdown: Record<string, number> = {
      '원자재': 0,
      '전기': 0,
      '운송': 0,
      '기타': 0
    };

    allEmissions.forEach(e => {
      let cat = e.category || '기타';
      if (cat === 'ELECTRICITY' || cat === '전력') cat = '전기';
      if (cat === 'MATERIAL' || cat === '원소재') cat = '원자재';
      if (cat === 'TRANSPORT') cat = '운송';

      const currentEmissions = e.emissionFactor && e.activityValue 
        ? e.activityValue * e.emissionFactor.currentValue 
        : e.emissions;

      if (totalBreakdown[cat] !== undefined) {
        totalBreakdown[cat] += currentEmissions;
      } else {
        totalBreakdown['기타'] += currentEmissions;
      }
    });

    const products = productsFromDb.map(p => {
      const productEmissions = p.emissions.reduce((sum, e) => {
        const currentEmissions = e.emissionFactor && e.activityValue 
          ? e.activityValue * e.emissionFactor.currentValue 
          : e.emissions;
        return sum + currentEmissions;
      }, 0);
      
      const breakdown: Record<string, number> = {
        '원자재': 0,
        '전기': 0,
        '운송': 0,
        '기타': 0
      };

      p.emissions.forEach(e => {
        let cat = e.category || '기타';
        if (cat === 'ELECTRICITY' || cat === '전력') cat = '전기';
        if (cat === 'MATERIAL' || cat === '원소재') cat = '원자재';
        if (cat === 'TRANSPORT') cat = '운송';

        const currentEmissions = e.emissionFactor && e.activityValue 
          ? e.activityValue * e.emissionFactor.currentValue 
          : e.emissions;

        if (breakdown[cat] !== undefined) {
          breakdown[cat] += currentEmissions;
        } else {
          breakdown['기타'] += currentEmissions;
        }
      });

      // Find the dominant category for the product display
      let dominantCategory = '기타';
      let maxEmission = -1;
      
      Object.entries(breakdown).forEach(([cat, val]) => {
        if (cat !== '기타' && val > maxEmission) {
          maxEmission = val;
          dominantCategory = cat;
        }
      });
      
      // If all specific categories are 0 but total is > 0, it must be '기타'
      if (maxEmission <= 0 && productEmissions > 0) {
        dominantCategory = '기타';
      } else if (productEmissions === 0) {
        dominantCategory = '일반';
      }

      return {
        id: p.id,
        productName: p.name,
        category: dominantCategory,
        totalCo2e: Number(productEmissions.toFixed(3)),
        lastUpdated: p.emissions[p.emissions.length - 1]?.yearMonth || '2025-05',
        breakdown
      };
    });

    const summary = {
      totalAveragePcf: Number(avgPcf.toFixed(1)),
      reductionTarget: 15,
      currentReduction: 8.4,
      categories,
      totalBreakdown,
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
