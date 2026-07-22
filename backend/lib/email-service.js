import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BRAND_NAME, SITE_PROFILE } from "./site-config.js";

const __emailDir = path.dirname(fileURLToPath(import.meta.url));
/** Prefer Canva PNG in frontend/public; fall back to backend/assets. */
const EMAIL_LOGO_PATH = [
    path.join(__emailDir, "..", "..", "frontend", "public", "marquisa-mark.png"),
    path.join(__emailDir, "..", "assets", "email-logo.png"),
].find((p) => fs.existsSync(p)) || path.join(__emailDir, "..", "..", "frontend", "public", "marquisa-mark.png");

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function nl2br(value) {
    return escapeHtml(value).replace(/\n/g, "<br />");
}

/** Base pública do frontend (imagens e links do app). */
function publicBaseUrl() {
    const raw = process.env.APP_URL || process.env.FRONTEND_URL || "https://marquisa.com.br";
    return String(raw).replace(/\/$/, "");
}

function emailCta(href, label, variant = "primary") {
    const bg = variant === "accent" ? "#2563eb" : "#0ea5e9";
    const color = "#ffffff";
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
        <tr>
          <td align="center" bgcolor="${bg}" style="border-radius:10px;background-color:${bg};">
            <a href="${escapeHtml(href)}"
               style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;line-height:1.2;color:${color};text-decoration:none;border-radius:10px;">
              ${escapeHtml(label)}
            </a>
          </td>
        </tr>
      </table>`;
}

function emailLinkFallback(url, label) {
    if (!url) return "";
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
        <tr>
          <td style="padding:12px 14px;border:1px solid #334155;border-radius:10px;background-color:#111827;">
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#94a3b8;">
              ${escapeHtml(label)}
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;word-break:break-all;">
              <a href="${escapeHtml(url)}" style="color:#7dd3fc;text-decoration:underline;">${escapeHtml(url)}</a>
            </p>
          </td>
        </tr>
      </table>`;
}

function emailBullets(items) {
    const rows = (items || [])
        .filter(Boolean)
        .map(
            (item) =>
                `<tr>
          <td valign="top" style="padding:0 8px 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#38bdf8;">&#10003;</td>
          <td style="padding:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#e2e8f0;">${item}</td>
        </tr>`
        )
        .join("");
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px;">${rows}</table>`;
}

