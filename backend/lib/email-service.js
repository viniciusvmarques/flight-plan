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

    return {
        async sendPasswordResetEmail({ email, resetUrl, userId = null }) {
            const subject = `${BRAND_NAME} — redefinição de senha`;
            const text =
                `Olá,\n\n` +
                `Para criar uma nova senha, acesse o link abaixo (válido por tempo limitado):\n${resetUrl}\n\n` +
                `Se você não pediu isso, ignore este e-mail.\n`;
            const html = buildEmailShell({
                title: "Redefinição de senha",
                intro: "Recebemos um pedido para redefinir a senha da sua conta.",
                bodyHtml:
                    `<p style="margin:0 0 16px;">Use o link abaixo para escolher uma nova senha:</p>` +
                    `<p style="margin:0 0 18px;"><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">Redefinir senha</a></p>` +
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

        async sendEmailVerificationEmail({ email, verifyUrl, userId = null }) {
            const subject = `${BRAND_NAME} — confirme seu e-mail`;
            const text =
                `Olá,\n\n` +
                `Para ativar sua conta, confirme seu e-mail no link abaixo:\n${verifyUrl}\n\n` +
                `Se você não pediu esse cadastro, ignore esta mensagem.\n`;
            const html = buildEmailShell({
                title: "Confirme seu e-mail",
                intro: "Recebemos um pedido de criação de conta e precisamos validar seu endereço de e-mail.",
                bodyHtml:
                    `<p style="margin:0 0 16px;">Clique no botão abaixo para ativar sua conta:</p>` +
                    `<p style="margin:0 0 18px;"><a href="${escapeHtml(verifyUrl)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">Confirmar e-mail</a></p>` +
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

        async sendWelcomeEmail({ email, userId = null }) {
            const subject = `${BRAND_NAME} — bem-vindo a bordo`;
            const text =
                `Olá,\n\n` +
                `Seu e-mail foi confirmado e sua conta está pronta para uso.\n` +
                `Agora você já pode gerar briefings, acompanhar METAR/TAF e evoluir seu planejamento de rota.\n\n` +
                `Suporte: ${SITE_PROFILE.supportEmail}\n`;
            const html = buildEmailShell({
                title: "Conta confirmada com sucesso",
                intro: "Seu acesso está liberado.",
                bodyHtml:
                    `<p style="margin:0 0 16px;">Agora você pode:</p>` +
                    `<ul style="margin:0 0 16px;padding-left:20px;">` +
                    `<li>gerar briefings meteorológicos;</li>` +
                    `<li>acompanhar rotas e planejamento de combustível;</li>` +
                    `<li>usar a área comercial para evoluir para o plano Pro quando desejar.</li>` +
                    `</ul>` +
                    `<p style="margin:0;">Se precisar de suporte, fale com ${escapeHtml(SITE_PROFILE.supportEmail)}.</p>`,
            });

            return sendEmail({ kind: "welcome", to: email, subject, text, html, userId });
        },

        async sendSubscriptionActivatedEmail({ email, currentPeriodEnd, userId = null, providerEventId = null }) {
            const endLabel = currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("pt-BR") : "o próximo ciclo da assinatura";
            const subject = `${BRAND_NAME} — assinatura ativada`;
            const text =
                `Olá,\n\n` +
                `Seu plano Pro foi ativado com sucesso.\n` +
                `Próximo marco comercial: ${endLabel}.\n\n` +
                `Suporte: ${SITE_PROFILE.supportEmail}\n`;
            const html = buildEmailShell({
                title: "Assinatura ativada",
                intro: "Seu acesso premium já está disponível.",
                bodyHtml:
                    `<p style="margin:0 0 16px;">Seu plano <strong>Pro</strong> foi ativado com sucesso.</p>` +
                    `<p style="margin:0;">Próximo marco comercial: <strong>${escapeHtml(endLabel)}</strong>.</p>`,
            });

            return sendEmail({
                kind: "purchase_success",
                to: email,
                subject,
                text,
                html,
                userId,
                providerEventId,
                metadata: { currentPeriodEnd: endLabel },
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

        async sendSubscriptionCancellationScheduledEmail({ email, currentPeriodEnd, userId = null, providerEventId = null }) {
            const endLabel = currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("pt-BR") : "o fim do ciclo atual";
            const subject = `${BRAND_NAME} — cancelamento programado`;
            const text =
                `Olá,\n\n` +
                `Seu cancelamento foi registrado. O plano permanece ativo até ${endLabel}.\n` +
                `Se precisar de suporte, responda para ${SITE_PROFILE.supportEmail}.\n`;
            const html = buildEmailShell({
                title: "Cancelamento programado",
                intro: "Recebemos seu pedido de cancelamento.",
                bodyHtml:
                    `<p style="margin:0 0 16px;">Seu acesso permanece ativo até <strong>${escapeHtml(endLabel)}</strong>.</p>` +
                    `<p style="margin:0;">Se precisar de ajuda, fale com ${escapeHtml(SITE_PROFILE.supportEmail)}.</p>`,
            });

            return sendEmail({
                kind: "subscription_cancellation_scheduled",
                to: email,
                subject,
                text,
                html,
                userId,
                providerEventId,
                metadata: { currentPeriodEnd: endLabel },
            });
        },

        async sendSubscriptionCanceledEmail({ email, userId = null, providerEventId = null }) {
            const subject = `${BRAND_NAME} — assinatura encerrada`;
            const text =
                `Olá,\n\n` +
                `Sua assinatura foi encerrada e sua conta retornou ao plano FREE.\n` +
                `Você pode contratar novamente quando quiser pela área de assinatura.\n`;
            const html = buildEmailShell({
                title: "Assinatura encerrada",
                intro: "Seu ciclo premium foi finalizado.",
                bodyHtml:
                    `<p style="margin:0 0 16px;">Sua conta foi revertida para o plano <strong>FREE</strong>.</p>` +
                    `<p style="margin:0;">Você pode voltar ao plano Pro a qualquer momento pela área comercial do produto.</p>`,
            });

            return sendEmail({ kind: "subscription_canceled", to: email, subject, text, html, userId, providerEventId });
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
