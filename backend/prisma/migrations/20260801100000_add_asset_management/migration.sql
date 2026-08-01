CREATE TYPE "AssetStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED');
CREATE TYPE "AssetAllocationStatus" AS ENUM ('ALLOCATED', 'RETURNED');
CREATE TYPE "AssetHistoryAction" AS ENUM ('CREATED', 'UPDATED', 'ASSIGNED', 'RETURNED', 'STATUS_CHANGED', 'DELETED');

ALTER TABLE "Asset"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "AssetStatus" USING "status"::"AssetStatus",
  ALTER COLUMN "status" SET DEFAULT 'AVAILABLE',
  ADD COLUMN "assetTag" TEXT,
  ADD COLUMN "categoryId" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "purchasePrice" DOUBLE PRECISION;

ALTER TABLE "AssetAllocation"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "AssetAllocationStatus" USING "status"::"AssetAllocationStatus",
  ALTER COLUMN "status" SET DEFAULT 'ALLOCATED';

CREATE TABLE "AssetCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssetCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AssetCategory_name_key" ON "AssetCategory"("name");

CREATE TABLE "AssetHistory" (
  "id" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "action" "AssetHistoryAction" NOT NULL,
  "fromStatus" "AssetStatus",
  "toStatus" "AssetStatus",
  "userId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssetHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");
CREATE INDEX "Asset_categoryId_idx" ON "Asset"("categoryId");
CREATE INDEX "Asset_status_idx" ON "Asset"("status");
CREATE INDEX "Asset_name_idx" ON "Asset"("name");
CREATE INDEX "AssetAllocation_assetId_status_idx" ON "AssetAllocation"("assetId", "status");
CREATE INDEX "AssetAllocation_userId_status_idx" ON "AssetAllocation"("userId", "status");
CREATE INDEX "AssetHistory_assetId_createdAt_idx" ON "AssetHistory"("assetId", "createdAt");
CREATE INDEX "AssetHistory_userId_createdAt_idx" ON "AssetHistory"("userId", "createdAt");

ALTER TABLE "Asset" ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssetHistory" ADD CONSTRAINT "AssetHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssetHistory" ADD CONSTRAINT "AssetHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
