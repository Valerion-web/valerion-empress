-- CreateEnum
CREATE TYPE "PerformanceStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED');

-- Preserve the legacy table while replacing its incompatible shape.
ALTER TABLE IF EXISTS "Performance" RENAME TO "PerformanceLegacy";
ALTER TABLE IF EXISTS "PerformanceLegacy" RENAME CONSTRAINT "Performance_pkey" TO "PerformanceLegacy_pkey";

-- CreateTable
CREATE TABLE "Performance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewPeriod" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER NOT NULL,
    "goals" TEXT NOT NULL,
    "achievements" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "status" "PerformanceStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Performance_employeeId_idx" ON "Performance"("employeeId");
CREATE INDEX "Performance_reviewerId_idx" ON "Performance"("reviewerId");
CREATE INDEX "Performance_status_idx" ON "Performance"("status");
CREATE INDEX "Performance_reviewDate_idx" ON "Performance"("reviewDate");
