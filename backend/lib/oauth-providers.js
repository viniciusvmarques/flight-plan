import { OAuth2Client } from "google-auth-library";
import * as jose from "jose";

const appleJwks = jose.createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

export function oauthConfigured() {
  return {
    google: !!String(process.env.GOOGLE_CLIENT_ID || "").trim(),
    apple: !!String(process.env.APPLE_CLIENT_ID || "").trim(),
  };
}

export async function verifyGoogleIdToken(idToken) {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID não configurado.");

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({ idToken, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload?.email) {
    throw new Error("Token Google inválido.");
  }

  return {
    providerAccountId: payload.sub,
    email: String(payload.email).trim().toLowerCase(),
    emailVerified: payload.email_verified === true,
    name: payload.name || null,
  };
}

export async function verifyAppleIdToken(idToken) {
  const clientId = String(process.env.APPLE_CLIENT_ID || "").trim();
  if (!clientId) throw new Error("APPLE_CLIENT_ID não configurado.");

  const { payload } = await jose.jwtVerify(idToken, appleJwks, {
    issuer: "https://appleid.apple.com",
    audience: clientId,
  });

  const email = payload.email ? String(payload.email).trim().toLowerCase() : "";
  if (!payload.sub) throw new Error("Token Apple inválido.");

  const emailVerified =
    payload.email_verified === true ||
    payload.email_verified === "true" ||
    (Boolean(email) && payload.is_private_email !== true);

  return {
    providerAccountId: String(payload.sub),
    email,
    emailVerified: Boolean(email) && emailVerified,
    name: null,
  };
}

export async function verifyOAuthToken(provider, idToken) {
  const p = String(provider || "").trim().toLowerCase();
  if (p === "google") return verifyGoogleIdToken(idToken);
  if (p === "apple") return verifyAppleIdToken(idToken);
  throw new Error("Provedor OAuth inválido.");
}
