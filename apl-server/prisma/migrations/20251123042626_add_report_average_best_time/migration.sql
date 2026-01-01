/*
  Warnings:

  - Added the required column `averageImmersionTime` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bestImmersionTime` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "averageImmersionTime" INTEGER NOT NULL,
ADD COLUMN     "bestImmersionTime" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ReportMetadata" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "hasAnki" BOOLEAN NOT NULL,

    CONSTRAINT "ReportMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportMetadata_reportId_key" ON "ReportMetadata"("reportId");

-- AddForeignKey
ALTER TABLE "ReportMetadata" ADD CONSTRAINT "ReportMetadata_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
