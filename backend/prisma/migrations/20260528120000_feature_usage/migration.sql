-- CreateTable
CREATE TABLE "FeatureUsage" (
    "subjectKey" TEXT NOT NULL,
    "counts" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureUsage_pkey" PRIMARY KEY ("subjectKey")
);

CREATE INDEX "FeatureUsage_updatedAt_idx" ON "FeatureUsage"("updatedAt");
