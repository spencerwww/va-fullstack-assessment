'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchHealth, API_BASE_URL, fetchSensors } from '../lib/api-client';
import { useTelemetry } from '../hooks/useTelemetry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import SensorCard from '../components/custom/sensor-card';
import SensorChart from '../components/custom/sensor-chart';

export default function Page() {
  // 'checking' → initial state; 'ok' or 'unhealthy' after first health check.
  const [healthStatus, setHealthStatus] = useState<'ok' | 'unhealthy' | 'checking'>('checking');
  const [healthError, setHealthError] = useState<string | null>(null);
  const { sensors, latestReadings, history } = useTelemetry();

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        await fetchHealth();
        if (cancelled) return;
        setHealthStatus('ok');
        setHealthError(null);
      } catch (e: unknown) {
        if (cancelled) return;
        // API not reachable or reporting unhealthy.
        setHealthStatus('unhealthy');
        setHealthError(e instanceof Error ? e.message : 'Failed to reach API');
      }
    }

    // Poll /health, but only start the next check after the previous one completes,
    // so we don't accumulate overlapping requests when the API is slow/unreachable.
    (async () => {
      while (!cancelled) {
        await checkHealth();
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
    
      <header className="border-b border-border bg-background/80 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo-darkmode.svg" alt="Spyder" width={32} height={32} />
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Spyder Telemetry</h1>
              <p className="text-xs text-muted-foreground">
                Vehicle Analytics Fullstack Assessment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              API base: <span className="font-mono">{API_BASE_URL}</span>
            </div>
            <div
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                healthStatus === 'ok'
                  ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                  : healthStatus === 'checking'
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-destructive/20 text-destructive'
              }`}
            >
              {healthStatus === 'ok'
                ? 'API connected'
                : healthStatus === 'checking'
                  ? 'Checking…'
                  : 'API unreachable'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
          <aside className="w-64 flex-shrink-0 overflow-y-auto overflow-x-hidden border-r border-border bg-background p-3 flex flex-col gap-2">
            {Array.from(sensors.values()).map(sensor => {
              const reading = latestReadings.get(sensor.sensorId);
              return (
                <SensorCard
                  key={sensor.sensorId}
                  sensorName={sensor.sensorName}
                  value={reading?.value ?? 0}
                  unit={sensor.unit}
                />
              );
            })}
          </aside>
          <main className="flex flex-row w-full">
            <div className="flex flex-col w-2/3 p-4">
              <div className="flex flex-col">
                <div className="h-24"><SensorChart
                  sensorName="PACK_CURRENT"
                  unit="A"
                  reading={latestReadings.get(3000000060001)}
                  history={history.get(3000000060001) || []} /></div>
                <div className="h-24"><SensorChart
                  sensorName="PACK_VOLTAGE"
                  unit="V"
                  reading={latestReadings.get(3000000060002)}
                  history={history.get(3000000060002) || []} /></div>
              </div>
              <div className="flex flex-col">
                <div className="h-32"><SensorChart
                  sensorName="VEHICLE_SPEED"
                  unit="km/h"
                  reading={latestReadings.get(3000000060101)}
                  history={history.get(3000000060101) || []} /></div>
                <div className="h-32"><SensorChart
                  sensorName="STEERING_ANGLE"
                  unit="deg"
                  reading={latestReadings.get(3000000060102)}
                  history={history.get(3000000060102) || []} /></div>
                <div className="h-32"><SensorChart
                  sensorName="BRAKE_PRESSURE_FRONT"
                  unit="bar"
                  reading={latestReadings.get(3000000060103)}
                  history={history.get(3000000060103) || []} /></div>
              </div>
            </div>
            {/* Right Column */}
            <div className="flex flex-col w-1/3 p-4">
              <div className="h-24"><SensorChart
                sensorName="TYRE_PRESSURE_FL"
                unit="kPa"
                reading={latestReadings.get(2000000051201)}
                history={history.get(2000000051201) || []} /></div>
              <div className="h-24"><SensorChart
                sensorName="TYRE_PRESSURE_FR"
                unit="kPa"
                reading={latestReadings.get(2000000051202)}
                history={history.get(2000000051202) || []} /></div>
              <div className="h-24"><SensorChart
                sensorName="TYRE_PRESSURE_RL"
                unit="kPa"
                reading={latestReadings.get(2000000051203)}
                history={history.get(2000000051203) || []} /></div>
              <div className="h-24"><SensorChart
                sensorName="TYRE_PRESSURE_RR"
                unit="kPa"
                reading={latestReadings.get(2000000051204)}
                history={history.get(2000000051204) || []} /></div>
              <div className="h-24"><SensorChart
                sensorName="MOTOR_TEMPERATURE"
                unit="°C"
                reading={latestReadings.get(1000000070502)}
                history={history.get(1000000070502) || []} /></div>
              <div className="h-24"><SensorChart
                sensorName="BATTERY_TEMPERATURE"
                unit="°C"
                reading={latestReadings.get(1000000070501)}
                history={history.get(1000000070501) || []} /></div>
              <div className="h-24"><SensorChart
                sensorName="PACK_SOC"
                unit="%"
                reading={latestReadings.get(3000000060003)}
                history={history.get(3000000060003) || []} /></div>   
            </div>
          </main>
      </div>
    </>
  );
}
