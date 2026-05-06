// 데이터 정리 스크립트 - 모든 활동 데이터와 제품 정보를 삭제
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up data...')
  await prisma.ghgEmission.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.post.deleteMany({})
  await prisma.company.deleteMany({})
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
