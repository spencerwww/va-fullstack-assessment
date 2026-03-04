import { Router } from "express";
import { sensorMetadataStore } from "../store";

const router = Router();
router.get('/', async (_req, res) => {
  try {
    if (sensorMetadataStore.size === 0) {
      return res.status(503).json({ error: 'Sensor metadata not yet available' });
    } 
    return res.json(Array.from(sensorMetadataStore.values()));
  } catch {
    return res.status(500).json({ error: 'Unexpected server error' });
  } 
});

router.get('/:sensorId', async (req, res) => {
  try {
    const sensorId = Number(req.params.sensorId);
    if (isNaN(sensorId)) {
      return res.status(400).json({ error: 'Invalid sensorId' });
    }

    const metadata = sensorMetadataStore.get(sensorId);
    if (!metadata) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    return res.json(metadata);
  } catch {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

export default router;