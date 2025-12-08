// src/features/branchManager/components/StatCard.jsx
import React from "react";
import Card from "../../../shared/components/ui/Card";

const StatCard = ({ title, value, icon, iconBg, valueColor = "text-neutral-900" }) => {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600 mb-2">{title}</p>
          <p className={`text-4xl font-bold ${valueColor}`}>{value}</p>
        </div>
        {icon && (
          <div className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center text-3xl`}>{icon}</div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
