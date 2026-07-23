/**
 * Envia o e-mail de novidades (promo-acesso.html) para os usuários cadastrados.
 *
 * PRIVACIDADE: cada mensagem vai com UM único destinatário em `to`.
 * Nunca coloca a lista em Cc/Bcc — ninguém vê o e-mail de outro cliente.
 *
 * Uso (na pasta backend, com DATABASE_URL e SMTP no .env):
 *
 *   # só lista / simula (não envia)
 *   node scripts/send-product-update-broadcast.mjs --dry-run
 *
 *   # teste em você primeiro
 *   node scripts/send-product-update-broadcast.mjs --only=seu@email.com
 *
 *   # só e-mails verificados
 *   node scripts/send-product-update-broadcast.mjs --verified-only
 *
 *   # envio real para todos
 *   node scripts/send-product-update-broadcast.mjs --confirm
 *
 * Opções:
 *   --delay=800     pausa entre envios (ms), padrão 800
 *   --limit=50      limita quantidade (útil para teste)
 *   --skip-sent     pula quem já recebeu kind=product_update com status sent
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createEmailService } from "../lib/email-service.js";

const prisma = new PrismaClient();
const emailService = createEmailService(prisma);

function arg(name, fallback = null) {
    const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
    if (!hit) return fallback;
    if (hit === `--${name}`) return true;
    return hit.slice(name.length + 3);
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function main() {
    const dryRun = Boolean(arg("dry-run"));
    const confirm = Boolean(arg("confirm"));
    const verifiedOnly = Boolean(arg("verified-only"));
    const skipSent = Boolean(arg("skip-sent"));
    const only = arg("only");
    const delayMs = Number(arg("delay", "800")) || 800;
    const limit = Number(arg("limit", "0")) || 0;

    if (!dryRun && !confirm && !only) {
        console.error(`
Para enviar de verdade use uma destas opções:

  --dry-run                 simula
  --only=voce@email.com     teste em 1 pessoa
  --confirm                 envia para a base

Exemplo:
  node scripts/send-product-update-broadcast.mjs --dry-run
  node scripts/send-product-update-broadcast.mjs --only=contato@marquisa.com.br
  node scripts/send-product-update-broadcast.mjs --verified-only --confirm
`);
        process.exit(1);
    }

    const where = {
        email: { not: null },
    };
    if (only && typeof only === "string") {
        where.email = { equals: only.trim().toLowerCase(), mode: "insensitive" };
    }
    if (verifiedOnly) {
        where.emailVerifiedAt = { not: null };
    }

    let users = await prisma.user.findMany({
        where,
        select: {
            id: true,
            email: true,
            firstName: true,
            preferredLocale: true,
            emailVerifiedAt: true,
        },
        orderBy: { createdAt: "asc" },
    });

    users = users.filter((u) => u.email && String(u.email).includes("@"));

    if (skipSent) {
        const already = await prisma.emailLog.findMany({
            where: {
                kind: "product_update",
                status: { in: ["sent", "console"] },
                toEmail: { in: users.map((u) => u.email) },
            },
            select: { toEmail: true },
        });
        const done = new Set(already.map((r) => r.toEmail.toLowerCase()));
        users = users.filter((u) => !done.has(u.email.toLowerCase()));
    }

    if (limit > 0) users = users.slice(0, limit);

    console.log(`Destinatários: ${users.length}`);
    console.log(`Modo: ${dryRun ? "DRY-RUN" : only ? `ONLY ${only}` : "BROADCAST"}`);
    console.log(`Delay: ${delayMs}ms | verified-only: ${verifiedOnly} | skip-sent: ${skipSent}`);
    console.log("Cada envio usa to=<um e-mail> — a lista NÃO é exposta.\n");

    let ok = 0;
    let fail = 0;

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const n = `[${i + 1}/${users.length}]`;
        try {
            await emailService.sendProductUpdateEmail({
                email: user.email,
                userId: user.id,
                dryRun,
            });
            ok += 1;
            console.log(`${n} OK  ${user.email}`);
        } catch (err) {
            fail += 1;
            console.error(`${n} FAIL ${user.email} — ${err?.message || err}`);
        }
        if (i < users.length - 1) await sleep(delayMs);
    }

    console.log(`\nConcluído. ok=${ok} fail=${fail}`);
}

main()
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
