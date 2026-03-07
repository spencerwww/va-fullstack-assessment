"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../ui/card';

import Image from 'next/image';

function SteeringWheel({ angle }: { angle: number }) {
  return (
    <Card className="rounded-none flex flex-col h-full w-1/4">
      <CardHeader className="px-2 py-0">
        <CardTitle>
          <p className="text-sm font-medium">
            STEERING_ANGLE
          </p>
        </CardTitle>
      </CardHeader>    
      <CardContent className="flex-1 flex items-center justify-center p-2">
        <Image
          src="/steering-wheel.svg"
          width={120}
          height={120}
          alt="Steering wheel"
          style={{ transform: `rotate(${angle}deg)`, transition: 'transform 0.3s ease', filter: 'invert(1)'}}
        />
      </CardContent>
    </Card>
  )
}

export default SteeringWheel;