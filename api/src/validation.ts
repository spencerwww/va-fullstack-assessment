import { SensorMetadata, SensorReading, sensorMetadataStore, latestReadingsStore } from './store';

const VALID_RANGES: Record<string, { min: number; max: number }> = {
  BATTERY_TEMPERATURE: { min: 20, max: 80 },
  MOTOR_TEMPERATURE: { min: 30, max: 120 },
  TYRE_PRESSURE_FL: { min: 150, max: 250 },
  TYRE_PRESSURE_FR: { min: 150, max: 250 },
  TYRE_PRESSURE_RL: { min: 150, max: 250 },
  TYRE_PRESSURE_RR: { min: 150, max: 250 },
  PACK_CURRENT: { min: -300, max: 300 },
  PACK_VOLTAGE: { min: 350, max: 500 },
  PACK_SOC: { min: 0, max: 100 },
  VEHICLE_SPEED: { min: 0, max: 250 },
  STEERING_ANGLE: { min: -180, max: 180 },
  BRAKE_PRESSURE_FRONT: { min: 0, max: 120 },
}

export function parseReading(raw: unknown): SensorReading | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }
  
  const r = raw as Record<string, unknown>;

  if (r.sensorId === undefined) return null;

  const sensorId = Number(r.sensorId);
  const value = Number(r.value);
  const timestamp = Number(r.timestamp);

  if (isNaN(sensorId)) {
    console.warn('Dropping reading missing sensorId: ', raw);
    return null;
  }

  if (isNaN(value)) {
    console.warn('Dropping reading with unparseable non-numeric value: ', raw);
    return null;
  }

  if (typeof r.sensorId !== 'number') {
    console.info('Recovered reading with numeric string sensorId');
  }

  if (typeof r.value !== 'number') {
    console.info('Recovered reading with numeric string value');
  }

  return { sensorId, value, timestamp };
}

const outOfRangeWindows: Record<string, number[]> = {};

export function checkOutOfRange(reading: SensorReading) {
  const metadata = sensorMetadataStore.get(reading.sensorId);
  if (!metadata) return;

  const range = VALID_RANGES[metadata.sensorName];
  if (!range) return;

  const isOutOfRange = reading.value < range.min || reading.value > range.max;
  const now = Date.now();

  if (isOutOfRange) {
    outOfRangeWindows[metadata.sensorName] ??= [];
    outOfRangeWindows[metadata.sensorName].push(now);

    outOfRangeWindows[metadata.sensorName] = outOfRangeWindows[metadata.sensorName].filter(ts => now - ts < 5000);
    if (outOfRangeWindows[metadata.sensorName].length > 3) {
      console.error(`[${new Date().toISOString()}] Out-of-range alert - Values exceeded valid min-max more than 3 times in 5 seconds: ${metadata.sensorName} (sensorId: ${reading.sensorId})`);
    }
  }
}