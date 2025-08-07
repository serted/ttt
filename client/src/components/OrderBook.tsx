import { OrderBookData } from "@shared/schema";

interface OrderBookProps {
  orderBookData: OrderBookData;
}

export default function OrderBook({ orderBookData }: OrderBookProps) {
  const currentPrice = orderBookData.asks.length > 0 && orderBookData.bids.length > 0
    ? (orderBookData.asks[orderBookData.asks.length - 1].price + orderBookData.bids[0].price) / 2
    : 0;

  const priceChange = 1.24; // This would come from trading state
  const isPositive = priceChange >= 0;

  return (
    <div className="w-48 border-l border-gray-200 bg-gray-50">
      <div className="p-3">
        <div className="text-sm font-medium mb-3 text-center text-gray-900">Order Book</div>
        
        {/* Ask Orders (Sell) */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Ask (Sell)</div>
          <div className="space-y-px">
            {orderBookData.asks.slice(0, 5).reverse().map((ask, index) => (
              <div 
                key={index}
                className="flex justify-between items-center text-xs bg-red-50 px-2 py-1 group hover:bg-red-100 transition-colors cursor-pointer"
              >
                <span className="text-red-500 font-mono">{ask.price.toFixed(2)}</span>
                <span className="text-gray-600">{ask.volume.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Price */}
        <div className="text-center py-2 border-y border-gray-300">
          <div className={`text-lg font-mono font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {currentPrice.toFixed(2)}
          </div>
          <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}% {isPositive ? '↗' : '↘'}
          </div>
        </div>

        {/* Bid Orders (Buy) */}
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2">Bid (Buy)</div>
          <div className="space-y-px">
            {orderBookData.bids.slice(0, 5).map((bid, index) => (
              <div 
                key={index}
                className="flex justify-between items-center text-xs bg-green-50 px-2 py-1 group hover:bg-green-100 transition-colors cursor-pointer"
              >
                <span className="text-green-600 font-mono">{bid.price.toFixed(2)}</span>
                <span className="text-gray-600">{bid.volume.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
