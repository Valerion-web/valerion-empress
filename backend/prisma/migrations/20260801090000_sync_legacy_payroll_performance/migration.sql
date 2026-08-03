-- Synchronize legacy empty Payroll and Performance tables with the current Prisma models.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PerformanceStatus') THEN
    CREATE TYPE "PerformanceStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Payroll' AND column_name = 'status') THEN
    ALTER TABLE "Payroll"
      ALTER COLUMN "status" DROP DEFAULT,
      ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PayrollStatus') THEN
    CREATE TYPE "PayrollStatus" AS ENUM ('PENDING', 'PAID');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Payroll' AND column_name = 'grossSalary') THEN
    ALTER TABLE "Payroll"
      DROP COLUMN "grossSalary",
      DROP COLUMN "payslipUrl",
      DROP COLUMN "status";
  END IF;
END $$;

ALTER TABLE "Payroll"
  ADD COLUMN IF NOT EXISTS "basicSalary" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "allowances" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "paymentStatus" "PayrollStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "paymentDate" TIMESTAMP(3);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Performance' AND column_name = 'userId') THEN
    ALTER TABLE "Performance"
      DROP CONSTRAINT IF EXISTS "Performance_userId_fkey";

    ALTER TABLE "Performance"
      DROP COLUMN "userId",
      DROP COLUMN "period",
      DROP COLUMN "score",
      DROP COLUMN "managerId",
      DROP COLUMN "summary",
      DROP COLUMN "rating";

    ALTER TABLE "Performance"
      ADD COLUMN IF NOT EXISTS "employeeId" TEXT,
      ADD COLUMN IF NOT EXISTS "reviewerId" TEXT,
      ADD COLUMN IF NOT EXISTS "reviewPeriod" TEXT,
      ADD COLUMN IF NOT EXISTS "reviewDate" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "goals" TEXT,
      ADD COLUMN IF NOT EXISTS "achievements" TEXT,
      ADD COLUMN IF NOT EXISTS "strengths" TEXT,
      ADD COLUMN IF NOT EXISTS "improvements" TEXT,
      ADD COLUMN IF NOT EXISTS "comments" TEXT,
      ADD COLUMN IF NOT EXISTS "status" "PerformanceStatus" NOT NULL DEFAULT 'DRAFT';

    ALTER TABLE "Performance"
      ALTER COLUMN "employeeId" TYPE TEXT,
      ALTER COLUMN "reviewerId" TYPE TEXT;

    ALTER TABLE "Performance"
      ADD CONSTRAINT "Performance_employeeId_fkey"
        FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      ADD CONSTRAINT "Performance_reviewerId_fkey"
        FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Performance_employeeId_idx" ON "Performance"("employeeId");
CREATE INDEX IF NOT EXISTS "Performance_reviewerId_idx" ON "Performance"("reviewerId");
CREATE INDEX IF NOT EXISTS "Performance_status_idx" ON "Performance"("status");
CREATE INDEX IF NOT EXISTS "Performance_reviewDate_idx" ON "Performance"("reviewDate");
