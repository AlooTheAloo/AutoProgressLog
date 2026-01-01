/*
  Warnings:

  - You are about to drop the column `score` on the `Report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "score";

-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "immersionScore" INTEGER NOT NULL,
    "ankiScore" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "reportId" INTEGER NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Score_reportId_key" ON "Score"("reportId");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
