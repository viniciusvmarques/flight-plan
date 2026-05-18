CREATE TABLE "ExamAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "subject" TEXT,
    "questionIds" JSONB NOT NULL,
    "answers" JSONB,
    "score" JSONB,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ExamAttempt_userId_startedAt_idx" ON "ExamAttempt"("userId", "startedAt");
CREATE INDEX "ExamAttempt_license_mode_idx" ON "ExamAttempt"("license", "mode");

ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
