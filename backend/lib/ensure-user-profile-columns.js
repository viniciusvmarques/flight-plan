/**
 * Emergency safety net: profile columns must exist even if migrate deploy
 * was skipped on a previous Render release.
 */
export async function ensureUserProfileColumns(prisma) {
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "homeCity" TEXT`);
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isPilot" BOOLEAN NOT NULL DEFAULT false`
  );
}
