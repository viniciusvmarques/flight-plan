import { PrismaClient } from "@prisma/client";

export const USAGE_FEATURES = ["weather", "briefing", "tools", "quiz", "exam"];

export function getFreeUsageLimit() {
  const n = Number(process.env.FREE_USAGE_LIMIT || 2);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 2;
}

export function normalizeVisitorId(value) {
  const id = String(value || "").trim();
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(id)) return null;
  return id;
}

export function resolveUsageSubjectKey({ userId, visitorId, isPro }) {
  if (isPro) return { key: null, isPro: true };
  if (userId) return { key: `user:${userId}`, isPro: false };
  const visitor = normalizeVisitorId(visitorId);
  if (visitor) return { key: `visitor:${visitor}`, isPro: false };
  return { key: null, isPro: false };
}

async function getOrCreateUsage(prisma, subjectKey) {
  return prisma.featureUsage.upsert({
    where: { subjectKey },
    create: { subjectKey },
    update: {},
  });
}

function readCount(row, feature) {
  const map = row?.counts && typeof row.counts === "object" ? row.counts : {};
  const n = Number(map[feature] || 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function getUsageStatus(prisma, subjectKey, isPro) {
  const limit = getFreeUsageLimit();
  if (isPro || !subjectKey) {
    return {
      isPro: !!isPro,
      limit,
      features: Object.fromEntries(USAGE_FEATURES.map((f) => [f, { used: 0, remaining: limit, unlimited: true }])),
    };
  }

  const row = await getOrCreateUsage(prisma, subjectKey);
  const features = {};
  for (const feature of USAGE_FEATURES) {
    const used = readCount(row, feature);
    features[feature] = {
      used,
      remaining: Math.max(0, limit - used),
      unlimited: false,
    };
  }
  return { isPro: false, limit, features };
}

/**
 * Incrementa uso se ainda dentro do limite. Retorna { allowed, status }.
 */
export async function consumeUsage(prisma, subjectKey, feature, { isPro = false } = {}) {
  const limit = getFreeUsageLimit();
  // Conta logada (mesmo FREE) não usa cota de 2× — o funil é cadastro, não paywall de uso.
  if (isPro || !subjectKey || String(subjectKey).startsWith("user:")) {
    return { allowed: true, unlimited: true, limit, used: 0, remaining: limit };
  }
  if (!USAGE_FEATURES.includes(feature)) {
    throw new Error(`Feature de uso inválida: ${feature}`);
  }

  const row = await getOrCreateUsage(prisma, subjectKey);
  const counts = { ...(row.counts && typeof row.counts === "object" ? row.counts : {}) };
  const used = readCount(row, feature);
  if (used >= limit) {
    return { allowed: false, unlimited: false, limit, used, remaining: 0, feature };
  }

  counts[feature] = used + 1;
  await prisma.featureUsage.update({
    where: { subjectKey },
    data: { counts },
  });

  return {
    allowed: true,
    unlimited: false,
    limit,
    used: used + 1,
    remaining: Math.max(0, limit - used - 1),
    feature,
  };
}

export function usageLimitPayload(feature, result) {
  return {
    error: "Limite gratuito atingido. Assine o PRO para uso ilimitado.",
    code: "USAGE_LIMIT",
    feature,
    limit: result.limit,
    used: result.used,
    remaining: 0,
    upgradePath: "/assinatura",
  };
}
