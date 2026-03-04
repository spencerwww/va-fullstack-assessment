import { Router } from "express";
import { latestReadingsStore } from "../index";

const router = Router();

router.get('/', async (_req, res) => {
    try {
        return res.status(200).json(Array.from(latestReadingsStore.values()));
    } catch {
        return res.status(500).json({ error: 'Unexpected server error' });
    }
});

export default router;