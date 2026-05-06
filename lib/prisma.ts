// Prisma Client 설정 - 애플리케이션 전체에서 사용할 데이터베이스 연결 인스턴스를 관리하며
// 개발 환경에서 다중 인스턴스 생성을 방지
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
