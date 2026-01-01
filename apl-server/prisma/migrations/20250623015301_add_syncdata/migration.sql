-- CreateTable
CREATE TABLE "SyncData" (
    "id" SERIAL NOT NULL,
    "generationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SyncData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnkiData" (
    "id" SERIAL NOT NULL,
    "totalCardsStudied" INTEGER NOT NULL,
    "cardsStudied" INTEGER NOT NULL,
    "mature" INTEGER NOT NULL,
    "retention" DOUBLE PRECISION NOT NULL,
    "syncDataId" INTEGER NOT NULL,

    CONSTRAINT "AnkiData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImmersionActivity" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "seconds" INTEGER NOT NULL,
    "activityName" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ImmersionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "reportNo" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Streak" (
    "id" SERIAL NOT NULL,
    "ankiStreak" INTEGER NOT NULL,
    "immersionStreak" INTEGER NOT NULL,
    "reportId" INTEGER NOT NULL,

    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnkiData_syncDataId_key" ON "AnkiData"("syncDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_reportId_key" ON "Streak"("reportId");

-- AddForeignKey
ALTER TABLE "SyncData" ADD CONSTRAINT "SyncData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnkiData" ADD CONSTRAINT "AnkiData_syncDataId_fkey" FOREIGN KEY ("syncDataId") REFERENCES "SyncData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImmersionActivity" ADD CONSTRAINT "ImmersionActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
