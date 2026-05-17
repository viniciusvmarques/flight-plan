import "dotenv/config";
import express from "express";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { parse } from "csv-parse/sync";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { createEmailService } from "./lib/email-service.js";
import { AIRCRAFT_PRESETS, getAircraftPresetByKey, serializeAircraftPreset } from "./lib/aircraft-presets.js";
import { LEGAL_DOC_VERSIONS, SITE_PROFILE, getClientIp, getUserAgent } from "./lib/site-config.js";

const app = express();
const DEFAULT_FRONTEND_ORIGIN = "http://localhost:5173";
const NODE_ENV = String(process.env.NODE_ENV || "development").toLowerCase();
const IS_PRODUCTION = NODE_ENV === "production";
const APP_URL = process.env.APP_URL || DEFAULT_FRONTEND_ORIGIN;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const TOKEN_EXPIRES = "7d";

function parseAllowedOrigins(value) {
  return String(value || DEFAULT_FRONTEND_ORIGIN)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isLocalUrl(value) {
  return /localhost|127\.0\.0\.1/i.test(String(value || ""));
}

const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGIN);

app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      return callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  })
);

// ===== Stripe (opcional) =====
// Observação: webhook precisa do body RAW antes do express.json().
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// ===== Stripe webhook (RAW) =====
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return res.status(process.env.NODE_ENV === "production" ? 503 : 200).send("stripe_not_configured");
  }

  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Helpers
    async function setUserPlanById(userId, data) {
      await prisma.user.update({ where: { id: userId }, data }).catch(() => null);
    }

    async function setUserPlanByEmail(email, data) {
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!cleanEmail) return;
      const u = await prisma.user.findUnique({ where: { email: cleanEmail }, select: { id: true } });
      if (!u) return;
      await setUserPlanById(u.id, data);
    }

    async function findUserByCustomerId(customerId) {
      if (!customerId) return null;
      return prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
        select: { id: true, email: true, plan: true, planStatus: true, currentPeriodEnd: true },
      });
    }

    async function findUserByIdOrEmail(userId, email) {
      if (userId) {
        const byId = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true },
        }).catch(() => null);
        if (byId) return byId;
      }

      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!cleanEmail) return null;
      return prisma.user.findUnique({
        where: { email: cleanEmail },
        select: { id: true, email: true },
      }).catch(() => null);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.client_reference_id || session.metadata?.userId || null;
      const email = session.customer_details?.email || session.customer_email || null;
      const customerId = typeof session.customer === "string" ? session.customer : null;
      const subId = typeof session.subscription === "string" ? session.subscription : null;

      let patch = { plan: "PRO", planStatus: "active" };
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId).catch(() => null);
        if (sub) {
          patch = buildBillingPatchFromSubscription(sub);
        }
      }

      patch = {
        ...patch,
        stripeCustomerId: customerId,
      };

      if (userId) await setUserPlanById(userId, patch);
      else if (email) await setUserPlanByEmail(email, patch);

      const targetUser = await findUserByIdOrEmail(userId, email);
      await emailService
        .sendSubscriptionActivatedEmail({
          email: targetUser?.email || email,
          currentPeriodEnd: patch.currentPeriodEnd,
          userId: targetUser?.id || null,
          providerEventId: event.id,
        })
        .catch((err) => console.error("sendSubscriptionActivatedEmail:", err?.message || err));
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
      const subId = typeof invoice.subscription === "string" ? invoice.subscription : null;
      if (customerId) {
        const u = await findUserByCustomerId(customerId);
        if (u) {
          const sub = subId ? await stripe.subscriptions.retrieve(subId).catch(() => null) : null;
          const patch = sub
            ? buildBillingPatchFromSubscription(sub)
            : {
                plan: "PRO",
                planStatus: "active",
                stripeSubscriptionId: subId,
              };
          await setUserPlanById(u.id, patch);

          const billingReason = String(invoice.billing_reason || "").toLowerCase();
          if (billingReason === "subscription_create") {
            await emailService
              .sendSubscriptionActivatedEmail({
                email: u.email,
                currentPeriodEnd: patch.currentPeriodEnd,
                userId: u.id,
                providerEventId: event.id,
              })
              .catch((err) => console.error("sendSubscriptionActivatedEmail invoice:", err?.message || err));
          } else {
            await emailService
              .sendSubscriptionRenewedEmail({
                email: u.email,
                currentPeriodEnd: patch.currentPeriodEnd,
                userId: u.id,
                providerEventId: event.id,
              })
              .catch((err) => console.error("sendSubscriptionRenewedEmail:", err?.message || err));
          }
        }
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
      if (customerId) {
        const u = await findUserByCustomerId(customerId);
        if (u) {
          await setUserPlanById(u.id, { plan: "PRO", planStatus: "past_due" });
          await emailService
            .sendPaymentFailedEmail({
              email: u.email,
              hostedInvoiceUrl: invoice.hosted_invoice_url || null,
              userId: u.id,
              providerEventId: event.id,
            })
            .catch((err) => console.error("sendPaymentFailedEmail:", err?.message || err));
        }
      }
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object;
      const previous = event.data.previous_attributes || {};
      const customerId = typeof sub.customer === "string" ? sub.customer : null;
      if (customerId) {
        const u = await findUserByCustomerId(customerId);
        if (u) {
          const patch = buildBillingPatchFromSubscription(sub);
          await setUserPlanById(u.id, patch);

          if (!previous.cancel_at_period_end && sub.cancel_at_period_end) {
            await emailService
              .sendSubscriptionCancellationScheduledEmail({
                email: u.email,
                currentPeriodEnd: patch.currentPeriodEnd,
                userId: u.id,
                providerEventId: event.id,
              })
              .catch((err) => console.error("sendSubscriptionCancellationScheduledEmail:", err?.message || err));
          }
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const customerId = typeof sub.customer === "string" ? sub.customer : null;
      if (customerId) {
        const u = await findUserByCustomerId(customerId);
        if (u) {
          await setUserPlanById(u.id, {
            plan: "FREE",
            planStatus: "canceled",
            stripeSubscriptionId: null,
            currentPeriodEnd: null,
            trialEndsAt: null,
            cancelAtPeriodEnd: false,
            canceledAt: sub?.canceled_at ? new Date(sub.canceled_at * 1000) : new Date(),
          });
          await emailService
            .sendSubscriptionCanceledEmail({ email: u.email, userId: u.id, providerEventId: event.id })
            .catch((err) => console.error("sendSubscriptionCanceledEmail:", err?.message || err));
        }
      }
    }

    return res.status(200).send("ok");
  } catch (e) {
    return res.status(500).send(e?.message || "Webhook handler failed");
  }
});

