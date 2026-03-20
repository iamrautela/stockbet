import { useMemo } from 'react';
import { generateChartData } from '@/lib/mock-data';

interface MiniChartProps {
  basePrice: number;
  positive: boolean;
  width?: number;
  height?: number;
}

const MiniChart = ({ basePrice, positive, width = 120, height = 40 }: MiniChartProps) => {
  const data = useMemo(() => generateChartData(basePrice, 20), [basePrice]);

  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.price - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  const color = positive ? 'hsl(142, 76%, 46%)' : 'hsl(0, 84%, 60%)';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`grad-${basePrice}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${basePrice})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MiniChart;
