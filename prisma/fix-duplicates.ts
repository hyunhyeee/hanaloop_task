// 중복 배출 계수 수정 스크립트 - 배출 계수 데이터의 중복을 제거하고 정제된 기본 배출 계수 세트로 데이터베이스를 재설정
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing duplicate emission factors...')

  // 1. Clear existing factors and versions
  await prisma.emissionFactorVersion.deleteMany({})
  await prisma.emissionFactor.deleteMany({})

  // 2. Seed a clean set
  const factors = [
    {
      category: 'ELECTRICITY',
      name: '전기 (한국전력 기본값)',
      unit: 'kgCO2e / kWh',
      currentValue: 0.456,
    },
    {
      category: 'MATERIAL',
      name: '원소재 (플라스틱 1)',
      unit: 'kgCO2e / kg',
      currentValue: 2.3,
    },
    {
      category: 'MATERIAL',
      name: '원소재 (플라스틱 2)',
      unit: 'kgCO2e / kg',
      currentValue: 3.2,
    },
    {
      category: 'TRANSPORT',
      name: '운송 (트럭)',
      unit: 'kgCO2e / ton-km',
      currentValue: 3.5,
    },
  ];

  for (const factorData of factors) {
    const id = `factor-${factorData.category}-${factorData.name.replace(/\s+/g, '-')}`;
    await prisma.emissionFactor.create({
      data: {
        id,
        ...factorData,
        versions: {
          create: {
            value: factorData.currentValue,
            versionNumber: 1,
            remarks: 'Initial clean system value',
          }
        }
      }
    });
  }

  console.log('Emission factors cleanup and re-seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