function emailNote(htmlInner) {
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px;">
        <tr>
          <td style="padding:12px 14px;border:1px solid #1e3a5f;border-radius:10px;background-color:#0f2744;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#cbd5e1;">
            ${htmlInner}
          </td>
        </tr>
      </table>`;
}

function emailParagraph(text, { muted = false, last = false } = {}) {
    const color = muted ? "#94a3b8" : "#e2e8f0";
    const margin = last ? "0" : "0 0 16px";
    return `<p style="margin:${margin};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${color};">${text}</p>`;
}

/**
 * Shell de e-mail em tabelas (Gmail/Outlook).
 * Sem flex/gap/overflow — evita conteúdo cortado.
 * Logo: PNG do símbolo da marca (bússola/VOR).
 */
function buildEmailShell({ title, intro, bodyHtml, footerNote, footerTransactional }) {
    const appUrl = publicBaseUrl();
    const logoSrc = fs.existsSync(EMAIL_LOGO_PATH)
        ? "cid:marquisa-logo"
        : `${appUrl}/marquisa-mark.png`;
    const support = SITE_PROFILE.supportEmail;
    const year = new Date().getFullYear();

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#071018;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#071018;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#0f172a;border:1px solid #1e293b;">

          <tr>
            <td bgcolor="#0b1a2e" style="background-color:#0b1a2e;padding:28px 28px 22px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="52" valign="middle" style="width:52px;padding:0 14px 0 0;">
                    <img src="${escapeHtml(logoSrc)}" width="48" height="48" alt="Marquisa"
                         style="display:block;width:48px;height:48px;border:0;border-radius:12px;" />
                  </td>
                  <td valign="middle">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;letter-spacing:0.22em;text-transform:uppercase;color:#93c5fd;font-weight:700;">
                      ${BRAND_NAME}
                    </div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#94a3b8;margin-top:4px;">
                      Briefing &middot; METAR &middot; navega&ccedil;&atilde;o
                    </div>
                  </td>
                </tr>
              </table>
              <div style="height:18px;line-height:18px;font-size:0;">&nbsp;</div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#7dd3fc;font-weight:700;">
                Operacional
              </div>
              <h1 style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.3;color:#f8fafc;font-weight:700;">
                ${escapeHtml(title)}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="height:3px;background-color:#2563eb;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <tr>
            <td style="padding:28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#e2e8f0;">
              ${intro ? emailParagraph(escapeHtml(intro)) : ""}
              ${bodyHtml || ""}
            </td>
          </tr>

          <tr>
            <td bgcolor="#0b1220" style="background-color:#0b1220;padding:20px 28px;border-top:1px solid #1e293b;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#94a3b8;">
              <p style="margin:0 0 8px;color:#cbd5e1;font-weight:700;">
                ${escapeHtml(footerNote || `${BRAND_NAME} · ${support}`)}
              </p>
              <p style="margin:0 0 8px;">
                ${escapeHtml(footerTransactional || "Mensagem relacionada à sua conta Marquisa.")}
              </p>
              <p style="margin:0;">
                <a href="${escapeHtml(appUrl)}" style="color:#93c5fd;text-decoration:underline;">${escapeHtml(appUrl.replace(/^https?:\/\//, ""))}</a>
                &nbsp;&middot;&nbsp; &copy; ${year} ${BRAND_NAME}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function cleanFirstName(value) {
    const name = String(value || "").trim();
    if (!name) return "";
    // Evita usar e-mail ou lixo como "nome"
    if (name.includes("@") || name.length > 40) return "";
    return name.split(/\s+/)[0];
}

function greetingLine(copy, firstName) {
    const name = cleanFirstName(firstName);
    return name ? copy.helloNamed(name) : copy.hello;
}

function buildTransporter() {
    const host = process.env.SMTP_HOST;
    if (!host) return null;

    return nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth:
            process.env.SMTP_USER != null && process.env.SMTP_USER !== ""
                ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" }
                : undefined,
    });
}

function normalizeLocale(value) {
    const raw = String(value || "").toLowerCase();
    if (raw.startsWith("en")) return "en";
    if (raw.startsWith("es")) return "es";
    return "pt-BR";
}

function dateLocaleFor(locale) {
    const lang = normalizeLocale(locale);
    if (lang === "en") return "en-US";
    if (lang === "es") return "es-ES";
    return "pt-BR";
}

function emailCopy(locale) {
    const lang = normalizeLocale(locale);
    const support = SITE_PROFILE.supportEmail;
    const all = {
        "pt-BR": {
            hello: "Olá,",
            helloNamed: (name) => `Olá, ${name},`,
            footerTransactional: "Mensagem relacionada à sua conta Marquisa.",
            nextCycleFallback: "o próximo ciclo da assinatura",
            endOfCurrentCycle: "o fim do ciclo atual",
            nextMilestone: "Próximo marco comercial:",
            copyPasteLink: "Se preferir, copie e cole este endereço no navegador:",
            supportLabel: `Suporte: ${support}`,
            supportNeedHelp: `Se precisar de suporte, fale com ${support}.`,
            supportHelp: `Se precisar de ajuda, fale com ${support}.`,
            supportOnly: `Suporte: ${support}.`,
            doubts: `Dúvidas: ${support}.`,
            accountLabel: "Conta:",
            openLinkLabel: "Acesse:",

            passwordResetSubject: `${BRAND_NAME} — redefinição de senha`,
            passwordResetTitle: "Redefinição de senha",
            passwordResetIntro: "Recebemos um pedido para redefinir a senha da sua conta.",
            passwordResetButton: "Redefinir senha",
            passwordResetUseLink: "Use o link abaixo para escolher uma nova senha:",
            passwordResetTextBody:
                `Para criar uma nova senha, acesse o link abaixo (válido por tempo limitado):`,
            passwordResetIgnore: "Se você não pediu isso, ignore este e-mail.",

            verifySubject: `${BRAND_NAME} — confirme seu e-mail`,
            verifyTitle: "Confirme seu e-mail",
            verifyIntro: "Recebemos um pedido de criação de conta e precisamos validar seu endereço de e-mail.",
            verifyButton: "Confirmar e-mail",
            verifyClick: "Clique no botão abaixo para ativar sua conta:",
            verifyTextBody: "Para ativar sua conta, confirme seu e-mail no link abaixo:",
            verifyIgnore: "Se você não pediu esse cadastro, ignore esta mensagem.",

            welcomeSubject: `${BRAND_NAME} — bem-vindo a bordo`,
            welcomeTitle: "Bem-vindo a bordo",
            welcomeIntro: "Seu e-mail foi confirmado e sua conta Marquisa está pronta para uso.",
            openApp: "Abrir Marquisa",
            welcomeLead: `Bem-vindo ao ${BRAND_NAME}.`,
            welcomeReady: "Seu e-mail foi confirmado e sua conta está pronta para uso.",
            welcomeFeaturesText:
                "Você já pode consultar METAR/TAF, montar briefings e usar o planejador de voo VFR/IFR.",
            welcomeCanUse: "A partir de agora você pode usar o painel para:",
            welcomeBulletMetar: "consultar METAR e TAF de aeródromos;",
            welcomeBulletBriefing: "organizar briefing meteorológico e operacional;",
            welcomeBulletPlanner: "montar planejamento de voo VFR/IFR com rota, nível, combustível e alternado;",
            welcomeBulletPro: "salvar briefings e favoritos ao evoluir para recursos Pro.",
            welcomeImportant: "Importante:",
            welcomeDisclaimerHtml:
                `o ${BRAND_NAME} é uma ferramenta de apoio e estudo. Ele não substitui fontes oficiais, cartas, NOTAM, ROTAER/AIS/MET, documentação aplicável ou julgamento do piloto em comando.`,
            welcomeDisclaimerText:
                `Lembrete importante: o ${BRAND_NAME} é uma ferramenta de apoio e estudo. Sempre valide informações operacionais em fontes oficiais, cartas, NOTAM, ROTAER/AIS/MET e documentação aplicável.`,
            promoSubject: `${BRAND_NAME} — seu briefing te espera`,
            promoTitle: "Seu briefing te espera",
            promoLead:
                "A Marquisa está pronta para a próxima perna: briefing, METAR/TAF, combustível e computador de voo.",
            promoBulletBriefing: "Briefing completo origem → destino → alternativa",
            promoBulletComputer: "Computador de voo (vento, VA, combustível, conversões)",
            promoBulletPro: "Pro: salvar briefing e baixar PDF",
            promoCta: "Acessar a Marquisa",
            promoFooter: "Não quer mais receber estes e-mails? Responda com o assunto SAIR ou escreva para o suporte pedindo remoção da lista.",

            proSubject: `${BRAND_NAME} — plano Pro ativado`,
            proTitle: "Plano Pro ativado",
            proIntro: "Obrigado por assinar. Seu acesso premium já está disponível.",
            manageSubscription: "Gerenciar assinatura",
            proThanksText: `Obrigado por assinar o ${BRAND_NAME} Pro.`,
            proActivatedText: "Seu acesso premium foi ativado com sucesso.",
            proActivatedHtml: "Seu plano <strong>Pro</strong> foi ativado com sucesso.",
            proBulletSync: "briefings e favoritos sincronizados;",
            proBulletReopen: "reabertura rápida de planejamentos salvos;",
            proBulletBilling: "gestão de cobrança e cancelamento pela área de assinatura.",
            proManageText: "Você pode gerenciar ou cancelar sua assinatura pela área Assinatura do site.",
            proPolicyNote:
                `Cancelamento, reembolso, arrependimento e comprovantes seguem as políticas publicadas no site. Em caso de dúvida, fale com ${support}.`,

            renewedSubject: `${BRAND_NAME} — assinatura renovada`,
            renewedTitle: "Assinatura renovada",
            renewedIntro: "Recebemos a renovação da sua assinatura.",
            renewedText: "O pagamento do seu plano Pro foi confirmado e a assinatura foi renovada.",
            renewedActiveHtml: "Seu plano <strong>Pro</strong> segue ativo.",

            paymentFailedSubject: `${BRAND_NAME} — falha no pagamento da assinatura`,
            paymentFailedTitle: "Falha de pagamento",
            paymentFailedIntro: "Não foi possível concluir a cobrança da sua assinatura.",
            paymentFailedText: "Não conseguimos confirmar o pagamento da sua assinatura.",
            paymentFailedReviewLink: "Use este link para revisar a cobrança:",
            paymentFailedBody: "Seu acesso premium pode ficar restrito até a regularização.",
            paymentFailedReviewButton: "Revisar cobrança",

            trialCancelSubject: `${BRAND_NAME} — cancelamento no período de teste`,
            trialCancelTitle: "Cancelamento no período de teste",
            trialCancelIntro: "Confirmamos o cancelamento da sua assinatura Pro durante o trial de 7 dias.",
            trialCancelTextConfirm:
                "Confirmamos o cancelamento da sua assinatura Pro durante o período de teste de 7 dias.",
            trialCancelTextNoCharge: "Não haverá cobrança do primeiro ciclo.",
            trialCancelTextFree: "Sua conta permanece ativa no plano FREE.",
            trialCancelHtmlLead:
                "Como o cancelamento ocorreu <strong>dentro dos 7 dias de teste</strong>, <strong>não haverá cobrança</strong> do plano Pro.",
            trialCancelBullet1: "assinatura encerrada imediatamente;",
            trialCancelBullet2: "nenhuma fatura do trial será gerada;",
            trialCancelBullet3: "sua conta continua no plano FREE.",
            trialCancelChargeNote: `Se notar qualquer cobrança indevida, fale com ${support}.`,

            scheduledCancelSubject: `${BRAND_NAME} — cancelamento programado`,
            scheduledCancelTitle: "Cancelamento programado",
            scheduledCancelIntro: "Recebemos seu pedido de cancelamento após o período de teste.",
            scheduledCancelTrialSubject: `${BRAND_NAME} — cancelamento no trial confirmado`,
            scheduledCancelTrialIntro:
                "Confirmamos o cancelamento durante o período de teste. Não haverá cobrança ao final do trial.",
            scheduledCancelTrialText:
                "Confirmamos o cancelamento da assinatura Pro durante o trial.",
            scheduledCancelTrialAccess: (endLabel) =>
                `Seu acesso segue até ${endLabel}. Depois disso, a conta volta ao FREE e não haverá cobrança.`,
            scheduledCancelAfterText: "Seu cancelamento foi registrado após o período de teste.",
            scheduledCancelAfterAccess: (endLabel) =>
                `O plano Pro permanece ativo até ${endLabel}. Depois disso, não haverá renovação nem nova cobrança.`,
            scheduledCancelTrialHtmlLead:
                "Cancelamento registrado <strong>dentro dos 7 dias de teste</strong>.",
            scheduledCancelTrialBullet1: (endLabel) => `acesso Pro até <strong>${endLabel}</strong>;`,
            scheduledCancelTrialBullet2: "<strong>sem cobrança</strong> ao fim do trial;",
            scheduledCancelTrialBullet3: "depois disso, a conta segue no plano FREE.",
            scheduledCancelAfterHtmlLead: (endLabel) =>
                `Como o pedido foi feito <strong>depois dos 7 dias de teste</strong>, o acesso Pro segue até <strong>${endLabel}</strong>.`,
            scheduledCancelAfterBullet1: "não haverá renovação automática após essa data;",
            scheduledCancelAfterBullet2: "não geramos nova cobrança no próximo ciclo;",
            scheduledCancelAfterBullet3: "sua conta permanece disponível no plano FREE.",
            scheduledCancelRefund: `Dúvidas ou pedido de reembolso: ${support}.`,

            endedCancelSubject: `${BRAND_NAME} — assinatura encerrada`,
            endedCancelTitle: "Assinatura encerrada",
            endedCancelIntro: "Seu ciclo Pro foi finalizado e a conta voltou ao plano FREE.",
            endedCancelText:
                "Sua assinatura Pro foi encerrada e a conta retornou ao plano FREE.",
            endedCancelResubscribe: "Você pode assinar novamente quando quiser pela área de assinatura.",
            endedCancelHtmlLead:
                "O ciclo premium terminou. Sua conta agora está no plano <strong>FREE</strong>.",
            endedCancelBullet1: "não haverá novas cobranças desta assinatura;",
            endedCancelBullet2: "briefings locais e ferramentas básicas seguem disponíveis;",
            endedCancelBullet3: "você pode reativar o Pro a qualquer momento.",

            passwordChangedSubject: `${BRAND_NAME} — senha alterada com sucesso`,
            passwordChangedTitle: "Senha alterada",
            passwordChangedIntro: "Sua senha foi atualizada com sucesso.",
            passwordChangedText: "A senha da sua conta foi alterada com sucesso.",
            passwordChangedWarn:
                `Se você não reconhece essa ação, redefina a senha imediatamente e fale com ${support}.`,
            passwordChangedBody: "Se você não reconhece essa ação, redefina a senha imediatamente.",

            contactConfirmSubject: `${BRAND_NAME} — recebemos sua mensagem`,
            contactConfirmTitle: "Mensagem recebida",
            contactConfirmIntro: (name) =>
                cleanFirstName(name) ? `Olá, ${cleanFirstName(name)}, recebemos sua solicitação.` : "Olá, recebemos sua solicitação.",
            contactConfirmText: (name, subjectLabel) => {
                const greet = cleanFirstName(name) ? `Olá, ${cleanFirstName(name)},` : "Olá,";
                return `${greet}\n\nRecebemos sua mensagem sobre "${subjectLabel}".\nNossa equipe analisará o pedido e responderá pelo canal informado.\n\nSuporte: ${support}\n`;
            },
            contactConfirmSubjectLabel: "Assunto:",
            contactConfirmReturn: "Nossa equipe retornará pelo e-mail informado assim que possível.",
        },
        en: {
            hello: "Hello,",
            helloNamed: (name) => `Hello, ${name},`,
            footerTransactional: "Message related to your Marquisa account.",
            nextCycleFallback: "the next billing cycle",
            endOfCurrentCycle: "the end of the current cycle",
            nextMilestone: "Next billing milestone:",
            copyPasteLink: "Or copy and paste this address into your browser:",
            supportLabel: `Support: ${support}`,
            supportNeedHelp: `If you need support, contact ${support}.`,
            supportHelp: `If you need help, contact ${support}.`,
            supportOnly: `Support: ${support}.`,
            doubts: `Questions: ${support}.`,
            accountLabel: "Account:",
            openLinkLabel: "Open:",

            passwordResetSubject: `${BRAND_NAME} — password reset`,
            passwordResetTitle: "Password reset",
            passwordResetIntro: "We received a request to reset your account password.",
            passwordResetButton: "Reset password",
            passwordResetUseLink: "Use the link below to choose a new password:",
            passwordResetTextBody: "To create a new password, open the link below (time-limited):",
            passwordResetIgnore: "If you did not request this, you can ignore this email.",

            verifySubject: `${BRAND_NAME} — confirm your email`,
            verifyTitle: "Confirm your email",
            verifyIntro: "We received an account creation request and need to validate your email address.",
            verifyButton: "Confirm email",
            verifyClick: "Click the button below to activate your account:",
            verifyTextBody: "To activate your account, confirm your email using the link below:",
            verifyIgnore: "If you did not request this signup, you can ignore this message.",

            welcomeSubject: `${BRAND_NAME} — welcome aboard`,
            welcomeTitle: "Welcome aboard",
            welcomeIntro: "Your email has been confirmed and your Marquisa account is ready to use.",
            openApp: "Open Marquisa",
            welcomeLead: `Welcome to ${BRAND_NAME}.`,
            welcomeReady: "Your email has been confirmed and your account is ready to use.",
            welcomeFeaturesText:
                "You can already look up METAR/TAF, build briefings, and use the VFR/IFR flight planner.",
            welcomeCanUse: "From now on you can use the dashboard to:",
            welcomeBulletMetar: "look up METAR and TAF for aerodromes;",
            welcomeBulletBriefing: "organize weather and operational briefings;",
            welcomeBulletPlanner: "build VFR/IFR flight plans with route, level, fuel, and alternate;",
            welcomeBulletPro: "save briefings and favorites as you unlock Pro features.",
            welcomeImportant: "Important:",
            welcomeDisclaimerHtml:
                `${BRAND_NAME} is a support and study tool. It does not replace official sources, charts, NOTAMs, ROTAER/AIS/MET, applicable documentation, or the judgment of the pilot in command.`,
            welcomeDisclaimerText:
                `Important reminder: ${BRAND_NAME} is a support and study tool. Always validate operational information against official sources, charts, NOTAMs, ROTAER/AIS/MET, and applicable documentation.`,
            promoSubject: `${BRAND_NAME} — your briefing is waiting`,
            promoTitle: "Your briefing is waiting",
            promoLead:
                "Marquisa is ready for the next leg: briefing, METAR/TAF, fuel planning, and the flight computer.",
            promoBulletBriefing: "Full origin → destination → alternate briefing",
            promoBulletComputer: "Flight computer (wind, TAS, fuel, conversions)",
            promoBulletPro: "Pro: save briefings and download PDF",
            promoCta: "Open Marquisa",
            promoFooter: "Don't want these emails anymore? Reply with subject UNSUBSCRIBE or write to support asking to be removed.",

            proSubject: `${BRAND_NAME} — Pro plan activated`,
            proTitle: "Pro plan activated",
            proIntro: "Thank you for subscribing. Your premium access is now available.",
            manageSubscription: "Manage subscription",
            proThanksText: `Thank you for subscribing to ${BRAND_NAME} Pro.`,
            proActivatedText: "Your premium access was activated successfully.",
            proActivatedHtml: "Your <strong>Pro</strong> plan was activated successfully.",
            proBulletSync: "synced briefings and favorites;",
            proBulletReopen: "quick reopen of saved flight plans;",
            proBulletBilling: "billing and cancellation management in the subscription area.",
            proManageText: "You can manage or cancel your subscription in the Subscription area of the site.",
            proPolicyNote:
                `Cancellation, refunds, cooling-off rights, and receipts follow the policies published on the site. If you have questions, contact ${support}.`,

            renewedSubject: `${BRAND_NAME} — subscription renewed`,
            renewedTitle: "Subscription renewed",
            renewedIntro: "We received your subscription renewal.",
            renewedText: "Your Pro plan payment was confirmed and the subscription was renewed.",
            renewedActiveHtml: "Your <strong>Pro</strong> plan remains active.",

            paymentFailedSubject: `${BRAND_NAME} — subscription payment failed`,
            paymentFailedTitle: "Payment failed",
            paymentFailedIntro: "We could not complete the charge for your subscription.",
            paymentFailedText: "We could not confirm payment for your subscription.",
            paymentFailedReviewLink: "Use this link to review the charge:",
            paymentFailedBody: "Your premium access may be limited until payment is resolved.",
            paymentFailedReviewButton: "Review charge",

            trialCancelSubject: `${BRAND_NAME} — trial cancellation confirmed`,
            trialCancelTitle: "Trial cancellation confirmed",
            trialCancelIntro: "We confirmed your Pro subscription cancellation during the 7-day trial.",
            trialCancelTextConfirm:
                "We confirmed the cancellation of your Pro subscription during the 7-day trial period.",
            trialCancelTextNoCharge: "There will be no charge for the first cycle.",
            trialCancelTextFree: "Your account remains active on the FREE plan.",
            trialCancelHtmlLead:
                "Because the cancellation happened <strong>within the 7-day trial</strong>, there will be <strong>no charge</strong> for the Pro plan.",
            trialCancelBullet1: "subscription ended immediately;",
            trialCancelBullet2: "no trial invoice will be generated;",
            trialCancelBullet3: "your account stays on the FREE plan.",
            trialCancelChargeNote: `If you notice any incorrect charge, contact ${support}.`,

            scheduledCancelSubject: `${BRAND_NAME} — cancellation scheduled`,
            scheduledCancelTitle: "Cancellation scheduled",
            scheduledCancelIntro: "We received your cancellation request after the trial period.",
            scheduledCancelTrialSubject: `${BRAND_NAME} — trial cancellation confirmed`,
            scheduledCancelTrialIntro:
                "We confirmed the cancellation during the trial period. There will be no charge at the end of the trial.",
            scheduledCancelTrialText: "We confirmed the Pro subscription cancellation during the trial.",
            scheduledCancelTrialAccess: (endLabel) =>
                `Your access continues until ${endLabel}. After that, the account returns to FREE and there will be no charge.`,
            scheduledCancelAfterText: "Your cancellation was recorded after the trial period.",
            scheduledCancelAfterAccess: (endLabel) =>
                `The Pro plan remains active until ${endLabel}. After that, there will be no renewal and no new charge.`,
            scheduledCancelTrialHtmlLead:
                "Cancellation recorded <strong>within the 7-day trial</strong>.",
            scheduledCancelTrialBullet1: (endLabel) => `Pro access until <strong>${endLabel}</strong>;`,
            scheduledCancelTrialBullet2: "<strong>no charge</strong> at the end of the trial;",
            scheduledCancelTrialBullet3: "after that, the account stays on the FREE plan.",
            scheduledCancelAfterHtmlLead: (endLabel) =>
                `Because the request was made <strong>after the 7-day trial</strong>, Pro access continues until <strong>${endLabel}</strong>.`,
            scheduledCancelAfterBullet1: "there will be no automatic renewal after that date;",
            scheduledCancelAfterBullet2: "we will not create a new charge for the next cycle;",
            scheduledCancelAfterBullet3: "your account remains available on the FREE plan.",
            scheduledCancelRefund: `Questions or refund requests: ${support}.`,

            endedCancelSubject: `${BRAND_NAME} — subscription ended`,
            endedCancelTitle: "Subscription ended",
            endedCancelIntro: "Your Pro cycle has ended and your account is back on the FREE plan.",
            endedCancelText: "Your Pro subscription has ended and the account returned to the FREE plan.",
            endedCancelResubscribe: "You can subscribe again anytime from the subscription area.",
            endedCancelHtmlLead:
                "The premium cycle has ended. Your account is now on the <strong>FREE</strong> plan.",
            endedCancelBullet1: "there will be no further charges for this subscription;",
            endedCancelBullet2: "local briefings and basic tools remain available;",
            endedCancelBullet3: "you can reactivate Pro anytime.",

            passwordChangedSubject: `${BRAND_NAME} — password changed successfully`,
            passwordChangedTitle: "Password changed",
            passwordChangedIntro: "Your password was updated successfully.",
            passwordChangedText: "Your account password was changed successfully.",
            passwordChangedWarn:
                `If you do not recognize this action, reset your password immediately and contact ${support}.`,
            passwordChangedBody: "If you do not recognize this action, reset your password immediately.",

            contactConfirmSubject: `${BRAND_NAME} — we received your message`,
            contactConfirmTitle: "Message received",
            contactConfirmIntro: (name) =>
                cleanFirstName(name) ? `Hello, ${cleanFirstName(name)}, we received your request.` : "Hello, we received your request.",
            contactConfirmText: (name, subjectLabel) => {
                const greet = cleanFirstName(name) ? `Hello, ${cleanFirstName(name)},` : "Hello,";
                return `${greet}\n\nWe received your message about "${subjectLabel}".\nOur team will review the request and reply through the channel you provided.\n\nSupport: ${support}\n`;
            },
            contactConfirmSubjectLabel: "Subject:",
            contactConfirmReturn: "Our team will reply to the email you provided as soon as possible.",
        },
        es: {
            hello: "Hola,",
            helloNamed: (name) => `Hola, ${name},`,
            footerTransactional: "Mensaje relacionado con tu cuenta Marquisa.",
            nextCycleFallback: "el próximo ciclo de la suscripción",
            endOfCurrentCycle: "el final del ciclo actual",
            nextMilestone: "Próximo hito comercial:",
            copyPasteLink: "Si prefieres, copia y pega esta dirección en el navegador:",
            supportLabel: `Soporte: ${support}`,
            supportNeedHelp: `Si necesitas soporte, escribe a ${support}.`,
            supportHelp: `Si necesitas ayuda, escribe a ${support}.`,
            supportOnly: `Soporte: ${support}.`,
            doubts: `Dudas: ${support}.`,
            accountLabel: "Cuenta:",
            openLinkLabel: "Accede:",

            passwordResetSubject: `${BRAND_NAME} — redefinir contraseña`,
            passwordResetTitle: "Redefinir contraseña",
            passwordResetIntro: "Recibimos una solicitud para redefinir la contraseña de tu cuenta.",
            passwordResetButton: "Redefinir contraseña",
            passwordResetUseLink: "Usa el enlace de abajo para elegir una nueva contraseña:",
            passwordResetTextBody:
                "Para crear una nueva contraseña, accede al enlace de abajo (válido por tiempo limitado):",
            passwordResetIgnore: "Si no pediste esto, ignora este email.",

            verifySubject: `${BRAND_NAME} — confirma tu email`,
            verifyTitle: "Confirma tu email",
            verifyIntro: "Recibimos una solicitud de creación de cuenta y necesitamos validar tu dirección de email.",
            verifyButton: "Confirmar email",
            verifyClick: "Haz clic en el botón de abajo para activar tu cuenta:",
            verifyTextBody: "Para activar tu cuenta, confirma tu email en el enlace de abajo:",
            verifyIgnore: "Si no pediste este registro, ignora este mensaje.",

            welcomeSubject: `${BRAND_NAME} — bienvenido a bordo`,
            welcomeTitle: "Bienvenido a bordo",
            welcomeIntro: "Tu email fue confirmado y tu cuenta Marquisa está lista para usar.",
            openApp: "Abrir Marquisa",
            welcomeLead: `Bienvenido a ${BRAND_NAME}.`,
            welcomeReady: "Tu email fue confirmado y tu cuenta está lista para usar.",
            welcomeFeaturesText:
                "Ya puedes consultar METAR/TAF, armar briefings y usar el planificador de vuelo VFR/IFR.",
            welcomeCanUse: "A partir de ahora puedes usar el panel para:",
            welcomeBulletMetar: "consultar METAR y TAF de aeródromos;",
            welcomeBulletBriefing: "organizar briefing meteorológico y operacional;",
            welcomeBulletPlanner: "armar planificación de vuelo VFR/IFR con ruta, nivel, combustible y alterno;",
            welcomeBulletPro: "guardar briefings y favoritos al evolucionar a funciones Pro.",
            welcomeImportant: "Importante:",
            welcomeDisclaimerHtml:
                `${BRAND_NAME} es una herramienta de apoyo y estudio. No sustituye fuentes oficiales, cartas, NOTAM, ROTAER/AIS/MET, documentación aplicable ni el juicio del piloto al mando.`,
            welcomeDisclaimerText:
                `Recordatorio importante: ${BRAND_NAME} es una herramienta de apoyo y estudio. Siempre valida la información operacional en fuentes oficiales, cartas, NOTAM, ROTAER/AIS/MET y documentación aplicable.`,
            promoSubject: `${BRAND_NAME} — tu briefing te espera`,
            promoTitle: "Tu briefing te espera",
            promoLead:
                "Marquisa está lista para el próximo tramo: briefing, METAR/TAF, combustible y computador de vuelo.",
            promoBulletBriefing: "Briefing completo origen → destino → alterno",
            promoBulletComputer: "Computador de vuelo (viento, VA, combustible, conversiones)",
            promoBulletPro: "Pro: guardar briefing y descargar PDF",
            promoCta: "Abrir Marquisa",
            promoFooter: "¿No quieres recibir más estos emails? Responde con el asunto SALIR o escribe al soporte pidiendo la baja.",

            proSubject: `${BRAND_NAME} — plan Pro activado`,
            proTitle: "Plan Pro activado",
            proIntro: "Gracias por suscribirte. Tu acceso premium ya está disponible.",
            manageSubscription: "Gestionar suscripción",
            proThanksText: `Gracias por suscribirte a ${BRAND_NAME} Pro.`,
            proActivatedText: "Tu acceso premium se activó correctamente.",
            proActivatedHtml: "Tu plan <strong>Pro</strong> se activó correctamente.",
            proBulletSync: "briefings y favoritos sincronizados;",
            proBulletReopen: "reapertura rápida de planificaciones guardadas;",
            proBulletBilling: "gestión de cobro y cancelación desde el área de suscripción.",
            proManageText: "Puedes gestionar o cancelar tu suscripción desde el área Suscripción del sitio.",
            proPolicyNote:
                `Cancelación, reembolso, arrepentimiento y comprobantes siguen las políticas publicadas en el sitio. Si tienes dudas, escribe a ${support}.`,

            renewedSubject: `${BRAND_NAME} — suscripción renovada`,
            renewedTitle: "Suscripción renovada",
            renewedIntro: "Recibimos la renovación de tu suscripción.",
            renewedText: "Se confirmó el pago de tu plan Pro y la suscripción fue renovada.",
            renewedActiveHtml: "Tu plan <strong>Pro</strong> sigue activo.",

            paymentFailedSubject: `${BRAND_NAME} — fallo en el pago de la suscripción`,
            paymentFailedTitle: "Fallo de pago",
            paymentFailedIntro: "No fue posible completar el cobro de tu suscripción.",
            paymentFailedText: "No pudimos confirmar el pago de tu suscripción.",
            paymentFailedReviewLink: "Usa este enlace para revisar el cobro:",
            paymentFailedBody: "Tu acceso premium puede quedar restringido hasta la regularización.",
            paymentFailedReviewButton: "Revisar cobro",

            trialCancelSubject: `${BRAND_NAME} — cancelación en período de prueba`,
            trialCancelTitle: "Cancelación en período de prueba",
            trialCancelIntro: "Confirmamos la cancelación de tu suscripción Pro durante el trial de 7 días.",
            trialCancelTextConfirm:
                "Confirmamos la cancelación de tu suscripción Pro durante el período de prueba de 7 días.",
            trialCancelTextNoCharge: "No habrá cobro del primer ciclo.",
            trialCancelTextFree: "Tu cuenta permanece activa en el plan FREE.",
            trialCancelHtmlLead:
                "Como la cancelación ocurrió <strong>dentro de los 7 días de prueba</strong>, <strong>no habrá cobro</strong> del plan Pro.",
            trialCancelBullet1: "suscripción finalizada de inmediato;",
            trialCancelBullet2: "no se generará ninguna factura del trial;",
            trialCancelBullet3: "tu cuenta continúa en el plan FREE.",
            trialCancelChargeNote: `Si notas cualquier cobro indebido, escribe a ${support}.`,

            scheduledCancelSubject: `${BRAND_NAME} — cancelación programada`,
            scheduledCancelTitle: "Cancelación programada",
            scheduledCancelIntro: "Recibimos tu solicitud de cancelación después del período de prueba.",
            scheduledCancelTrialSubject: `${BRAND_NAME} — cancelación en trial confirmada`,
            scheduledCancelTrialIntro:
                "Confirmamos la cancelación durante el período de prueba. No habrá cobro al final del trial.",
            scheduledCancelTrialText: "Confirmamos la cancelación de la suscripción Pro durante el trial.",
            scheduledCancelTrialAccess: (endLabel) =>
                `Tu acceso continúa hasta ${endLabel}. Después, la cuenta vuelve a FREE y no habrá cobro.`,
            scheduledCancelAfterText: "Tu cancelación fue registrada después del período de prueba.",
            scheduledCancelAfterAccess: (endLabel) =>
                `El plan Pro permanece activo hasta ${endLabel}. Después de eso, no habrá renovación ni nuevo cobro.`,
            scheduledCancelTrialHtmlLead:
                "Cancelación registrada <strong>dentro de los 7 días de prueba</strong>.",
            scheduledCancelTrialBullet1: (endLabel) => `acceso Pro hasta <strong>${endLabel}</strong>;`,
            scheduledCancelTrialBullet2: "<strong>sin cobro</strong> al final del trial;",
            scheduledCancelTrialBullet3: "después de eso, la cuenta sigue en el plan FREE.",
            scheduledCancelAfterHtmlLead: (endLabel) =>
                `Como la solicitud se hizo <strong>después de los 7 días de prueba</strong>, el acceso Pro continúa hasta <strong>${endLabel}</strong>.`,
            scheduledCancelAfterBullet1: "no habrá renovación automática después de esa fecha;",
            scheduledCancelAfterBullet2: "no generamos un nuevo cobro en el próximo ciclo;",
            scheduledCancelAfterBullet3: "tu cuenta permanece disponible en el plan FREE.",
            scheduledCancelRefund: `Dudas o solicitud de reembolso: ${support}.`,

            endedCancelSubject: `${BRAND_NAME} — suscripción finalizada`,
            endedCancelTitle: "Suscripción finalizada",
            endedCancelIntro: "Tu ciclo Pro terminó y tu cuenta volvió al plan FREE.",
            endedCancelText: "Tu suscripción Pro fue finalizada y la cuenta volvió al plan FREE.",
            endedCancelResubscribe: "Puedes suscribirte de nuevo cuando quieras desde el área de suscripción.",
            endedCancelHtmlLead:
                "El ciclo premium terminó. Tu cuenta ahora está en el plan <strong>FREE</strong>.",
            endedCancelBullet1: "no habrá nuevos cobros de esta suscripción;",
            endedCancelBullet2: "briefings locales y herramientas básicas siguen disponibles;",
            endedCancelBullet3: "puedes reactivar Pro en cualquier momento.",

            passwordChangedSubject: `${BRAND_NAME} — contraseña cambiada con éxito`,
            passwordChangedTitle: "Contraseña cambiada",
            passwordChangedIntro: "Tu contraseña se actualizó con éxito.",
            passwordChangedText: "La contraseña de tu cuenta se cambió con éxito.",
            passwordChangedWarn:
                `Si no reconoces esta acción, redefine la contraseña de inmediato y escribe a ${support}.`,
            passwordChangedBody: "Si no reconoces esta acción, redefine la contraseña de inmediato.",

            contactConfirmSubject: `${BRAND_NAME} — recibimos tu mensaje`,
            contactConfirmTitle: "Mensaje recibido",
            contactConfirmIntro: (name) =>
                cleanFirstName(name) ? `Hola, ${cleanFirstName(name)}, recibimos tu solicitud.` : "Hola, recibimos tu solicitud.",
            contactConfirmText: (name, subjectLabel) => {
                const greet = cleanFirstName(name) ? `Hola, ${cleanFirstName(name)},` : "Hola,";
                return `${greet}\n\nRecibimos tu mensaje sobre "${subjectLabel}".\nNuestro equipo analizará la solicitud y responderá por el canal informado.\n\nSoporte: ${support}\n`;
            },
            contactConfirmSubjectLabel: "Asunto:",
            contactConfirmReturn: "Nuestro equipo responderá al email informado lo antes posible.",
        },
    };
    return all[lang] || all["pt-BR"];
}

export function createEmailService(prisma) {
    const transporter = buildTransporter();
    const from = process.env.MAIL_FROM || `${BRAND_NAME} <contato@marquisa.com.br>`;

    async function resolveFirstName(userId, firstName) {
        const direct = cleanFirstName(firstName);
        if (direct) return direct;
        if (!userId || !prisma?.user?.findUnique) return "";
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { firstName: true },
            });
            return cleanFirstName(user?.firstName);
        } catch {
            return "";
        }
    }

    async function logEmail(entry) {
        try {
            await prisma.emailLog.create({ data: entry });
        } catch {
            // Não bloquear o fluxo principal por falha de logging.
        }
    }

    async function sendEmail({
        kind,
        to,
        subject,
        text,
        html,
        userId = null,
        contactMessageId = null,
        metadata = null,
        providerEventId = null,
    }) {
        if (!to) return;

        if (providerEventId) {
            const existing = await prisma.emailLog.findFirst({
                where: {
                    kind,
                    providerEventId,
                    status: { in: ["sent", "console"] },
                },
                select: { id: true },
            }).catch(() => null);
            if (existing) return;
        }

        if (!transporter) {
            console.log(`\n─── ${BRAND_NAME} · ${kind} (SMTP não configurado) ───`);
            console.log(`Para: ${to}`);
            console.log(`Assunto: ${subject}`);
            console.log(text);
            console.log("Configure SMTP_HOST / MAIL_FROM no .env para envio real.\n");

            await logEmail({
                userId,
                contactMessageId,
                kind,
                toEmail: to,
                subject,
                status: "console",
                provider: "console",
                providerEventId,
                metadata,
                sentAt: new Date(),
            });
            return;
        }

        try {
            const attachments = [];
            if (fs.existsSync(EMAIL_LOGO_PATH)) {
                attachments.push({
                    filename: "marquisa-email-logo.png",
                    path: EMAIL_LOGO_PATH,
                    cid: "marquisa-logo",
                    contentDisposition: "inline",
                });
            }
            await transporter.sendMail({
                from,
                to,
                subject,
                text,
                html,
                attachments: attachments.length ? attachments : undefined,
            });
            await logEmail({
                userId,
                contactMessageId,
                kind,
                toEmail: to,
                subject,
                status: "sent",
                provider: "smtp",
                providerEventId,
                metadata,
                sentAt: new Date(),
            });
        } catch (error) {
            await logEmail({
                userId,
                contactMessageId,
                kind,
                toEmail: to,
                subject,
                status: "failed",
                provider: "smtp",
                providerEventId,
                error: error?.message || "Falha no envio",
                metadata,
            });
            throw error;
        }
    }

    async function sendTrialCancellationEmailImpl({ email, userId = null, providerEventId = null, locale = "pt-BR", firstName = null }) {
        const copy = emailCopy(locale);
        const greet = greetingLine(copy, await resolveFirstName(userId, firstName));
        const appUrl = publicBaseUrl();
        const subject = copy.trialCancelSubject;
        const text =
            `${greet}\n\n` +
            `${copy.trialCancelTextConfirm}\n` +
            `${copy.trialCancelTextNoCharge}\n` +
            `${copy.trialCancelTextFree}\n` +
            `${copy.supportLabel}\n` +
            `${copy.accountLabel} ${appUrl}/assinatura\n`;
        const html = buildEmailShell({
            title: copy.trialCancelTitle,
            intro: greet,
            footerTransactional: copy.footerTransactional,
            bodyHtml:
                emailParagraph(escapeHtml(copy.trialCancelIntro)) +
                emailParagraph(copy.trialCancelHtmlLead) +
                emailBullets([
                    escapeHtml(copy.trialCancelBullet1),
                    escapeHtml(copy.trialCancelBullet2),
                    escapeHtml(copy.trialCancelBullet3),
                ]) +
                emailCta(`${appUrl}/assinatura`, copy.manageSubscription) +
                emailParagraph(escapeHtml(copy.trialCancelChargeNote), { last: true }),
        });

        return sendEmail({
            kind: "subscription_canceled_trial",
            to: email,
            subject,
            text,
            html,
            userId,
            providerEventId,
            metadata: { reason: "trial" },
        });
    }

    return {
        async sendPasswordResetEmail({ email, resetUrl, userId = null, locale = "pt-BR", firstName = null }) {
            const copy = emailCopy(locale);
            const greet = greetingLine(copy, await resolveFirstName(userId, firstName));
            const subject = copy.passwordResetSubject;
            const text =
                `${greet}\n\n` +
                `${copy.passwordResetTextBody}\n${resetUrl}\n\n` +
                `${copy.passwordResetIgnore}\n`;
            const html = buildEmailShell({
                title: copy.passwordResetTitle,
                intro: greet,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    emailParagraph(escapeHtml(copy.passwordResetIntro)) +
                    emailParagraph(escapeHtml(copy.passwordResetUseLink)) +
                    emailCta(resetUrl, copy.passwordResetButton) +
                    emailLinkFallback(resetUrl, copy.copyPasteLink) +
                    emailParagraph(escapeHtml(copy.passwordResetIgnore), { muted: true, last: true }),
            });

            return sendEmail({
                kind: "password_reset",
                to: email,
                subject,
                text,
                html,
                userId,
                metadata: { resetUrl },
            });
        },

        async sendEmailVerificationEmail({ email, verifyUrl, userId = null, locale = "pt-BR", firstName = null }) {
            const copy = emailCopy(locale);
            const greet = greetingLine(copy, await resolveFirstName(userId, firstName));
            const subject = copy.verifySubject;
            const text =
                `${greet}\n\n` +
                `${copy.verifyTextBody}\n${verifyUrl}\n\n` +
                `${copy.verifyIgnore}\n`;
            const html = buildEmailShell({
                title: copy.verifyTitle,
                intro: greet,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    emailParagraph(escapeHtml(copy.verifyIntro)) +
                    emailParagraph(escapeHtml(copy.verifyClick)) +
                    emailCta(verifyUrl, copy.verifyButton, "accent") +
                    emailLinkFallback(verifyUrl, copy.copyPasteLink) +
                    emailParagraph(escapeHtml(copy.verifyIgnore), { muted: true, last: true }),
            });

            return sendEmail({
                kind: "email_verification",
                to: email,
                subject,
                text,
                html,
                userId,
                metadata: { verifyUrl },
            });
        },

        async sendWelcomeEmail({ email, userId = null, locale = "pt-BR", firstName = null }) {
            const copy = emailCopy(locale);
            const greet = greetingLine(copy, await resolveFirstName(userId, firstName));
            const subject = copy.welcomeSubject;
            const appUrl = publicBaseUrl();
            const text =
                `${greet}\n\n` +
                `${copy.welcomeLead}\n\n` +
                `${copy.welcomeReady}\n` +
                `${copy.welcomeFeaturesText}\n\n` +
                `${copy.openLinkLabel} ${appUrl}\n\n` +
                `${copy.welcomeDisclaimerText}\n\n` +
                `${copy.supportLabel}\n`;
            const html = buildEmailShell({
                title: copy.welcomeTitle,
                intro: greet,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    emailParagraph(escapeHtml(copy.welcomeIntro)) +
                    emailParagraph(escapeHtml(copy.welcomeCanUse)) +
                    emailBullets([
                        escapeHtml(copy.welcomeBulletMetar),
                        escapeHtml(copy.welcomeBulletBriefing),
                        escapeHtml(copy.welcomeBulletPlanner),
                        escapeHtml(copy.welcomeBulletPro),
                    ]) +
                    emailCta(appUrl, copy.openApp, "accent") +
                    emailNote(`<strong>${escapeHtml(copy.welcomeImportant)}</strong> ${escapeHtml(copy.welcomeDisclaimerHtml)}`) +
                    emailParagraph(escapeHtml(copy.supportNeedHelp), { muted: true, last: true }),
            });

            return sendEmail({ kind: "welcome", to: email, subject, text, html, userId, metadata: { appUrl } });
        },

        async sendSubscriptionActivatedEmail({ email, currentPeriodEnd, userId = null, providerEventId = null, locale = "pt-BR", firstName = null }) {
            const copy = emailCopy(locale);
            const greet = greetingLine(copy, await resolveFirstName(userId, firstName));
            const recent = await prisma.emailLog.findFirst({
                where: {
                    kind: "purchase_success",
                    toEmail: email,
                    status: { in: ["sent", "console"] },
                    createdAt: { gt: new Date(Date.now() - 30 * 60 * 1000) },
                },
                select: { id: true },
            }).catch(() => null);
            if (recent) return;

            const endLabel = currentPeriodEnd
                ? new Date(currentPeriodEnd).toLocaleDateString(dateLocaleFor(locale))
                : copy.nextCycleFallback;
            const appUrl = publicBaseUrl();
            const subject = copy.proSubject;
            const text =
                `${greet}\n\n` +
                `${copy.proThanksText}\n\n` +
                `${copy.proActivatedText}\n` +
                `${copy.nextMilestone} ${endLabel}.\n\n` +
                `${copy.proManageText}\n` +
                `${copy.openLinkLabel} ${appUrl}\n\n` +
                `${copy.supportLabel}\n`;
            const html = buildEmailShell({
                title: copy.proTitle,
                intro: greet,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    emailParagraph(escapeHtml(copy.proIntro)) +
                    emailParagraph(copy.proActivatedHtml) +
                    emailBullets([
                        escapeHtml(copy.proBulletSync),
                        escapeHtml(copy.proBulletReopen),
                        escapeHtml(copy.proBulletBilling),
                    ]) +
                    emailParagraph(`${escapeHtml(copy.nextMilestone)} <strong>${escapeHtml(endLabel)}</strong>.`) +
                    emailCta(`${appUrl}/assinatura`, copy.manageSubscription) +
                    emailNote(escapeHtml(copy.proPolicyNote)),
            });

            return sendEmail({
                kind: "purchase_success",
                to: email,
                subject,
                text,
                html,
                userId,
                providerEventId,
                metadata: { currentPeriodEnd: endLabel, appUrl },
            });
        },

        async sendSubscriptionRenewedEmail({ email, currentPeriodEnd, userId = null, providerEventId = null, locale = "pt-BR", firstName = null }) {
            const copy = emailCopy(locale);
            const greet = greetingLine(copy, await resolveFirstName(userId, firstName));
            const endLabel = currentPeriodEnd
                ? new Date(currentPeriodEnd).toLocaleDateString(dateLocaleFor(locale))
                : copy.nextCycleFallback;
            const subject = copy.renewedSubject;
            const text =
                `${greet}\n\n` +
                `${copy.renewedText}\n` +
                `${copy.nextMilestone} ${endLabel}.\n`;
            const html = buildEmailShell({
                title: copy.renewedTitle,
                intro: greet,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    emailParagraph(escapeHtml(copy.renewedIntro)) +
                    emailParagraph(copy.renewedActiveHtml) +
                    emailParagraph(`${escapeHtml(copy.nextMilestone)} <strong>${escapeHtml(endLabel)}</strong>.`, { last: true }),
            });

            return sendEmail({
                kind: "subscription_renewed",
                to: email,
                subject,
                text,
                html,
                userId,
                providerEventId,
                metadata: { currentPeriodEnd: endLabel },
            });
        },

        async sendPaymentFailedEmail({ email, hostedInvoiceUrl = null, userId = null, providerEventId = null, locale = "pt-BR", firstName = null }) {
            const copy = emailCopy(locale);
            const greet = greetingLine(copy, await resolveFirstName(userId, firstName));
            const subject = copy.paymentFailedSubject;
            const text =
                `${greet}\n\n` +
                `${copy.paymentFailedText}\n` +
                `${hostedInvoiceUrl ? `${copy.paymentFailedReviewLink} ${hostedInvoiceUrl}\n` : ""}` +
                `${copy.supportHelp}\n`;
            const html = buildEmailShell({
                title: copy.paymentFailedTitle,
                intro: greet,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    emailParagraph(escapeHtml(copy.paymentFailedIntro)) +
                    emailParagraph(escapeHtml(copy.paymentFailedBody)) +
                    (hostedInvoiceUrl
                        ? emailCta(hostedInvoiceUrl, copy.paymentFailedReviewButton) +
                          emailLinkFallback(hostedInvoiceUrl, copy.copyPasteLink)
                        : "") +
                    emailParagraph(escapeHtml(copy.supportHelp), { muted: true, last: true }),
            });

            return sendEmail({
                kind: "payment_failed",
                to: email,
                subject,
                text,
                html,
                userId,
                providerEventId,
                metadata: { hostedInvoiceUrl },
            });
        },

        async sendContactConfirmationEmail({ email, name, subjectLabel, userId = null, contactMessageId = null, locale = "pt-BR" }) {
            const copy = emailCopy(locale);
            const subject = copy.contactConfirmSubject;
            const text = copy.contactConfirmText(name, subjectLabel);
            const html = buildEmailShell({
                title: copy.contactConfirmTitle,
                intro: copy.contactConfirmIntro(name),
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    emailParagraph(`${escapeHtml(copy.contactConfirmSubjectLabel)} <strong>${escapeHtml(subjectLabel)}</strong>`) +
                    emailParagraph(escapeHtml(copy.contactConfirmReturn), { last: true }),
            });

            return sendEmail({
                kind: "contact_confirmation",
                to: email,
                subject,
                text,
                html,
                userId,
                contactMessageId,
                metadata: { subjectLabel },
            });
        },

        async sendNewSignupNotificationEmail({
            email,
            userId = null,
            preferredLocale = "pt-BR",
            createdAt = null,
            emailVerified = false,
        }) {
            if (process.env.SIGNUP_NOTIFY_ENABLED === "false") return;

            const skipList = String(process.env.SIGNUP_NOTIFY_SKIP_EMAILS || "")
                .split(",")
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean);
            if (skipList.includes(String(email || "").trim().toLowerCase())) return;

            const when = createdAt ? new Date(createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "agora";
            const statusLabel = emailVerified ? "E-mail já confirmado" : "Aguardando confirmação de e-mail";
            const subject = `${BRAND_NAME} — novo cadastro no site`;
            const text =
                `Novo cadastro no Marquisa.\n\n` +
                `E-mail: ${email}\n` +
                `Idioma: ${preferredLocale}\n` +
                `Data (Brasília): ${when}\n` +
                `Status: ${statusLabel}\n` +
                `User ID: ${userId || "—"}\n`;
            const html = buildEmailShell({
                title: "Novo cadastro",
                intro: "Alguém acabou de criar uma conta no Marquisa.",
                bodyHtml:
                    emailParagraph(`<strong>E-mail:</strong> ${escapeHtml(email)}`) +
                    emailParagraph(`<strong>Idioma:</strong> ${escapeHtml(preferredLocale)}`) +
                    emailParagraph(`<strong>Data (Brasília):</strong> ${escapeHtml(when)}`) +
                    emailParagraph(`<strong>Status:</strong> ${escapeHtml(statusLabel)}`) +
                    emailParagraph(`<strong>User ID:</strong> ${escapeHtml(userId || "—")}`, { last: true }),
            });

            return sendEmail({
                kind: "signup_notification",
                to: SITE_PROFILE.signupNotifyEmail,
                subject,
                text,
                html,
                userId,
                metadata: { signupEmail: email, emailVerified },
            });
        },

        async sendContactNotificationEmail({ message, contactMessageId = null }) {
            const subject = `${BRAND_NAME} — novo contato do site`;
            const text =
                `Novo contato recebido.\n\n` +
                `Nome: ${message.name}\n` +
                `E-mail: ${message.email}\n` +
                `Assunto: ${message.subject}\n\n` +
                `${message.message}\n`;
            const html = buildEmailShell({
                title: "Novo contato recebido",
                intro: "Uma nova mensagem foi enviada pelo formulário do site.",
                bodyHtml:
                    emailParagraph(`<strong>Nome:</strong> ${escapeHtml(message.name)}`) +
                    emailParagraph(`<strong>E-mail:</strong> ${escapeHtml(message.email)}`) +
                    emailParagraph(`<strong>Assunto:</strong> ${escapeHtml(message.subject)}`) +
                    emailParagraph(`<strong>Mensagem:</strong><br />${nl2br(message.message)}`, { last: true }),
            });

            return sendEmail({
                kind: "contact_notification",
                to: SITE_PROFILE.contactReceiverEmail,
                subject,
                text,
                html,
                contactMessageId,
                metadata: { fromEmail: message.email },
            });
        },

        async sendSubscriptionCancellationScheduledEmail({
            email,
            currentPeriodEnd,
            userId = null,
            providerEventId = null,
            locale = "pt-BR",
            duringTrial = false,
            firstName = null,
        }) {
            const copy = emailCopy(locale);
            const greet = greetingLine(copy, await resolveFirstName(userId, firstName));
            const endLabel = currentPeriodEnd
                ? new Date(currentPeriodEnd).toLocaleDateString(dateLocaleFor(locale))
                : copy.endOfCurrentCycle;
            const appUrl = publicBaseUrl();
            const subject = duringTrial ? copy.scheduledCancelTrialSubject : copy.scheduledCancelSubject;
            const title = duringTrial ? copy.trialCancelTitle : copy.scheduledCancelTitle;
            const introBody = duringTrial ? copy.scheduledCancelTrialIntro : copy.scheduledCancelIntro;
            const text = duringTrial
                ? `${greet}\n\n${copy.scheduledCancelTrialText}\n` +
                  `${copy.scheduledCancelTrialAccess(endLabel)}\n` +
                  `${copy.supportLabel}\n`
                : `${greet}\n\n${copy.scheduledCancelAfterText}\n` +
                  `${copy.scheduledCancelAfterAccess(endLabel)}\n` +
                  `${copy.supportLabel}\n`;
            const escapedEnd = escapeHtml(endLabel);
            const html = buildEmailShell({
                title,
                intro: greet,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    emailParagraph(escapeHtml(introBody)) +
                    (duringTrial
                        ? emailParagraph(copy.scheduledCancelTrialHtmlLead) +
                          emailBullets([
                              copy.scheduledCancelTrialBullet1(escapedEnd),
                              copy.scheduledCancelTrialBullet2,
                              escapeHtml(copy.scheduledCancelTrialBullet3),
                          ]) +
                          emailParagraph(escapeHtml(copy.doubts), { muted: true, last: true })
                        : emailParagraph(copy.scheduledCancelAfterHtmlLead(escapedEnd)) +
                          emailBullets([
                              escapeHtml(copy.scheduledCancelAfterBullet1),
                              escapeHtml(copy.scheduledCancelAfterBullet2),
                              escapeHtml(copy.scheduledCancelAfterBullet3),
                          ]) +
                          emailCta(`${appUrl}/assinatura`, copy.manageSubscription) +
                          emailParagraph(escapeHtml(copy.scheduledCancelRefund), { muted: true, last: true })),
            });

            return sendEmail({
                kind: duringTrial ? "subscription_cancellation_scheduled_trial" : "subscription_cancellation_scheduled",
                to: email,
                subject,
                text,
                html,
                userId,
                providerEventId,
                metadata: { currentPeriodEnd: endLabel, reason: duringTrial ? "trial_scheduled" : "after_trial" },
            });
        },

        async sendSubscriptionCanceledEmail({ email, userId = null, providerEventId = null, locale = "pt-BR", reason = "ended", firstName = null }) {
            if (reason === "trial") {
                return sendTrialCancellationEmailImpl({ email, userId, providerEventId, locale, firstName });
            }

            const copy = emailCopy(locale);
            const greet = greetingLine(copy, await resolveFirstName(userId, firstName));
            const appUrl = publicBaseUrl();
            const subject = copy.endedCancelSubject;
            const text =
                `${greet}\n\n` +
                `${copy.endedCancelText}\n` +
                `${copy.endedCancelResubscribe}\n` +
                `${copy.supportLabel}\n` +
                `${copy.accountLabel} ${appUrl}/assinatura\n`;
            const html = buildEmailShell({
                title: copy.endedCancelTitle,
                intro: greet,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    emailParagraph(escapeHtml(copy.endedCancelIntro)) +
                    emailParagraph(copy.endedCancelHtmlLead) +
                    emailBullets([
                        escapeHtml(copy.endedCancelBullet1),
                        escapeHtml(copy.endedCancelBullet2),
                        escapeHtml(copy.endedCancelBullet3),
                    ]) +
                    emailCta(`${appUrl}/assinatura`, copy.manageSubscription) +
                    emailParagraph(escapeHtml(copy.supportOnly), { muted: true, last: true }),
            });

            return sendEmail({
                kind: "subscription_canceled",
                to: email,
                subject,
                text,
                html,
                userId,
                providerEventId,
                metadata: { reason: "ended" },
            });
        },

        async sendTrialCancellationEmail(args) {
            return sendTrialCancellationEmailImpl(args);
        },

        async sendPasswordChangedEmail({ email, userId = null, locale = "pt-BR", firstName = null }) {
            const copy = emailCopy(locale);
            const greet = greetingLine(copy, await resolveFirstName(userId, firstName));
            const subject = copy.passwordChangedSubject;
            const text =
                `${greet}\n\n` +
                `${copy.passwordChangedText}\n` +
                `${copy.passwordChangedWarn}\n`;
            const html = buildEmailShell({
                title: copy.passwordChangedTitle,
                intro: greet,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    emailParagraph(escapeHtml(copy.passwordChangedIntro)) +
                    emailParagraph(escapeHtml(copy.passwordChangedBody)) +
                    emailParagraph(escapeHtml(copy.supportOnly), { muted: true, last: true }),
            });

            return sendEmail({ kind: "password_changed", to: email, subject, text, html, userId });
        },

        async sendPromoAccessEmail({ email, userId = null, locale = "pt-BR", firstName = null }) {
            const copy = emailCopy(locale);
            const greet = greetingLine(copy, await resolveFirstName(userId, firstName));
            const appUrl = publicBaseUrl();
            const subject = copy.promoSubject;
            const text =
                `${greet}\n\n` +
                `${copy.promoLead}\n\n` +
                `- ${copy.promoBulletBriefing}\n` +
                `- ${copy.promoBulletComputer}\n` +
                `- ${copy.promoBulletPro}\n\n` +
                `${copy.openLinkLabel} ${appUrl}\n\n` +
                `${copy.promoFooter}\n` +
                `${copy.supportLabel}\n`;
            const html = buildEmailShell({
                title: copy.promoTitle,
                intro: greet,
                footerTransactional: copy.promoFooter,
                bodyHtml:
                    emailParagraph(escapeHtml(copy.promoLead)) +
                    emailBullets([
                        escapeHtml(copy.promoBulletBriefing),
                        escapeHtml(copy.promoBulletComputer),
                        escapeHtml(copy.promoBulletPro),
                    ]) +
                    emailCta(appUrl, copy.promoCta, "accent") +
                    emailLinkFallback(appUrl, copy.openLinkLabel),
            });

            return sendEmail({ kind: "promo_access", to: email, subject, text, html, userId, metadata: { appUrl } });
        },
    };
}
