// src/features/companyAdmin/components/BranchRevenueChart.jsx
import React from "react";
import Card from "../../../shared/components/ui/Card";

const BranchRevenueChart = () => {
  const branches = [
    { id: "B1", value: 45 },
    { id: "B2", value: 75 },
    { id: "B3", value: 60 },
    { id: "B4", value: 35 },
    { id: "B5", value: 95 },
    { id: "B6", value: 50 },
    { id: "B7", value: 70 },
    { id: "B8", value: 40 },
    { id: "B9", value: 30 },
    { id: "B10", value: 80 },
  ];

  const maxValue = Math.max(...branches.map((b) => b.value));

  return (
    <Card>
      <h3 className="text-lg font-bold text-neutral-900 mb-6">Branch Revenue Comparison</h3>

      <div className="h-80 flex items-end justify-around gap-3">
        {branches.map((branch) => {
          const height = (branch.value / maxValue) * 100;
          const isHighlight = branch.id === "B5";

          return (
            <div key={branch.id} className="flex-1 flex flex-col items-center gap-3 group">
              {/* Bar */}
              <div
                className={`w-full rounded-t-lg transition-all duration-300 ${
                  isHighlight ? "bg-primary-500" : "bg-primary-200 hover:bg-primary-300"
                }`}
                style={{ height: `${height}%` }}
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center pt-2">
                  <span className="text-xs font-semibold text-white">${branch.value}K</span>
                </div>
              </div>

              {/* Label */}
              <span className="text-sm text-neutral-600 font-medium">{branch.id}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default BranchRevenueChart;
