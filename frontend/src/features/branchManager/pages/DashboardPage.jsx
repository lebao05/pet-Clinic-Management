import React, { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import UrgentAlertsTable from "../components/UrgentAlertsTable";
import RevenueChart from "../components/RevenueChart";
import { branchManagerApi } from "../../../api/branchManagerApi";
import { DollarSign, Users, AlertTriangle, RefreshCw, Calendar, AlertCircle } from "lucide-react";
import Button from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";

function getDefaultBranchId() {
  const v = localStorage.getItem("branchId");
  return v ? Number(v) : 1;
}

function dateISO(d) {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const DashboardPage = () => {
  const [branchId, setBranchId] = useState(getDefaultBranchId());
  const [stats, setStats] = useState({
    todayRevenue: 0,
    activeStaff: 0,
    lowStockItems: 0,
  });
  const [urgentItems, setUrgentItems] = useState([]);
  const [revenue7d, setRevenue7d] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Time range for revenue chart
  const [chartDateRange, setChartDateRange] = useState("7days");
  const [customFrom, setCustomFrom] = useState(dateISO(new Date(Date.now() - 7 * 86400000)));
  const [customTo, setCustomTo] = useState(dateISO(new Date()));
  const [dateRangeError, setDateRangeError] = useState("");

  // ==================== VALIDATE DATE RANGE (MAX 7 DAYS) ====================
  const validateDateRange = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      setDateRangeError("Date range cannot exceed 7 days");
      return false;
    }

    if (from > to) {
      setDateRangeError("Start date must be before end date");
      return false;
    }

    setDateRangeError("");
    return true;
  };

  // ==================== LOAD SUMMARY ====================
  async function loadSummary() {
    try {
      setLoading(true);
      setError("");
      const res = await branchManagerApi.getSummary(branchId);
      const data = res.data?.data;

      setStats({
        todayRevenue: Number(data?.todayRevenue || 0),
        activeStaff: Number(data?.activeStaff || 0),
        lowStockItems: Number(data?.lowStockItems || 0),
      });
      setUrgentItems((data?.lowStockList || []).slice(0, 5));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  // ==================== LOAD REVENUE CHART ====================
  async function loadRevenueChart() {
    try {
      let from, to;

      if (chartDateRange === "custom") {
        from = customFrom;
        to = customTo;

        // Validate before loading
        if (!validateDateRange(from, to)) {
          return;
        }
      } else if (chartDateRange === "7days") {
        from = dateISO(new Date(Date.now() - 6 * 86400000)); // 7 days including today
        to = dateISO(new Date());
      } else if (chartDateRange === "14days") {
        from = dateISO(new Date(Date.now() - 13 * 86400000));
        to = dateISO(new Date());
      } else if (chartDateRange === "30days") {
        from = dateISO(new Date(Date.now() - 29 * 86400000));
        to = dateISO(new Date());
      }

      const res = await branchManagerApi.revenueReport({ branchId, from, to });
      setRevenue7d(res.data?.data?.daily || []);
    } catch (e) {
      console.error("Error loading chart:", e);
      setRevenue7d([]);
    }
  }

  useEffect(() => {
    loadSummary();
    loadRevenueChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chartDateRange !== "custom") {
      loadRevenueChart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartDateRange, branchId]);

  function saveBranch() {
    localStorage.setItem("branchId", String(branchId));
    loadSummary();
    loadRevenueChart();
  }

  function handleRefresh() {
    loadSummary();
    loadRevenueChart();
  }

  // ==================== AUTO SET TO DATE WHEN FROM CHANGES ====================
  const handleCustomFromChange = (value) => {
    setCustomFrom(value);

    // Auto set To date = From date + 7 days
    const fromDate = new Date(value);
    const toDate = new Date(fromDate);
    toDate.setDate(toDate.getDate() + 7);

    // Don't exceed today
    const today = new Date();
    if (toDate > today) {
      setCustomTo(dateISO(today));
    } else {
      setCustomTo(dateISO(toDate));
    }

    // Validate after setting
    setTimeout(() => {
      validateDateRange(value, customTo);
    }, 100);
  };

  const handleCustomToChange = (value) => {
    setCustomTo(value);
    validateDateRange(customFrom, value);
  };

  // Load chart when custom dates change
  useEffect(() => {
    if (chartDateRange === "custom") {
      loadRevenueChart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customFrom, customTo]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-600 mt-1">Key operational metrics for your branch.</p>
        </div>

        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Testing Controls - Collapsible */}
      <details className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <summary className="cursor-pointer font-medium text-neutral-700 text-sm">
          🔧 Testing Controls (Click to expand)
        </summary>
        <div className="flex gap-4 items-end mt-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Branch ID (for testing)</label>
            <input
              type="number"
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            />
          </div>
          <Button onClick={saveBranch} variant="primary">
            Load Data
          </Button>
        </div>
        <div className="mt-2 text-xs text-neutral-600 bg-blue-50 p-2 rounded border border-blue-200">
          💡 <strong>Tip:</strong> Change Branch ID to test different branches (1, 2, 3, etc.)
        </div>
      </details>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong className="font-medium">Error: </strong>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`${stats.todayRevenue.toLocaleString("vi-VN")} VNĐ`}
          icon={<DollarSign className="w-6 h-6" />}
          iconBg="bg-green-100 text-green-600"
          valueColor="text-green-600"
        />
        <StatCard
          title="Active Staff"
          value={stats.activeStaff}
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-blue-100 text-blue-600"
          valueColor="text-blue-600"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={<AlertTriangle className="w-6 h-6" />}
          iconBg="bg-red-100 text-red-600"
          valueColor="text-red-600"
        />
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart with Time Range Selector */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Revenue Trend</h3>
            <Calendar className="w-5 h-5 text-neutral-400" />
          </div>

          {/* Time Range Selector - ALWAYS VISIBLE */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                chartDateRange === "7days"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
              onClick={() => setChartDateRange("7days")}
            >
              Last 7 Days
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                chartDateRange === "14days"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
              onClick={() => setChartDateRange("14days")}
            >
              Last 14 Days
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                chartDateRange === "30days"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
              onClick={() => setChartDateRange("30days")}
            >
              Last 30 Days
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                chartDateRange === "custom"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
              onClick={() => setChartDateRange("custom")}
            >
              Custom Range
            </button>
          </div>

          {/* Custom Date Range */}
          {chartDateRange === "custom" && (
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    From (auto sets To = From + 7 days)
                  </label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => handleCustomFromChange(e.target.value)}
                    max={dateISO(new Date())}
                    className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">To</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => handleCustomToChange(e.target.value)}
                    min={customFrom}
                    max={dateISO(new Date())}
                    className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Date Range Error/Warning */}
              {dateRangeError ? (
                <div className="mt-2 flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{dateRangeError}</span>
                </div>
              ) : (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                  ℹ️ Maximum date range is 7 days for optimal performance
                </div>
              )}
            </div>
          )}

          {/* Chart */}
          <RevenueChart data={revenue7d} />
        </Card>

        {/* Urgent Alerts */}
        <UrgentAlertsTable items={urgentItems} />
      </div>
    </div>
  );
};

export default DashboardPage;
