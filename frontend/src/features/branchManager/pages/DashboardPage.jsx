// src/features/branchManager/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import UrgentAlertsTable from "../components/UrgentAlertsTable";
import RevenueChart from "../components/RevenueChart";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    todayRevenue: 1250.75,
    activeStaff: 8,
    lowStockItems: 3,
  });

  const urgentItems = [
    { name: "Canine Health Supplement", stock: 8 },
    { name: "Feline Antibiotic Ointment", stock: 5 },
    { name: "Small Pet Bandages", stock: 9 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`$${stats.todayRevenue.toLocaleString()}`}
          icon="💰"
          iconBg="bg-primary-100"
          valueColor="text-primary-600"
        />

        <StatCard
          title="Active Staff"
          value={stats.activeStaff}
          icon="👥"
          iconBg="bg-secondary-100"
          valueColor="text-secondary-600"
        />

        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon="⚠️"
          iconBg="bg-warning-100"
          valueColor="text-warning-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Alerts */}
        <UrgentAlertsTable items={urgentItems} />

        {/* Weekly Revenue Chart */}
        <RevenueChart />
      </div>
    </div>
  );
};

export default DashboardPage;
