import React from "react";
import { TrendingUp } from "lucide-react";

const RevenueChart = ({ data = [] }) => {
  const safe = Array.isArray(data) ? data : [];

  // Process data
  const mapped = safe.map((x) => {
    const dt = new Date(x.date || Date.now());
    const label = dt.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });
    return {
      day: label,
      value: Number(x.amount || 0),
      fullDate: x.date,
    };
  });

  const maxValue = Math.max(1, ...mapped.map((d) => d.value));
  const totalRevenue = mapped.reduce((sum, d) => sum + d.value, 0);
  const avgRevenue = mapped.length > 0 ? totalRevenue / mapped.length : 0;

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  if (mapped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
        <TrendingUp className="w-12 h-12 mb-2" />
        <p className="text-sm">No revenue data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-200">
        <div>
          <p className="text-xs text-neutral-600">Total Revenue</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(totalRevenue)} VNĐ</p>
        </div>
        <div>
          <p className="text-xs text-neutral-600">Daily Average</p>
          <p className="text-lg font-bold text-blue-600">{formatCurrency(avgRevenue)} VNĐ</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-neutral-500">
          <span>{formatCurrency(maxValue)}</span>
          <span>{formatCurrency(maxValue * 0.75)}</span>
          <span>{formatCurrency(maxValue * 0.5)}</span>
          <span>{formatCurrency(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-16 right-0 top-0 bottom-8 flex items-end justify-between gap-1 border-l border-b border-neutral-200">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 25, 50, 75, 100].map((percent) => (
              <div key={percent} className="w-full border-t border-neutral-100" />
            ))}
          </div>

          {/* Bars */}
          {mapped.map((item, index) => {
            const height = item.value > 0 ? Math.max((item.value / maxValue) * 100, 2) : 0;
            return (
              <div key={index} className="relative flex-1 group" style={{ minWidth: "20px", maxWidth: "60px" }}>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-neutral-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    <div className="font-medium">{item.day}</div>
                    <div>{formatCurrency(item.value)} VNĐ</div>
                  </div>
                  <div className="w-2 h-2 bg-neutral-900 transform rotate-45 -mt-1 mx-auto" />
                </div>

                {/* Bar */}
                {item.value > 0 && (
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-500 cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="absolute left-16 right-0 bottom-0 flex items-center justify-between gap-1">
          {mapped.map((item, index) => (
            <div
              key={index}
              className="flex-1 text-center text-xs text-neutral-600 truncate"
              style={{ minWidth: "20px", maxWidth: "60px" }}
              title={item.day}
            >
              {item.day}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 text-xs text-neutral-600 pt-2 border-t border-neutral-200">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-blue-400 rounded" />
          <span>Daily Revenue (VNĐ)</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
