// src/features/companyAdmin/components/SalesDistributionChart.jsx
import React from "react";
import Card from "../../../shared/components/ui/Card";

const SalesDistributionChart = () => {
  const servicePercentage = 65;
  const productPercentage = 35;

  // SVG circle calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const serviceOffset = circumference - (servicePercentage / 100) * circumference;

  return (
    <Card>
      <h3 className="text-lg font-bold text-neutral-900 mb-6">Sales Distribution</h3>

      <div className="flex flex-col items-center justify-center py-8">
        {/* Donut Chart */}
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle cx="80" cy="80" r={radius} fill="none" stroke="#FCD34D" strokeWidth="30" />

            {/* Services arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#14B8A6"
              strokeWidth="30"
              strokeDasharray={circumference}
              strokeDashoffset={serviceOffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-neutral-900">{servicePercentage}%</span>
            <span className="text-sm text-neutral-600">Services</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-secondary-500"></div>
            <span className="text-sm text-neutral-700">Services ({servicePercentage}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-warning-300"></div>
            <span className="text-sm text-neutral-700">Products ({productPercentage}%)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SalesDistributionChart;
