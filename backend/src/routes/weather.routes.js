import express from "express";
import { getMetar, getTaf } from "../services/weather.service.js";

const router = express.Router();

// GET /api/weather/metar/SBGR
router.get("/metar/:icao", async (req, res) => {
    try {
        const data = await getMetar(req.params.icao);
        // METAR = texto
        res.type("text/plain").send(data);
    } catch (err) {
        res.status(500).json({ error: err?.message || "Falha ao buscar METAR" });
    }
});

// GET /api/weather/taf/SBGR
router.get("/taf/:icao", async (req, res) => {
    try {
        const data = await getTaf(req.params.icao);
        // TAF = texto
        res.type("text/plain").send(data);
    } catch (err) {
        res.status(500).json({ error: err?.message || "Falha ao buscar TAF" });
    }
});

export default router;