app.use(express.json());

// ===== Auth/DB =====
const prisma = new PrismaClient();
const emailService = createEmailService(prisma);

const RESET_TOKEN_BYTES = 32;
const RESET_EXPIRY_MS =
  (Number(process.env.PASSWORD_RESET_EXPIRY_MINUTES) || 60) * 60 * 1000;
const EMAIL_VERIFICATION_TOKEN_BYTES = 32;
const EMAIL_VERIFICATION_EXPIRY_MS =
  (Number(process.env.EMAIL_VERIFICATION_EXPIRY_HOURS) || 48) * 60 * 60 * 1000;

if (IS_PRODUCTION && JWT_SECRET === "dev_secret_change_me") {
  throw new Error("JWT_SECRET precisa ser definido com um valor forte em produção.");
}

if (IS_PRODUCTION && isLocalUrl(APP_URL)) {
  console.warn("APP_URL ainda aponta para localhost em produção. Ajuste para o domínio público do frontend.");
}

if (IS_PRODUCTION && allowedOrigins.some(isLocalUrl)) {
  console.warn("CORS_ORIGIN ainda contém localhost em produção. Ajuste para o domínio público do frontend.");
}

function normalizeBillingStatus(value) {
  return String(value || "").trim().toLowerCase() || null;
}

function canAccessProPlan(plan, planStatus) {
  const normalizedPlan = String(plan || "FREE").toUpperCase();
  const normalizedStatus = normalizeBillingStatus(planStatus);
  if (normalizedPlan !== "PRO") return false;
  return !normalizedStatus || ["active", "trialing", "demo"].includes(normalizedStatus);
}

function buildBillingPatchFromSubscription(subscription) {
  const status = normalizeBillingStatus(subscription?.status) || "active";
  const currentPeriodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end * 1000) : null;
  const trialEndsAt = subscription?.trial_end ? new Date(subscription.trial_end * 1000) : null;
  const cancelAtPeriodEnd = !!subscription?.cancel_at_period_end;
  const canceledAt = subscription?.canceled_at ? new Date(subscription.canceled_at * 1000) : null;
  const keepsCommercialContext = ["active", "trialing", "past_due", "unpaid"].includes(status);

  return {
    plan: keepsCommercialContext ? "PRO" : "FREE",
    planStatus: status,
    stripeSubscriptionId: typeof subscription?.id === "string" ? subscription.id : null,
    currentPeriodEnd,
    trialEndsAt,
    cancelAtPeriodEnd,
    canceledAt,
  };
}

