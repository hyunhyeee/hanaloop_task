import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding minimal system data...')

  // 1. Create a default system company if none exists
  const defaultCompany = await prisma.company.upsert({
    where: { id: 'default-company' },
    update: {},
    create: {
      id: 'default-company',
      name: '내 회사',
      country: 'KR',
    },
  })

  console.log('Default company created/verified:', defaultCompany.id)

  // 2. Ensure basic emission factors exist (using same values as seed.ts)
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
    await prisma.emissionFactor.upsert({
      where: { id: `factor-${factorData.category}-${factorData.name.replace(/\s+/g, '-')}` },
      update: { currentValue: factorData.currentValue },
      create: {
        id: `factor-${factorData.category}-${factorData.name.replace(/\s+/g, '-')}`,
        ...factorData,
        versions: {
          create: {
            value: factorData.currentValue,
            versionNumber: 1,
            remarks: 'System default',
          }
        }
      }
    });
  }

  console.log('System data seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
