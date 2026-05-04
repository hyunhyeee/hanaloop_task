import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clean up existing data to avoid conflicts on re-run
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
