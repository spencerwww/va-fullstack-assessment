"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../ui/card';

function BrakeBar({ pressure }: { pressure: number }) {

  
  return (
    <Card className="rounded-none flex flex-col h-full w-1/4">
      <CardHeader className="px-2 py-0">
        <CardTitle>
          <p className="text-sm font-medium">
            BRAKE_PRESSURE_FRONT
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex justify-center items-end p-2">
        <div className="h-full w-1/3 bg-muted rounded flex flex-col-reverse">
          <div 
            className="rounded w-full transition-all duration-300"
            style={{
              height: `${(pressure / 120) * 100}%`,
              backgroundColor: 'hsl(var(--chart-3))'
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default BrakeBar;