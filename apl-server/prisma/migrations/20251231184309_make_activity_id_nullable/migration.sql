-- DropIndex
DROP INDEX "ImmersionActivity_activityTogglId_key";

-- AlterTable
ALTER TABLE "ImmersionActivity" ALTER COLUMN "activityTogglId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ReportImmersionLog" (
    "id" SERIAL NOT NULL,
    "activityName" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL,
    "reportId" INTEGER NOT NULL,

    CONSTRAINT "ReportImmersionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportImmersionLog_reportId_idx" ON "ReportImmersionLog"("reportId");

-- AddForeignKey
ALTER TABLE "ReportImmersionLog" ADD CONSTRAINT "ReportImmersionLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
