-- Synchronize legacy empty Payroll and Performance tables with the current Prisma models.
CREATE TYPE "PerformanceStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED');

ALTER TABLE "Payroll"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;
DROP TYPE "PayrollStatus";
CREATE TYPE "PayrollStatus" AS ENUM ('PENDING', 'PAID');

ALTER TABLE "Payroll"
  DROP COLUMN "grossSalary",
  DROP COLUMN "payslipUrl",
  DROP COLUMN "status",
  ADD COLUMN "basicSalary" DOUBLE PRECISION NOT NULL,
  ADD COLUMN "allowances" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "paymentStatus" "PayrollStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "paymentDate" TIMESTAMP(3);

ALTER TABLE "Performance"
  DROP CONSTRAINT IF EXISTS "Performance_userId_fkey",
  DROP COLUMN "userId",
  DROP COLUMN "period",
  DROP COLUMN "score",
  DROP COLUMN "managerId",
  DROP COLUMN "summary",
  DROP COLUMN "rating",
  ADD COLUMN "employeeId" TEXT NOT NULL,
  ADD COLUMN "reviewerId" TEXT NOT NULL,
  ADD COLUMN "reviewPeriod" TEXT NOT NULL,
  ADD COLUMN "reviewDate" TIMESTAMP(3) NOT NULL,
  ADD COLUMN "rating" INTEGER NOT NULL,
  ADD COLUMN "goals" TEXT NOT NULL,
  ADD COLUMN "achievements" TEXT NOT NULL,
  ADD COLUMN "strengths" TEXT NOT NULL,
  ADD COLUMN "improvements" TEXT NOT NULL,
  ADD COLUMN "comments" TEXT NOT NULL,
  ADD COLUMN "status" "PerformanceStatus" NOT NULL DEFAULT 'DRAFT';

ALTER TABLE "Performance"
  ADD CONSTRAINT "Performance_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Performance_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Performance_employeeId_idx" ON "Performance"("employeeId");
CREATE INDEX "Performance_reviewerId_idx" ON "Performance"("reviewerId");
CREATE INDEX "Performance_status_idx" ON "Performance"("status");
CREATE INDEX "Performance_reviewDate_idx" ON "Performance"("reviewDate");
