"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../ui/card';

import Image from 'next/image';

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180); // -90 to start from top 
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function Speedometer({ speed }: { speed: number }) {
  if (speed < 0) speed = 0;
  if (speed > 250) speed = 250;
  const MIN_ANGLE = -135;
  const MAX_ANGLE = 135;
  const needleAngle = MIN_ANGLE + (speed / 250) * (MAX_ANGLE - MIN_ANGLE);

  const backgroundArc = arcPath(50, 50, 40, MIN_ANGLE, MAX_ANGLE);
  const needleRotation = needleAngle;

  return (
    <Card className="rounded-none flex flex-col h-full w-1/4">
      <CardHeader className="px-2 py-0">
        <CardTitle>
          <p className="text-sm font-medium">
            VEHICLE_SPEED
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-2">
        <svg viewBox="0 0 100 100" className="w-full h-full max-w-[150px]">
          <path d={backgroundArc} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" strokeLinecap="round" />
          
          <g
            style={{
              transform: `rotate(${needleRotation}deg)`,
              transformOrigin: '50px 50px',
              transition: 'transform 0.5s ease-out',
            }}
          >
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="15"
              stroke="red"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          
          <circle cx="50" cy="50" r="3" fill="white" />
          
          <text x="50" y="70" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
            {Math.round(speed)}
          </text>
        </svg>
      </CardContent>
    </Card>
  )
}

export default Speedometer