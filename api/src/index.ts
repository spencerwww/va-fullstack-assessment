import WebSocket from 'ws';
import { EMULATOR_URL } from './server';

export interface SensorMetadata {
  sensorId: number;
  sensorName: string;
  unit: string;
}

export interface SensorReading {
  sensorId: number;
  value: number;
  timestamp: number
}

export const sensorMetadataStore = new Map<number, SensorMetadata>();
export const latestReadingsStore = new Map<number, SensorReading>();

export async function loadSensorMetadata() {
  try {
    const r = await fetch(`${EMULATOR_URL.replace(/\/$/, '')}/sensors`);
    if (r.ok) {
        const sensors: SensorMetadata[] = await r.json();
        sensors.forEach(s => sensorMetadataStore.set(s.sensorId, s));
    }
  } catch {
    console.error('Failed to load sensor metadata from emulator');
  }
}

export function connectToEmulator() {
  const wsUrl = `${EMULATOR_URL.replace(/^http/, 'ws')}`;

  const ws = new WebSocket(`${wsUrl}/ws/telemetry`);

  ws.on('open', () => {
    console.log('Connected to emulator WebSocket');
  });

  ws.on('message', (data) => {
    try {
      const reading: SensorReading = JSON.parse(data.toString());
      latestReadingsStore.set(reading.sensorId, reading);
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