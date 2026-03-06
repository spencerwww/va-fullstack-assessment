"use client"

import { CartesianGrid, Line, LineChart, ReferenceArea, XAxis, YAxis} from 'recharts';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../ui/chart';
import { TelemetryReading } from '../../lib/api-client';
import { VALID_RANGES } from './sensor-card';

interface SensorChartProps {
  sensorName: string;
  unit: string;
  reading: TelemetryReading | undefined;
  history: TelemetryReading[];
}

const chartConfig = {
  value: {
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function SensorChart({ sensorName, unit, reading, history }: SensorChartProps) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - 60;

  const range = VALID_RANGES[sensorName];
  const span = range.max - range.min;
  const buffer = span * 0.6;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{sensorName}</CardTitle>
        <p className="text-2xl font-bold">
          {reading ? `${reading.value.toFixed(1)}` : '—'}
          <span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={history} margin={{ top: 2, right: 3, left: 2, bottom: 1 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={[windowStart, now]}
              tickFormatter={(ts) => new Date(ts * 1000).toLocaleTimeString()}
              scale="time"
              ticks={[windowStart, windowStart+15, windowStart+30, windowStart+45, now]}
            />
            <YAxis domain={[range.min - buffer, range.max + buffer]} />
            <Line
              type="linear"
              dataKey="value"
              stroke="hsl(var(--chart-1))"
              dot={false}
              isAnimationActive={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ReferenceArea y1={range.max} y2={range.max + buffer} fill="red" fillOpacity={0.1} />
            <ReferenceArea y1={range.min - buffer} y2={range.min} fill="red" fillOpacity={0.1} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default SensorChart;