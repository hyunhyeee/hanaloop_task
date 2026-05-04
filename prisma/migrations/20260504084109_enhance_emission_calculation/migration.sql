-- AlterTable
ALTER TABLE "GhgEmission" ADD COLUMN     "activityValue" DOUBLE PRECISION,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "emissionFactorId" TEXT,
ADD COLUMN     "unit" TEXT;

-- AddForeignKey
ALTER TABLE "GhgEmission" ADD CONSTRAINT "GhgEmission_emissionFactorId_fkey" FOREIGN KEY ("emissionFactorId") REFERENCES "EmissionFactor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
