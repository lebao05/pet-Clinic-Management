// src/features/branchManager/components/RevenueChart.jsx
import React from "react";
import {Card} from "../../../shared/components/ui/Card";

const RevenueChart = ({ data = [] }) => {
  // expected: [{date:'YYYY-MM-DD', amount:number}]
  const safe = Array.isArray(data) ? data : [];
  const mapped = safe.map((x) => {
    const dt = new Date(x.date || Date.now());
    const label = dt.toLocaleDateString(undefined, { weekday: "short" });
    return { day: label, value: Number(x.amount || 0) };
  });
  const maxValue = Math.max(1, ...mapped.map((d) => d.value));

  return (
    <Card>
      <h3 className="text-lg font-bold text-neutral-900 mb-6">Weekly Revenue</h3>

      <div className="h-64 bg-neutral-900 rounded-lg p-6 flex items-end justify-around gap-2">
        {mapped.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative group">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neutral-800 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>

                {/* Bar */}
                <div
                  className="w-full bg-gradient-to-t from-primary-400 to-primary-300 rounded-t transition-all duration-300 hover:from-primary-300 hover:to-primary-200"
                  style={{ height: `${height}%` }}
                ></div>
              </div>

              <span className="text-xs text-neutral-400">{item.day}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-600">
        <div className="w-3 h-3 bg-primary-400 rounded"></div>
        <span>Daily Revenue</span>
      </div>
    </Card>
  );
};

export default RevenueChart;
