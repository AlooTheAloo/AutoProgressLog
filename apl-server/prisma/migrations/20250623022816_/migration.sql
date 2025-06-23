/*
  Warnings:

  - You are about to drop the column `reportId` on the `SyncData` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[syncDataId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `syncDataId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SyncData" DROP CONSTRAINT "SyncData_reportId_fkey";

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "syncDataId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SyncData" DROP COLUMN "reportId";

-- CreateIndex
CREATE UNIQUE INDEX "Report_syncDataId_key" ON "Report"("syncDataId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_syncDataId_fkey" FOREIGN KEY ("syncDataId") REFERENCES "SyncData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
