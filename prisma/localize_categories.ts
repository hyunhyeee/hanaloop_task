import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating categories to Korean...')

  // Update Emission Factors
  await prisma.emissionFactor.updateMany({
    where: { category: 'ELECTRICITY' },
    data: { category: '전력' }
  });

  await prisma.emissionFactor.updateMany({
    where: { category: 'MATERIAL' },
    data: { category: '원소재' }
  });

  await prisma.emissionFactor.updateMany({
    where: { category: 'TRANSPORT' },
    data: { category: '운송' }
  });

  // Update GhgEmissions
  await prisma.ghgEmission.updateMany({
    where: { category: 'ELECTRICITY' },
    data: { category: '전력' }
  });

  await prisma.ghgEmission.updateMany({
    where: { category: 'MATERIAL' },
    data: { category: '원소재' }
  });

  await prisma.ghgEmission.updateMany({
    where: { category: 'TRANSPORT' },
    data: { category: '운송' }
  });

  console.log('Category update finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
