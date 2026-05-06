// 데이터 초기화 API - 시스템의 모든 활동 데이터, 제품 정보 및 기업 정보를 삭제하여 초기 상태로 만듭니다.
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    // Delete order matters for foreign keys
    // We preserve EmissionFactor and EmissionFactorVersion as they are reference data
    await prisma.ghgEmission.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.company.deleteMany({});

    return NextResponse.json({ message: 'All user data has been successfully cleared.' });
  } catch (error: any) {
    console.error('Data Deletion Error:', error);
    return NextResponse.json(
      { error: 'Failed to clear data: ' + error.message },
      { status: 500 }
    );
  }
}
