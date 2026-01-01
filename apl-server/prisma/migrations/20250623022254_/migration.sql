-- AlterTable
ALTER TABLE "SyncData" ADD COLUMN     "reportId" INTEGER;

-- AddForeignKey
ALTER TABLE "SyncData" ADD CONSTRAINT "SyncData_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;
