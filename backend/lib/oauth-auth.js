import crypto from "crypto";
import { verifyOAuthToken } from "./oauth-providers.js";

const ALLOWED_PROVIDERS = new Set(["google", "apple"]);

export async function resolveOAuthProfile(provider, idToken) {
  if (!ALLOWED_PROVIDERS.has(provider)) {
    throw Object.assign(new Error("Provedor OAuth inválido."), { status: 400 });
  }
  if (!String(idToken || "").trim()) {
    throw Object.assign(new Error("Token OAuth ausente."), { status: 400 });
  }

  try {
    const profile = await verifyOAuthToken(provider, idToken);
    if (!profile.email) {
      throw Object.assign(
        new Error("Não foi possível obter e-mail do provedor. Use cadastro por e-mail ou libere o e-mail no Apple/Google."),
        { status: 400, code: "OAUTH_EMAIL_REQUIRED" }
      );
    }
    return profile;
  } catch (e) {
    if (e.status) throw e;
    throw Object.assign(new Error(e?.message || "Falha ao validar login social."), { status: 401 });
  }
}

export async function loginOrRegisterWithOAuth(prisma, {
  provider,
  profile,
  preferredLocale,
  consent,
  consentVersions,
  req,
  getClientIp,
  getUserAgent,
  legalVersions,
}) {
  const existingLink = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId: profile.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (existingLink?.user) {
    const user = await finalizeOAuthUser(prisma, existingLink.user, preferredLocale);
    return { user, isNew: false };
  }

  let user = await prisma.user.findUnique({ where: { email: profile.email } });

  if (user) {
    await prisma.oAuthAccount.create({
      data: {
        userId: user.id,
        provider,
        providerAccountId: profile.providerAccountId,
      },
    });

    if (profile.emailVerified && !user.emailVerifiedAt) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt: new Date(),
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });
    }

    user = await finalizeOAuthUser(prisma, user, preferredLocale);
    return { user, isNew: false };
  }

  if (!consent?.accepted) {
    throw Object.assign(new Error("Aceite os termos e a política de privacidade para continuar."), {
      status: 400,
      code: "CONSENT_REQUIRED",
    });
  }

  user = await prisma.user.create({
    data: {
      email: profile.email,
      password: null,
      emailVerifiedAt: profile.emailVerified ? new Date() : null,
      emailVerificationToken: profile.emailVerified
        ? null
        : crypto.randomBytes(24).toString("hex"),
      emailVerificationExpires: profile.emailVerified
        ? null
        : new Date(Date.now() + 48 * 60 * 60 * 1000),
      plan: "FREE",
      preferredLocale,
      oauthAccounts: {
        create: {
          provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      consents: {
        create: {
          termsVersion: String(consentVersions?.terms || legalVersions.terms),
          privacyVersion: String(consentVersions?.privacy || legalVersions.privacy),
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        },
      },
    },
  });

  return { user, isNew: true };
}

async function finalizeOAuthUser(prisma, user, preferredLocale) {
  if (!user.emailVerifiedAt) {
    throw Object.assign(new Error("Confirme seu e-mail antes de entrar na conta."), {
      status: 403,
      code: "EMAIL_NOT_VERIFIED",
      email: user.email,
    });
  }

  if (preferredLocale !== (user.preferredLocale || "pt-BR")) {
    return prisma.user.update({
      where: { id: user.id },
      data: { preferredLocale },
    });
  }

  return user;
}
