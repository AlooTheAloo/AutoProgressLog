/*
  Warnings:

  - A unique constraint covering the columns `[reportNo,userId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Report_reportNo_userId_key" ON "Report"("reportNo", "userId");
