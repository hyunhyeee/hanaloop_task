// 탄소 배출량 계산 API - 활동 데이터와 배출 계수를 바탕으로 탄소 배출량을 계산하고 결과를 저장
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
      companyId: providedCompanyId, 
      factorId, 
      productId, 
      activityValue, 
      yearMonth, 
      source,
      scope,
      lifecycleStage 
    } = await request.json();

    let companyId = providedCompanyId;

    // 1. Get the factor
    const factor = await prisma.emissionFactor.findUnique({
      where: { id: factorId }
    });

    if (!factor) throw new Error('Emission factor not found');

    // 1b. If productId is provided, use its companyId to ensure consistency
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { companyId: true }
      });
      if (product) {
        companyId = product.companyId;
      }
    }

    // 1c. Verify if the company actually exists
    let companyExists = false;
    if (companyId) {
      const comp = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
      companyExists = !!comp;
    }

    if (!companyExists) {
      // Fallback to first available company if provided one doesn't exist
      const firstCompany = await prisma.company.findFirst({ select: { id: true } });
      if (firstCompany) {
        companyId = firstCompany.id;
      } else {
        // Final fallback: Create a default company if nothing exists
        const defaultComp = await prisma.company.upsert({
          where: { id: 'default-company' },
          update: {},
          create: { id: 'default-company', name: '기본 회사', country: 'KR' }
        });
        companyId = defaultComp.id;
      }
    }

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
