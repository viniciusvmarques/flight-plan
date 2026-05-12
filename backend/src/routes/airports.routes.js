import express from "express";
import { getAirportInfo } from "../services/airports.service.js";

const router = express.Router();

// compat com seu frontend atual: /api/airport?icao=SBGR
router.get("/airport", (req, res) => {
    try {
        const icao = req.query.icao;
        const info = getAirportInfo(icao);
        res.json(info);
    } catch (e) {
        res.status(400).json({ error: e?.message || "Falha ao buscar aeródromo" });
    }
});

// rota alternativa (se quiser usar no futuro): /api/airports/SBGR
router.get("/airports/:icao", (req, res) => {
    try {
        const info = getAirportInfo(req.params.icao);
        res.json(info);
    } catch (e) {
        res.status(400).json({ error: e?.message || "Falha ao buscar aeródromo" });
    }
});

export default router;
