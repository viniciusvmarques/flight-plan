import nodemailer from "nodemailer";
import { BRAND_NAME, SITE_PROFILE } from "./site-config.js";

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

function buildEmailShell({ title, intro, bodyHtml, footerNote, footerTransactional }) {
    return `
        <div style="background:#0b1220;padding:24px;font-family:Arial,sans-serif;color:#e5e7eb;">
            <div style="max-width:640px;margin:0 auto;background:rgba(15,23,42,0.94);border:1px solid rgba(148,163,184,0.2);border-radius:18px;overflow:hidden;">
                <div style="padding:20px 24px;border-bottom:1px solid rgba(148,163,184,0.16);">
                    <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#93c5fd;font-weight:700;">${BRAND_NAME}</div>
                    <h1 style="margin:10px 0 0;font-size:24px;line-height:1.25;color:#f8fafc;">${escapeHtml(title)}</h1>
                </div>
                <div style="padding:24px;line-height:1.7;font-size:15px;color:#e2e8f0;">
                    <p style="margin:0 0 16px;">${escapeHtml(intro)}</p>
                    ${bodyHtml}
                </div>
                <div style="padding:18px 24px;border-top:1px solid rgba(148,163,184,0.16);font-size:13px;line-height:1.6;color:#94a3b8;">
                    <p style="margin:0 0 8px;">${escapeHtml(footerNote || `${BRAND_NAME} · ${SITE_PROFILE.supportEmail}`)}</p>
                    <p style="margin:0;">${escapeHtml(footerTransactional || "Mensagem transacional enviada para suporte da sua operação.")}</p>
                </div>
            </div>
        </div>
    `;
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
            footerTransactional: "Mensagem transacional enviada para suporte da sua operação.",
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
            contactConfirmIntro: (name) => `Olá ${name || ""}, recebemos sua solicitação.`,
            contactConfirmText: (name, subjectLabel) =>
                `Olá ${name || ""},\n\nRecebemos sua mensagem sobre "${subjectLabel}".\nNossa equipe analisará o pedido e responderá pelo canal informado.\n\nSuporte: ${support}\n`,
            contactConfirmSubjectLabel: "Assunto:",
            contactConfirmReturn: "Nossa equipe retornará pelo e-mail informado assim que possível.",
        },
        en: {
            hello: "Hello,",
            footerTransactional: "Transactional message sent to support your account.",
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
            contactConfirmIntro: (name) => `Hello ${name || ""}, we received your request.`,
            contactConfirmText: (name, subjectLabel) =>
                `Hello ${name || ""},\n\nWe received your message about "${subjectLabel}".\nOur team will review the request and reply through the channel you provided.\n\nSupport: ${support}\n`,
            contactConfirmSubjectLabel: "Subject:",
            contactConfirmReturn: "Our team will reply to the email you provided as soon as possible.",
        },
        es: {
            hello: "Hola,",
            footerTransactional: "Mensaje transaccional enviado para el soporte de tu cuenta.",
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
            contactConfirmIntro: (name) => `Hola ${name || ""}, recibimos tu solicitud.`,
            contactConfirmText: (name, subjectLabel) =>
                `Hola ${name || ""},\n\nRecibimos tu mensaje sobre "${subjectLabel}".\nNuestro equipo analizará la solicitud y responderá por el canal informado.\n\nSoporte: ${support}\n`,
            contactConfirmSubjectLabel: "Asunto:",
            contactConfirmReturn: "Nuestro equipo responderá al email informado lo antes posible.",
        },
    };
    return all[lang] || all["pt-BR"];
}

