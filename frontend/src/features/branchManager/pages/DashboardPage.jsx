// src/features/branchManager/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import UrgentAlertsTable from "../components/UrgentAlertsTable";
import RevenueChart from "../components/RevenueChart";
import { branchManagerApi } from "../../../api/branchManagerApi";

function getDefaultBranchId() {
  const v = localStorage.getItem("branchId");
  return v ? Number(v) : 1;
}

const DashboardPage = () => {
  const [branchId, setBranchId] = useState(getDefaultBranchId());
  const [stats, setStats] = useState({ todayRevenue: 0, activeStaff: 0, lowStockItems: 0 });
  const [urgentItems, setUrgentItems] = useState([]);
  const [revenue7d, setRevenue7d] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const res = await branchManagerApi.getSummary(branchId);
      const data = res.data?.data;
      setStats({
        todayRevenue: Number(data?.todayRevenue || 0),
        activeStaff: Number(data?.activeStaff || 0),
        lowStockItems: Number(data?.lowStockItems || 0),
      });
      setUrgentItems((data?.lowStockList || []).slice(0, 5));
      setRevenue7d(data?.revenue7d || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-1">Branch Dashboard</h1>
          <p className="text-neutral-600">Key operational metrics for your branch.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="w-28 px-3 py-2 border rounded-lg"
            type="number"
            min={1}
            value={branchId}
            onChange={(e) => setBranchId(Number(e.target.value))}
          />
          <button
            className="px-4 py-2 bg-secondary-500 text-white rounded-lg"
            onClick={() => {
              localStorage.setItem("branchId", String(branchId));
              load();
            }}
          >
            Set Branch
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-danger-600">{error}</p>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`${stats.todayRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
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
        <UrgentAlertsTable
          items={urgentItems.map((x) => ({ name: x.ProductName, stock: x.StockQty }))}
        />

        {/* Weekly Revenue Chart */}
        <RevenueChart data={revenue7d} />
      </div>
    </div>
  );
};

export default DashboardPage;
