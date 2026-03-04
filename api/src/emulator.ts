import WebSocket from 'ws';
import { EMULATOR_URL } from './server';
import {
  SensorMetadata,
  sensorMetadataStore,
  latestReadingsStore
} from './store';
import { parseReading, checkOutOfRange } from './validation';

export async function loadSensorMetadata() {
  try {
    const r = await fetch(`${EMULATOR_URL.replace(/\/$/, '')}/sensors`);
    if (r.ok) {
        const sensors: SensorMetadata[] = await r.json();
        sensors.forEach(s => sensorMetadataStore.set(s.sensorId, s));
    }
  } catch {
    console.error('Failed to load sensor metadata from emulator, retrying in 3 seconds...');
    setTimeout(loadSensorMetadata, 3000);
  };
}

export function connectToEmulator() {
  const wsUrl = `${EMULATOR_URL.replace(/^http/, 'ws')}`;

  const ws = new WebSocket(`${wsUrl}/ws/telemetry`);

  ws.on('open', () => {
    console.log('Connected to emulator WebSocket');
  });

  ws.on('message', (data) => {
    try {
      const raw: unknown = JSON.parse(data.toString());
      const parsed = parseReading(raw);
      if (parsed) {
        latestReadingsStore.set(parsed.sensorId, parsed);
        checkOutOfRange(parsed);
      }
    } catch (err) {
      console.error('Failed to parse reading: ', err);
    }
  });

  ws.on('close', () => {
    console.log('Emulator WebSocket connection closed. Reconnecting in 3 seconds...');
    setTimeout(connectToEmulator, 3000);
  });

  ws.on('error', (err) => {
    console.error('Emulator WebSocket error:', err);
    ws.terminate();
  });
}