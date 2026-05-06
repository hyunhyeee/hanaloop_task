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
        const rawProductName = row['설명'] || 'Excel Item';
        if (String(rawProductName).trim() === '' || String(rawProductName).includes('Unknown')) {
          continue; 
        }

        const companyId = `p-${String(rawProductName).replace(/\s+/g, '-').toLowerCase()}`;

        const product = await tx.company.upsert({
          where: { id: String(companyId) },
          update: { name: String(rawProductName) },
          create: { id: String(companyId), name: String(rawProductName), country: 'KR' },
        });

        // Parse Date (Handling Excel serial numbers and string dates)
        const now = new Date();
        let yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const rawDate = row['일자'] || row['일자(원본)'];
        
        if (rawDate) {
          if (typeof rawDate === 'number') {
            // Excel serial date to JS Date (Base 1900)
            const date = new Date((rawDate - 25569) * 86400 * 1000);
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            yearMonth = `${y}-${m}`;
          } else {
            const dateStr = String(rawDate);
            // Handle YYYY-MM-DD or YYYY/MM/DD or YY-MM-DD
            const match = dateStr.match(/(\d{2,4})[-/](\d{1,2})/);
            if (match) {
              let y = match[1];
              if (y.length === 2) y = `20${y}`;
              const m = match[2].padStart(2, '0');
              yearMonth = `${y}-${m}`;
            }
          }
        }

        // Robust Factor Matching Logic
        const rawType = String(row['활동 유형'] || row['활동유형'] || '').trim();
        const rawDesc = String(row['설명'] || '').trim();
        const combined = `${rawType} ${rawDesc}`.toLowerCase();

        // 1. Determine Category by Keywords
        let targetCategory = '';
        if (combined.includes('전기') || combined.includes('전력') || combined.includes('electricity')) {
          targetCategory = 'ELECTRICITY';
        } else if (combined.includes('원자재') || combined.includes('원소재') || combined.includes('플라스틱') || combined.includes('material')) {
          targetCategory = 'MATERIAL';
        } else if (combined.includes('운송') || combined.includes('트럭') || combined.includes('transport')) {
          targetCategory = 'TRANSPORT';
        }

        // 2. Try to find a specific factor matching the description within that category
        const cleanDesc = rawDesc.replace(/\s+/g, '').toLowerCase();
        let factor = factors.find(f => 
          f.category === targetCategory && 
          cleanDesc !== '' && 
          f.name.replace(/\s+/g, '').toLowerCase().includes(cleanDesc)
        );

        // 3. Fallback to any factor in the category
        if (!factor && targetCategory) {
          factor = factors.find(f => f.category === targetCategory);
        }

        // 4. Final Fallback: Search all factors by type or description
        if (!factor && rawType !== '') {
          factor = factors.find(f => 
            f.category === rawType || 
            f.name.replace(/\s+/g, '').toLowerCase().includes(rawType.replace(/\s+/g, '').toLowerCase())
          );
        }

        const quantity = parseFloat(row['량'] || 0);

        if (quantity > 0 && factor) {
          const calculatedEmissions = quantity * factor.currentValue;
          
          await tx.ghgEmission.create({
            data: {
              yearMonth,
              source: rawDesc || 'Excel Import',
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
