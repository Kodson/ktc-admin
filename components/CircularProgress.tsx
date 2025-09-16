interface CircularProgressProps {
  percentage: number;
  status: string;
}

export function CircularProgress({ percentage, status }: CircularProgressProps) {
  const radius = 45;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStrokeColor = () => {
    switch (status) {
      case 'Good': return '#10b981';
      case 'Critical': return '#ef4444';
      case 'Low': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const strokeColor = getStrokeColor();

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
    </div>
  );
}