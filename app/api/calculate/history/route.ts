import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const emissions = await prisma.ghgEmission.findMany({
      orderBy: {
        id: 'desc'
      },
      take: 10,
      include: {
        product: {
          select: {
            name: true
          }
        },
        emissionFactor: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({ history: emissions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
