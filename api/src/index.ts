import { EMULATOR_URL } from './server';

export interface SensorMetadata {
  sensorId: number;
  sensorName: string;
  unit: string;
}

export const sensorMetadataStore = new Map<number, SensorMetadata>();

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