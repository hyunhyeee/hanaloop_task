import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const factors = await prisma.emissionFactor.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        currentValue: true,
        unit: true
      }
    });
    return NextResponse.json(factors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch factors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { companyId, factorId, activityValue, yearMonth, source } = await request.json();

    // 1. Get the factor
    const factor = await prisma.emissionFactor.findUnique({
      where: { id: factorId }
    });

    if (!factor) throw new Error('Emission factor not found');

    // 2. Calculate PCF (Activity Value * Factor Value)
    const emissions = Number(activityValue) * factor.currentValue;

    // 3. Save to DB
    const result = await prisma.ghgEmission.create({
      data: {
        companyId,
        yearMonth,
        source: source || 'Direct Input',
        category: factor.category,
        activityValue: Number(activityValue),
        unit: factor.unit.split(' / ')[1] || 'unit',
        emissions: Number(emissions.toFixed(3)),
        emissionFactorId: factor.id
      }
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
