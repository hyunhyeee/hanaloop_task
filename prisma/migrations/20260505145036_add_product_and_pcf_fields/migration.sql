-- CreateEnum
CREATE TYPE "LifecycleStage" AS ENUM ('RAW_MATERIAL', 'PRODUCTION', 'TRANSPORTATION', 'USE', 'DISPOSAL');

-- CreateEnum
CREATE TYPE "GhgScope" AS ENUM ('SCOPE_1', 'SCOPE_2', 'SCOPE_3');

-- AlterTable
ALTER TABLE "GhgEmission" ADD COLUMN     "lifecycleStage" "LifecycleStage",
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "scope" "GhgScope";

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "category" TEXT,
    "unit" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GhgEmission" ADD CONSTRAINT "GhgEmission_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
