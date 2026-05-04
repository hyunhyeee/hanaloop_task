import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clean up existing data to avoid conflicts on re-run
  await prisma.emissionFactorVersion.deleteMany({})
  await prisma.emissionFactor.deleteMany({})
  await prisma.post.deleteMany({})
  await prisma.ghgEmission.deleteMany({})
  await prisma.company.deleteMany({})

  const companies = [
    {
      id: "c1",
      name: "Acme Corp",
      country: "US",
      emissions: [
        { "yearMonth": "2024-01", "emissions": 120 },
        { "yearMonth": "2024-02", "emissions": 110 },
        { "yearMonth": "2024-03", "emissions": 95 }
      ]
    },
    {
      id: "c2",
      name: "Globex",
      country: "DE",
      emissions: [
        { "yearMonth": "2024-01", "emissions": 80 },
        { "yearMonth": "2024-02", "emissions": 105 },
        { "yearMonth": "2024-03", "emissions": 120 }
      ]
    }
  ];

  const posts = [
    {
      id: "p1",
      title: "Sustainability Report",
      resourceUid: "c1",
      dateTime: "2024-02",
      content: "Quarterly CO2 update"
    }
  ];

  for (const company of companies) {
    const { emissions, ...companyData } = company;
    await prisma.company.create({
      data: {
        ...companyData,
        emissions: {
          create: emissions
        }
      }
    });
  }

  for (const post of posts) {
    await prisma.post.create({
      data: post
    });
  }

  // Seed Emission Factors
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
    await prisma.emissionFactor.create({
      data: {
        ...factorData,
        versions: {
          create: {
            value: factorData.currentValue,
            versionNumber: 1,
            remarks: 'Initial system value',
          }
        }
      }
    });
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