function buildVerificationUrl(token) {
  const base = String(APP_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${base}/verify-email?token=${encodeURIComponent(token)}`;
}

function buildPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    plan: user.plan,
    planStatus: user.planStatus ?? null,
    emailVerifiedAt: user.emailVerifiedAt ?? null,
    createdAt: user.createdAt,
  };
}

function sanitizeAircraftProfileInput(body = {}) {
  const preset = body?.presetKey ? getAircraftPresetByKey(String(body.presetKey)) : null;
  const name = String(body?.name || preset?.label || "").trim();
  const registration = String(body?.registration || "").trim().toUpperCase() || null;
  const notes = String(body?.notes || "").trim() || null;
  const incomingData = body?.data && typeof body.data === "object" ? body.data : {};
  const presetDefaults = preset?.defaults || {};

  return {
    name,
    registration,
    presetKey: preset?.key || null,
    family: body?.family ? String(body.family) : preset?.family || "custom",
    isDefault: !!body?.isDefault,
    notes,
    data: {
      ...presetDefaults,
      ...incomingData,
    },
  };
}

async function clearDefaultAircraftProfiles(userId, excludeId = null) {
  await prisma.aircraftProfile.updateMany({
    where: {
      userId,
      isDefault: true,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    data: { isDefault: false },
  }).catch(() => null);
}

function signToken(user){
  return jwt.sign({ sub: user.id, email: user.email, plan: user.plan }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
}

function requireAuth(req,res,next){
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if(!token) return res.status(401).json({ error: "Não autenticado." });
  try{
    req.auth = jwt.verify(token, JWT_SECRET);
    return next();
  }catch{
    return res.status(401).json({ error: "Sessão inválida." });
  }
}

async function requirePro(req,res,next){
  // Não confiar no plano do JWT (pode estar desatualizado após webhook).
  const id = req.auth?.sub;
  if(!id) return res.status(401).json({ error: "Token inválido." });
  const u = await prisma.user.findUnique({ where: { id }, select: { plan: true, planStatus: true } }).catch(()=>null);
  if(!canAccessProPlan(u?.plan, u?.planStatus)) {
    return res.status(402).json({ error: "Recurso disponível apenas para assinaturas PRO ativas." });
  }
  return next();
}

// ===== Health =====
app.get("/health", (req, res) => res.json({ ok: true }));
// ============================
// ===== AUTH =====
// ============================
app.post("/auth/register", async (req,res)=>{
  try{
    const { email, password, consent, consentVersions } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    if(!cleanEmail || !password) return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    if(String(password).length < 6) return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres." });
    if(!consent?.accepted) return res.status(400).json({ error: "Você precisa aceitar os termos/política." });

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if(existing) return res.status(409).json({ error: "Já existe conta com esse e-mail." });

    const hash = await bcrypt.hash(String(password), 10);
    const verificationToken = crypto.randomBytes(EMAIL_VERIFICATION_TOKEN_BYTES).toString("hex");
    const verificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hash,
        emailVerifiedAt: null,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        plan: "FREE",
        consents: {
          create: {
            termsVersion: String(consentVersions?.terms || LEGAL_DOC_VERSIONS.terms),
            privacyVersion: String(consentVersions?.privacy || LEGAL_DOC_VERSIONS.privacy),
            ipAddress: getClientIp(req),
            userAgent: getUserAgent(req),
          },
        },
      },
      select: { id:true, email:true, plan:true, planStatus:true, emailVerifiedAt:true, createdAt:true },
    });

    await emailService
      .sendEmailVerificationEmail({
        email: user.email,
        verifyUrl: buildVerificationUrl(verificationToken),
        userId: user.id,
      })
      .catch((err) => console.error("sendEmailVerificationEmail:", err?.message || err));

    return res.json({
      ok: true,
      requiresEmailVerification: true,
      email: user.email,
      message: "Conta criada. Confira sua caixa de entrada para confirmar o e-mail antes de entrar.",
    });
  }catch(e){
    return res.status(500).json({ error: e?.message || "Falha no cadastro." });
  }
});

app.post("/auth/login", async (req,res)=>{
  try{
    const { email, password } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    if(!cleanEmail || !password) return res.status(400).json({ error: "E-mail e senha são obrigatórios." });

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if(!user) return res.status(401).json({ error: "E-mail ou senha inválidos." });

    const ok = await bcrypt.compare(String(password), user.password);
    if(!ok) return res.status(401).json({ error: "E-mail ou senha inválidos." });

    if (!user.emailVerifiedAt) {
      return res.status(403).json({
        error: "Confirme seu e-mail antes de entrar na conta.",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    const safe = buildPublicUser(user);
    const token = signToken(safe);
    return res.json({ token, user: safe });
  }catch(e){
    return res.status(500).json({ error: e?.message || "Falha no login." });
  }
});

// Resposta genérica para não revelar se o e-mail existe
const FORGOT_PASSWORD_MSG =
  "Se existir uma conta com esse e-mail, você receberá instruções para redefinir a senha.";
const RESEND_VERIFICATION_MSG =
  "Se existir uma conta pendente com esse e-mail, enviaremos um novo link de confirmação.";

app.post("/auth/resend-verification", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const generic = { ok: true, message: RESEND_VERIFICATION_MSG };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.json(generic);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerifiedAt: true },
    });
    if (!user || user.emailVerifiedAt) return res.json(generic);

    const verificationToken = crypto.randomBytes(EMAIL_VERIFICATION_TOKEN_BYTES).toString("hex");
    const verificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    await emailService
      .sendEmailVerificationEmail({
        email: user.email,
        verifyUrl: buildVerificationUrl(verificationToken),
        userId: user.id,
      })
      .catch((err) => console.error("sendEmailVerificationEmail resend:", err?.message || err));

    return res.json(generic);
  } catch (e) {
    return res.status(500).json({ error: "Não foi possível reenviar a confirmação agora." });
  }
});

app.post("/auth/verify-email", async (req, res) => {
  try {
    const token = String(req.body?.token || "").trim();
    if (!token) return res.status(400).json({ error: "Token de confirmação ausente." });

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        plan: true,
        planStatus: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(400).json({
        error: "Link de confirmação inválido ou expirado. Solicite um novo envio para continuar.",
      });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: user.emailVerifiedAt || new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
      select: {
        id: true,
        email: true,
        plan: true,
        planStatus: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });

    await emailService
      .sendWelcomeEmail({ email: updated.email, userId: updated.id })
      .catch((err) => console.error("sendWelcomeEmail after verify:", err?.message || err));

    return res.json({
      ok: true,
      message: "E-mail confirmado com sucesso. Agora você já pode entrar na sua conta.",
      user: buildPublicUser(updated),
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Não foi possível confirmar o e-mail." });
  }
});

app.post("/auth/forgot-password", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const generic = { ok: true, message: FORGOT_PASSWORD_MSG };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json(generic);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
    if (!user) return res.json(generic);

    const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
    const expires = new Date(Date.now() + RESET_EXPIRY_MS);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: rawToken, passwordResetExpires: expires },
    });

    const base = String(APP_URL || "http://localhost:5173").replace(/\/$/, "");
    const resetUrl = `${base}/reset-password?token=${encodeURIComponent(rawToken)}`;

    await emailService
      .sendPasswordResetEmail({ email: user.email, resetUrl, userId: user.id })
      .catch((err) => console.error("sendPasswordResetEmail:", err?.message || err));

    return res.json(generic);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Não foi possível processar o pedido." });
  }
});

app.post("/auth/reset-password", async (req, res) => {
  try {
    const token = String(req.body?.token || "").trim();
    const password = String(req.body?.password || "");
    if (!token || !password) {
      return res.status(400).json({ error: "Token e nova senha são obrigatórios." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres." });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });
    if (!user) {
      return res.status(400).json({
        error: "Link inválido ou expirado. Solicite uma nova redefinição em «Esqueci minha senha».",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    await emailService
      .sendPasswordChangedEmail({ email: user.email, userId: user.id })
      .catch((err) => console.error("sendPasswordChangedEmail:", err?.message || err));

    return res.json({ ok: true, message: "Senha atualizada. Você já pode entrar." });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Falha ao redefinir senha." });
  }
});

app.get("/me", requireAuth, async (req,res)=>{
  const id = req.auth?.sub;
  if(!id) return res.status(401).json({ error: "Token inválido." });
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id:true,
      email:true,
      plan:true,
      planStatus:true,
      emailVerifiedAt:true,
      currentPeriodEnd:true,
      trialEndsAt:true,
      cancelAtPeriodEnd:true,
      canceledAt:true,
      createdAt:true,
    },
  });
  return res.json({ user });
});

app.delete("/me", requireAuth, async (req, res) => {
  const id = req.auth?.sub;
  if (!id) return res.status(401).json({ error: "Token inválido." });

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        plan: true,
        planStatus: true,
        stripeSubscriptionId: true,
        cancelAtPeriodEnd: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Conta não encontrada." });

    const confirmEmail = String(req.body?.email || "").trim().toLowerCase();
    if (confirmEmail !== user.email.toLowerCase()) {
      return res.status(400).json({ error: "Confirme o e-mail da conta para excluir." });
    }

    if (canAccessProPlan(user.plan, user.planStatus) && user.stripeSubscriptionId && !user.cancelAtPeriodEnd) {
      return res.status(409).json({
        error: "Cancele a assinatura antes de excluir a conta para evitar novas cobranças.",
        code: "ACTIVE_SUBSCRIPTION",
      });
    }

    await prisma.user.delete({ where: { id: user.id } });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Falha ao excluir conta." });
  }
});

app.get("/api/aircraft/presets", (req, res) => {
  return res.json({
    items: AIRCRAFT_PRESETS.map((item) => serializeAircraftPreset(item)),
  });
});

app.get("/api/aircraft/profiles", requireAuth, async (req, res) => {
  const userId = req.auth?.sub;
  const items = await prisma.aircraftProfile.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
  return res.json({ items });
});

app.post("/api/aircraft/profiles", requireAuth, async (req, res) => {
  try {
    const userId = req.auth?.sub;
    const payload = sanitizeAircraftProfileInput(req.body);
    if (!payload.name) return res.status(400).json({ error: "Informe um nome para o perfil da aeronave." });

    if (payload.isDefault) {
      await clearDefaultAircraftProfiles(userId);
    }

    const item = await prisma.aircraftProfile.create({
      data: {
        userId,
        ...payload,
      },
    });

    return res.json({ item });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Não foi possível criar o perfil de aeronave." });
  }
});

app.put("/api/aircraft/profiles/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.auth?.sub;
    const id = String(req.params.id || "");
    const existing = await prisma.aircraftProfile.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return res.status(404).json({ error: "Perfil de aeronave não encontrado." });

    const payload = sanitizeAircraftProfileInput(req.body);
    if (!payload.name) return res.status(400).json({ error: "Informe um nome para o perfil da aeronave." });

    if (payload.isDefault) {
      await clearDefaultAircraftProfiles(userId, id);
    }

    const item = await prisma.aircraftProfile.update({
      where: { id },
      data: payload,
    });

    return res.json({ item });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Não foi possível atualizar o perfil de aeronave." });
  }
});

app.delete("/api/aircraft/profiles/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.auth?.sub;
    const id = String(req.params.id || "");
    const existing = await prisma.aircraftProfile.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return res.status(404).json({ error: "Perfil de aeronave não encontrado." });
    await prisma.aircraftProfile.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Não foi possível remover o perfil de aeronave." });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const subject = String(req.body?.subject || "").trim();
    const message = String(req.body?.message || "").trim();
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (name.length < 2) return res.status(400).json({ error: "Informe seu nome." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Informe um e-mail válido." });
    if (subject.length < 3) return res.status(400).json({ error: "Informe o assunto." });
    if (message.length < 20) return res.status(400).json({ error: "Descreva melhor sua mensagem." });

    let userId = null;
    if (token) {
      try {
        const auth = jwt.verify(token, JWT_SECRET);
        userId = auth?.sub || null;
      } catch {
        userId = null;
      }
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        userId,
        name,
        email,
        subject,
        message,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      },
    });

    await Promise.allSettled([
      emailService.sendContactConfirmationEmail({
        email,
        name,
        subjectLabel: subject,
        userId,
        contactMessageId: contactMessage.id,
      }),
      emailService.sendContactNotificationEmail({
        message: { name, email, subject, message },
        contactMessageId: contactMessage.id,
      }),
    ]);

    return res.json({
      ok: true,
      message: `Recebemos sua mensagem. Nossa equipe retornará pelo e-mail informado em ${SITE_PROFILE.supportHours}`,
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Não foi possível enviar sua mensagem." });
  }
});

// ===== Briefings / Favoritos (PRO) =====
app.get("/api/briefings", requireAuth, requirePro, async (req,res)=>{
  const userId = req.auth.sub;
  const items = await prisma.briefing.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });
  return res.json({ items });
});

app.post("/api/briefings", requireAuth, requirePro, async (req,res)=>{
  const userId = req.auth.sub;
  const { data } = req.body || {};
  if(!data) return res.status(400).json({ error: "Dados ausentes." });
  const item = await prisma.briefing.create({ data: { userId, data } });
  return res.json({ item });
});

app.delete("/api/briefings/:id", requireAuth, requirePro, async (req,res)=>{
  const userId = req.auth.sub;
  const id = String(req.params.id);
  const existing = await prisma.briefing.findUnique({ where: { id } });
  if(!existing || existing.userId !== userId) return res.status(404).json({ error: "Não encontrado." });
  await prisma.briefing.delete({ where: { id } });
  return res.json({ ok:true });
});

app.get("/api/favorites", requireAuth, requirePro, async (req,res)=>{
  const userId = req.auth.sub;
  const items = await prisma.favorite.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return res.json({ items });
});

app.post("/api/favorites", requireAuth, requirePro, async (req,res)=>{
  const userId = req.auth.sub;
  const { icao } = req.body || {};
  const clean = String(icao || "").toUpperCase().trim();
  if(clean.length !== 4) return res.status(400).json({ error: "ICAO inválido." });
  const item = await prisma.favorite.upsert({
    where: { userId_icao: { userId, icao: clean } },
    update: {},
    create: { userId, icao: clean },
  });
  return res.json({ item });
});

app.delete("/api/favorites/:icao", requireAuth, requirePro, async (req,res)=>{
  const userId = req.auth.sub;
  const clean = String(req.params.icao || "").toUpperCase().trim();
  await prisma.favorite.delete({ where: { userId_icao: { userId, icao: clean } } }).catch(()=>null);
  return res.json({ ok:true });
});

// Endpoint de "demo upgrade" quando Stripe não estiver configurado
app.post("/api/demo/upgrade", requireAuth, async (req,res)=>{
  const id = req.auth.sub;
  const user = await prisma.user.update({ where: { id }, data: { plan: "PRO", planStatus: "demo" }, select: { id:true, email:true, plan:true, planStatus:true, createdAt:true } });
  const token = signToken(user);
  return res.json({ token, user });
});


// ===== Helpers =====
function normalizeIcao(x) {
    return String(x || "").toUpperCase().trim();
}
function safeNum(x) {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
}
function ftToM(ft) {
    const n = Number(ft);
    return Number.isFinite(n) ? Math.round(n * 0.3048) : null;
}

// ============================
// ===== CAMINHOS CORRETOS =====
// ============================
const airportsCsvPath = path.join(__dirname, "src/data/raw/airports.csv");
const runwaysCsvPath = path.join(__dirname, "src/data/raw/runways.csv");

// ============================
// ===== DB EM MEMÓRIA =====
// ============================
let AIRPORTS = {};
let RUNWAYS_BY_ICAO = {};

// ============================
// ===== CSV LOADERS =====
// ============================
function loadCSV(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    return parse(content, { columns: true, skip_empty_lines: true });
}

function headingToRwy(hdg) {
    if (!Number.isFinite(hdg)) return null;
    let rwy = Math.round(hdg / 10);
    if (rwy === 0) rwy = 36;
    return String(rwy).padStart(2, "0");
}

function normalizeRunwayIdent(id) {
    const s = String(id || "").trim().toUpperCase();
    if (!s) return "";
    const m = s.match(/^(\d{1,2})([A-Z])?$/);
    if (m) return m[1].padStart(2, "0") + (m[2] || "");
    return s;
}


function formatRunway(rw) {
    let ends = "";

    if (rw.le_ident || rw.he_ident) {
        ends = [normalizeRunwayIdent(rw.le_ident), normalizeRunwayIdent(rw.he_ident)].filter(Boolean).join("/");
    } else {
        const le = headingToRwy(rw.le_heading_degT);
        const he = headingToRwy(rw.he_heading_degT);
        ends = [le, he].filter(Boolean).join("/");
    }

    const lenM = ftToM(rw.length_ft);
    const surf = rw.surface || "—";

    const flags = [];
    if (rw.lighted) flags.push("LGT");
    if (rw.closed) flags.push("CLOSED");

    const parts = [];
    parts.push(ends || "—");
    if (lenM) parts.push(`${lenM}m`);
    parts.push(surf);
    if (flags.length) parts.push(flags.join(" "));

    return parts.join(" • ");
}

function loadAirportsAndRunways() {
    // ===== Airports =====
    try {
        const aRecs = loadCSV(airportsCsvPath);
        const map = {};

        for (const r of aRecs) {
            const icao = (r.ident || "").toUpperCase().trim();
            if (icao.length !== 4) continue;

            map[icao] = {
                icao,
                name: r.name || `Aeródromo ${icao}`,
                elevationFt: safeNum(r.elevation_ft),
                lat: safeNum(r.latitude_deg),
                lon: safeNum(r.longitude_deg),
                municipality: r.municipality || null,
                region: r.iso_region || null,
                type: r.type || null,
            };
        }

        AIRPORTS = map;
        console.log(`✔ Airports carregados: ${Object.keys(AIRPORTS).length}`);
    } catch (e) {
        console.error("❌ Falha ao carregar airports.csv:", e.message);
        AIRPORTS = {};
    }

    // ===== Runways =====
    try {
        const rRecs = loadCSV(runwaysCsvPath);
        const byIcao = {};

        for (const r of rRecs) {
            const icao = (r.airport_ident || "").toUpperCase().trim();
            if (icao.length !== 4) continue;

            const item = {
                le_ident: (r.le_ident || "").trim(),
                he_ident: (r.he_ident || "").trim(),
                le_heading_degT: safeNum(r.le_heading_degT),
                he_heading_degT: safeNum(r.he_heading_degT),
                length_ft: safeNum(r.length_ft),
                surface: (r.surface || "").trim(),
                lighted: r.lighted === "1" || r.lighted === 1,
                closed: r.closed === "1" || r.closed === 1,
            };

            if (!byIcao[icao]) byIcao[icao] = [];
            byIcao[icao].push(item);
        }

        for (const key of Object.keys(byIcao)) {
            byIcao[key].sort((a, b) => (b.length_ft || 0) - (a.length_ft || 0));
        }

        RUNWAYS_BY_ICAO = byIcao;
        console.log(`✔ Runways carregadas: ${Object.keys(RUNWAYS_BY_ICAO).length} aeródromos`);
    } catch (e) {
        console.error("❌ Falha ao carregar runways.csv:", e.message);
        RUNWAYS_BY_ICAO = {};
    }
}

// carrega no boot
loadAirportsAndRunways();

// ============================
// ===== ROTAS =====
// ============================
app.get("/api/airport", (req, res) => {
    const icao = normalizeIcao(req.query.icao);
    if (icao.length !== 4) return res.status(400).json({ error: "ICAO inválido" });

    const a = AIRPORTS[icao];
    if (!a) return res.status(404).json({ error: "Aeródromo não encontrado" });

    const runways = RUNWAYS_BY_ICAO[icao] || [];
    const runwaysText = runways.length
        ? runways.map(formatRunway).join("\n")
        : "—";

    res.json({
        icao: a.icao,
        name: a.name,
        elevationFt: a.elevationFt,
        municipality: a.municipality,
        region: a.region,
        latitude: a.lat,
        longitude: a.lon,
        runwaysText,
        runwaysCount: runways.length,
        runways: runways.map((rw) => ({
            leIdent: rw.le_ident || null,
            heIdent: rw.he_ident || null,
            leHdg: safeNum(rw.le_heading_degT),
            heHdg: safeNum(rw.he_heading_degT),
            lengthFt: safeNum(rw.length_ft),
            surface: rw.surface || null,
        })),
    });
});

// ============================
// ===== METAR / TAF =====
// ============================
async function fetchRawFromAVWX(kind, icao) {
    const token = process.env.AVWX_TOKEN || "";
    if (!token) return null;

    const url = `https://avwx.rest/api/${kind}/${icao}?format=raw&filter=sanitized`;
    const r = await axios.get(url, {
        headers: { Authorization: `Token ${token}` },
    });
    return r.data?.raw || null;
}

async function fetchRawFromNOAA(kind, icao) {
    if (kind === "metar") {
        const url = `https://tgftp.nws.noaa.gov/data/observations/metar/stations/${icao}.TXT`;
        const r = await axios.get(url, { responseType: "text" });
        const lines = String(r.data || "").split("\n").map(l => l.trim()).filter(Boolean);
        return lines[1] || null;
    }

    if (kind === "taf") {
        const url = `https://tgftp.nws.noaa.gov/data/forecasts/taf/stations/${icao}.TXT`;
        const r = await axios.get(url, { responseType: "text" });
        const lines = String(r.data || "").split("\n").map(l => l.trim()).filter(Boolean);
        return lines.slice(1).join("\n") || null;
    }

    return null;
}

async function fetchRaw(kind, icao) {
    return (
        (await fetchRawFromAVWX(kind, icao).catch(() => null)) ||
        (await fetchRawFromNOAA(kind, icao).catch(() => null))
    );
}

// =========================================================
// ===== Rotas "novas" (compat com o frontend atual) =====
// =========================================================
// O frontend chama:
//   GET /api/weather/metar/:icao
//   GET /api/weather/taf/:icao
// Mas este backend originalmente expunha:
//   GET /api/metar?icao=
//   GET /api/taf?icao=
//
// Para não quebrar nada, mantemos as rotas antigas E adicionamos as novas.
app.get("/api/weather/metar/:icao", async (req, res) => {
    const icao = normalizeIcao(req.params.icao);
    if (icao.length !== 4) return res.status(400).send("ICAO inválido");

    const raw = await fetchRaw("metar", icao);
    if (!raw) return res.status(404).send("Sem METAR disponível");
    res.type("text/plain").send(raw);
});

app.get("/api/weather/taf/:icao", async (req, res) => {
    const icao = normalizeIcao(req.params.icao);
    if (icao.length !== 4) return res.status(400).send("ICAO inválido");

    const raw = await fetchRaw("taf", icao);
    if (!raw) return res.status(404).send("Sem TAF disponível");
    res.type("text/plain").send(raw);
});

app.get("/api/metar", async (req, res) => {
    const icao = normalizeIcao(req.query.icao);
    if (icao.length !== 4) return res.status(400).send("ICAO inválido");

    const raw = await fetchRaw("metar", icao);
    if (!raw) return res.status(404).send("Sem METAR disponível");
    res.type("text/plain").send(raw);
});

app.get("/api/taf", async (req, res) => {
    const icao = normalizeIcao(req.query.icao);
    if (icao.length !== 4) return res.status(400).send("ICAO inválido");

    const raw = await fetchRaw("taf", icao);
    if (!raw) return res.status(404).send("Sem TAF disponível");
    res.type("text/plain").send(raw);
});

// ============================
// ===== CHECKOUT =====
// ============================
app.post("/api/stripe/checkout", requireAuth, async (req, res) => {
  const userId = req.auth?.sub;
  if (!userId) return res.status(401).json({ error: "Não autenticado." });
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, stripeCustomerId: true } });
  if (!u) return res.status(404).json({ error: "Usuário não encontrado." });

  if (!stripe) return res.json({ demo: true });

  const priceId = String(STRIPE_PRICE_ID || "").trim();
  if (!priceId) return res.status(400).json({ error: "PRICE_ID ausente." });

  const successUrl = `${APP_URL.replace(/\/$/, "")}/assinatura?checkout=success`;
  const cancelUrl = `${APP_URL.replace(/\/$/, "")}/assinatura?checkout=cancel`;

  // Customer
  let customerId = u.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: u.email,
      metadata: { userId: u.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: u.id }, data: { stripeCustomerId: customerId } }).catch(() => null);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: u.id,
    metadata: { userId: u.id },
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: u.id },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return res.json({ url: session.url });
});

// Customer Portal (cancelar/gerenciar)
app.post("/api/stripe/portal", requireAuth, async (req, res) => {
  const userId = req.auth?.sub;
  if (!userId) return res.status(401).json({ error: "Não autenticado." });
  if (!stripe) return res.status(400).json({ error: "Stripe não configurado." });

  const u = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
  if (!u?.stripeCustomerId) return res.status(400).json({ error: "Cliente Stripe não encontrado para este usuário." });

  const returnUrl = `${APP_URL.replace(/\/$/, "")}/assinatura`;
  const session = await stripe.billingPortal.sessions.create({
    customer: u.stripeCustomerId,
    return_url: returnUrl,
  });
  return res.json({ url: session.url });
});

// ============================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log("Backend rodando na porta", PORT);
});
