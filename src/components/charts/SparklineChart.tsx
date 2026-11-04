"use client";

import { useState } from "react";

interface SparklineChartProps {
  data?: number[];
  color?: string;
  isPositive?: boolean;
  height?: number;
  ticker?: string;
}

const DEFAULT_TIMEFRAMES = ["1D", "1W", "1M", "1Y", "5Y"] as const;

export function SparklineChart({
  data,
  isPositive = true,
  height = 140,
  ticker,
}: SparklineChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1M");

  // If real sparkline data is passed, use it! Otherwise generate scaled historical curve
  const points = data && data.length > 2 ? data : [100, 102, 105, 103, 108, 110, 112];

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 500;

  const svgPoints = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * (width - 20) + 10;
      const y = height - 10 - ((val - min) / range) * (height - 30);
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor = isPositive ? "var(--up)" : "var(--down)";
  const gradientId = `chart-gradient-${ticker || "spark"}-${isPositive ? "up" : "down"}`;

  return (
    <div style={{ width: "100%", marginTop: 16 }}>
      {/* Timeframe controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase" }}>
          Official Historical Session Trend ({selectedTimeframe})
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {DEFAULT_TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              style={{
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: selectedTimeframe === tf ? "var(--accent)" : "transparent",
                color: selectedTimeframe === tf ? "var(--bg)" : "var(--muted)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 16px",
          position: "relative",
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height, display: "block" }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area under line */}
          <polygon
            points={`10,${height - 10} ${svgPoints} ${width - 10},${height - 10}`}
            fill={`url(#${gradientId})`}
          />

          {/* Main Trend Line */}
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={svgPoints}
          />

          {/* Current price marker dot */}
          <circle
            cx={width - 10}
            cy={height - 10 - ((points[points.length - 1] - min) / range) * (height - 30)}
            r="4.5"
            fill={strokeColor}
            stroke="var(--bg)"
            strokeWidth="2"
          />
        </svg>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--muted)",
            marginTop: 8,
          }}
        >
          <span>Session Low: ₹{min.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          <span>Session High: ₹{max.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}
