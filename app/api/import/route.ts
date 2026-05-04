import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const factors = await prisma.emissionFactor.findMany();

    const results = await prisma.$transaction(async (tx) => {
      const processedProducts = [];
      
      for (const row of data) {
        const rawProductName = row['설명'];
        if (!rawProductName || String(rawProductName).trim() === '' || String(rawProductName).includes('Unknown')) {
          continue; 
        }

        const companyId = `p-${String(rawProductName).replace(/\s+/g, '-').toLowerCase()}`;

        const product = await tx.company.upsert({
          where: { id: String(companyId) },
          update: { name: String(rawProductName) },
          create: { id: String(companyId), name: String(rawProductName), country: 'KR' },
        });

        // Parse Date
        let yearMonth = '2026-05';
        if (row['일자(원본)']) {
          const dateStr = String(row['일자(원본)']);
          const match = dateStr.match(/(\d{4})[-/]?(\d{2})/);
          if (match) yearMonth = `${match[1]}-${match[2]}`;
        }

        // Match Emission Factor by '활동유형' (Enhanced Korean Mapping)
        const rawType = String(row['활동유형'] || '').trim();
        const factor = factors.find(f => 
          f.category === rawType || 
          f.name.includes(rawType) ||
          (rawType.includes('전기') && f.category === '전력') ||
          (rawType.includes('원소재') && f.category === '원소재') ||
          (rawType.includes('운송') && f.category === '운송')
        );

        const quantity = parseFloat(row['량'] || 0);

        if (quantity > 0 && factor) {
          const calculatedEmissions = quantity * factor.currentValue;
          
          await tx.ghgEmission.create({
            data: {
              yearMonth,
              source: String(row['설명']),
              category: factor.category,
              activityValue: quantity,
              unit: String(row['단위'] || factor.unit.split(' / ')[1]),
              emissions: Number(calculatedEmissions.toFixed(3)),
              companyId: product.id,
              emissionFactorId: factor.id
            }
          });
        }
        
        processedProducts.push(product);
      }
      return processedProducts;
    });

    return NextResponse.json({ success: true, count: results.length });
  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to sync data' }, { status: 500 });
  }
}
