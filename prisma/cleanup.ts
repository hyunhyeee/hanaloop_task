import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up invalid data...')

  // 1. Delete emissions associated with "Unknown" or "Unnamed" products
  const unknownCompanies = await prisma.company.findMany({
    where: {
      OR: [
        { name: { contains: 'Unknown' } },
        { name: { contains: 'Unnamed' } },
        { id: { startsWith: 'comp-' } }
      ]
    }
  });

  const ids = unknownCompanies.map(c => c.id);
  
  if (ids.length > 0) {
    await prisma.ghgEmission.deleteMany({
      where: { companyId: { in: ids } }
    });
    
    await prisma.company.deleteMany({
      where: { id: { in: ids } }
    });
    console.log(`Deleted ${ids.length} invalid product entries.`);
  }

  console.log('Cleanup finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
