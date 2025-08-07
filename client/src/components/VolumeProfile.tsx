import { CandleData, VolumeProfileLevel } from "@shared/schema";
import { useMemo } from "react";

interface VolumeProfileProps {
  candleData: CandleData[];
  priceRange: { min: number; max: number };
  height: number;
}

export default function VolumeProfile({ candleData, priceRange, height }: VolumeProfileProps) {
  const volumeProfile = useMemo(() => {
    if (candleData.length === 0) return [];

    const levels: Map<number, VolumeProfileLevel> = new Map();
    const priceStep = (priceRange.max - priceRange.min) / 100; // 100 price levels

    candleData.forEach(candle => {
      candle.clusters.forEach(cluster => {
        const priceLevel = Math.floor((cluster.price - priceRange.min) / priceStep) * priceStep + priceRange.min;
        
        const existing = levels.get(priceLevel) || {
          price: priceLevel,
          totalVolume: 0,
          buyVolume: 0,
          sellVolume: 0,
        };

        existing.totalVolume += cluster.volume;
        existing.buyVolume += cluster.buyVolume;
        existing.sellVolume += cluster.sellVolume;
        
        levels.set(priceLevel, existing);
      });
    });

    return Array.from(levels.values()).sort((a, b) => b.price - a.price);
  }, [candleData, priceRange]);

  const maxVolume = Math.max(...volumeProfile.map(level => level.totalVolume));

  const priceToY = (price: number) => {
    const range = priceRange.max - priceRange.min;
    return ((priceRange.max - price) / range) * height;
  };

  return (
    <div className="w-20 border-r border-gray-200 bg-gray-50 relative">
      <div className="absolute inset-0 p-2">
        <div className="text-xs text-gray-500 mb-2">Volume</div>
        <div className="relative h-full">
          {volumeProfile.map((level, index) => {
            const y = priceToY(level.price);
            const buyWidth = (level.buyVolume / maxVolume) * 60; // Max 60px width
            const sellWidth = (level.sellVolume / maxVolume) * 60;

            return (
              <div
                key={index}
                className="absolute flex items-center group"
                style={{ 
                  top: `${y}px`,
                  transform: 'translateY(-50%)',
                  height: '2px',
                  width: '100%'
                }}
              >
                <div 
                  className="bg-green-500 h-full group-hover:bg-opacity-80 transition-all cursor-pointer"
                  style={{ width: `${buyWidth}px` }}
                  title={`Buy Volume: ${level.buyVolume.toFixed(2)}`}
                />
                <div 
                  className="bg-red-500 h-full group-hover:bg-opacity-80 transition-all cursor-pointer"
                  style={{ width: `${sellWidth}px` }}
                  title={`Sell Volume: ${level.sellVolume.toFixed(2)}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
