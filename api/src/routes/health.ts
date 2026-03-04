import { Router } from "express";
import { EMULATOR_URL } from "../server";

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const r = await fetch(`${EMULATOR_URL.replace(/\/$/, '')}/sensors`);
    if (r.ok) {
      return res.json({ status: 'ok', emulator: true });
    }
  } catch {
    // connection failed
  }
  res.status(503).json({ error: 'Service is currently unhealthy, emulator could not be reached' });
});

export default router;