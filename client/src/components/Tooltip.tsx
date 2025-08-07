import { Cluster } from "@shared/schema";

interface TooltipProps {
  visible: boolean;
  x: number;
  y: number;
  data: Cluster | null;
}

export default function Tooltip({ visible, x, y, data }: TooltipProps) {
  if (!visible || !data) return null;

  return (
    <div 
      className="absolute bg-gray-900 bg-opacity-95 backdrop-blur text-white text-xs p-3 rounded shadow-lg pointer-events-none max-w-48 z-20"
      style={{ 
        left: `${x + 10}px`,
        top: `${y - 10}px`,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="font-medium mb-2">Cluster Data</div>
      <div className="space-y-1">
        <div>Price: <span className="text-green-400">${data.price.toFixed(2)}</span></div>
        <div>Volume: <span className="text-white">{data.volume.toFixed(2)} BTC</span></div>
        <div>Buy Volume: <span className="text-green-400">{data.buyVolume.toFixed(2)} BTC</span></div>
        <div>Sell Volume: <span className="text-red-400">{data.sellVolume.toFixed(2)} BTC</span></div>
        <div>Delta: <span className={data.delta > 0 ? 'text-green-400' : 'text-red-400'}>
          {data.delta > 0 ? '+' : ''}{data.delta.toFixed(2)} BTC
        </span></div>
        <div>Aggression: <span className={data.delta > 0 ? 'text-green-400' : 'text-red-400'}>
          {(data.aggression * 100).toFixed(1)}%
        </span></div>
      </div>
    </div>
  );
}
