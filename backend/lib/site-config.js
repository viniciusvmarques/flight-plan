export const BRAND_NAME = "Marquisa";

export const LEGAL_DOC_VERSIONS = {
    terms: process.env.LEGAL_TERMS_VERSION || "2026-05-12",
    privacy: process.env.LEGAL_PRIVACY_VERSION || "2026-05-12",
    cancellation: process.env.LEGAL_CANCELLATION_VERSION || "2026-05-12",
};

export const SITE_PROFILE = {
    brandName: BRAND_NAME,
    legalName: process.env.LEGAL_COMPANY_NAME || "[preencher razão social / nome legal]",
    tradeName: process.env.LEGAL_TRADE_NAME || BRAND_NAME,
    supportEmail: process.env.SUPPORT_EMAIL || "contato@marquisa.com.br",
    privacyEmail: process.env.PRIVACY_EMAIL || process.env.SUPPORT_EMAIL || "contato@marquisa.com.br",
    contactReceiverEmail:
        process.env.CONTACT_RECEIVER_EMAIL || process.env.SUPPORT_EMAIL || "contato@marquisa.com.br",
    cityCountry: process.env.LEGAL_CITY_COUNTRY || "[preencher cidade/UF - Brasil]",
    documentId: process.env.LEGAL_DOCUMENT_ID || "[preencher CNPJ ou identificação aplicável]",
    supportHours: process.env.SUPPORT_HOURS || "Segunda a sexta, em horário comercial.",
    refundSummary:
        process.env.LEGAL_REFUND_SUMMARY ||
        "A política comercial final deve ser revisada com os dados reais da operação antes da publicação definitiva.",
};

export function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (Array.isArray(forwarded)) return forwarded[0] || null;
    if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || null;
    return req.ip || req.socket?.remoteAddress || null;
}

export function getUserAgent(req) {
    return String(req.headers["user-agent"] || "").trim() || null;
}
