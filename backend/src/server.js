import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import airportsRoutes from "./routes/airports.routes.js";


import weatherRoutes from "./routes/weather.routes.js";
import { prisma } from "./prisma.js";

const app = express();

const PORT = Number(process.env.PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Middlewares
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Rotas existentes
app.use("/api/weather", weatherRoutes);
app.use("/api", airportsRoutes);


// Health
app.get("/", (req, res) => res.send("API OK"));

// ===== Auth middleware =====
function requireAuth(req, res, next) {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Não autenticado." });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload; // { sub, email }
        next();
    } catch {
        return res.status(401).json({ error: "Sessão inválida." });
    }
}

// DB check (opcional)
app.get("/api/db-check", async (req, res) => {
    const users = await prisma.user.count();
    res.json({ ok: true, users });
});

// ===== REGISTER =====
// Body: { email, password, consent: { accepted: true } }
app.post("/auth/register", async (req, res) => {
    const { email, password, consent } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !password) {
        return res.status(400).json({ error: "Informe e-mail e senha." });
    }
    if (!consent?.accepted) {
        return res.status(400).json({ error: "Você precisa aceitar os termos/política." });
    }

    const exists = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (exists) return res.status(400).json({ error: "Este e-mail já está cadastrado." });

    const hash = await bcrypt.hash(String(password), 10);

    const user = await prisma.user.create({
        data: {
            email: cleanEmail,
            password: hash,
            plan: "FREE",
            consents: { create: { acceptedAt: new Date() } },
        },
        select: { id: true, email: true, plan: true, createdAt: true },
    });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
});

// ===== LOGIN =====
// Body: { email, password }
app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !password) {
        return res.status(400).json({ error: "Informe e-mail e senha." });
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) return res.status(401).json({ error: "E-mail ou senha inválidos." });

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ error: "E-mail ou senha inválidos." });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
        token,
        user: { id: user.id, email: user.email, plan: user.plan, createdAt: user.createdAt },
    });
});

// ===== ME =====
app.get("/me", requireAuth, async (req, res) => {
    const me = await prisma.user.findUnique({
        where: { id: req.user.sub },
        select: { id: true, email: true, plan: true, createdAt: true },
    });
    res.json({ user: me });
});

// Erro padrão
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Erro interno." });
});

app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
});
