import { Router } from "express";
import { latestReadingsStore, sseClients } from "../store";

const router = Router();

router.get('/', async (_req, res) => {
    try {
        return res.json(Array.from(latestReadingsStore.values()));
    } catch {
        return res.status(500).json({ error: 'Unexpected server error' });
    }
});

router.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.add(res);

    req.on('close', () => {
        sseClients.delete(res);
    });
});

router.get('/:sensorId', async (req, res) => {
    try {
        const sensorId = Number(req.params.sensorId);
        if (isNaN(sensorId)) {
            return res.status(400).json({ error: 'Invalid sensorId' });
        }

        const reading = latestReadingsStore.get(sensorId);
        if (!reading) {
            return res.status(404).json({ error: 'Reading not found for sensorId' });
        }

        return res.json(reading);
    } catch {
        return res.status(500).json({ error: 'Unexpected server error' });
    }
});

export default router;