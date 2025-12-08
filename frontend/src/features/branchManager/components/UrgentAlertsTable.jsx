// src/features/branchManager/components/UrgentAlertsTable.jsx
import React from "react";
import Button from "../../../shared/components/ui/Button";

const UrgentAlertsTable = ({ items }) => {
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-bold text-neutral-900">Urgent Alerts</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Item Name</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-neutral-700">Current Stock</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-neutral-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-neutral-50 transition">
                <td className="px-6 py-4 text-neutral-900">{item.name}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-warning-50 text-warning-600 font-bold">
                    {item.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <Button variant="secondary" size="sm" icon="🛒">
                    Re-order
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UrgentAlertsTable;
