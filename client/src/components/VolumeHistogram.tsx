import { CandleData } from "@shared/schema";

interface VolumeHistogramProps {
  candleData: CandleData[];
  zoom: number;
  pan: number;
}

export default function VolumeHistogram({ candleData, zoom, pan }: VolumeHistogramProps) {
  if (candleData.length === 0) return null;

  const maxVolume = Math.max(...candleData.map(candle => candle.volume));
  const candleSpacing = 60 * zoom;
  const startX = 20 - pan;
  const candleWidth = 12 * zoom;

  return (
    <div className="h-full border-t border-gray-200 bg-gray-50 relative overflow-hidden">
      <div className="flex items-end h-full px-4 py-2 relative">
        {candleData.map((candle, index) => {
          const x = startX + index * candleSpacing;
          const volumeHeight = (candle.volume / maxVolume) * 48; // Max 48px height
          const buyRatio = candle.buyVolume / candle.volume;
          const buyHeight = volumeHeight * buyRatio;
          const sellHeight = volumeHeight * (1 - buyRatio);
          const isGreen = candle.delta > 0;

          return (
            <div
              key={index}
              className="absolute bottom-2 group cursor-pointer"
              style={{ 
                left: `${x}px`,
                width: `${candleWidth}px`,
                height: `${volumeHeight}px`
              }}
            >
              <div 
                className={`w-full transition-all ${isGreen ? 'bg-green-500' : 'bg-red-500'} hover:bg-opacity-80 relative`}
                style={{ height: '100%' }}
              >
                <div 
                  className={`absolute bottom-0 inset-x-0 ${isGreen ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ height: `${(sellHeight / volumeHeight) * 100}%` }}
                />
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs whitespace-nowrap px-2 py-1 rounded shadow-lg">
                    Volume: {candle.volume.toFixed(2)} BTC<br/>
                    Buy: {candle.buyVolume.toFixed(2)} BTC<br/>
                    Sell: {candle.sellVolume.toFixed(2)} BTC<br/>
                    Delta: {candle.delta > 0 ? '+' : ''}{candle.delta.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
