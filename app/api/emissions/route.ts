import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const factors = await prisma.emissionFactor.findMany({
      include: {
        versions: {
          orderBy: {
            versionNumber: 'desc'
          }
        }
      },
      orderBy: {
        category: 'asc'
      }
    });
    return NextResponse.json(factors);
  } catch (error: any) {
    console.error('Fetch Factors Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch factors' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, newValue, remarks } = await request.json();

    if (!id || newValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get current max version number
      const latestVersion = await tx.emissionFactorVersion.findFirst({
        where: { factorId: id },
        orderBy: { versionNumber: 'desc' }
      });

      const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;

      // 2. Update the main factor's current value
      const updatedFactor = await tx.emissionFactor.update({
        where: { id },
        data: { currentValue: Number(newValue) }
      });

      // 3. Create a new version record
      await tx.emissionFactorVersion.create({
        data: {
          factorId: id,
          value: Number(newValue),
          versionNumber: nextVersionNumber,
          remarks: remarks || `Updated to ${newValue}`,
        }
      });

      return updatedFactor;
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Update Factor Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action !== 'reset') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const results = await prisma.$transaction(async (tx) => {
      const allFactors = await tx.emissionFactor.findMany();
      const updatedFactors = [];

      for (const factor of allFactors) {
        // Find the very first version (v1)
        const v1 = await tx.emissionFactorVersion.findFirst({
          where: { factorId: factor.id, versionNumber: 1 },
          orderBy: { createdAt: 'asc' }
        });

        if (v1 && factor.currentValue !== v1.value) {
          // Update factor back to v1 value
          const updated = await tx.emissionFactor.update({
            where: { id: factor.id },
            data: { currentValue: v1.value }
          });

          // Optional: Create a new version record for the reset action
          const latestVersion = await tx.emissionFactorVersion.findFirst({
            where: { factorId: factor.id },
            orderBy: { versionNumber: 'desc' }
          });
          
          await tx.emissionFactorVersion.create({
            data: {
              factorId: factor.id,
              value: v1.value,
              versionNumber: (latestVersion?.versionNumber || 0) + 1,
              remarks: 'System Reset: Reverted to initial value',
            }
          });
          
          updatedFactors.push(updated);
        }
      }
      return updatedFactors;
    });

    return NextResponse.json({ success: true, count: results.length });
  } catch (error: any) {
    console.error('Reset Factors Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
