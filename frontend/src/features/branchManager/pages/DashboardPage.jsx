// frontend/src/features/branchManager/pages/DashboardPage.jsx

import React, { useState, useEffect } from "react";
import branchManagerApi from "../../../api/branchManagerApi";
import { DollarSign, TrendingUp, Calendar, Users, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DashboardPage = () => {
  const branchId = 10;
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [revenueChart, setRevenueChart] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const [summaryRes, revenueRes, alertsRes] = await Promise.allSettled([
        branchManagerApi.getDashboardSummary(branchId, today),
        branchManagerApi.getRevenueChart(branchId, last30Days, today),
        branchManagerApi.getUrgentAlerts(branchId),
      ]);

      if (summaryRes.status === "fulfilled") {
        setSummary(summaryRes.value.data.data);
      }

      if (revenueRes.status === "fulfilled") {
        const chartData = (revenueRes.value.data.data || []).map((item) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString("vi-VN", {
            month: "short",
            day: "numeric",
          }),
        }));
        setRevenueChart(chartData);
      }

      if (alertsRes.status === "fulfilled") {
        setAlerts(alertsRes.value.data.alerts || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const StatCard = ({ icon: Icon, label, value, change, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {change && (
          <span
            className={`flex items-center gap-1 text-sm font-medium ${change > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          label="Doanh thu hôm nay"
          value={formatCurrency(summary?.todayRevenue)}
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Doanh thu tháng này"
          value={formatCurrency(summary?.monthRevenue)}
          color="blue"
        />
        <StatCard icon={Calendar} label="Lịch hẹn hôm nay" value={summary?.todayAppointments || 0} color="purple" />
        <StatCard icon={Users} label="Khách hàng tháng này" value={summary?.monthCustomers || 0} color="amber" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu 30 ngày gần nhất</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Thông báo quan trọng
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === "warning"
                    ? "bg-amber-50 border-amber-500"
                    : alert.severity === "error"
                    ? "bg-red-50 border-red-500"
                    : "bg-blue-50 border-blue-500"
                }`}
              >
                <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
