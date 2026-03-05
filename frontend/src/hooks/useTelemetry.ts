import { useEffect, useState } from "react";
import {
    SensorMetadata,
    TelemetryReading,
    fetchSensors,
    fetchTelemetry,
    subscribeToTelemetry
} from "../lib/api-client";

export function useTelemetry() {
  const [sensors, setSensors] = useState<Map<number, SensorMetadata>>(new Map());
  const [latestReadings, setLatestReadings] = useState<Map<number, TelemetryReading>>(new Map());
  const [history, setHistory] = useState<Map<number, TelemetryReading[]>>(new Map());

  useEffect(() => {
    async function initialise() {
      try {
        const sensorList = await fetchSensors();
        const sensorMap = new Map(sensorList.map(s => [s.sensorId, s]));
        setSensors(sensorMap);

        const telemetryList = await fetchTelemetry();
        const latestMap = new Map(telemetryList.map(t => [t.sensorId, t]));
        const historyMap = new Map<number, TelemetryReading[]>(
          telemetryList.map(t => [t.sensorId, [t]])
        );
        setLatestReadings(latestMap);
        setHistory(historyMap);
      } catch (e: unknown) {
        console.error("Failed to fetch sensors:", e);
      }
    }

    initialise();

    const cleanup = subscribeToTelemetry(
      (reading) => {
        const now = Date.now();
        const WINDOW_MS = 60 * 1000;

        setLatestReadings(prev => {
          const next = new Map(prev);
          next.set(reading.sensorId, reading);
          return next;
        });

        setHistory(prev => {
          const next = new Map(prev);
          const existing = next.get(reading.sensorId) ?? [];
          const updated = [...existing, reading]
            .filter(r => now - r.timestamp * 1000 <= WINDOW_MS);
          next.set(reading.sensorId, updated);
          return next;
        });                
      },
      (err) => console.error("SSE error:", err)
    );

    return cleanup;
  }, []);

  return { sensors, latestReadings, history };
}