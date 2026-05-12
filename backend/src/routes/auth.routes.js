import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const TOKEN_EXPIRES = "7d";

function signToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email, plan: user.plan },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRES }
    );
}

router.post("/register", async (req, res) => {
    try {
        const { email, password, consent } = req.body || {};
        const cleanEmail = String(email || "").trim().toLowerCase();

        if (!cleanEmail || !password) return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
        if (String(password).length < 6) return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres." });
        if (!consent?.accepted) return res.status(400).json({ error: "Você precisa aceitar os termos/política." });

        const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existing) return res.status(409).json({ error: "Já existe conta com esse e-mail." });

        const hash = await bcrypt.hash(String(password), 10);

        const user = await prisma.user.create({
            data: {
                email: cleanEmail,
                passwordHash: hash,
                plan: "FREE",
                role: "ALUNO",
                consents: {
                    create: {
                        accepted: true,
                        ip: req.ip || null,
                        userAgent: req.headers["user-agent"] || null,
                    },
                },
            },
            select: { id: true, email: true, plan: true, role: true, createdAt: true },
        });

        const token = signToken(user);
        return res.json({ token, user });
    } catch (e) {
        return res.status(500).json({ error: e?.message || "Falha no cadastro." });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const cleanEmail = String(email || "").trim().toLowerCase();

        if (!cleanEmail || !password) return res.status(400).json({ error: "E-mail e senha são obrigatórios." });

        const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!user) return res.status(401).json({ error: "E-mail ou senha inválidos." });

        const ok = await bcrypt.compare(String(password), user.passwordHash);
        if (!ok) return res.status(401).json({ error: "E-mail ou senha inválidos." });

        const safe = { id: user.id, email: user.email, plan: user.plan, role: user.role, createdAt: user.createdAt };
        const token = signToken(safe);

        return res.json({ token, user: safe });
    } catch (e) {
        return res.status(500).json({ error: e?.message || "Falha no login." });
    }
});

// middleware simples para proteger rotas
function requireAuth(req, res, next) {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Token ausente." });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.auth = payload;
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido/expirado." });
    }
}

router.get("/me", requireAuth, async (req, res) => {
    const id = req.auth?.sub;
    if (!id) return res.status(401).json({ error: "Token inválido." });

    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, plan: true, role: true, createdAt: true },
    });

    return res.json({ user });
});

export default router;
