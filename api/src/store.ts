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