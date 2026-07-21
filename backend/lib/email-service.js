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

function buildEmailShell({ title, intro, bodyHtml, footerNote }) {
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
                    <p style="margin:0;">Mensagem transacional enviada para suporte da sua operação.</p>
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

function emailCopy(locale) {
    const lang = normalizeLocale(locale);
    const all = {
        "pt-BR": {
            passwordResetSubject: `${BRAND_NAME} — redefinição de senha`,
            passwordResetTitle: "Redefinição de senha",
            passwordResetIntro: "Recebemos um pedido para redefinir a senha da sua conta.",
            passwordResetButton: "Redefinir senha",
            verifySubject: `${BRAND_NAME} — confirme seu e-mail`,
            verifyTitle: "Confirme seu e-mail",
            verifyIntro: "Recebemos um pedido de criação de conta e precisamos validar seu endereço de e-mail.",
            verifyButton: "Confirmar e-mail",
            welcomeSubject: `${BRAND_NAME} — bem-vindo a bordo`,
            welcomeTitle: "Bem-vindo a bordo",
            welcomeIntro: "Seu e-mail foi confirmado e sua conta Marquisa está pronta para uso.",
            openApp: "Abrir Marquisa",
            proSubject: `${BRAND_NAME} — plano Pro ativado`,
            proTitle: "Plano Pro ativado",
            proIntro: "Obrigado por assinar. Seu acesso premium já está disponível.",
            manageSubscription: "Gerenciar assinatura",
            trialCancelSubject: `${BRAND_NAME} — cancelamento no período de teste`,
            trialCancelTitle: "Cancelamento no período de teste",
            trialCancelIntro: "Confirmamos o cancelamento da sua assinatura Pro durante o trial de 7 dias.",
            scheduledCancelSubject: `${BRAND_NAME} — cancelamento programado`,
            scheduledCancelTitle: "Cancelamento programado",
            scheduledCancelIntro: "Recebemos seu pedido de cancelamento após o período de teste.",
            endedCancelSubject: `${BRAND_NAME} — assinatura encerrada`,
            endedCancelTitle: "Assinatura encerrada",
            endedCancelIntro: "Seu ciclo Pro foi finalizado e a conta voltou ao plano FREE.",
        },
        en: {
            passwordResetSubject: `${BRAND_NAME} — password reset`,
            passwordResetTitle: "Password reset",
            passwordResetIntro: "We received a request to reset your account password.",
            passwordResetButton: "Reset password",
            verifySubject: `${BRAND_NAME} — confirm your email`,
            verifyTitle: "Confirm your email",
            verifyIntro: "We received an account creation request and need to validate your email address.",
            verifyButton: "Confirm email",
            welcomeSubject: `${BRAND_NAME} — welcome aboard`,
            welcomeTitle: "Welcome aboard",
            welcomeIntro: "Your email has been confirmed and your Marquisa account is ready to use.",
            openApp: "Open Marquisa",
            proSubject: `${BRAND_NAME} — Pro plan activated`,
            proTitle: "Pro plan activated",
            proIntro: "Thank you for subscribing. Your premium access is now available.",
            manageSubscription: "Manage subscription",
            trialCancelSubject: `${BRAND_NAME} — trial cancellation confirmed`,
            trialCancelTitle: "Trial cancellation confirmed",
            trialCancelIntro: "We confirmed your Pro subscription cancellation during the 7-day trial.",
            scheduledCancelSubject: `${BRAND_NAME} — cancellation scheduled`,
            scheduledCancelTitle: "Cancellation scheduled",
            scheduledCancelIntro: "We received your cancellation request after the trial period.",
            endedCancelSubject: `${BRAND_NAME} — subscription ended`,
            endedCancelTitle: "Subscription ended",
            endedCancelIntro: "Your Pro cycle has ended and your account is back on the FREE plan.",
        },
        es: {
            passwordResetSubject: `${BRAND_NAME} — redefinir contraseña`,
            passwordResetTitle: "Redefinir contraseña",
            passwordResetIntro: "Recibimos una solicitud para redefinir la contraseña de tu cuenta.",
            passwordResetButton: "Redefinir contraseña",
            verifySubject: `${BRAND_NAME} — confirma tu email`,
            verifyTitle: "Confirma tu email",
            verifyIntro: "Recibimos una solicitud de creación de cuenta y necesitamos validar tu dirección de email.",
            verifyButton: "Confirmar email",
            welcomeSubject: `${BRAND_NAME} — bienvenido a bordo`,
            welcomeTitle: "Bienvenido a bordo",
            welcomeIntro: "Tu email fue confirmado y tu cuenta Marquisa está lista para usar.",
            openApp: "Abrir Marquisa",
            proSubject: `${BRAND_NAME} — plan Pro activado`,
            proTitle: "Plan Pro activado",
            proIntro: "Gracias por suscribirte. Tu acceso premium ya está disponible.",
            manageSubscription: "Gestionar suscripción",
            trialCancelSubject: `${BRAND_NAME} — cancelación en período de prueba`,
            trialCancelTitle: "Cancelación en período de prueba",
            trialCancelIntro: "Confirmamos la cancelación de tu suscripción Pro durante el trial de 7 días.",
            scheduledCancelSubject: `${BRAND_NAME} — cancelación programada`,
            scheduledCancelTitle: "Cancelación programada",
            scheduledCancelIntro: "Recibimos tu solicitud de cancelación después del período de prueba.",
            endedCancelSubject: `${BRAND_NAME} — suscripción finalizada`,
            endedCancelTitle: "Suscripción finalizada",
            endedCancelIntro: "Tu ciclo Pro terminó y tu cuenta volvió al plan FREE.",
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
            `Olá,\n\n` +
            `Confirmamos o cancelamento da sua assinatura Pro durante o período de teste de 7 dias.\n` +
            `Não haverá cobrança do primeiro ciclo.\n` +
            `Sua conta permanece ativa no plano FREE.\n` +
            `Suporte: ${SITE_PROFILE.supportEmail}\n` +
            `Conta: ${appUrl}/assinatura\n`;
        const html = buildEmailShell({
            title: copy.trialCancelTitle,
            intro: copy.trialCancelIntro,
            bodyHtml:
                `<p style="margin:0 0 16px;">Como o cancelamento ocorreu <strong>dentro dos 7 dias de teste</strong>, <strong>não haverá cobrança</strong> do plano Pro.</p>` +
                `<ul style="margin:0 0 16px;padding-left:20px;">` +
                `<li>assinatura encerrada imediatamente;</li>` +
                `<li>nenhuma fatura do trial será gerada;</li>` +
                `<li>sua conta continua no plano FREE.</li>` +
                `</ul>` +
                `<p style="margin:0 0 18px;"><a href="${escapeHtml(appUrl)}/assinatura" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.manageSubscription)}</a></p>` +
                `<p style="margin:0;">Se notar qualquer cobrança indevida, fale com ${escapeHtml(SITE_PROFILE.supportEmail)}.</p>`,
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
                `Olá,\n\n` +
                `Para criar uma nova senha, acesse o link abaixo (válido por tempo limitado):\n${resetUrl}\n\n` +
                `Se você não pediu isso, ignore este e-mail.\n`;
            const html = buildEmailShell({
                title: copy.passwordResetTitle,
                intro: copy.passwordResetIntro,
                bodyHtml:
                    `<p style="margin:0 0 16px;">Use o link abaixo para escolher uma nova senha:</p>` +
                    `<p style="margin:0 0 18px;"><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.passwordResetButton)}</a></p>` +
                    `<p style="margin:0 0 8px;">Se preferir, copie e cole este endereço no navegador:</p>` +
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
                `Olá,\n\n` +
                `Para ativar sua conta, confirme seu e-mail no link abaixo:\n${verifyUrl}\n\n` +
                `Se você não pediu esse cadastro, ignore esta mensagem.\n`;
            const html = buildEmailShell({
                title: copy.verifyTitle,
                intro: copy.verifyIntro,
                bodyHtml:
                    `<p style="margin:0 0 16px;">Clique no botão abaixo para ativar sua conta:</p>` +
                    `<p style="margin:0 0 18px;"><a href="${escapeHtml(verifyUrl)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.verifyButton)}</a></p>` +
                    `<p style="margin:0 0 8px;">Se preferir, copie e cole este endereço no navegador:</p>` +
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
                `Olá,\n\n` +
                `Bem-vindo ao ${BRAND_NAME}.\n\n` +
                `Seu e-mail foi confirmado e sua conta está pronta para uso.\n` +
                `Você já pode consultar METAR/TAF, montar briefings e usar o planejador de voo VFR/IFR.\n\n` +
                `Acesse: ${appUrl}\n\n` +
                `Lembrete importante: o ${BRAND_NAME} é uma ferramenta de apoio e estudo. Sempre valide informações operacionais em fontes oficiais, cartas, NOTAM, ROTAER/AIS/MET e documentação aplicável.\n\n` +
                `Suporte: ${SITE_PROFILE.supportEmail}\n`;
            const html = buildEmailShell({
                title: copy.welcomeTitle,
                intro: copy.welcomeIntro,
                bodyHtml:
                    `<p style="margin:0 0 16px;">A partir de agora você pode usar o painel para:</p>` +
                    `<ul style="margin:0 0 16px;padding-left:20px;">` +
                    `<li>consultar METAR e TAF de aeródromos;</li>` +
                    `<li>organizar briefing meteorológico e operacional;</li>` +
                    `<li>montar planejamento de voo VFR/IFR com rota, nível, combustível e alternado;</li>` +
                    `<li>salvar briefings e favoritos ao evoluir para recursos Pro.</li>` +
                    `</ul>` +
                    `<p style="margin:0 0 18px;"><a href="${escapeHtml(appUrl)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.openApp)}</a></p>` +
                    `<p style="margin:0 0 12px;padding:12px 14px;border-radius:12px;background:rgba(59,130,246,0.12);border:1px solid rgba(147,197,253,0.22);">` +
                    `<strong>Importante:</strong> o ${escapeHtml(BRAND_NAME)} é uma ferramenta de apoio e estudo. Ele não substitui fontes oficiais, cartas, NOTAM, ROTAER/AIS/MET, documentação aplicável ou julgamento do piloto em comando.` +
                    `</p>` +
                    `<p style="margin:0;">Se precisar de suporte, fale com ${escapeHtml(SITE_PROFILE.supportEmail)}.</p>`,
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

            const endLabel = currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("pt-BR") : "o próximo ciclo da assinatura";
            const appUrl = String(process.env.APP_URL || "https://marquisa.com.br").replace(/\/$/, "");
            const subject = copy.proSubject;
            const text =
                `Olá,\n\n` +
                `Obrigado por assinar o ${BRAND_NAME} Pro.\n\n` +
                `Seu acesso premium foi ativado com sucesso.\n` +
                `Próximo marco comercial: ${endLabel}.\n\n` +
                `Você pode gerenciar ou cancelar sua assinatura pela área Assinatura do site.\n` +
                `Acesse: ${appUrl}\n\n` +
                `Suporte: ${SITE_PROFILE.supportEmail}\n`;
            const html = buildEmailShell({
                title: copy.proTitle,
                intro: copy.proIntro,
                bodyHtml:
                    `<p style="margin:0 0 16px;">Seu plano <strong>Pro</strong> foi ativado com sucesso.</p>` +
                    `<ul style="margin:0 0 16px;padding-left:20px;">` +
                    `<li>briefings e favoritos sincronizados;</li>` +
                    `<li>reabertura rápida de planejamentos salvos;</li>` +
                    `<li>gestão de cobrança e cancelamento pela área de assinatura.</li>` +
                    `</ul>` +
                    `<p style="margin:0 0 12px;">Próximo marco comercial: <strong>${escapeHtml(endLabel)}</strong>.</p>` +
                    `<p style="margin:0 0 18px;"><a href="${escapeHtml(appUrl)}/assinatura" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.manageSubscription)}</a></p>` +
                    `<p style="margin:0;padding:12px 14px;border-radius:12px;background:rgba(59,130,246,0.12);border:1px solid rgba(147,197,253,0.22);">` +
                    `Cancelamento, reembolso, arrependimento e comprovantes seguem as políticas publicadas no site. Em caso de dúvida, fale com ${escapeHtml(SITE_PROFILE.supportEmail)}.` +
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

        async sendSubscriptionRenewedEmail({ email, currentPeriodEnd, userId = null, providerEventId = null }) {
            const endLabel = currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("pt-BR") : "o próximo ciclo da assinatura";
            const subject = `${BRAND_NAME} — assinatura renovada`;
            const text =
                `Olá,\n\n` +
                `O pagamento do seu plano Pro foi confirmado e a assinatura foi renovada.\n` +
                `Próximo marco comercial: ${endLabel}.\n`;
            const html = buildEmailShell({
                title: "Assinatura renovada",
                intro: "Recebemos a renovação da sua assinatura.",
                bodyHtml:
                    `<p style="margin:0 0 16px;">Seu plano <strong>Pro</strong> segue ativo.</p>` +
                    `<p style="margin:0;">Próximo marco comercial: <strong>${escapeHtml(endLabel)}</strong>.</p>`,
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

        async sendPaymentFailedEmail({ email, hostedInvoiceUrl = null, userId = null, providerEventId = null }) {
            const subject = `${BRAND_NAME} — falha no pagamento da assinatura`;
            const text =
                `Olá,\n\n` +
                `Não conseguimos confirmar o pagamento da sua assinatura.\n` +
                `${hostedInvoiceUrl ? `Use este link para revisar a cobrança: ${hostedInvoiceUrl}\n` : ""}` +
                `Se precisar de ajuda, fale com ${SITE_PROFILE.supportEmail}.\n`;
            const html = buildEmailShell({
                title: "Falha de pagamento",
                intro: "Não foi possível concluir a cobrança da sua assinatura.",
                bodyHtml:
                    `<p style="margin:0 0 16px;">Seu acesso premium pode ficar restrito até a regularização.</p>` +
                    (hostedInvoiceUrl
                        ? `<p style="margin:0 0 18px;"><a href="${escapeHtml(hostedInvoiceUrl)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">Revisar cobrança</a></p>`
                        : "") +
                    `<p style="margin:0;">Se precisar de ajuda, fale com ${escapeHtml(SITE_PROFILE.supportEmail)}.</p>`,
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

        async sendContactConfirmationEmail({ email, name, subjectLabel, userId = null, contactMessageId = null }) {
            const subject = `${BRAND_NAME} — recebemos sua mensagem`;
            const text =
                `Olá ${name || ""},\n\n` +
                `Recebemos sua mensagem sobre "${subjectLabel}".\n` +
                `Nossa equipe analisará o pedido e responderá pelo canal informado.\n\n` +
                `Suporte: ${SITE_PROFILE.supportEmail}\n`;
            const html = buildEmailShell({
                title: "Mensagem recebida",
                intro: `Olá ${name || ""}, recebemos sua solicitação.`,
                bodyHtml:
                    `<p style="margin:0 0 16px;">Assunto: <strong>${escapeHtml(subjectLabel)}</strong></p>` +
                    `<p style="margin:0;">Nossa equipe retornará pelo e-mail informado assim que possível.</p>`,
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
            const dateLocale = normalizeLocale(locale) === "en" ? "en-US" : normalizeLocale(locale) === "es" ? "es-ES" : "pt-BR";
            const endLabel = currentPeriodEnd
                ? new Date(currentPeriodEnd).toLocaleDateString(dateLocale)
                : normalizeLocale(locale) === "en"
                  ? "the end of the current cycle"
                  : normalizeLocale(locale) === "es"
                    ? "el final del ciclo actual"
                    : "o fim do ciclo atual";
            const appUrl = String(process.env.APP_URL || "https://marquisa.com.br").replace(/\/$/, "");
            const subject = duringTrial
                ? `${BRAND_NAME} — cancelamento no trial confirmado`
                : copy.scheduledCancelSubject;
            const title = duringTrial ? copy.trialCancelTitle : copy.scheduledCancelTitle;
            const intro = duringTrial
                ? "Confirmamos o cancelamento durante o período de teste. Não haverá cobrança ao final do trial."
                : copy.scheduledCancelIntro;
            const text = duringTrial
                ? `Olá,\n\nConfirmamos o cancelamento da assinatura Pro durante o trial.\n` +
                  `Seu acesso segue até ${endLabel}. Depois disso, a conta volta ao FREE e não haverá cobrança.\n` +
                  `Suporte: ${SITE_PROFILE.supportEmail}\n`
                : `Olá,\n\nSeu cancelamento foi registrado após o período de teste.\n` +
                  `O plano Pro permanece ativo até ${endLabel}. Depois disso, não haverá renovação nem nova cobrança.\n` +
                  `Suporte: ${SITE_PROFILE.supportEmail}\n`;
            const html = buildEmailShell({
                title,
                intro,
                bodyHtml: duringTrial
                    ? `<p style="margin:0 0 16px;">Cancelamento registrado <strong>dentro dos 7 dias de teste</strong>.</p>` +
                      `<ul style="margin:0 0 16px;padding-left:20px;">` +
                      `<li>acesso Pro até <strong>${escapeHtml(endLabel)}</strong>;</li>` +
                      `<li><strong>sem cobrança</strong> ao fim do trial;</li>` +
                      `<li>depois disso, a conta segue no plano FREE.</li>` +
                      `</ul>` +
                      `<p style="margin:0;">Dúvidas: ${escapeHtml(SITE_PROFILE.supportEmail)}.</p>`
                    : `<p style="margin:0 0 16px;">Como o pedido foi feito <strong>depois dos 7 dias de teste</strong>, o acesso Pro segue até <strong>${escapeHtml(endLabel)}</strong>.</p>` +
                      `<ul style="margin:0 0 16px;padding-left:20px;">` +
                      `<li>não haverá renovação automática após essa data;</li>` +
                      `<li>não geramos nova cobrança no próximo ciclo;</li>` +
                      `<li>sua conta permanece disponível no plano FREE.</li>` +
                      `</ul>` +
                      `<p style="margin:0 0 18px;"><a href="${escapeHtml(appUrl)}/assinatura" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.manageSubscription)}</a></p>` +
                      `<p style="margin:0;">Dúvidas ou pedido de reembolso: ${escapeHtml(SITE_PROFILE.supportEmail)}.</p>`,
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
                `Olá,\n\n` +
                `Sua assinatura Pro foi encerrada e a conta retornou ao plano FREE.\n` +
                `Você pode assinar novamente quando quiser pela área de assinatura.\n` +
                `Suporte: ${SITE_PROFILE.supportEmail}\n` +
                `Conta: ${appUrl}/assinatura\n`;
            const html = buildEmailShell({
                title: copy.endedCancelTitle,
                intro: copy.endedCancelIntro,
                bodyHtml:
                    `<p style="margin:0 0 16px;">O ciclo premium terminou. Sua conta agora está no plano <strong>FREE</strong>.</p>` +
                    `<ul style="margin:0 0 16px;padding-left:20px;">` +
                    `<li>não haverá novas cobranças desta assinatura;</li>` +
                    `<li>briefings locais e ferramentas básicas seguem disponíveis;</li>` +
                    `<li>você pode reativar o Pro a qualquer momento.</li>` +
                    `</ul>` +
                    `<p style="margin:0 0 18px;"><a href="${escapeHtml(appUrl)}/assinatura" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(copy.manageSubscription)}</a></p>` +
                    `<p style="margin:0;">Suporte: ${escapeHtml(SITE_PROFILE.supportEmail)}.</p>`,
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

        async sendPasswordChangedEmail({ email, userId = null }) {
            const subject = `${BRAND_NAME} — senha alterada com sucesso`;
            const text =
                `Olá,\n\n` +
                `A senha da sua conta foi alterada com sucesso.\n` +
                `Se você não reconhece essa ação, redefina a senha imediatamente e fale com ${SITE_PROFILE.supportEmail}.\n`;
            const html = buildEmailShell({
                title: "Senha alterada",
                intro: "Sua senha foi atualizada com sucesso.",
                bodyHtml:
                    `<p style="margin:0 0 16px;">Se você não reconhece essa ação, redefina a senha imediatamente.</p>` +
                    `<p style="margin:0;">Suporte: ${escapeHtml(SITE_PROFILE.supportEmail)}.</p>`,
            });

            return sendEmail({ kind: "password_changed", to: email, subject, text, html, userId });
        },
    };
}
