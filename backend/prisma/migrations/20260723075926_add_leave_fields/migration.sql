/*
  Warnings:

  - You are about to drop the column `comments` on the `Leave` table. All the data in the column will be lost.
  - You are about to drop the column `days` on the `Leave` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Leave` table. All the data in the column will be lost.
  - Added the required column `leaveType` to the `Leave` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDays` to the `Leave` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY', 'UNPAID');

-- AlterTable
ALTER TABLE "Leave" DROP COLUMN "comments",
DROP COLUMN "days",
DROP COLUMN "type",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "leaveType" "LeaveType" NOT NULL,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "totalDays" INTEGER NOT NULL;
