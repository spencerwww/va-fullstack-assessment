import http from 'http';
import express from 'express';
import cors from 'cors';

import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';

import { loadSensorMetadata, connectToEmulator } from './emulator';
import sensorsRouter from './routes/sensors';
import healthRouter from './routes/health';
import telemetryRouter from './routes/telemetry';

const app = express();
const openapiSpec = yaml.load(fs.readFileSync('./openapi.yaml', 'utf-8')) as object;
app.use(cors({ origin: true, credentials: false }));
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Default to local emulator when EMULATOR_URL is not provided.
export const EMULATOR_URL = process.env.EMULATOR_URL || 'http://localhost:3001';

app.use('/health', healthRouter);

// ---------------------------------------------------------------------------
// Assessment: implement the API below.
// The emulator is a black box: it only outputs data. Its base URL is EMULATOR_URL
// (e.g. http://emulator:3001 with Docker, or http://localhost:3001 locally).
// Emulator exposes only:
//   GET {EMULATOR_URL}/sensors   → static metadata (sensorId, sensorName, unit)
//   WS  {EMULATOR_URL}/ws/telemetry → stream of readings { sensorId, value, timestamp }
// The emulator does not store or serve "latest" readings. You must:
// - Connect to the emulator WebSocket stream.
// - Store the latest value per sensor in the API as readings arrive.
// - Expose your own metadata and "latest telemetry" routes to clients.
// Do not modify the emulator service.
// ---------------------------------------------------------------------------

app.use('/sensors', sensorsRouter);
app.use('/telemetry', telemetryRouter);

const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(Number(PORT), HOST, () => {
  console.log(`API server listening on http://${HOST}:${PORT}`);
  loadSensorMetadata();
  connectToEmulator();
});
