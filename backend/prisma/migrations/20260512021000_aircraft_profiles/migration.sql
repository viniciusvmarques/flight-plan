-- CreateTable
CREATE TABLE "AircraftProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration" TEXT,
    "presetKey" TEXT,
    "family" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AircraftProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AircraftProfile_userId_idx" ON "AircraftProfile"("userId");

-- CreateIndex
CREATE INDEX "AircraftProfile_userId_isDefault_idx" ON "AircraftProfile"("userId", "isDefault");

-- AddForeignKey
ALTER TABLE "AircraftProfile" ADD CONSTRAINT "AircraftProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
