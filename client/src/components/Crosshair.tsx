interface CrosshairProps {
  x: number;
  y: number;
  visible: boolean;
  price: number;
  time: number;
}

export default function Crosshair({ x, y, visible, price, time }: CrosshairProps) {
  if (!visible) return null;

  return (
    <>
      {/* Vertical line */}
      <div 
        className="absolute w-px bg-gray-600 opacity-30 pointer-events-none"
        style={{ 
          left: `${x}px`,
          top: 0,
          bottom: 0,
          zIndex: 10
        }}
      />
      
      {/* Horizontal line */}
      <div 
        className="absolute h-px bg-gray-600 opacity-30 pointer-events-none"
        style={{ 
          top: `${y}px`,
          left: 0,
          right: 0,
          zIndex: 10
        }}
      />

      {/* Price label */}
      <div 
        className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none"
        style={{ 
          top: `${y}px`,
          right: 0,
          transform: 'translateY(-50%)',
          zIndex: 15
        }}
      >
        {price.toFixed(2)}
      </div>

      {/* Time label */}
      <div 
        className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none"
        style={{ 
          left: `${x}px`,
          bottom: 0,
          transform: 'translateX(-50%)',
          zIndex: 15
        }}
      >
        {new Date(time * 1000).toLocaleTimeString()}
      </div>
    </>
  );
}