export function createEmailService(prisma) {
    const transporter = buildTransporter();
    const from = process.env.MAIL_FROM || `${BRAND_NAME} <contato@marquisa.com.br>`;

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
            await transporter.sendMail({ from, to, subject, text, html });
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

    async function sendTrialCancellationEmailImpl({ email, userId = null, providerEventId = null, locale = "pt-BR" }) {
        const copy = emailCopy(locale);
        const appUrl = String(process.env.APP_URL || "https://marquisa.com.br").replace(/\/$/, "");
        const subject = copy.trialCancelSubject;
        const text =
            `${copy.hello}\n\n` +
            `${copy.trialCancelTextConfirm}\n` +
            `${copy.trialCancelTextNoCharge}\n` +
            `${copy.trialCancelTextFree}\n` +
            `${copy.supportLabel}\n` +
            `${copy.accountLabel} ${appUrl}/assinatura\n`;
        const html = buildEmailShell({
            title: copy.trialCancelTitle,
            intro: copy.trialCancelIntro,
            footerTransactional: copy.footerTransactional,
            bodyHtml:
                `<p style="margin:0 0 16px;">${copy.trialCancelHtmlLead}</p>` +
                `<ul style="margin:0 0 16px;padding-left:20px;">` +
                `<li>${escapeHtml(copy.trialCancelBullet1)}</li>` +
                `<li>${escapeHtml(copy.trialCancelBullet2)}</li>` +
                `<li>${escapeHtml(copy.trialCancelBullet3)}</li>` +
                `</ul>` +
                `<p style="margin:0 0 18px;"><a href="${escapeHtml(appUrl)}/assinatura" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.manageSubscription)}</a></p>` +
                `<p style="margin:0;">${escapeHtml(copy.trialCancelChargeNote)}</p>`,
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
        async sendPasswordResetEmail({ email, resetUrl, userId = null, locale = "pt-BR" }) {
            const copy = emailCopy(locale);
            const subject = copy.passwordResetSubject;
            const text =
                `${copy.hello}\n\n` +
                `${copy.passwordResetTextBody}\n${resetUrl}\n\n` +
                `${copy.passwordResetIgnore}\n`;
            const html = buildEmailShell({
                title: copy.passwordResetTitle,
                intro: copy.passwordResetIntro,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    `<p style="margin:0 0 16px;">${escapeHtml(copy.passwordResetUseLink)}</p>` +
                    `<p style="margin:0 0 18px;"><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.passwordResetButton)}</a></p>` +
                    `<p style="margin:0 0 8px;">${escapeHtml(copy.copyPasteLink)}</p>` +
                    `<p style="margin:0;word-break:break-all;color:#bfdbfe;">${escapeHtml(resetUrl)}</p>`,
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

        async sendEmailVerificationEmail({ email, verifyUrl, userId = null, locale = "pt-BR" }) {
            const copy = emailCopy(locale);
            const subject = copy.verifySubject;
            const text =
                `${copy.hello}\n\n` +
                `${copy.verifyTextBody}\n${verifyUrl}\n\n` +
                `${copy.verifyIgnore}\n`;
            const html = buildEmailShell({
                title: copy.verifyTitle,
                intro: copy.verifyIntro,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    `<p style="margin:0 0 16px;">${escapeHtml(copy.verifyClick)}</p>` +
                    `<p style="margin:0 0 18px;"><a href="${escapeHtml(verifyUrl)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.verifyButton)}</a></p>` +
                    `<p style="margin:0 0 8px;">${escapeHtml(copy.copyPasteLink)}</p>` +
                    `<p style="margin:0;word-break:break-all;color:#bfdbfe;">${escapeHtml(verifyUrl)}</p>`,
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

        async sendWelcomeEmail({ email, userId = null, locale = "pt-BR" }) {
            const copy = emailCopy(locale);
            const subject = copy.welcomeSubject;
            const appUrl = String(process.env.APP_URL || "https://marquisa.com.br").replace(/\/$/, "");
            const text =
                `${copy.hello}\n\n` +
                `${copy.welcomeLead}\n\n` +
                `${copy.welcomeReady}\n` +
                `${copy.welcomeFeaturesText}\n\n` +
                `${copy.openLinkLabel} ${appUrl}\n\n` +
                `${copy.welcomeDisclaimerText}\n\n` +
                `${copy.supportLabel}\n`;
            const html = buildEmailShell({
                title: copy.welcomeTitle,
                intro: copy.welcomeIntro,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    `<p style="margin:0 0 16px;">${escapeHtml(copy.welcomeCanUse)}</p>` +
                    `<ul style="margin:0 0 16px;padding-left:20px;">` +
                    `<li>${escapeHtml(copy.welcomeBulletMetar)}</li>` +
                    `<li>${escapeHtml(copy.welcomeBulletBriefing)}</li>` +
                    `<li>${escapeHtml(copy.welcomeBulletPlanner)}</li>` +
                    `<li>${escapeHtml(copy.welcomeBulletPro)}</li>` +
                    `</ul>` +
                    `<p style="margin:0 0 18px;"><a href="${escapeHtml(appUrl)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.openApp)}</a></p>` +
                    `<p style="margin:0 0 12px;padding:12px 14px;border-radius:12px;background:rgba(59,130,246,0.12);border:1px solid rgba(147,197,253,0.22);">` +
                    `<strong>${escapeHtml(copy.welcomeImportant)}</strong> ${escapeHtml(copy.welcomeDisclaimerHtml)}` +
                    `</p>` +
                    `<p style="margin:0;">${escapeHtml(copy.supportNeedHelp)}</p>`,
            });

            return sendEmail({ kind: "welcome", to: email, subject, text, html, userId, metadata: { appUrl } });
        },

        async sendSubscriptionActivatedEmail({ email, currentPeriodEnd, userId = null, providerEventId = null, locale = "pt-BR" }) {
            const copy = emailCopy(locale);
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
            const appUrl = String(process.env.APP_URL || "https://marquisa.com.br").replace(/\/$/, "");
            const subject = copy.proSubject;
            const text =
                `${copy.hello}\n\n` +
                `${copy.proThanksText}\n\n` +
                `${copy.proActivatedText}\n` +
                `${copy.nextMilestone} ${endLabel}.\n\n` +
                `${copy.proManageText}\n` +
                `${copy.openLinkLabel} ${appUrl}\n\n` +
                `${copy.supportLabel}\n`;
            const html = buildEmailShell({
                title: copy.proTitle,
                intro: copy.proIntro,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    `<p style="margin:0 0 16px;">${copy.proActivatedHtml}</p>` +
                    `<ul style="margin:0 0 16px;padding-left:20px;">` +
                    `<li>${escapeHtml(copy.proBulletSync)}</li>` +
                    `<li>${escapeHtml(copy.proBulletReopen)}</li>` +
                    `<li>${escapeHtml(copy.proBulletBilling)}</li>` +
                    `</ul>` +
                    `<p style="margin:0 0 12px;">${escapeHtml(copy.nextMilestone)} <strong>${escapeHtml(endLabel)}</strong>.</p>` +
                    `<p style="margin:0 0 18px;"><a href="${escapeHtml(appUrl)}/assinatura" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.manageSubscription)}</a></p>` +
                    `<p style="margin:0;padding:12px 14px;border-radius:12px;background:rgba(59,130,246,0.12);border:1px solid rgba(147,197,253,0.22);">` +
                    `${escapeHtml(copy.proPolicyNote)}` +
                    `</p>`,
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

        async sendSubscriptionRenewedEmail({ email, currentPeriodEnd, userId = null, providerEventId = null, locale = "pt-BR" }) {
            const copy = emailCopy(locale);
            const endLabel = currentPeriodEnd
                ? new Date(currentPeriodEnd).toLocaleDateString(dateLocaleFor(locale))
                : copy.nextCycleFallback;
            const subject = copy.renewedSubject;
            const text =
                `${copy.hello}\n\n` +
                `${copy.renewedText}\n` +
                `${copy.nextMilestone} ${endLabel}.\n`;
            const html = buildEmailShell({
                title: copy.renewedTitle,
                intro: copy.renewedIntro,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    `<p style="margin:0 0 16px;">${copy.renewedActiveHtml}</p>` +
                    `<p style="margin:0;">${escapeHtml(copy.nextMilestone)} <strong>${escapeHtml(endLabel)}</strong>.</p>`,
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

        async sendPaymentFailedEmail({ email, hostedInvoiceUrl = null, userId = null, providerEventId = null, locale = "pt-BR" }) {
            const copy = emailCopy(locale);
            const subject = copy.paymentFailedSubject;
            const text =
                `${copy.hello}\n\n` +
                `${copy.paymentFailedText}\n` +
                `${hostedInvoiceUrl ? `${copy.paymentFailedReviewLink} ${hostedInvoiceUrl}\n` : ""}` +
                `${copy.supportHelp}\n`;
            const html = buildEmailShell({
                title: copy.paymentFailedTitle,
                intro: copy.paymentFailedIntro,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    `<p style="margin:0 0 16px;">${escapeHtml(copy.paymentFailedBody)}</p>` +
                    (hostedInvoiceUrl
                        ? `<p style="margin:0 0 18px;"><a href="${escapeHtml(hostedInvoiceUrl)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.paymentFailedReviewButton)}</a></p>`
                        : "") +
                    `<p style="margin:0;">${escapeHtml(copy.supportHelp)}</p>`,
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
                    `<p style="margin:0 0 16px;">${escapeHtml(copy.contactConfirmSubjectLabel)} <strong>${escapeHtml(subjectLabel)}</strong></p>` +
                    `<p style="margin:0;">${escapeHtml(copy.contactConfirmReturn)}</p>`,
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
                    `<p style="margin:0 0 10px;"><strong>E-mail:</strong> ${escapeHtml(email)}</p>` +
                    `<p style="margin:0 0 10px;"><strong>Idioma:</strong> ${escapeHtml(preferredLocale)}</p>` +
                    `<p style="margin:0 0 10px;"><strong>Data (Brasília):</strong> ${escapeHtml(when)}</p>` +
                    `<p style="margin:0 0 10px;"><strong>Status:</strong> ${escapeHtml(statusLabel)}</p>` +
                    `<p style="margin:0;"><strong>User ID:</strong> ${escapeHtml(userId || "—")}</p>`,
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
                    `<p style="margin:0 0 10px;"><strong>Nome:</strong> ${escapeHtml(message.name)}</p>` +
                    `<p style="margin:0 0 10px;"><strong>E-mail:</strong> ${escapeHtml(message.email)}</p>` +
                    `<p style="margin:0 0 10px;"><strong>Assunto:</strong> ${escapeHtml(message.subject)}</p>` +
                    `<p style="margin:0;"><strong>Mensagem:</strong><br />${nl2br(message.message)}</p>`,
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
        }) {
            const copy = emailCopy(locale);
            const endLabel = currentPeriodEnd
                ? new Date(currentPeriodEnd).toLocaleDateString(dateLocaleFor(locale))
                : copy.endOfCurrentCycle;
            const appUrl = String(process.env.APP_URL || "https://marquisa.com.br").replace(/\/$/, "");
            const subject = duringTrial ? copy.scheduledCancelTrialSubject : copy.scheduledCancelSubject;
            const title = duringTrial ? copy.trialCancelTitle : copy.scheduledCancelTitle;
            const intro = duringTrial ? copy.scheduledCancelTrialIntro : copy.scheduledCancelIntro;
            const text = duringTrial
                ? `${copy.hello}\n\n${copy.scheduledCancelTrialText}\n` +
                  `${copy.scheduledCancelTrialAccess(endLabel)}\n` +
                  `${copy.supportLabel}\n`
                : `${copy.hello}\n\n${copy.scheduledCancelAfterText}\n` +
                  `${copy.scheduledCancelAfterAccess(endLabel)}\n` +
                  `${copy.supportLabel}\n`;
            const escapedEnd = escapeHtml(endLabel);
            const html = buildEmailShell({
                title,
                intro,
                footerTransactional: copy.footerTransactional,
                bodyHtml: duringTrial
                    ? `<p style="margin:0 0 16px;">${copy.scheduledCancelTrialHtmlLead}</p>` +
                      `<ul style="margin:0 0 16px;padding-left:20px;">` +
                      `<li>${copy.scheduledCancelTrialBullet1(escapedEnd)}</li>` +
                      `<li>${copy.scheduledCancelTrialBullet2}</li>` +
                      `<li>${escapeHtml(copy.scheduledCancelTrialBullet3)}</li>` +
                      `</ul>` +
                      `<p style="margin:0;">${escapeHtml(copy.doubts)}</p>`
                    : `<p style="margin:0 0 16px;">${copy.scheduledCancelAfterHtmlLead(escapedEnd)}</p>` +
                      `<ul style="margin:0 0 16px;padding-left:20px;">` +
                      `<li>${escapeHtml(copy.scheduledCancelAfterBullet1)}</li>` +
                      `<li>${escapeHtml(copy.scheduledCancelAfterBullet2)}</li>` +
                      `<li>${escapeHtml(copy.scheduledCancelAfterBullet3)}</li>` +
                      `</ul>` +
                      `<p style="margin:0 0 18px;"><a href="${escapeHtml(appUrl)}/assinatura" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.manageSubscription)}</a></p>` +
                      `<p style="margin:0;">${escapeHtml(copy.scheduledCancelRefund)}</p>`,
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

        async sendSubscriptionCanceledEmail({ email, userId = null, providerEventId = null, locale = "pt-BR", reason = "ended" }) {
            if (reason === "trial") {
                return sendTrialCancellationEmailImpl({ email, userId, providerEventId, locale });
            }

            const copy = emailCopy(locale);
            const appUrl = String(process.env.APP_URL || "https://marquisa.com.br").replace(/\/$/, "");
            const subject = copy.endedCancelSubject;
            const text =
                `${copy.hello}\n\n` +
                `${copy.endedCancelText}\n` +
                `${copy.endedCancelResubscribe}\n` +
                `${copy.supportLabel}\n` +
                `${copy.accountLabel} ${appUrl}/assinatura\n`;
            const html = buildEmailShell({
                title: copy.endedCancelTitle,
                intro: copy.endedCancelIntro,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    `<p style="margin:0 0 16px;">${copy.endedCancelHtmlLead}</p>` +
                    `<ul style="margin:0 0 16px;padding-left:20px;">` +
                    `<li>${escapeHtml(copy.endedCancelBullet1)}</li>` +
                    `<li>${escapeHtml(copy.endedCancelBullet2)}</li>` +
                    `<li>${escapeHtml(copy.endedCancelBullet3)}</li>` +
                    `</ul>` +
                    `<p style="margin:0 0 18px;"><a href="${escapeHtml(appUrl)}/assinatura" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.manageSubscription)}</a></p>` +
                    `<p style="margin:0;">${escapeHtml(copy.supportOnly)}</p>`,
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

        async sendPasswordChangedEmail({ email, userId = null, locale = "pt-BR" }) {
            const copy = emailCopy(locale);
            const subject = copy.passwordChangedSubject;
            const text =
                `${copy.hello}\n\n` +
                `${copy.passwordChangedText}\n` +
                `${copy.passwordChangedWarn}\n`;
            const html = buildEmailShell({
                title: copy.passwordChangedTitle,
                intro: copy.passwordChangedIntro,
                footerTransactional: copy.footerTransactional,
                bodyHtml:
                    `<p style="margin:0 0 16px;">${escapeHtml(copy.passwordChangedBody)}</p>` +
                    `<p style="margin:0;">${escapeHtml(copy.supportOnly)}</p>`,
            });

            return sendEmail({ kind: "password_changed", to: email, subject, text, html, userId });
        },
    };
}
