"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../ui/card';

function PackSocBar({ packSoc }: { packSoc: number }) {

  
  return (
    <Card className="rounded-none flex flex-col h-full w-1/4">
      <CardHeader className="px-2 py-0">
        <CardTitle>
          <p className="text-sm font-medium">
            PACK_SOC
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex justify-center items-center p-2">
        <div className="h-1/3 w-2/3 bg-muted rounded flex flex-row">
          <div 
            className="rounded transition-all duration-500"
            style={{
              width: `${(packSoc / 100) * 100}%`,
              backgroundColor: 'hsl(var(--chart-2))'
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default PackSocBar;