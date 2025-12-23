-- CreateTable
CREATE TABLE "SurveyAnswer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "track" TEXT,
    "refoldKnows" BOOLEAN,
    "refoldStage" TEXT,
    "years" INTEGER,
    "language" TEXT,
    "appsUsing" TEXT[],

    CONSTRAINT "SurveyAnswer_pkey" PRIMARY KEY ("id")
);
