// src/features/companyAdmin/components/KPICard.jsx
import React from "react";
import Card from "../../../shared/components/ui/Card";

const KPICard = ({ title, value, change, trend }) => {
  const isPositive = trend === "up";
  const changeColor = isPositive ? "text-success-600" : "text-danger-600";
  const changeIcon = isPositive ? "↗" : "↘";

  return (
    <Card>
      <div className="space-y-2">
        <p className="text-sm text-neutral-600">{title}</p>
        <p className="text-4xl font-bold text-neutral-900">{value}</p>
        {change && (
          <p className={`text-sm font-medium ${changeColor} flex items-center gap-1`}>
            <span>{changeIcon}</span>
            {change}
          </p>
        )}
      </div>
    </Card>
  );
};

export default KPICard;
