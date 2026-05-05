import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [factors, products] = await Promise.all([
      prisma.emissionFactor.findMany({
        select: {
          id: true,
          name: true,
          category: true,
          currentValue: true,
          unit: true
        }
      }),
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          sku: true
        }
      })
    ]);
    return NextResponse.json({ factors, products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch calculation data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { 
      companyId, 
      factorId, 
      productId, 
      activityValue, 
      yearMonth, 
      source,
      scope,
      lifecycleStage 
    } = await request.json();

    // 1. Get the factor
    const factor = await prisma.emissionFactor.findUnique({
      where: { id: factorId }
    });

    if (!factor) throw new Error('Emission factor not found');

    // 2. Calculate PCF (Activity Value * Factor Value)
    const emissions = Number(activityValue) * factor.currentValue;

    // 3. Save to DB with enhanced metadata
    const result = await prisma.ghgEmission.create({
      data: {
        companyId,
        productId,
        yearMonth,
        source: source || 'Direct Input',
        category: factor.category,
        scope,
        lifecycleStage,
        activityValue: Number(activityValue),
        unit: factor.unit.split(' / ')[1] || 'unit',
        emissions: Number(emissions.toFixed(3)),
        emissionFactorId: factor.id
      }
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Calculation API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
