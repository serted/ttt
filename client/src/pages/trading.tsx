import TradingChart from "@/components/TradingChart";
import { useTradingData } from "@/hooks/useTradingData";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";

export default function TradingPage() {
  const { tradingState, candleData, orderBookData, isConnected } = useTradingData();

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-medium text-gray-900">BTC/USDT</h1>
          <div className="flex items-center space-x-2 text-sm">
            <span className={`font-mono font-medium ${tradingState.priceChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              ${tradingState.currentPrice.toFixed(2)}
            </span>
            <span className={`text-xs ${tradingState.priceChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {tradingState.priceChange >= 0 ? '+' : ''}{tradingState.priceChangePercent.toFixed(2)}%
            </span>
            {isConnected && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="1m">
            <SelectTrigger className="w-20 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1m</SelectItem>
              <SelectItem value="5m">5m</SelectItem>
              <SelectItem value="15m">15m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Trading Chart */}
      <div className="flex-1">
        <TradingChart 
          candleData={candleData}
          orderBookData={orderBookData}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}
