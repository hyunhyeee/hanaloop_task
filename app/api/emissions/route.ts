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
