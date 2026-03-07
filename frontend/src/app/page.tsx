'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { fetchHealth, API_BASE_URL, fetchSensors } from '../lib/api-client';
import { useTelemetry } from '../hooks/useTelemetry';
import SensorCard from '../components/custom/sensor-card';
import SensorChart from '../components/custom/sensor-chart';
import SteeringWheel from '../components/custom/steering-wheel';
import Speedometer from '../components/custom/speedometer';
import BrakeBar from '../components/custom/brake-bar';
import PackSocBar from '../components/custom/pack-soc-bar';

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

  const sensorIdByName = useMemo(() => {
    const map = new Map<string, number>();
    sensors.forEach(s => map.set(s.sensorName, s.sensorId));
    return map;
  }, [sensors]);

  const getReading = (name: string) => latestReadings.get(sensorIdByName.get(name) ?? -1);
  const getHistory = (name: string) => history.get(sensorIdByName.get(name) ?? -1) || [];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
    
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
          <main className="flex flex-row w-full min-h-0">
            {/* Left Column */}
            <div className="flex flex-col w-2/3 min-h-0">
              {/* Top Row */}
              <div className="flex flex-col flex-[4] min-h-0">
                <div className="flex-1 min-h-0"><SensorChart
                  sensorName="PACK_CURRENT"
                  unit="A"
                  reading={getReading('PACK_CURRENT')}
                  history={getHistory('PACK_CURRENT')}
                  colour="hsl(var(--chart-2))" /></div>
                <div className="flex-1 min-h-0"><SensorChart
                  sensorName="PACK_VOLTAGE"
                  unit="V"
                  reading={getReading('PACK_VOLTAGE')}
                  history={getHistory('PACK_VOLTAGE')}
                  colour="hsl(var(--chart-2))" /></div>
              </div>
              {/* Bottom Row */}
              <div className="flex flex-col flex-[8] min-h-0">
                <div className="flex-1 min-h-0"><SensorChart
                  sensorName="VEHICLE_SPEED"
                  unit="km/h"
                  reading={getReading('VEHICLE_SPEED')}
                  history={getHistory('VEHICLE_SPEED')}
                  colour="hsl(var(--chart-3))" /></div>
                <div className="flex-1 min-h-0"><SensorChart
                  sensorName="STEERING_ANGLE"
                  unit="deg"
                  reading={getReading('STEERING_ANGLE')}
                  history={getHistory('STEERING_ANGLE')}
                  colour="hsl(var(--chart-3))" /></div>
                <div className="flex-1 min-h-0"><SensorChart
                  sensorName="BRAKE_PRESSURE_FRONT"
                  unit="bar"
                  reading={getReading('BRAKE_PRESSURE_FRONT')}
                  history={getHistory('BRAKE_PRESSURE_FRONT')}
                  colour="hsl(var(--chart-3))" /></div>

              </div>
              {/* Visual Indicators */}
              <div className="flex flex-row flex-[3] min-h-0">
                <SteeringWheel angle={getReading('STEERING_ANGLE')?.value ?? 0} />
                <Speedometer speed={getReading('VEHICLE_SPEED')?.value ?? 0}/>
                <BrakeBar pressure={getReading('BRAKE_PRESSURE_FRONT')?.value ?? 0} />
                <PackSocBar packSoc={getReading('PACK_SOC')?.value ?? 0} />
              </div>
            </div>
            {/* Right Column */}
            <div className="flex flex-col w-1/3 min-h-0">
              <div className="flex flex-col flex-[12] min-h-0">
                <div className="flex-1 min-h-0"><SensorChart
                  sensorName="TYRE_PRESSURE_FL"
                  unit="kPa"
                  reading={getReading('TYRE_PRESSURE_FL')}
                  history={getHistory('TYRE_PRESSURE_FL')}
                  colour="hsl(var(--chart-1))" /></div>
                <div className="flex-1 min-h-0"><SensorChart
                  sensorName="TYRE_PRESSURE_FR"
                  unit="kPa"
                  reading={getReading('TYRE_PRESSURE_FR')}
                  history={getHistory('TYRE_PRESSURE_FR')}
                  colour="hsl(var(--chart-1))" /></div>
                <div className="flex-1 min-h-0"><SensorChart
                  sensorName="TYRE_PRESSURE_RL"
                  unit="kPa"
                  reading={getReading('TYRE_PRESSURE_RL')}
                  history={getHistory('TYRE_PRESSURE_RL')}
                  colour="hsl(var(--chart-1))" /></div>
                <div className="flex-1 min-h-0"><SensorChart
                  sensorName="TYRE_PRESSURE_RR"
                  unit="kPa"
                  reading={getReading('TYRE_PRESSURE_RR')}
                  history={getHistory('TYRE_PRESSURE_RR')}
                  colour="hsl(var(--chart-1))" /></div>
                <div className="flex-1 min-h-0"><SensorChart
                  sensorName="MOTOR_TEMPERATURE"
                  unit="°C"
                  reading={getReading('MOTOR_TEMPERATURE')}
                  history={getHistory('MOTOR_TEMPERATURE')}
                  colour="hsl(var(--chart-5))" /></div>
                <div className="flex-1 min-h-0"><SensorChart
                  sensorName="BATTERY_TEMPERATURE"
                  unit="°C"
                  reading={getReading('BATTERY_TEMPERATURE')}
                  history={getHistory('BATTERY_TEMPERATURE')}
                  colour="hsl(var(--chart-5))" /></div>
              </div>
              <div className="flex flex-col flex-[3] min-h-0">
                <div className="flex-1 min-h-0"><SensorChart
                  sensorName="PACK_SOC"
                  unit="%"
                  reading={getReading('PACK_SOC')}
                  history={getHistory('PACK_SOC')}
                  colour="hsl(var(--chart-2))" /></div>   
                </div>
              </div>
          </main>
      </div>
    </div>
  );
}
