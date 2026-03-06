"use client"

import { cn } from "../../lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface TelemetryProps {
  sensorName: string;
  value: number;
  unit: string;
}

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

function SensorCard({ sensorName, value, unit }: TelemetryProps) {

  const range = VALID_RANGES[sensorName];
  if (!range) return null;
  const span = range.max - range.min;
  const buffer = span * 0.1;

  const getColour = () => {
    if (value > range.max || value < range.min) return "bg-red-500/20 border-red-500 text-red-400"
    if (value > (range.max - buffer) || value < (range.min + buffer)) return "bg-yellow-500/20 border-yellow-500 text-yellow-400"
    return "bg-green-500/20 border-green-500 text-green-400"
  }

  return (
    <Card className={
      cn(
        "rounded-sm px-3 py-1",
        getColour()
      )
    }>
      <p className="text-xs">{sensorName}</p>
      <p className="flex items-baseline justify-between">
        <span className="text-2xl font-bold">{value.toFixed(1)}</span>
        <span className="text-lg">{unit}</span>
      </p>
    </Card>
  )
}

export default SensorCard;
