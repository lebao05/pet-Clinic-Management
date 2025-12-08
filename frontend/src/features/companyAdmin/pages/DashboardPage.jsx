// src/features/companyAdmin/pages/DashboardPage.jsx
import React from "react";
import KPICard from "../components/KPICard";
import BranchRevenueChart from "../components/BranchRevenueChart";
import SalesDistributionChart from "../components/SalesDistributionChart";
import Button from "../../../shared/components/ui/Button";

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900">Company Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500">
            <option>📅 Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Total Revenue" value="$1,250,345" change="+12.5%" trend="up" />

        <KPICard title="Total Customers" value="5,432" change="+254 this month" trend="up" />

        <KPICard title="Appointment Volume" value="1,890" change="-1.2%" trend="down" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BranchRevenueChart />
        <SalesDistributionChart />
      </div>
    </div>
  );
};

export default DashboardPage;
