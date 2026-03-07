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
  colour: string;
}

const chartConfig = {
  value: {
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function SensorChart({ sensorName, unit, reading, history, colour = "hsl((var--chart-1))" }: SensorChartProps) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - 60;

  const range = VALID_RANGES[sensorName];
  const span = range.max - range.min;
  const buffer = span * 0.6;

  return (
    <Card className="rounded-none flex flex-col h-full w-full">
      <CardHeader className="flex-none px-2 py-0">
        <CardTitle>
          <p className="text-sm font-medium">
            {sensorName}:
            <span className="ml-4">{reading ? `${reading.value.toFixed(1)}` : '—'}</span>
            <span className="text-xs text-muted-foreground ml-1">{unit}</span>
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ChartContainer className="h-full w-full" config={chartConfig}>
          <LineChart data={history} margin={{ top: 1, right: 1, left: 1, bottom: 1 }}>
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
              stroke={colour}
              dot={false}
              isAnimationActive={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ReferenceArea y1={range.max} y2={range.max + buffer} fill="red" fillOpacity={0.2} />
            <ReferenceArea y1={range.min - buffer} y2={range.min} fill="red" fillOpacity={0.2} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default SensorChart;